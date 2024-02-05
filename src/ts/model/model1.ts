import ModelDataProcessor from "../data/modelDataProcessor";
import Model from "./model";
import {mat4} from "gl-matrix";
import {UniformType} from "../enum";

class Model1 extends Model {
    private readonly _kernel: number[] = [
        0.02, 0.02, 0.02, 0.02, 0.02,
        0.02, 0.04, 0.04, 0.04, 0.02,
        0.02, 0.04, 0.36, 0.04, 0.02,
        0.02, 0.04, 0.04, 0.04, 0.02,
        0.02, 0.02, 0.02, 0.02, 0.02];

    public constructor(gl: WebGLRenderingContext, mdp: ModelDataProcessor) {
        super(gl, mdp);
    }

    protected override mainRender(data: {mvpMatrix: mat4, vertexAlpha: number, resolution: number, isBlur: number}): void {
        this._mdp.passAttributeDataAll();

        this._mdp.passUniformData(UniformType.ONE_INT, 'texture0', 0);
        this._mdp.passUniformData(UniformType.ONE_FLOAT, 'kernel', this._kernel);
        this._mdp.passUniformData(UniformType.FOUR_MATRIX, 'mvpMatrix', data.mvpMatrix);
        this._mdp.passUniformData(UniformType.ONE_FLOAT, 'vertexAlpha', data.vertexAlpha);
        this._mdp.passUniformData(UniformType.TWO_FLOAT, 'resolution', data.resolution);
        this._mdp.passUniformData(UniformType.ONE_INT, 'isBlur', data.isBlur);

        this._mdp.drawElements();
    }
}

export default Model1;
