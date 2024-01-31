import {Buffers} from "../types";
import ShaderPath from "../shaderPath";

abstract class Canvas {
    protected readonly _c: HTMLCanvasElement;
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _path: ShaderPath;

    protected constructor(c: HTMLCanvasElement) {
        this._c = c;
        this._gl = c.getContext('webgl')!;
        this._path = new ShaderPath(this._gl);
    }

    public initCanvas(): void {
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // enable culling
        // this._gl.enable(this._gl.CULL_FACE);

        // enable depth test
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);

        // const pointSizeRange: number[] = this._gl.getParameter(this._gl.ALIASED_POINT_SIZE_RANGE);
        // console.log(`pointSizeRange: ${pointSizeRange[0]} - ${pointSizeRange[1]}`);
    }

    public abstract initShader(): void;

    public startShader(): void {
        this._path.startShader(30);
    }

    public suspendShader(): void {
        this._path.suspendShader();
    }

    protected createFrameBuffer(width: number, height: number): Buffers {
        const frameBuffer: WebGLFramebuffer | null = this._gl.createFramebuffer();
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, frameBuffer);

        const depthRenderBuffer: WebGLRenderbuffer | null = this._gl.createRenderbuffer();
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, depthRenderBuffer);
        this._gl.renderbufferStorage(this._gl.RENDERBUFFER, this._gl.DEPTH_COMPONENT16, width, height);
        this._gl.framebufferRenderbuffer(this._gl.FRAMEBUFFER, this._gl.DEPTH_ATTACHMENT, this._gl.RENDERBUFFER, depthRenderBuffer);

        const fTexture: WebGLTexture | null = this._gl.createTexture();
        this._gl.bindTexture(this._gl.TEXTURE_2D, fTexture);
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
        this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, fTexture, 0);

        this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        this._gl.bindRenderbuffer(this._gl.RENDERBUFFER, null);
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        return {f: frameBuffer, d: depthRenderBuffer, t: fTexture};
    };
}

export default Canvas;
