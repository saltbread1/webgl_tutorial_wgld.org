export interface TextureManager {
    activeTexture(texUnit: number): void;
    bindTexture(): void;
    unbindTexture(): void;
}

export interface TextureLoadManager extends TextureManager {
    createTexture(source: string): Promise<void>;
}

export interface TextureBufferManager extends TextureManager {
    createTexture(width: number, height: number): void;
    attachFrameBuffer(): void;
}
