import Renderer from "./renderer";
import {mat4, vec3} from "gl-matrix";
import Program from "../data/program";
import {loadFile, sphere} from "../util/util";
import {Vertices} from "../util/type";
import AttributeManager from "../data/attributeManager";
import UniformManager from "../data/uniformManager";
import VBOManager from "../data/vboManager";
import ModelDataProcessor from "../data/modelDataProcessor";
import Texture2DLoadManager from "../textureManager/texture2DLoadManager";
import IBOManager from "../data/iboManager";
import Model4 from "../model/model4";

class Renderer4 extends Renderer {
    private readonly _elmHeight: HTMLInputElement;

    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();
    private readonly _invMatrix: mat4 = mat4.create();
    private readonly _lightPosition: vec3 = [-16.0, 16.0, 8.0];
    private readonly _eyePosition: vec3 = [0.0, 0.0, 4.0];

    private readonly _texMan: Texture2DLoadManager;

    public constructor(gl: WebGLRenderingContext, width: number, height: number, elmHeight: HTMLInputElement) {
        super(gl, width, height);

        this._elmHeight = elmHeight;
        this._texMan = new Texture2DLoadManager(gl);
    }

    public override async createModels(): Promise<void> {
        const program: Program = new Program(this._gl);
        program.create(await loadFile('./shader/bump_map.vert'),
            await loadFile('./shader/bump_map.frag'));

        const v: Vertices = sphere(64, 128, 1, true);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'normal', stride: 3},
            {name: 'color', stride: 4},
            {name: 'textureCoord', stride: 2});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mMatrix', 'mvpMatrix', 'invMatrix', 'lightPosition', 'eyePosition', 'texture0', 'height');

        const vboMan: VBOManager = new VBOManager(this._gl);
        vboMan.addBuffers({name: 'position', data: v.pos!, stride: 3},
            {name: 'normal', data: v.nor!, stride: 3},
            {name: 'color', data: v.col!, stride: 4},
            {name: 'textureCoord', data: v.st!, stride: 2});

        const iboMan: IBOManager = new IBOManager(this._gl);
        iboMan.setIBOInfo(v.idx!);

        this._models.set('sphere', new Model4(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan, iboMan)));
    }

    public override async preProcess(): Promise<void> {
        super.preProcess();

        await this._texMan.loadImage('./img/normal_height0.png');
        this._texMan.createTexture({warpS: this._gl.REPEAT, warpT: this._gl.REPEAT});

        mat4.lookAt(this._vMatrix, this._eyePosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 45, this._width / this._height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);
    }

    public override render(fps: number): void {
        this._currSec += 1 / fps;

        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        const height: number = parseFloat(this._elmHeight.value);

        this._texMan.useTexture((): void => {
            mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
            mat4.rotateY(this._mMatrix, this._mMatrix, this._currSec * Math.PI * 0.1);
            mat4.rotateX(this._mMatrix, this._mMatrix, Math.PI * 0.5);
            mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
            mat4.invert(this._invMatrix, this._mMatrix);
            this._models.get('sphere')?.render({mMatrix: this._mMatrix, mvpMatrix: this._mvpMatrix,
                invMatrix: this._invMatrix, lightPosition: this._lightPosition, eyePosition: this._eyePosition, height: height});
        });
    }
}

export default Renderer4;
