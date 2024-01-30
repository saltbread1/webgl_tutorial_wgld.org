import Canvas from "./canvas";
import ShaderModel0 from "../shaderModels/shaderModel0";
import ShaderModel1 from "../shaderModels/shaderModel1";
import ShaderPath from "../shaderPath";

class Canvas0 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override initialize(): void {
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // enable culling
        // this._gl.enable(this._gl.CULL_FACE);

        // enable depth test
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);

        // const pointSizeRange: number[] = this._gl.getParameter(this._gl.ALIASED_POINT_SIZE_RANGE);
        // console.log(`pointSizeRange: ${pointSizeRange[0]} - ${pointSizeRange[1]}`);
    };

    public override async mainShader(): Promise<void> {
        const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
        const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
        const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;
        //const elmPointSize: HTMLInputElement = document.getElementById("point_size") as HTMLInputElement;

        const shaderModel0: ShaderModel0 = new ShaderModel0(this._gl, this._c);
        const shaderModel1: ShaderModel1 = new ShaderModel1(this._gl, this._c, elmTransparency, elmAdd, elmAlphaValue);

        await shaderModel0.initialize();
        shaderModel1.initialize();

        this._c.addEventListener('mousemove', (e: MouseEvent) => shaderModel0.mouseMove(e));

        const path: ShaderPath = new ShaderPath(this._gl);
        path.addPath({model: shaderModel0, buffers: this.createFrameBuffer(this._c.width, this._c.height)},
            {model: shaderModel1, buffers: {f: null, t: null, d: null}});
        path.startShader(30);
    };
}

export default Canvas0;
