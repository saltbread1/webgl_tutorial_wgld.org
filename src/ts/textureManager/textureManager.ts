abstract class TextureManager {
    protected readonly _gl: WebGLRenderingContext;
    protected _texture: WebGLTexture | null;

    protected constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._texture = null;
    }

    public abstract useTexture(func: () => void, unit: number) : void;
}

export default TextureManager;
