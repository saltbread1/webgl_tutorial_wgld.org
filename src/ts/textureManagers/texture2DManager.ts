import {TextureManager} from "./textureManager";

abstract class Texture2DManager implements TextureManager {
    protected readonly _gl: WebGLRenderingContext;
    protected _texture: WebGLTexture | null;

    protected constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._texture = null;
    }

    protected setTexParams(): void {
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    }

    public activeTexture(texUnit: number): void {
        this._gl.activeTexture(texUnit);
    }

    public bindTexture(): void {
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    }

    public unbindTexture(): void {
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    }
}

export default Texture2DManager;
