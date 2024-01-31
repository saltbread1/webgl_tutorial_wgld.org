import Canvas from "./canvas";
import ShaderModel0 from "../shaderModels/shaderModel0";
import ShaderModel2 from "../shaderModels/shaderModel2";

class Canvas1 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmBlur: HTMLInputElement = document.getElementById("blur") as HTMLInputElement;

        const shaderModel0: ShaderModel0 = new ShaderModel0(this._gl, this._c);
        const shaderModel2: ShaderModel2 = new ShaderModel2(this._gl, this._c, elmBlur);

        await shaderModel0.initialize();
        shaderModel2.initialize();

        this._c.addEventListener('mousemove', (e: MouseEvent) => shaderModel0.mouseMove(e));

        this._path.addPath({model: shaderModel0, buffers: this.createFrameBuffer(this._c.width, this._c.height)},
            {model: shaderModel2, buffers: {f: null, t: null, d: null}});
    };
}

export default Canvas1;
