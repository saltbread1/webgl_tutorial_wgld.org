import {TextureBufferManager} from "../textureManager/textureManager";

class Framebuffer {
    private readonly _gl: WebGLRenderingContext;
    private readonly _texMan: TextureBufferManager;
    private _framebuffer: WebGLFramebuffer | null;
    private _depthRenderbuffer: WebGLRenderbuffer | null;

    public constructor(gl: WebGLRenderingContext, texMan: TextureBufferManager) {
        this._gl = gl;
        this._framebuffer = null;
        this._depthRenderbuffer = null;
        this._texMan = texMan;
    }

    public get getFramebuffer(): WebGLFramebuffer | null {
        return this._framebuffer;
    }

    public get getDepthRenderbuffer(): WebGLRenderbuffer | null {
        return this._depthRenderbuffer;
    }

    public get getTextureManager(): TextureBufferManager {
        return this._texMan;
    }

    public initialize(width: number, height: number, isAttach: boolean = true): void {
        this._framebuffer = this._gl.createFramebuffer();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);

        this._depthRenderbuffer = this._gl.createRenderbuffer();
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._depthRenderbuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, width, height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._depthRenderbuffer);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

        this._texMan.createTexture(width, height);
        if (isAttach)  { this._texMan.attachFramebuffer(); }

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    };
}

export default Framebuffer;
