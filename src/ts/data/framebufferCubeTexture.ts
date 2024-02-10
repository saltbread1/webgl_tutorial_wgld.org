import TextureCubeBufferManager from "../textureManager/textureCubeBufferManager";
import Framebuffer from "./framebuffer";

class FramebufferCubeTexture extends Framebuffer {
    public constructor(gl: WebGLRenderingContext, texMan: TextureCubeBufferManager, width: number, height: number) {
        super(gl, texMan, width, height);
    }

    public override attachFramebuffer(target: number): void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);
        this._texMan.attachFramebuffer(target);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }
}

export default FramebufferCubeTexture;
