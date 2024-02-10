import Renderer from "./renderer";
import {mat4, quat, vec3, vec4} from "gl-matrix";
import ModelDataProcessor from "../data/modelDataProcessor";
import Program from "../data/program";
import {Vertices} from "../util/type";
import {cube, hsv2rgb, loadFile, torus} from "../util/util";
import VBOManager from "../data/vboManager";
import AttributeManager from "../data/attributeManager";
import IBOManager from "../data/iboManager";
import UniformManager from "../data/uniformManager";
import Model5 from "../model/model5";
import TextureCubeLoadManager from "../textureManager/textureCubeLoadManager";
import Model6 from "../model/model6";
import Renderer0 from "./renderer0";

class Renderer6 extends Renderer {
    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();
    private readonly _invMatrix: mat4 = mat4.create();
    private readonly _mouseQuat: quat = quat.create();

    private readonly _torusPosition: vec3 = vec3.create();
    private readonly _lightPosition: vec3 = vec3.create();
    private readonly _eyePosition: vec3 = vec3.create();
    private readonly _camUp: vec3 = vec3.create();
    private readonly _ambientColor: vec4 = vec4.create();

    private readonly _texMan: TextureCubeLoadManager;
    private readonly _cubeTarget: number;
    private readonly _mouseMove: (e: MouseEvent, c: HTMLCanvasElement) => void;

    public constructor(gl: WebGLRenderingContext, width: number, height: number, cubeTarget: number) {
        super(gl, width, height);
        this._texMan = new TextureCubeLoadManager(gl);
        this._cubeTarget = cubeTarget;
        this._mouseMove = new Renderer0(gl, width, height).mouseMove;
    }

