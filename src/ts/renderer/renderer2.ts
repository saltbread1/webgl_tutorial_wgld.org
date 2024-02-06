import Renderer from "./renderer";
import {mat4} from "gl-matrix";
import Program from "../data/program";
import {blend, loadFile, square} from "../util";
import {Vertices} from "../type";
import AttributeManager from "../data/attributeManager";
import UniformManager from "../data/uniformManager";
import VBOManager from "../data/vboManager";
import IBOManager from "../data/iboManager";
import ModelDataProcessor from "../data/modelDataProcessor";
import Framebuffer from "../framebuffer";
import {BlendType} from "../enum";
import Model2 from "../model/model2";

class Renderer2 extends Renderer {
    private readonly _elmTransparency: HTMLInputElement;
    private readonly _elmAdd: HTMLInputElement;
    private readonly _elmAlphaValue: HTMLInputElement;

    private readonly _mMatrix: mat4 = mat4.create();
    private readonly _vMatrix: mat4 = mat4.create();
    private readonly _pMatrix: mat4 = mat4.create();
    private readonly _mvpMatrix: mat4 = mat4.create();
    private readonly _tmpMatrix: mat4 = mat4.create();

    public constructor(gl: WebGLRenderingContext, width: number, height: number,
                       elmTransparency: HTMLInputElement, elmAdd: HTMLInputElement, elmAlphaValue: HTMLInputElement) {
        super(gl, width, height);

        this._elmTransparency = elmTransparency;
        this._elmAdd = elmAdd;
        this._elmAlphaValue = elmAlphaValue;
    }

    public override async createModels(): Promise<void> {
        const program: Program = new Program(this._gl);
        program.create(await loadFile('./shader/2d_model.vert'),
            await loadFile('./shader/2d_model.frag'));

        const v: Vertices = square(1.5);

        const attMan: AttributeManager = new AttributeManager(this._gl);
        attMan.addAttributeInfos(program.get,
            {name: 'position', stride: 3},
            {name: 'color', stride: 4},
            {name: 'textureCoord', stride: 2});

        const uniMan: UniformManager = new UniformManager(this._gl);
        uniMan.addLocations(program.get, 'mvpMatrix', 'vertexAlpha', 'texture0', 'isTexture');

        const vboMan: VBOManager = new VBOManager(this._gl);
        vboMan.addBuffers({name: 'position', data: v.pos!, stride: 3},
            {name: 'color', data: v.col!, stride: 4},
            {name: 'textureCoord', data: v.st!, stride: 2});

        const iboMan: IBOManager = new IBOManager(this._gl);
        iboMan.setIBOInfo(v.idx!);

        this._models.set('square', new Model2(this._gl, new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan, iboMan)));
    }

    public override preProcess(): void {
        super.preProcess();

        mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 45, this._width / this._height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);
    }

    public override render(fps: number, framebuffer?: Framebuffer): void {
        this._currSec += 1 / fps;

        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        this._gl.disable(this._gl.DEPTH_TEST);
        this._gl.enable(this._gl.BLEND);

        let blendType: BlendType = BlendType.INVALIABLE;
        if (this._elmTransparency.checked) {
            blendType = BlendType.ALPHA;
        }
        if (this._elmAdd.checked) {
            blendType = BlendType.ADD
        }
        blend(this._gl, blendType);

        const vertexAlpha: number = parseFloat(this._elmAlphaValue.value);

        framebuffer?.useTexture((): void => {
            mat4.fromTranslation(this._mMatrix, [0.5, 0.0, 0.0]);
            mat4.rotateY(this._mMatrix, this._mMatrix, -this._currSec * Math.PI * 0.25);
            mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
            this._models.get('square')?.render({mvpMatrix: this._mvpMatrix, vertexAlpha: vertexAlpha});

            mat4.fromTranslation(this._mMatrix, [-0.5, 0.0, -0.2]);
            mat4.rotateZ(this._mMatrix, this._mMatrix, this._currSec * Math.PI * 0.1);
            mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
            this._models.get('square')?.render({mvpMatrix: this._mvpMatrix, vertexAlpha: vertexAlpha});
        });

        this._gl.disable(this._gl.BLEND);
        this._gl.enable(this._gl.DEPTH_TEST);
    }
}

export default Renderer2;
