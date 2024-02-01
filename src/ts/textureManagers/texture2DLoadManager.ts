import {TextureLoadManager} from "./textureManager";
import Texture2DManager from "./texture2DManager";

class Texture2DLoadManager extends Texture2DManager implements TextureLoadManager {
    private _image: HTMLImageElement | null;

    public constructor(gl: WebGLRenderingContext) {
        super(gl);
        this._image = null;
    }

    public async loadImage(source: string): Promise<void> {
        this._image = new Image();

        await new Promise<void>((resolve: () => void): void => {
            this._image!.onload = (): void => { resolve(); };
            this._image!.src = source;
        });
    }

    public createTexture(): void {
        if (this._image === null) {
            throw new Error('Must load a image before create a texture.');
        }
        this._texture = this._gl.createTexture();
        this.bindTexture();
        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._image);
        this._gl.generateMipmap(this._gl.TEXTURE_2D);
        this.setTexParams();
        this.unbindTexture();
    }
}

export default Texture2DLoadManager;
