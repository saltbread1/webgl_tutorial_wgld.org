import ModelDataProcessor from "../data/modelDataProcessor";
import Model from "./model";
import {mat4} from "gl-matrix";
import {UniformType} from "../util/enum";

class Model0 extends Model {
    public constructor(gl: WebGLRenderingContext, mdp: ModelDataProcessor) {
        super(gl, mdp);
    }

    protected override mainRender(data: {mvpMatrix: mat4, invMatrix: mat4, isLight: number, isTexture: number}): void {
        this._mdp.passAttributeDataAll();

        this._mdp.passUniformData(UniformType.THREE_FLOAT, 'lightDirection', [-1.0, 1.0, 1.0]);
        this._mdp.passUniformData(UniformType.THREE_FLOAT, 'eyeDirection', [0.0, 0.0, 1.0]);
        this._mdp.passUniformData(UniformType.FOUR_FLOAT, 'ambientColor', [0.1, 0.1, 0.1, 0.1]);
        this._mdp.passUniformData(UniformType.ONE_INT, 'texture0', 0);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'mvpMatrix', data.mvpMatrix);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'invMatrix', data.invMatrix);
        this._mdp.passUniformData(UniformType.ONE_INT, 'isLight', data.isLight);
        this._mdp.passUniformData(UniformType.ONE_INT, 'isTexture', data.isTexture);

        this._mdp.drawElements();
    }
}

export default Model0;
