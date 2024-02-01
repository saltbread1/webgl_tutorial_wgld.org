import {TextureLoadManager} from "./textureManager";
import Texture2DManager from "./texture2DManager";

class Texture2DLoadManager extends Texture2DManager implements TextureLoadManager {
    public constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public async createTexture(source: string): Promise<void> {
        await new Promise<void>((resolve: () => void): void => {
            const img: HTMLImageElement = new Image();

            img.onload = (): void => {
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, img);
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
                this.setTexParams();
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                resolve();
            };
            img.src = source;
        });
    }
}

export default Texture2DLoadManager;
