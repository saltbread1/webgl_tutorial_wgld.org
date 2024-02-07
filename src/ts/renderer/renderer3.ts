import Renderer from "./renderer";
import {mat4} from "gl-matrix";
import Program from "../data/program";
import {loadFile, sphere} from "../util/util";
import {Vertices} from "../util/type";
import AttributeManager from "../data/attributeManager";
import UniformManager from "../data/uniformManager";
import VBOManager from "../data/vboManager";
import ModelDataProcessor from "../data/modelDataProcessor";
import Model3 from "../model/model3";
import Texture2DLoadManager from "../textureManager/texture2DLoadManager";

class Renderer3 extends Renderer {
    private readonly _elmPointSize: HTMLInputElement;

    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();

    private readonly _texMan: Texture2DLoadManager;

    public constructor(gl: WebGLRenderingContext, width: number, height: number, elmPointSize: HTMLInputElement) {
        super(gl, width, height);

        this._elmPointSize = elmPointSize;
        this._texMan = new Texture2DLoadManager(gl);
    }

    public override async createModels(): Promise<void> {
        const program: Program = new Program(this._gl);
        program.create(await loadFile('./shader/pointTexture.vert'),
            await loadFile('./shader/pointTexture.frag'));

        const v: Vertices = sphere(16, 32, 1, true);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'color', stride: 4});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mvpMatrix', 'pointSize', 'texture0', 'isTexture');

        const vboMan: VBOManager = new VBOManager(this._gl);
        vboMan.addBuffers({name: 'position', data: v.pos!, stride: 3},
            {name: 'color', data: v.col!, stride: 4});

        this._models.set('sphere', new Model3(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan)));
    }

    public override async preProcess(): Promise<void> {
        super.preProcess();

        await this._texMan.loadImage('./img/texture1.png');
        this._texMan.createTexture();

        mat4.lookAt(this._vMatrix, [0.0, 0.0, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 45, this._width / this._height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);
    }

    public override render(fps: number): void {
        this._currSec += 1 / fps;

        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        const pointSize: number = parseFloat(this._elmPointSize.value);

        this._texMan.useTexture((): void => {
            mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
            mat4.rotateY(this._mMatrix, this._mMatrix, this._currSec * Math.PI * 0.1);
            mat4.rotateX(this._mMatrix, this._mMatrix, Math.PI * 0.5);
            mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
            this._models.get('sphere')?.render({mvpMatrix: this._mvpMatrix, pointSize: pointSize});
        });
    }
}

export default Renderer3;
