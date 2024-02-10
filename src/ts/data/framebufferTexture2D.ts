import Texture2DBufferManager from "../textureManager/texture2DBufferManager";
import Framebuffer from "./framebuffer";

class FramebufferTexture2D extends Framebuffer {
    public constructor(gl: WebGLRenderingContext, texMan: Texture2DBufferManager, width: number, height: number) {
        super(gl, texMan, width, height);
    }

    public override attachFramebuffer(): void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);
        this._texMan.attachFramebuffer(this._gl.TEXTURE_2D);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }
}

export default FramebufferTexture2D;
