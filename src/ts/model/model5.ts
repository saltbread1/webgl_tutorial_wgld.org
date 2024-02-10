import ModelDataProcessor from "../data/modelDataProcessor";
import Model from "./model";
import {mat4} from "gl-matrix";
import {UniformType} from "../util/enum";

class Model5 extends Model {
    public constructor(gl: WebGLRenderingContext, mdp: ModelDataProcessor) {
        super(gl, mdp);
    }

    protected override mainRender(data: {mMatrix: mat4, mvpMatrix: mat4, invMatrix: mat4, eyePosition: number[], isReflect: number[]}): void {
        this._mdp.passAttributeDataAll();

        this._mdp.passUniformData(UniformType.ONE_INT, 'cubeTexture', 0);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'mMatrix', data.mMatrix);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'mvpMatrix', data.mvpMatrix);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'invMatrix', data.invMatrix);
        this._mdp.passUniformData(UniformType.THREE_FLOAT, 'eyePosition', data.eyePosition);
        this._mdp.passUniformData(UniformType.ONE_FLOAT, 'isReflect', data.isReflect);

        this._mdp.drawElements();
    }
}

export default Model5;
