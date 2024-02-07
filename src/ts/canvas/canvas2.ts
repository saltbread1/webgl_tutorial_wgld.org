import Canvas from "./canvas";
import Renderer4 from "../renderer/renderer4";

class Canvas1 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmHeight: HTMLInputElement = document.getElementById('height') as HTMLInputElement;
        const renderer: Renderer4 = new Renderer4(this._gl, this._canvas.width, this._canvas.height, elmHeight);

        await renderer.createModels();
        await renderer.preProcess();

        this._path.addPath({renderer: renderer});
    };
}

export default Canvas1;
