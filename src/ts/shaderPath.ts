import ShaderModel from "./shaderModels/shaderModel";
import Framebuffer from "./frameBuffers/framebuffer";
import Texture2DBufferManager from "./textureManagers/texture2DBufferManager";

type Path = {
    model: ShaderModel;
    framebuffer: Framebuffer<Texture2DBufferManager> | null;
}

class ShaderPath {
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

    public startShader(fps: number): void {
        this._intervalID = window.setInterval((): void => {
            let preBuff: Framebuffer<Texture2DBufferManager> | null = null;
            this._paths.forEach((path: Path): void => {
                const buff: WebGLFramebuffer | null = path.framebuffer === null ? null : path.framebuffer.getFramebuffer;
                this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, buff);
                path.model.render(preBuff);
                this._gl.flush();
                preBuff = path.framebuffer;
            });
        }, 1000 / fps);
    }

    public suspendShader(): void {
        window.clearInterval(this._intervalID);
    }
}

export default ShaderPath;
