import Canvas from "./canvas";
import ShaderModel3 from "../shaderModels/shaderModel3";

class Canvas2 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const shaderModel3: ShaderModel3 = new ShaderModel3(this._gl, this._c);

        await shaderModel3.initialize();

        this._path.addPath({model: shaderModel3, buffers: {f: null, t: null, d: null}});
    };
}

export default Canvas2;
