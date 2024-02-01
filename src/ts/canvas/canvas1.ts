import Canvas from "./canvas";
import ShaderModel0 from "../shaderModels/shaderModel0";
import ShaderModel2 from "../shaderModels/shaderModel2";
import Framebuffer from "../frameBuffers/framebuffer";
import Texture2DBufferManager from "../textureManagers/texture2DBufferManager";

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

        const buff0: Framebuffer<Texture2DBufferManager> = new Framebuffer<Texture2DBufferManager>(this._gl, new Texture2DBufferManager(this._gl));
        buff0.initializeFrameBuffer(this._c.width, this._c.height);
        this._path.addPath({model: shaderModel0, framebuffer: buff0},
            {model: shaderModel2, framebuffer: null});
    };
}

export default Canvas1;
