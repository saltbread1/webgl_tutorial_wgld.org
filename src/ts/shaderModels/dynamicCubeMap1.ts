import {vec3, mat4, quat} from "gl-matrix";
import {Vertices} from "../types";
import {cube, torus} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../shaderData";
import {readFileSync} from "fs";
import {TextureBufferManager, TextureLoadManager} from "../textureManagers/textureManager";
import Framebuffer from "../frameBuffers/framebuffer";
import CubeTextureLoadManager from "../textureManagers/CubeTextureLoadManager";

class DynamicCubeMap1 extends ShaderModel {
    private readonly _elmCanvas: HTMLCanvasElement;
    private readonly _elmEta: HTMLInputElement;
    private readonly _tmpMatrix: mat4;
    private readonly _invMatrix: mat4;
    private readonly _mouseQuat: quat;
    private readonly _textureManager: TextureLoadManager;

    public constructor(gl: WebGLRenderingContext, elmCanvas: HTMLCanvasElement, elmEta: HTMLInputElement) {
        super(gl, readFileSync('src/shader/cube_map.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/cube_map.frag', {encoding: 'utf-8'}));

        this._elmCanvas = elmCanvas;
        this._elmEta = elmEta;
        this._tmpMatrix = mat4.create();
        this._invMatrix = mat4.create();
        this._mouseQuat = quat.create();
        this._textureManager = new CubeTextureLoadManager(gl);
    }

    public override async initialize(): Promise<void> {
        this._gl.useProgram(this._program);

        // cube map texture
        await this._textureManager.loadImage('img/cube_map0/cube_PX.png');
        await this._textureManager.loadImage('img/cube_map0/cube_PY.png');
        await this._textureManager.loadImage('img/cube_map0/cube_PZ.png');
        await this._textureManager.loadImage('img/cube_map0/cube_NX.png');
        await this._textureManager.loadImage('img/cube_map0/cube_NY.png');
        await this._textureManager.loadImage('img/cube_map0/cube_NZ.png');
        this._textureManager.createTexture();
        this._textureManager.activeTexture(this._gl.TEXTURE0);
        this._gl.uniform1i(this._uniMan.getUniform('cubeTexture'), 0);
    }

    public mouseMove(e: MouseEvent): void {
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

    public override render<T extends TextureBufferManager>(framebuffer: Framebuffer<T> | null): void {
        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // initialize buffer
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        this._gl.useProgram(this._program);

        const eta: number = parseFloat(this._elmEta.value);
        this._gl.uniform1f(this._uniMan.getUniform('eta'), eta);

        // disable alpha blend
        this._gl.disable(this._gl.BLEND);

        // bind texture
        this._textureManager.bindTexture();

        //const lightPosition: vec3 = [-16.0, 16.0, 8.0];
        const eyePosition: vec3 = [0.0, 0.0, 6.0];
        const camUp: vec3 = [0.0, 1.0, 0.0];

        vec3.transformQuat(eyePosition, eyePosition, this._mouseQuat);
        vec3.transformQuat(camUp, camUp, this._mouseQuat);

        mat4.identity(this._tmpMatrix);
        mat4.lookAt(this._vMatrix, eyePosition, [0.0, 0.0, 0.0], camUp);
        mat4.perspective(this._pMatrix, 45, this._elmCanvas.width / this._elmCanvas.height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        // set lights
        //this._gl.uniform3fv(this._uniMan.getUniform('lightPosition'), lightPosition);
        this._gl.uniform3fv(this._uniMan.getUniform('eyePosition'), eyePosition);

        this.renderTorus(time);
        this.renderCube(time);
    }

    private renderTorus(time: number): void {
        // set sphere attributes
        this._vboMan.setAttribute('torusPosition', 'position');
        this._vboMan.setAttribute('torusNormal', 'normal');
        this._vboMan.setAttribute('torusColor', 'color');

        // apply sphere IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('torus')!);

        // matrix for sphere
        mat4.identity(this._mMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI * 0.2);
        mat4.translate(this._mMatrix, this._mMatrix, [2.0, 0.0, 0.0]);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for sphere
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniform1i(this._uniMan.getUniform('isReflection'), 1);

        // draw the sphere
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('torus'), this._gl.UNSIGNED_SHORT, 0);
    }

    private renderCube(time: number): void {
        this._vboMan.setAttribute('cubePosition', 'position');
        this._vboMan.setAttribute('cubeNormal', 'normal');
        this._vboMan.setAttribute('cubeColor', 'color');

        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('cube')!);

        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniform1i(this._uniMan.getUniform('isReflection'), 0);

        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('cube'), this._gl.UNSIGNED_SHORT, 0);
    }

    protected override createAttributes(program: WebGLProgram): AttributeManager {
        const ret: AttributeManager = new AttributeManager(this._gl, program);

        ret.addAttribute('position', 3);
        ret.addAttribute('normal', 3);
        ret.addAttribute('color', 4);

        return ret;
    }

    protected override createVBOAndIBO(attMan: AttributeManager): {vm: VBOManager, im: IBOManager} {
        const torusVertices: Vertices = torus(128, 128, 0.2, 1);
        const cubeVertices: Vertices = cube(32);

        const vm: VBOManager = new VBOManager(this._gl, attMan);
        vm.addVBOFromVertices('torus', torusVertices);
        vm.addVBOFromVertices('cube', cubeVertices);

        const im: IBOManager = new IBOManager(this._gl);
        im.addIBO('torus', torusVertices);
        im.addIBO('cube', cubeVertices);

        return {vm: vm, im: im};
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mMatrix');
        ret.addUniform('invMatrix');
        ret.addUniform('mvpMatrix');
        ret.addUniform('eyePosition');
        ret.addUniform('cubeTexture');
        ret.addUniform('isReflection');
        ret.addUniform('eta');

        return ret;
    }
}

export default DynamicCubeMap1;
