import Canvas from "./canvas";
import CubeMap from "../shaderModels/cubeMap";

class Canvas3 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const elmEta: HTMLInputElement = document.getElementById('eta') as HTMLInputElement;
        const cubeMap: CubeMap = new CubeMap(this._gl, this._c, elmEta);

        await cubeMap.initialize();

        this._c.addEventListener('mousemove', (e: MouseEvent) => cubeMap.mouseMove(e));

        this._path.addPath({model: cubeMap, framebuffer: null});
    };
}

export default Canvas3;
