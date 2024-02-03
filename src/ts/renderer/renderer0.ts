import Renderer from "./renderer";
import {mat4, quat, vec3} from "gl-matrix";
import Framebuffer from "../frameBuffer/framebuffer";
import ModelDataManager from "../data/modelData";
import Program from "../data/program";
import {readFileSync} from "fs";
import {Vertices} from "../type";
import {sphere, torus} from "../util";
import Model0 from "../model/model0";
import Texture2DLoadManager from "../textureManager/texture2DLoadManager";

class Renderer0 extends Renderer {
    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();
    private readonly _invMatrix: mat4 = mat4.create();
    private readonly _qMatrix: mat4 = mat4.create();
    private readonly _mouseQuat: quat = quat.create();

    private readonly _textureManager: Texture2DLoadManager;

    public constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        super(canvas, gl);
        this._textureManager = new Texture2DLoadManager(gl);
    }

    public override createModels(): void {
        const program: Program = new Program(this._gl);
        program.create(readFileSync('src/shader/3d_model.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/3d_model.frag', {encoding: 'utf-8'}));

        const modelData0: ModelDataManager = new ModelDataManager(this._gl, program);
        const v0: Vertices = torus(128, 128, 0.2, 1.5);
        modelData0.createVertexData('position', v0.pos!, 3);
        modelData0.createVertexData('normal', v0.nor!, 3);
        modelData0.createVertexData('color', v0.col!, 4);
        modelData0.createVertexData('textureCoord', v0.st!, 2);
        modelData0.createIBO(v0.idx!);
        modelData0.createUniformData('mvpMatrix');
        modelData0.createUniformData('invMatrix');
        modelData0.createUniformData('lightDirection');
        modelData0.createUniformData('eyeDirection');
        modelData0.createUniformData('ambientColor');
        modelData0.createUniformData('texture0');
        modelData0.createUniformData('isLight');
        modelData0.createUniformData('isTexture');

        const modelData1: ModelDataManager = new ModelDataManager(this._gl, program);
        const v1: Vertices = sphere(128, 128, 2.25);
        modelData1.createVertexData('position', v1.pos!, 3);
        modelData1.createVertexData('normal', v1.nor!, 3);
        modelData1.createVertexData('color', v1.col!, 4);
        modelData1.createVertexData('textureCoord', v1.st!, 2);
        modelData1.createIBO(v1.idx!);
        modelData1.createUniformData('mvpMatrix');
        modelData1.createUniformData('invMatrix');
        modelData1.createUniformData('lightDirection');
        modelData1.createUniformData('eyeDirection');
        modelData1.createUniformData('ambientColor');
        modelData1.createUniformData('texture0');
        modelData1.createUniformData('isLight');
        modelData1.createUniformData('isTexture');

        this._models.set('torus', new Model0(this._gl, modelData0));
        this._models.set('sphere', new Model0(this._gl, modelData1));
    }

    public override async preProcess(): Promise<void> {
        super.preProcess();

        await this._textureManager.loadImage('img/texture0.png');
        this._textureManager.createTexture();

        mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 90, this._canvas.width / this._canvas.height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        this._models.get('torus')!.preProcess();
        this._models.get('sphere')!.preProcess();
    }

    public override render(fps: number): void {
        this._currSec += 1 / fps;

        this._gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.fromQuat(this._qMatrix, this._mouseQuat);
        mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, this._currSec * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        this._textureManager.useTexture((): void => {
            this._models.get('torus')!.render({mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix, isLight: 1, isTexture: 0});
            this._models.get('sphere')!.render({mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix, isLight: 0, isTexture: 1});
        }, this._gl.TEXTURE0);
    }

    public mouseMove(e: MouseEvent): void {
        const halfW: number = this._canvas.width / 2;
        const halfH: number = this._canvas.height / 2;
        const x: number = e.clientX - (this._canvas.clientLeft + halfW);
        const y: number = -(e.clientY - (this._canvas.clientTop + halfH));
        const rad: number = Math.PI * Math.sqrt((x*x+y*y)/(halfW*halfW+halfH*halfH));
        const axis: vec3 = vec3.create();
        vec3.normalize(axis, [x, y, 0]);
        vec3.rotateZ(axis, axis, [0, 0, 0], Math.PI/2);
        quat.setAxisAngle(this._mouseQuat, axis, rad);
    };
}

export default Renderer0;
