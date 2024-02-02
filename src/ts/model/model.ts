import ModelDataManager from "../data/modelData";

abstract class Model {
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _modelData: ModelDataManager;

    protected constructor(gl: WebGLRenderingContext, modelData: ModelDataManager) {
        this._gl = gl;
        this._modelData = modelData;
    }

    public preProcess(): void {
        // none
    }

    public abstract render(data: any): void;
}

export default Model;
