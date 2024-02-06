import Model from "../model/model";
import Framebuffer from "../data/framebuffer";

abstract class Renderer {
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _width: number;
    protected readonly _height: number;
    protected readonly _models: Map<string, Model>;
    protected _currSec: number = 0;

    protected constructor(gl: WebGLRenderingContext, width: number, height: number) {
        this._gl = gl;
        this._width = width;
        this._height = height;
        this._models = new Map<string, Model>;
    }

    public abstract createModels(): void | Promise<void>;

    public preProcess(): void | Promise<void> {
        // none
    }

    public abstract render(fps: number, framebuffer?: Framebuffer): void;
}

export default Renderer;
