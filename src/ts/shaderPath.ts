import {Buffers, Path} from "./types";

class ShaderPath {
    private readonly _gl: WebGLRenderingContext;
    private readonly _paths: Path[];

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._paths = [];
    }

    public addPath(...paths: Path[]): void {
        paths.forEach((p: Path): number => this._paths.push(p));
    }

    public startShader(fps: number): void {
        setInterval((): void => {
            let preBuff: Buffers = {f: null, d: null, t: null};
            this._paths.forEach((path: Path): void => {
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, path.buffers.f);
                path.model.render(preBuff);
                this._gl.flush();
                preBuff = path.buffers;
            });
        }, 1000 / fps);
    }
}

export default ShaderPath;
