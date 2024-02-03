import CubeTextureManager from "./CubeTextureManager";

class CubeTextureLoadManager extends CubeTextureManager {
    private readonly _images: {img: HTMLImageElement, t: number | undefined}[];
    private readonly _targets: number[];

    public constructor(gl: WebGLRenderingContext) {
        super(gl);
        this._images = [];
        this._targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                         gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    }

    public async loadImage(source: string, target?: number): Promise<void> {
        if (this._images.length >= 6) { return; }

        const img: HTMLImageElement = new Image();

        await new Promise<void>((resolve: () => void): void => {
            img.onload = (): void => {
                this._images.push({img: img, t: target});
                resolve();
            };
            img.src = source;
        });
    }

    public createTexture(): void {
        this._texture = this._gl.createTexture();

        this.useTexture((): void => {
            for (let i: number = 0; i < 6; i++) {
                const target: number = this._images[i].t ? this._images[i].t! : this._targets[i];
                this._gl.texImage2D(target, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._images[i].img);
            }
            this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
            this.setTexParams();
        });
    }
}

export default CubeTextureLoadManager;
