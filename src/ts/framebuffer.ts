import Texture2DBufferManager from "./textureManager/texture2DBufferManager";

class Framebuffer {
    private readonly _gl: WebGLRenderingContext;
    private readonly _texMan: Texture2DBufferManager;
    private _framebuffer: WebGLFramebuffer | null;
    private _depthRenderbuffer: WebGLRenderbuffer | null;

    public constructor(gl: WebGLRenderingContext, texMan: Texture2DBufferManager) {
        this._gl = gl;
        this._framebuffer = null;
        this._depthRenderbuffer = null;
        this._texMan = texMan;
    }

    public initialize(width: number, height: number, isAttach: boolean = true): void {
        this._framebuffer = this._gl.createFramebuffer();
        this.useFramebuffer((): void => {
            this._depthRenderbuffer = this._gl.createRenderbuffer();
            this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._depthRenderbuffer);
            this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, width, height);
            this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._depthRenderbuffer);
            this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

            this._texMan.createTexture(width, height);
            if (isAttach)  { this._texMan.attachFramebuffer(); }
        });
    };

    public useFramebuffer(func: () => void): void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);
        func();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    public useTexture(func: () => void): void {
        this._texMan.useTexture(func);
    }
}

export default Framebuffer;
