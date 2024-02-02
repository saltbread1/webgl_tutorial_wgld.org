import {TextureManager} from "./textureManager";

abstract class Texture2DManager extends TextureManager {
    protected constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public override bindTexture(): void {
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
    }

    public override unbindTexture(): void {
        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
    }

    protected setTexParams(): void {
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    }
}

export default Texture2DManager;
