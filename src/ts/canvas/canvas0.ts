import Canvas from "./canvas";
import Framebuffer from "../framebuffer";
import Texture2DBufferManager from "../textureManager/texture2DBufferManager";
import Renderer0 from "../renderer/renderer0";
import Renderer1 from "../renderer/renderer1";
import Renderer2 from "../renderer/renderer2";

class Canvas0 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
        const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
        const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;
        const elmBlur: HTMLInputElement = document.getElementById('blur') as HTMLInputElement;

        const fWidth: number = 256;
        const fHeight: number = 256;
        const buff0: Framebuffer = new Framebuffer(this._gl, new Texture2DBufferManager(this._gl));
        buff0.initialize(this._canvas.width, this._canvas.height);
        const buff1: Framebuffer = new Framebuffer(this._gl, new Texture2DBufferManager(this._gl));
        buff1.initialize(this._canvas.width, this._canvas.height);

        const renderer0: Renderer0 = new Renderer0(this._gl, fWidth, fHeight);
        const renderer1: Renderer1 = new Renderer1(this._gl, this._canvas.width, this._canvas.height, elmBlur);
        const renderer2: Renderer2 = new Renderer2(this._gl, this._canvas.width, this._canvas.height, elmTransparency, elmAdd, elmAlphaValue);

        renderer0.createModels();
        await renderer0.preProcess();

        renderer1.createModels();
        renderer1.preProcess();

        renderer2.createModels();
        renderer2.preProcess();

        this._canvas.addEventListener('mousemove',
            (e: MouseEvent) => renderer0.mouseMove(e, this._canvas),
            false);

        this._path.addPath({renderer: renderer0, framebuffer: buff0}, {renderer: renderer1, framebuffer: buff1}, {renderer: renderer2});
    };
}

export default Canvas0;
