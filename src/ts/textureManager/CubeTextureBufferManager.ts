import CubeTextureManager from "./CubeTextureManager";

class CubeTextureBufferManager extends CubeTextureManager {
    private readonly _targets: number[];
    public constructor(gl: WebGLRenderingContext) {
        super(gl);
        this._targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    }

    public createTexture(width: number, height: number, targets?: number[]): void {
        this._texture = this._gl.createTexture();
        this.useTexture((): void => {
            if (!targets) {
                targets = this._targets;
            }
            targets.forEach((t: number): void => {
                this._gl.texImage2D(t, 0, this._gl.RGBA, width, height, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
            });
            this.setTexParams();
        });
    }

    public attachFramebuffer(target: number) : void {
        this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, target, this._texture, 0);
    }
}

export default CubeTextureBufferManager;
