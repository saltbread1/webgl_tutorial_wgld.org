import Texture2DBufferManager from "../textureManager/texture2DBufferManager";

class FramebufferTexture2D {
    private readonly _gl: WebGLRenderingContext;
    private readonly _texMan: Texture2DBufferManager;
    private readonly _width: number;
    private readonly _height: number;
    private _framebuffer: WebGLFramebuffer | null;
    private _depthRenderbuffer: WebGLRenderbuffer | null;

    public constructor(gl: WebGLRenderingContext, texMan: Texture2DBufferManager, width: number, height: number) {
        this._gl = gl;
        this._texMan = texMan;
        this._width = width;
        this._height = height;
        this._framebuffer = null;
        this._depthRenderbuffer = null;
    }

    public initialize(): void {
        this._framebuffer = this._gl.createFramebuffer();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);

        this._depthRenderbuffer = this._gl.createRenderbuffer();
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._depthRenderbuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, this._width, this._height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._depthRenderbuffer);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

        this._texMan.createTexture(this._width, this._height);
        this._texMan.attachFramebuffer();

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    };

    public useFramebuffer(func: () => void): void {
        const cacheWidth: number = this._gl.drawingBufferWidth;
        const cacheHeight: number = this._gl.drawingBufferHeight;

        this._gl.viewport(0, 0, this._width, this._height);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);
        func();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        this._gl.viewport(0, 0, cacheWidth, cacheHeight);
    }

    public attachFramebuffer(): void {
        this._texMan.attachFramebuffer();
    }

    public useTexture(func: () => void, unit: number = this._gl.TEXTURE0): void {
        this._texMan.useTexture(func, unit);
    }
}

export default FramebufferTexture2D;
