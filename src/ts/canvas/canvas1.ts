import Canvas from "./canvas";
import Renderer3 from "../renderer/renderer3";

class Canvas1 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmPointSize: HTMLInputElement = document.getElementById('point_size') as HTMLInputElement;

        const renderer3: Renderer3 = new Renderer3(this._gl, this._canvas.width, this._canvas.height, elmPointSize);

        await renderer3.createModels();
        await renderer3.preProcess();

        // this._canvas.addEventListener('mousemove',
        //     (e: MouseEvent) => renderer3.mouseMove(e, this._canvas),
        //     false);

        this._path.addPath({renderer: renderer3});
    };
}

export default Canvas1;
