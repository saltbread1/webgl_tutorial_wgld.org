import Canvas from "./canvas";
import ShaderModel0 from "../shaderModels/shaderModel0";
import ShaderModel1 from "../shaderModels/shaderModel1";

class Canvas0 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
        const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
        const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;

        const shaderModel0: ShaderModel0 = new ShaderModel0(this._gl, this._c);
        const shaderModel1: ShaderModel1 = new ShaderModel1(this._gl, this._c, elmTransparency, elmAdd, elmAlphaValue);

        await shaderModel0.initialize();
        shaderModel1.initialize();

        this._c.addEventListener('mousemove', (e: MouseEvent) => shaderModel0.mouseMove(e));

        this._path.addPath({model: shaderModel0, buffers: this.createFrameBuffer(this._c.width, this._c.height)},
            {model: shaderModel1, buffers: {f: null, t: null, d: null}});
    };
}

export default Canvas0;
