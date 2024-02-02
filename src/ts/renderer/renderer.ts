import Model from "../model/model";
import Framebuffer from "../frameBuffer/framebuffer";

abstract class Renderer {
    protected readonly _canvas: HTMLCanvasElement;
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _models: Map<string, Model>;
    protected _currSec: number = 0;

    protected constructor(canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
        this._canvas = canvas;
        this._gl = gl;
        this._models = new Map<string, Model>;
    }

    public abstract createModels(): void;

    public preProcess(): void | Promise<void> {
        // none
    }

    public abstract render(fps: number, framebuffer?: Framebuffer): void;
}

export default Renderer;
