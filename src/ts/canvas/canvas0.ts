import Canvas from "./canvas";
import Framebuffer from "../framebuffer";
import Texture2DBufferManager from "../textureManager/texture2DBufferManager";
import Renderer0 from "../renderer/renderer0";

class Canvas0 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
        const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
        const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;

        const renderer0: Renderer0 = new Renderer0(this._canvas, this._gl);

        renderer0.createModels();
        await renderer0.preProcess();

        this._canvas.addEventListener('mousemove', (e: MouseEvent) => renderer0.mouseMove(e));

        // const buff0: Framebuffer = new Framebuffer(this._gl, new Texture2DBufferManager(this._gl));
        // buff0.initialize(this._canvas.width, this._canvas.height);
        this._path.addPath({renderer: renderer0});
    };
}

export default Canvas0;
