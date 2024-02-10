import Canvas from "./canvas";
import Renderer6 from "../renderer/renderer6";
import Renderer7 from "../renderer/renderer7";
import FramebufferCubeTexture from "../data/framebufferCubeTexture";
import TextureCubeBufferManager from "../textureManager/textureCubeBufferManager";

class Canvas4 extends Canvas {
    public constructor(c: HTMLCanvasElement) {
        super(c);
    }

    public override async initShader(): Promise<void> {
        const fWidth: number = 512;
        const fHeight: number = 512;
        const buff: FramebufferCubeTexture = new FramebufferCubeTexture(this._gl, new TextureCubeBufferManager(this._gl), fWidth, fHeight);
        buff.initialize();

        const targets: number[] = [this._gl.TEXTURE_CUBE_MAP_POSITIVE_X, this._gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this._gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            this._gl.TEXTURE_CUBE_MAP_NEGATIVE_X, this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, this._gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];

        const renderer0: Renderer6[] = [];
        targets.forEach((t: number): void => {
            renderer0.push(new Renderer6(this._gl, fWidth, fHeight, t));
        })
        const renderer1: Renderer7 = new Renderer7(this._gl, this._canvas.width, this._canvas.height);

        for (const r of renderer0) {
            await r.createModels();
            await r.preProcess();
            this._canvas.addEventListener('mousemove',
                (e: MouseEvent) => r.mouseMove(e, this._canvas),
                false);
        }

        await renderer1.createModels();
        await renderer1.preProcess();
        this._canvas.addEventListener('mousemove',
            (e: MouseEvent) => renderer1.mouseMove(e, this._canvas),
            false);

        renderer0.forEach((r: Renderer6, i: number): void => {
            this._path.addPath({renderer: r, framebuffer: buff, target: targets[i]});
        });
        this._path.addPath({renderer: renderer1});
    };
}

export default Canvas4;
