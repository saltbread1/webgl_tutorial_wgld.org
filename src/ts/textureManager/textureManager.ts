export interface TextureManagerBase {
    activeTexture(texUnit: number): void;
    bindTexture(): void;
    unbindTexture(): void;
}

export interface TextureLoadManager extends TextureManagerBase {
    loadImage(source: string, target?: number): Promise<void>;
    createTexture(): void;
}

export interface TextureBufferManager extends TextureManagerBase {
    createTexture(width: number, height: number, targets?: number[]): void;
    attachFramebuffer(target?: number): void;
}

export abstract class TextureManager implements TextureManagerBase {
    protected readonly _gl: WebGLRenderingContext;
    protected _texture: WebGLTexture | null;

    protected constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._texture = null;
    }

    public activeTexture(texUnit: number): void {
        this._gl.activeTexture(texUnit);
    }

    public abstract bindTexture() : void;

    public abstract unbindTexture() : void;
}
