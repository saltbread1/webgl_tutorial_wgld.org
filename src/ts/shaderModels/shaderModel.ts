import {mat4} from "gl-matrix"
import {Buffers, BlendType} from "../types";
import {ProgramCreator, AttributeManager, VBOManager, IBOManager, UniformManager} from "../shaderData";

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

    protected constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
        this._gl = gl;

        this._program = new ProgramCreator(this._gl, vs, fs).createProgram()!;
        this._attMan = this.createAttributes(this._program);
        this._vboMan = this.createVBOs(this._attMan);
        this._iboMan = this.createIBOs();
        this._uniMan = this.createUniforms(this._program);

        this._mMatrix = mat4.create();
        this._vMatrix = mat4.create();
        this._pMatrix = mat4.create();
        this._mvpMatrix = mat4.create();
    }

    public abstract initialize(): void;

    public abstract render(buffers: Buffers): void;

    protected abstract createAttributes(program: WebGLProgram): AttributeManager;

    protected abstract createVBOs(attMan: AttributeManager): VBOManager;

    protected abstract createIBOs(): IBOManager;

    protected abstract createUniforms(program: WebGLProgram): UniformManager;

    protected createTexture(source: string): Promise<WebGLTexture> {
        return new Promise<WebGLTexture>((resolve: (value: WebGLTexture) => void): void => {
            const img: HTMLImageElement = new Image();

            img.onload = (): void => {
                const texture: WebGLTexture = this._gl.createTexture()!;
                this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                resolve(texture);
            };
            img.src = source;
        });
    }

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
