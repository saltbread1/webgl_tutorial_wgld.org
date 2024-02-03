import {mat4} from "gl-matrix"
import {BlendType} from "../type";
import {ProgramCreator, AttributeManager, VBOManager, IBOManager, UniformManager} from "../data/modelDataProcessor";
import Framebuffer from "../framebuffer";
import {TextureBufferManager} from "../textureManager/textureManager";

abstract class ShaderModel {
    protected readonly _gl: WebGLRenderingContext;

    protected readonly _program: WebGLProgram;
    protected readonly _attMan: AttributeManager;
    protected readonly _vboMan: VBOManager;
    protected readonly _iboMan: IBOManager;
    protected readonly _uniMan: UniformManager;

    protected readonly _mMatrix: mat4;
    protected readonly _vMatrix: mat4;
    protected readonly _pMatrix: mat4;
    protected readonly _mvpMatrix: mat4;

    protected readonly _initTime: number;

    protected constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
        this._gl = gl;

        this._program = new ProgramCreator(this._gl, vs, fs).createProgram()!;
        this._attMan = this.createAttributes(this._program);
        const vi: {vm: VBOManager, im: IBOManager} = this.createVBOAndIBO(this._attMan);
        this._vboMan = vi.vm;
        this._iboMan = vi.im;
        this._uniMan = this.createUniforms(this._program);

        this._mMatrix = mat4.create();
        this._vMatrix = mat4.create();
        this._pMatrix = mat4.create();
        this._mvpMatrix = mat4.create();

        this._initTime = new Date().getTime();
    }

    public abstract initialize(): void;

    public abstract render<T extends TextureBufferManager>(framebuffer: Framebuffer<T> | null): void;

    protected abstract createAttributes(program: WebGLProgram): AttributeManager;

    protected abstract createVBOAndIBO(attMan: AttributeManager): {vm: VBOManager, im: IBOManager};

    protected abstract createUniforms(program: WebGLProgram): UniformManager;

    protected blend(type: BlendType): void {
        switch (type) {
            case BlendType.ALPHA:
                this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE);
                break;
            case BlendType.ADD:
                this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE, this._gl.ONE, this._gl.ONE);
                break;
            default:
                throw new Error('This blend type is illegal.');
        }
    };
}

export default ShaderModel;
