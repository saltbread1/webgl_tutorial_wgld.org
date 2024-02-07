import ModelDataProcessor from "../data/modelDataProcessor";
import Model from "./model";
import {mat4} from "gl-matrix";
import {UniformType} from "../util/enum";

class Model3 extends Model {
    public constructor(gl: WebGLRenderingContext, mdp: ModelDataProcessor) {
        super(gl, mdp);
    }

    protected override mainRender(data: {mvpMatrix: mat4, pointSize: number}): void {
        this._mdp.passAttributeDataAll();

        this._mdp.passUniformData(UniformType.ONE_INT, 'texture0', 0);
        this._mdp.passUniformData(UniformType.ONE_INT, 'isTexture', 1);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'mvpMatrix', data.mvpMatrix);
        this._mdp.passUniformData(UniformType.ONE_FLOAT, 'pointSize', data.pointSize);

        this._mdp.drawArrays();
    }
}

export default Model3;
