import Framebuffer from "./framebuffer";
import {Path} from "./type";

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

    public render(fps: number): void {
        let preBuff: Framebuffer | undefined;
        this._paths.forEach((path: Path): void => {
            if (path.framebuffer) {
                path.framebuffer.useFramebuffer((): void => {
                    path.renderer.render(fps, preBuff);
                });
            } else {
                path.renderer.render(fps, preBuff);
                this._gl.flush();
            }
            preBuff = path.framebuffer;
        });
    }
}

export default RenderPath;
