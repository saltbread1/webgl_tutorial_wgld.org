import Framebuffer from "../data/framebuffer";
import {Path} from "../util/type";

class RenderPath {
    private readonly _gl: WebGLRenderingContext;
    private readonly _paths: Path[];

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._paths = [];
    }

    public addPath(...paths: Path[]): void {
        paths.forEach((p: Path): number => this._paths.push(p));
    }

    public render(isPause :boolean, dSec: number): void {
        let preBuff: Framebuffer | undefined;
        this._paths.forEach((path: Path): void => {
            if (path.framebuffer) {
                path.framebuffer.attachFramebuffer(path.target ? path.target : this._gl.TEXTURE_2D);
                path.framebuffer.useFramebuffer((): void => {
                    path.renderer.render(isPause, dSec, preBuff);
                });
            } else {
                path.renderer.render(isPause, dSec, preBuff);
                this._gl.flush();
            }
            preBuff = path.framebuffer;
        });
    }
}

export default RenderPath;
