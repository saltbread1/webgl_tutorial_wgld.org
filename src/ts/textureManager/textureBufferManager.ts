import TextureManager from "./textureManager";

interface TextureBufferManager extends TextureManager{
    createTexture(width: number, height: number): void;
    attachFramebuffer(target: number) : void;
}

export default TextureBufferManager;
