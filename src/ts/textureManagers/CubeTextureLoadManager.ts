import {TextureLoadManager} from "./textureManager";
import CubeTextureManager from "./CubeTextureManager";

class CubeTextureLoadManager extends CubeTextureManager implements TextureLoadManager {
    private readonly _images: HTMLImageElement[];
    private readonly _targets: number[];

    public constructor(gl: WebGLRenderingContext) {
        super(gl);
        this._images = new Array(6);
        this._targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                         gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    }

    public async loadImage(source: string): Promise<void> {
        const img: HTMLImageElement = new Image();

        await new Promise<void>((resolve: () => void): void => {
            img.onload = (): void => { resolve(); };
            img.src = source;
        });

        this._images.push(img);
    }

    public createTexture(): void {
        this._texture = this._gl.createTexture();

        this.bindTexture();
        for (let i: number = 0; i < 6; i++) {
            this._gl.texImage2D(this._targets[i], 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._images[i]);
        }
        this._gl.generateMipmap(this._gl.TEXTURE_CUBE_MAP);
        this.setTexParams();
        this.unbindTexture();
    }
}

export default CubeTextureLoadManager;
