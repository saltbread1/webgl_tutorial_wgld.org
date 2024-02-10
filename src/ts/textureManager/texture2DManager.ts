import TextureManager from "./textureManager";

abstract class Texture2DManager extends TextureManager {
    protected constructor(gl: WebGLRenderingContext) {
        super(gl, gl.TEXTURE_2D);
    }
}

export default Texture2DManager;
