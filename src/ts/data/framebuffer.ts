import TextureBufferManager from "../textureManager/textureBufferManager";

class Framebuffer {
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _texMan: TextureBufferManager;
    protected readonly _width: number;
    protected readonly _height: number;
    protected _framebuffer: WebGLFramebuffer | null;
    protected _depthRenderbuffer: WebGLRenderbuffer | null;

    public constructor(gl: WebGLRenderingContext, texMan: TextureBufferManager, width: number, height: number) {
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

    public attachFramebuffer(target: number): void {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);
        this._texMan.attachFramebuffer(target);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    }

    public useTexture(func: () => void, unit: number = this._gl.TEXTURE0): void {
        this._texMan.useTexture(func, unit);
    }
}

export default Framebuffer;
