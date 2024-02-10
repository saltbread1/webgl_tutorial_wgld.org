import Canvas from "./canvas";
import Renderer5 from "../renderer/renderer5";

class Canvas3 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const renderer: Renderer5 = new Renderer5(this._gl, this._canvas.width, this._canvas.height);

        await renderer.createModels();
        await renderer.preProcess();

        this._canvas.addEventListener('mousemove',
            (e: MouseEvent) => renderer.mouseMove(e, this._canvas),
            false);

        this._path.addPath({renderer: renderer});
    };
}

export default Canvas3;
