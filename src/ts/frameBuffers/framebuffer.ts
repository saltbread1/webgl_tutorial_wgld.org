import {TextureBufferManager} from "../textureManagers/textureManager";

class Framebuffer<T extends TextureBufferManager> {
    private readonly _gl: WebGLRenderingContext;
    private readonly _textureManager: T;
    private _framebuffer: WebGLFramebuffer | null;
    private _depthRenderBuffer: WebGLRenderbuffer | null;

    public constructor(gl: WebGLRenderingContext, textureManager: T) {
        this._gl = gl;
        this._framebuffer = null;
        this._depthRenderBuffer = null;
        this._textureManager = textureManager;
    }

    public get getFramebuffer(): WebGLFramebuffer | null {
        return this._framebuffer;
    }

    public getDepthBuffer(): WebGLRenderbuffer | null {
        return this._depthRenderBuffer;
    }

    public getTextureManager(): T {
        return this._textureManager;
    }

    public initializeFrameBuffer(width: number, height: number): void {
        this._framebuffer = this._gl.createFramebuffer();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._framebuffer);

        this._depthRenderBuffer = this._gl.createRenderbuffer();
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, this._depthRenderBuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, width, height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, this._depthRenderBuffer);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);

        this._textureManager.createTexture(width, height);
        this._textureManager.attachFrameBuffer();

        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
    };
}

export default Framebuffer;
