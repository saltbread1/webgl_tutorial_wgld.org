import TextureManager from "./textureManager";

abstract class TextureCubeManager extends TextureManager {
    protected readonly _targets: number[];

    protected constructor(gl: WebGLRenderingContext) {
        super(gl, gl.TEXTURE_CUBE_MAP);
        this._targets = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z];
    }
}

export default TextureCubeManager;
