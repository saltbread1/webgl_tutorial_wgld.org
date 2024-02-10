import Renderer from "./renderer";
import {mat4, quat, vec3} from "gl-matrix";
import ModelDataProcessor from "../data/modelDataProcessor";
import Program from "../data/program";
import {Vertices} from "../util/type";
import {cube, loadFile, torus} from "../util/util";
import VBOManager from "../data/vboManager";
import AttributeManager from "../data/attributeManager";
import IBOManager from "../data/iboManager";
import UniformManager from "../data/uniformManager";
import Model5 from "../model/model5";
import TextureCubeLoadManager from "../textureManager/textureCubeLoadManager";
import Renderer0 from "./renderer0";

class Renderer5 extends Renderer {
    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();
    private readonly _invMatrix: mat4 = mat4.create();
    private readonly _mouseQuat: quat = quat.create();

    private readonly _eyePosition: vec3 = vec3.create();
    private readonly _camUp: vec3 = vec3.create();

    private readonly _texMan: TextureCubeLoadManager;
    private readonly _mouseMove: (e: MouseEvent, c: HTMLCanvasElement) => void;

    public constructor(gl: WebGLRenderingContext, width: number, height: number) {
        super(gl, width, height);
        this._texMan = new TextureCubeLoadManager(gl);
        this._mouseMove = new Renderer0(gl, width, height).mouseMove;
    }

    public override async createModels(): Promise<void> {
        const program: Program = new Program(this._gl);
        program.create(await loadFile('./shader/cube_map.vert'),
            await loadFile('./shader/cube_map.frag'));

        const v0: Vertices = cube(32);
        const v1: Vertices = torus(128, 64, 0.25, 1, true);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'normal', stride: 3},
            {name: 'color', stride: 4});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mMatrix', 'mvpMatrix', 'invMatrix', 'eyePosition', 'cubeTexture', 'isReflect');

        const vboMan0: VBOManager = new VBOManager(this._gl);
        vboMan0.addBuffers({name: 'position', data: v0.pos!, stride: 3},
            {name: 'normal', data: v0.nor!, stride: 3},
            {name: 'color', data: v0.col!, stride: 4});

        const vboMan1: VBOManager = new VBOManager(this._gl);
        vboMan1.addBuffers({name: 'position', data: v1.pos!, stride: 3},
            {name: 'normal', data: v1.nor!, stride: 3},
            {name: 'color', data: v1.col!, stride: 4});

        const iboMan0: IBOManager = new IBOManager(this._gl);
        iboMan0.setIBOInfo(v0.idx!);

        const iboMan1: IBOManager = new IBOManager(this._gl);
        iboMan1.setIBOInfo(v1.idx!);

        this._models.set('cube', new Model5(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan0, iboMan0)));
        this._models.set('torus', new Model5(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan1, iboMan1)));
    }

    public override async preProcess(): Promise<void> {
        super.preProcess();

        await this._texMan.loadImage('img/cube_map0/cube_PX.png');
        await this._texMan.loadImage('img/cube_map0/cube_PY.png');
        await this._texMan.loadImage('img/cube_map0/cube_PZ.png');
        await this._texMan.loadImage('img/cube_map0/cube_NX.png');
        await this._texMan.loadImage('img/cube_map0/cube_NY.png');
        await this._texMan.loadImage('img/cube_map0/cube_NZ.png');
        this._texMan.createTexture();
    }

    protected override mainRender(): void {
        vec3.set(this._eyePosition, 0.0, 0.0, 6.0);
        vec3.set(this._camUp, 0.0, 1.0, 0.0);
        vec3.transformQuat(this._eyePosition, this._eyePosition, this._mouseQuat);
        vec3.transformQuat(this._camUp, this._camUp, this._mouseQuat);

        mat4.identity(this._tmpMatrix);
        mat4.lookAt(this._vMatrix, this._eyePosition, [0.0, 0.0, 0.0], this._camUp);
        mat4.perspective(this._pMatrix, 45, this._width / this._height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        mat4.identity(this._mMatrix);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.copy(this._invMatrix, this._mMatrix);

        this._texMan.useTexture((): void => {
            this._models.get('cube')?.render({mMatrix: this._mMatrix, mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix,
                eyePosition: this._eyePosition, isReflect: 0});
        }, this._gl.TEXTURE0);

        mat4.identity(this._mMatrix);
        mat4.rotateZ(this._mMatrix, this._mMatrix, this.currSec * Math.PI * 0.15);
        mat4.translate(this._mMatrix, this._mMatrix, [2.0, 0.0, 0.0]);
        //mat4.rotateZ(this._mMatrix, this._mMatrix, -this.currSec * Math.PI * 0.15);
        mat4.rotateX(this._mMatrix, this._mMatrix, this.currSec * Math.PI * 0.3);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        this._texMan.useTexture((): void => {
            this._models.get('torus')?.render({mMatrix: this._mMatrix, mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix,
                eyePosition: this._eyePosition, isReflect: 1});
        }, this._gl.TEXTURE0);
    }

    public mouseMove(e: MouseEvent, c: HTMLCanvasElement): void {
        this._mouseMove(e, c);
    };
}

export default Renderer5;
