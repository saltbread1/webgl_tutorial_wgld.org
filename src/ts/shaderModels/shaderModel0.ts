import {vec3, mat4, quat} from "gl-matrix";
import {Buffers, Vertices, BlendType} from "../types";
import {sphere, square, torus} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../shaderData";

class ShaderModel0 extends ShaderModel {
    private readonly _tmpMatrix: mat4;
    private readonly _invMatrix: mat4;
    private readonly _qMatrix: mat4;
    private readonly _mouseQuat: quat;

    private readonly _lightDirection: number[];
    private readonly _eyeDirection: number[];
    private readonly _ambientColor: number[];

    private readonly _initTime: number;

    private readonly _elmCanvas: HTMLCanvasElement;
    private readonly _elmTransparency: HTMLInputElement;
    private readonly _elmAdd: HTMLInputElement;
    private readonly _elmAlphaValue: HTMLInputElement;
    private readonly _elmPointSize: HTMLInputElement;

    private _texture0: WebGLTexture;
    private _buffers: Buffers;

    public constructor(gl: WebGLRenderingContext, vs: string, fs: string, elmCanvas: HTMLCanvasElement,
                       elmTransparency: HTMLInputElement, elmAdd: HTMLInputElement,
                       elmAlphaValue: HTMLInputElement, elmPointSize: HTMLInputElement) {
        super(gl, vs, fs);

        this._tmpMatrix = mat4.create();
        this._invMatrix = mat4.create();
        this._qMatrix = mat4.create();
        this._mouseQuat = quat.create();

        this._lightDirection = [-1.0, 1.0, 1.0];
        this._eyeDirection = [0.0, 0.0, 1.0];
        this._ambientColor = [0.1, 0.1, 0.1, 0.1];

        this._initTime = new Date().getTime();

        this._elmCanvas = elmCanvas;
        this._elmTransparency = elmTransparency;
        this._elmAdd = elmAdd;
        this._elmAlphaValue = elmAlphaValue;
        this._elmPointSize = elmPointSize;

        this._texture0 = this._gl.createTexture()!;
        this._buffers = {f: null, d: null, t: null};
    }

    public override async initialize(): Promise<void> {
        // calculate view x projection matrix
        mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 90, this._elmCanvas.width / this._elmCanvas.height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        this._texture0 = await this.createTexture('img/texture0.png');
        // active texture unit 0
        this._gl.activeTexture(this._gl.TEXTURE0);

        this._buffers = this.createFrameBuffer(this._elmCanvas.width, this._elmCanvas.height);

        // set lights
        this._gl.uniform3fv(this._uniMan.getUniform('lightDirection'), this._lightDirection);
        this._gl.uniform3fv(this._uniMan.getUniform('eyeDirection'), this._eyeDirection);
        this._gl.uniform4fv(this._uniMan.getUniform('ambientColor'), this._ambientColor);
    }

    // allow function to bind "this"
    public mouseMove = (e: MouseEvent): void  => {
        const halfW: number = this._elmCanvas.width / 2;
        const halfH: number = this._elmCanvas.height / 2;
        const x: number = e.clientX - (this._elmCanvas.clientLeft + halfW);
        const y: number = -(e.clientY - (this._elmCanvas.clientTop + halfH));
        const rad: number = Math.PI * Math.sqrt((x*x+y*y)/(halfW*halfW+halfH*halfH));
        const axis: vec3 = vec3.create();
        vec3.normalize(axis, [x, y, 0]);
        vec3.rotateZ(axis, axis, [0, 0, 0], Math.PI/2);
        quat.setAxisAngle(this._mouseQuat, axis, rad);
    };

    protected override render(): void {
        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // point size
        const pointSize: number = parseFloat(this._elmPointSize.value);
        this._gl.uniform1f(this._uniMan.getUniform('pointSize'), pointSize);

        // blend
        let blendType: BlendType = BlendType.INVALIABLE;
        if (this._elmTransparency.checked) { blendType = BlendType.ALPHA; }
        if (this._elmAdd.checked) { blendType = BlendType.ADD; }
        this.blend(blendType);
        // alpha value
        const vertexAlpha: number = parseFloat(this._elmAlphaValue.value);

        // bind framebuffer
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._buffers.f);

