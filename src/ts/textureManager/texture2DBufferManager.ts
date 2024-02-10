import Texture2DManager from "./texture2DManager";

class Texture2DBufferManager extends Texture2DManager {
    public constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public createTexture(width: number, height: number): void {
        this._texture = this._gl.createTexture();
        this.useTexture((): void => {
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
            this.setTexParams();
        });
    }

    public attachFramebuffer() : void {
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._texture, 0);
    }
}

export default Texture2DBufferManager;
