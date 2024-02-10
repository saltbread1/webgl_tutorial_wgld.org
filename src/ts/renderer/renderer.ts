import Model from "../model/model";
import Framebuffer from "../data/framebuffer";

abstract class Renderer {
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _width: number;
    protected readonly _height: number;
    protected readonly _models: Map<string, Model>;
    private _currSec: number = 0;

    protected constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this._gl = gl;
        this._width = width;
        this._height = height;
        this._models = new Map<string, Model>;
    }

    protected get currSec(): number {
        return this._currSec;
    }

    public abstract createModels(): void | Promise<void>;

    public preProcess(): void | Promise<void> {
        // none
    }

    protected clear(): void {
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
    }

    protected abstract mainRender(framebuffer?: Framebuffer): void;

    public render(isPause: boolean, dSec: number, framebuffer?: Framebuffer): void {
        if (!isPause) { this._currSec += dSec; }
        this.clear();
        this.mainRender(framebuffer);
    }
}

export default Renderer;
