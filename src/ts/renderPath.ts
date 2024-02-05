import Framebuffer from "./framebuffer";
import {Path} from "./type";

class RenderPath {
    private readonly _gl: WebGLRenderingContext;
    private readonly _paths: Path[];
    private _intervalID: number | undefined;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._paths = [];
    }

    public addPath(...paths: Path[]): void {
        paths.forEach((p: Path): number => this._paths.push(p));
    }

    public startRender(fps: number): void {
        console.log(this._intervalID);
        if (!this._intervalID === undefined) { console.log('a'); return; }

        this._intervalID = window.setInterval((): void => {
            let preBuff: Framebuffer | undefined;
            this._paths.forEach((path: Path): void => {
                path.framebuffer?.useFramebuffer((): void => {
                    path.renderer.render(fps, preBuff);
                });
                if (!path.framebuffer) {
                    path.renderer.render(fps, preBuff);
                    this._gl.flush();
                }
                preBuff = path.framebuffer;
            });
        }, 1000 / fps);

        console.log(this._intervalID);
    }

    public suspendRender(): void {
        window.clearInterval(this._intervalID);
        this._intervalID = undefined;
    }
}

export default RenderPath;
