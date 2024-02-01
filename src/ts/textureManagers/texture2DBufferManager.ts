import Texture2DManager from "./texture2DManager";
import {TextureBufferManager} from "./textureManager";

class Texture2DBufferManager extends Texture2DManager implements TextureBufferManager {
    public constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public createTexture(width: number, height: number): void {
        this._texture = this._gl.createTexture();
        this.bindTexture();
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
        this.setTexParams();
        this.unbindTexture();
    }

    public attachFrameBuffer() : void{
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._texture, 0);
    }
}

export default Texture2DBufferManager;
