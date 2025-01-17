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
                path.framebuffer.buff.attachFramebuffer(path.framebuffer.target);
                path.framebuffer.buff.useFramebuffer((): void => {
                    path.renderer.render(isPause, dSec, preBuff);
                });
            } else {
                path.renderer.render(isPause, dSec, preBuff);
                this._gl.flush();
            }
            preBuff = path.framebuffer?.buff;
        });
    }
}

export default RenderPath;