        // initialize buffer
        this._gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // disable alpha blend
        this._gl.disable(this._gl.BLEND);

        // set common uniforms
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), 1.0);
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);

        // bind texture
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture0);

        // set sphere attributes
        this._vboMan.setAttribute('spherePosition', 'position');
        this._vboMan.setAttribute('sphereNormal', 'normal');
        this._vboMan.setAttribute('sphereColor', 'color');
        this._vboMan.setAttribute('sphereTextureCoord', 'textureCoord');

        // apply sphere IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('sphere')!);

        // matrix for sphere
        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.fromQuat(this._qMatrix, this._mouseQuat);
        mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for sphere
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 0);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 1);

        // draw the sphere background
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('sphere'), this._gl.UNSIGNED_SHORT, 0);
        //gl.drawArrays(gl.POINTS, 0, sphereVertices.pos.length / 3);


        // set torus attributes
        this._vboMan.setAttribute('torusPosition', 'position');
        this._vboMan.setAttribute('torusNormal', 'normal');
        this._vboMan.setAttribute('torusColor', 'color');
        this._vboMan.setAttribute('torusTextureCoord', 'textureCoord');

        // apply torus IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('torus')!);

        // matrix for torus
        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.fromQuat(this._qMatrix, this._mouseQuat);
        mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for torus inline
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 1);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 0);

        // draw the torus inline
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('torus'), this._gl.UNSIGNED_SHORT, 0);


        // unbind framebuffer: flush automatically
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        // initialize canvas
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // set square attributes
        this._vboMan.setAttribute('squarePosition', 'position');
        this._vboMan.setAttribute('squareNormal', 'normal');
        this._vboMan.setAttribute('squareColor', 'color');
        this._vboMan.setAttribute('squareTextureCoord', 'textureCoord');

        // set common uniforms
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), vertexAlpha);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 0);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 1);

        // bind texture
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._buffers.t);

        // apply square IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('square')!);

        // enable alpha blend
        this._gl.enable(this._gl.BLEND);

        // model 1: rotate on z axis
        // MVP matrix
        mat4.fromTranslation(this._mMatrix, [0.25, 0.25, 1.0]);
        mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);

        // model 2: rotate on y axis
        // MVP matrix
        mat4.fromTranslation(this._mMatrix, [-0.25, -0.25, 1.2]);
        mat4.rotateY(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);

        this._gl.flush();
    }

    protected override createAttributes(program: WebGLProgram): AttributeManager {
        const ret: AttributeManager = new AttributeManager(this._gl, program);
        ret.addAttribute('position', 3);
        ret.addAttribute('normal', 3);
        ret.addAttribute('color', 4);
        ret.addAttribute('textureCoord', 2);

        return ret;
    }

    protected override createVBOs(attMan: AttributeManager): VBOManager {
        const squareVertices: Vertices = square(1);
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: VBOManager = new VBOManager(this._gl, attMan);
        ret.addVBO('square', squareVertices);
        ret.addVBO('torus', torusVertices);
        ret.addVBO('sphere', sphereVertices);

        return ret;
    }

    protected override createIBOs(): IBOManager {
        const squareVertices: Vertices = square(1);
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: IBOManager = new IBOManager(this._gl);
        ret.addIBO('square', squareVertices);
        ret.addIBO('torus', torusVertices);
        ret.addIBO('sphere', sphereVertices);

        return ret;
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mMatrix');
        ret.addUniform('mvpMatrix');
        ret.addUniform('invMatrix');
        ret.addUniform('lightDirection');
        //uniformManager.addUniform('lightPosition');
        ret.addUniform('eyeDirection');
        ret.addUniform('ambientColor');
        ret.addUniform('texture0');
        ret.addUniform('texture1');
        ret.addUniform('vertexAlpha');
        ret.addUniform('pointSize');
        ret.addUniform('outlineSizeRatio');
        ret.addUniform('isLight');
        ret.addUniform('isTexture');

        return ret;
    }
}

export default ShaderModel0;
