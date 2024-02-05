import Renderer from "./renderer";
import {mat4, quat, vec3} from "gl-matrix";
import ModelDataProcessor from "../data/modelDataProcessor";
import Program from "../data/program";
import {readFileSync} from "fs";
import {Vertices} from "../type";
import {sphere, torus} from "../util";
import Model0 from "../model/model0";
import Texture2DLoadManager from "../textureManager/texture2DLoadManager";
import VBOManager from "../data/vboManager";
import AttributeManager from "../data/attributeManager";
import IBOManager from "../data/iboManager";
import UniformManager from "../data/uniformManager";

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

    public constructor(gl: WebGLRenderingContext, width: number, height: number) {
        super(gl, width, height);
        this._textureManager = new Texture2DLoadManager(gl);
    }

    public override createModels(): void {
        const program: Program = new Program(this._gl);
        program.create(readFileSync('src/shader/3d_model.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/3d_model.frag', {encoding: 'utf-8'}));

        const v0: Vertices = torus(128, 128, 0.2, 1.5, true);
        const v1: Vertices = sphere(128, 128, 2.25, true);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'normal', stride: 3},
            {name: 'color', stride: 4},
            {name: 'textureCoord', stride: 2});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mvpMatrix', 'invMatrix', 'lightDirection', 'eyeDirection', 'ambientColor', 'texture0', 'isLight', 'isTexture');

        const vboMan0: VBOManager = new VBOManager(this._gl);
        vboMan0.addBuffers({name: 'position', data: v0.pos!, stride: 3},
            {name: 'normal', data: v0.nor!, stride: 3},
            {name: 'color', data: v0.col!, stride: 4},
            {name: 'textureCoord', data: v0.st!, stride: 2});

        const vboMan1: VBOManager = new VBOManager(this._gl);
        vboMan1.addBuffers({name: 'position', data: v1.pos!, stride: 3},
            {name: 'normal', data: v1.nor!, stride: 3},
            {name: 'color', data: v1.col!, stride: 4},
            {name: 'textureCoord', data: v1.st!, stride: 2});

        const iboMan0: IBOManager = new IBOManager(this._gl);
        iboMan0.setIBOInfo(v0.idx!);

        const iboMan1: IBOManager = new IBOManager(this._gl);
        iboMan1.setIBOInfo(v1.idx!);

        this._models.set('torus', new Model0(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan0, iboMan0)));
        this._models.set('sphere', new Model0(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan1, iboMan1)));
    }

    public override async preProcess(): Promise<void> {
        super.preProcess();

        await this._textureManager.loadImage('img/texture0.png');
        this._textureManager.createTexture();

        mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 90, this._width / this._height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);
    }

    public override render(fps: number): void {
        this._currSec += 1 / fps;

        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.fromQuat(this._qMatrix, this._mouseQuat);
        mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, this._currSec * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        this._textureManager.useTexture((): void => {
            this._models.get('torus')?.render({mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix, isLight: 1, isTexture: 0});
            this._models.get('sphere')?.render({mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix, isLight: 0, isTexture: 1});
        }, this._gl.TEXTURE0);
    }

    public mouseMove(e: MouseEvent, c: HTMLCanvasElement): void {
        const halfW: number = c.width / 2;
        const halfH: number = c.height / 2;
        const x: number = e.clientX - (c.clientLeft + halfW);
        const y: number = -(e.clientY - (c.clientTop + halfH));
        const rad: number = Math.PI * Math.sqrt((x*x+y*y)/(halfW*halfW+halfH*halfH));
        const axis: vec3 = vec3.create();
        vec3.normalize(axis, [x, y, 0]);
        vec3.rotateZ(axis, axis, [0, 0, 0], Math.PI/2);
        quat.setAxisAngle(this._mouseQuat, axis, rad);
    };
}

export default Renderer0;
