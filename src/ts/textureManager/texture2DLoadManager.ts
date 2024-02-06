import Texture2DManager from "./texture2DManager";

class Texture2DLoadManager extends Texture2DManager {
    private _image: HTMLImageElement | undefined;

    public constructor(gl: WebGLRenderingContext) {
        super(gl);
    }

    public async loadImage(source: string): Promise<void> {
        this._image = new Image();

        await new Promise<void>((resolve: () => void): void => {
            this._image!.onload = (): void => { resolve(); };
            this._image!.src = source;
        });
    }

    public async loadImageById(id: string): Promise<void> {
        const img: HTMLImageElement = document.getElementById(id) as HTMLImageElement;
        await this.loadImage(img.src);
    }

    public createTexture(): void {
        if (!this._image) {
            throw new Error('Must load a image before create a texture.');
        }
        this._texture = this._gl.createTexture();
        this.useTexture((): void => {
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._image!);
            this._gl.generateMipmap(this._gl.TEXTURE_2D);
            this.setTexParams();
        });
    }
}

export default Texture2DLoadManager;
