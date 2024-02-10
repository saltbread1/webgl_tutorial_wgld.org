import Renderer from "./renderer";
import {mat4} from "gl-matrix";
import Program from "../data/program";
import {loadFile, square} from "../util/util";
import {Vertices} from "../util/type";
import AttributeManager from "../data/attributeManager";
import UniformManager from "../data/uniformManager";
import VBOManager from "../data/vboManager";
import IBOManager from "../data/iboManager";
import Model1 from "../model/model1";
import ModelDataProcessor from "../data/modelDataProcessor";
import FramebufferTexture2D from "../data/framebufferTexture2D";

class Renderer1 extends Renderer {
    private readonly _elmBlur: HTMLInputElement;

    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();

    public constructor(gl: WebGLRenderingContext, width: number, height: number, elmBlur: HTMLInputElement) {
        super(gl, width, height);

        this._elmBlur = elmBlur;
    }

    public override async createModels(): Promise<void> {
        const program: Program = new Program(this._gl);
        program.create(await loadFile('./shader/2d_model.vert'),
            await loadFile('./shader/quad_blur.frag'));

        const v: Vertices = square(2);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'color', stride: 4},
            {name: 'textureCoord', stride: 2});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mvpMatrix', 'vertexAlpha', 'resolution', 'kernel', 'texture0', 'isBlur');

        const vboMan: VBOManager = new VBOManager(this._gl);
        vboMan.addBuffers({name: 'position', data: v.pos!, stride: 3},
            {name: 'color', data: v.col!, stride: 4},
            {name: 'textureCoord', data: v.st!, stride: 2});

        const iboMan: IBOManager = new IBOManager(this._gl);
        iboMan.setIBOInfo(v.idx!);

        this._models.set('blur', new Model1(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan, iboMan)));
    }

    public override preProcess(): void {
        super.preProcess();

        mat4.lookAt(this._vMatrix, [0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.ortho(this._pMatrix, -1.0, 1.0, 1.0, -1.0, 0.1, 1.0);
        mat4.multiply(this._mvpMatrix, this._mMatrix, this._mvpMatrix);
        mat4.multiply(this._mvpMatrix, this._vMatrix, this._mvpMatrix);
        mat4.multiply(this._mvpMatrix, this._pMatrix, this._mvpMatrix);
    }

    protected override mainRender(framebuffer?: FramebufferTexture2D): void {
        const isBlur: number = this._elmBlur.checked ? 1 : 0;

        framebuffer?.useTexture((): void => {
            this._models.get('blur')?.render({mvpMatrix: this._mvpMatrix, vertexAlpha: 1.0,
                resolution: [this._width, this._height], isBlur: isBlur});
        });
    }
}

export default Renderer1;
