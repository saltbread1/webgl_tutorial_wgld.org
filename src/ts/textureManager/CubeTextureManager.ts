import TextureManager from "./textureManager";

abstract class CubeTextureManager extends TextureManager {
    protected constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public override useTexture(func: () => void, unit: number = this._gl.TEXTURE0): void {
        this._gl.activeTexture(unit);
        this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, this._texture);
        func();
        this._gl.activeTexture(unit);
        this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
    }

    protected setTexParams(): void {
        this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
    }
}

export default CubeTextureManager;
