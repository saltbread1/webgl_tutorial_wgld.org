import {vec3, mat4, quat} from "gl-matrix";
import {Buffers, Vertices} from "../types";
import {sphere, torus} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../shaderData";
import {readFileSync} from "fs";

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

    private _texture0: WebGLTexture | undefined;

    public constructor(gl: WebGLRenderingContext, elmCanvas: HTMLCanvasElement,) {
        super(gl, readFileSync('src/shader/model0.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/model0.frag', {encoding: 'utf-8'}));

        this._tmpMatrix = mat4.create();
        this._invMatrix = mat4.create();
        this._qMatrix = mat4.create();
        this._mouseQuat = quat.create();

        this._lightDirection = [-1.0, 1.0, 1.0];
        this._eyeDirection = [0.0, 0.0, 1.0];
        this._ambientColor = [0.1, 0.1, 0.1, 0.1];

        this._initTime = new Date().getTime();

        this._elmCanvas = elmCanvas;
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

    public override render(buffers: Buffers): void {
        this._gl.useProgram(this._program);

        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // initialize buffer
        this._gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // disable alpha blend
        this._gl.disable(this._gl.BLEND);

        // set common uniforms
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);

        // bind texture
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture0!);

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
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
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
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 1);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 0);

        // draw the torus inline
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('torus'), this._gl.UNSIGNED_SHORT, 0);
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
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: VBOManager = new VBOManager(this._gl, attMan);
        ret.addVBO('torus', torusVertices);
        ret.addVBO('sphere', sphereVertices);

        return ret;
    }

    protected override createIBOs(): IBOManager {
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: IBOManager = new IBOManager(this._gl);
        ret.addIBO('torus', torusVertices);
        ret.addIBO('sphere', sphereVertices);

        return ret;
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mvpMatrix');
        ret.addUniform('invMatrix');
        ret.addUniform('lightDirection');
        ret.addUniform('eyeDirection');
        ret.addUniform('ambientColor');
        ret.addUniform('texture0');
        ret.addUniform('isLight');
        ret.addUniform('isTexture');

        return ret;
    }
}

export default ShaderModel0;