    public override async createModels(): Promise<void> {
        const program0: Program = new Program(this._gl);
        program0.create(await loadFile('./shader/cube_map.vert'),
            await loadFile('./shader/cube_map.frag'));
        const program1: Program = new Program(this._gl);
        program1.create(await loadFile('./shader/3d_model2.vert'),
            await loadFile('./shader/3d_model2.frag'));

        const v0: Vertices = cube(128);
        const v1: Vertices = torus(128, 64, 0.25, 1);

        const attMan0: AttributeManager = new AttributeManager(this._gl);
        attMan0.addAttributeInfos(program0.get,
            {name: 'position', stride: 3},
            {name: 'normal', stride: 3},
            {name: 'color', stride: 4});
        const attMan1: AttributeManager = new AttributeManager(this._gl);
        attMan1.addAttributeInfos(program1.get,
            {name: 'position', stride: 3},
            {name: 'normal', stride: 3},
            {name: 'color', stride: 4},
            {name: 'textureCoord', stride: 2});

        const uniMan0: UniformManager = new UniformManager(this._gl);
        uniMan0.addLocations(program0.get, 'mMatrix', 'mvpMatrix', 'invMatrix', 'eyePosition', 'cubeTexture', 'isReflect');
        const uniMan1: UniformManager = new UniformManager(this._gl);
        uniMan1.addLocations(program1.get, 'mMatrix', 'mvpMatrix', 'invMatrix', 'lightPosition', 'eyePosition',
            'ambientColor', 'texture0', 'isLight', 'isTexture');

        const vboMan0: VBOManager = new VBOManager(this._gl);
        vboMan0.addBuffers({name: 'position', data: v0.pos!, stride: 3},
            {name: 'normal', data: v0.nor!, stride: 3},
            {name: 'color', data: v0.col!, stride: 4});
        const vboMan1: VBOManager = new VBOManager(this._gl);
        vboMan1.addBuffers({name: 'position', data: v1.pos!, stride: 3},
            {name: 'normal', data: v1.nor!, stride: 3},
            {name: 'color', data: v1.col!, stride: 4},
            {name: 'textureCoord', data: v1.st!, stride: 2});

        const iboMan0: IBOManager = new IBOManager(this._gl);
        iboMan0.setIBOInfo(v0.idx!);
        const iboMan1: IBOManager = new IBOManager(this._gl);
        iboMan1.setIBOInfo(v1.idx!);

        this._models.set('cube', new Model5(this._gl, new ModelDataProcessor(this._gl, program0, attMan0, uniMan0, vboMan0, iboMan0)));
        this._models.set('torus', new Model6(this._gl, new ModelDataProcessor(this._gl, program1, attMan1, uniMan1, vboMan1, iboMan1)));
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

        this.setParams();

        mat4.lookAt(this._vMatrix, this._eyePosition, this._torusPosition, this._camUp);
        mat4.perspective(this._pMatrix, 90, this._width / this._height, 0.1, 256);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._vMatrix);
    }

    private setParams(): void {
        switch (this._cubeTarget) {
            case this._gl.TEXTURE_CUBE_MAP_POSITIVE_X:
                vec3.set(this._torusPosition, 4, 0, 0);
                vec3.set(this._camUp, 0, -1, 0);
                vec4.copy(this._ambientColor, hsv2rgb(0, 0.3, 0.3, 0.3) as vec4);
                break;
            case this._gl.TEXTURE_CUBE_MAP_POSITIVE_Y:
                vec3.set(this._torusPosition, 0, 2, 0);
                vec3.set(this._camUp, 0, 0, 1);
                vec4.copy(this._ambientColor, hsv2rgb(1/6, 0.3, 0.3, 0.3) as vec4);
                break;
            case this._gl.TEXTURE_CUBE_MAP_POSITIVE_Z:
                vec3.set(this._torusPosition, 0, 0, 4);
                vec3.set(this._camUp, 0, -1, 0);
                vec4.copy(this._ambientColor, hsv2rgb(2/6, 0.3, 0.3, 0.3) as vec4);
                break;
            case this._gl.TEXTURE_CUBE_MAP_NEGATIVE_X:
                vec3.set(this._torusPosition, -4, 0, 0);
                vec3.set(this._camUp, 0, -1, 0);
                vec4.copy(this._ambientColor, hsv2rgb(3/6, 0.3, 0.3, 0.3) as vec4);
                break;
            case this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Y:
                vec3.set(this._torusPosition, 0, -4, 0);
                vec3.set(this._camUp, 0, 0, -1);
                vec4.copy(this._ambientColor, hsv2rgb(4/6, 0.3, 0.3, 0.3) as vec4);
                break;
            case this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Z:
                vec3.set(this._torusPosition, 0, 0, -4);
                vec3.set(this._camUp, 0, -1, 0);
                vec4.copy(this._ambientColor, hsv2rgb(5/6, 0.3, 0.3, 0.3) as vec4);
                break;
            default:
                throw new Error('Invalid cube target.');
        }
    }

    protected override mainRender(): void {
        mat4.identity(this._mMatrix);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.copy(this._invMatrix, this._mMatrix);

        this._texMan.useTexture((): void => {
            this._models.get('cube')?.render({mMatrix: this._mMatrix, mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix,
                eyePosition: this._eyePosition, isReflect: 0});
        }, this._gl.TEXTURE0);

        mat4.identity(this._mMatrix);
        mat4.translate(this._mMatrix, this._mMatrix, this._torusPosition);
        mat4.rotate(this._mMatrix, this._mMatrix, this.currSec * Math.PI * 0.3, [1, 1, 0]);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        vec3.set(this._lightPosition, 0.0, 0.0, 8.0);
        vec3.transformQuat(this._lightPosition, this._lightPosition, this._mouseQuat);

        this._models.get('torus')?.render({mMatrix: this._mMatrix, mvpMatrix: this._mvpMatrix, invMatrix: this._invMatrix,
            lightPosition: this._lightPosition, eyePosition: this._eyePosition, ambientColor: this._ambientColor});
    }

    public mouseMove(e: MouseEvent, c: HTMLCanvasElement): void {
        this._mouseMove(e, c);
    };
}

export default Renderer6;
