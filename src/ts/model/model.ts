import ModelDataProcessor from "../data/modelDataProcessor";

abstract class Model {
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _mdp: ModelDataProcessor;

    protected constructor(gl: WebGLRenderingContext, modelData: ModelDataProcessor) {
        this._gl = gl;
        this._mdp = modelData;
    }

    public render(data: any): void {
        this._mdp.useProgram((): void => {
            this.mainRender(data);
        });
    }

    protected abstract mainRender(data: any): void;
}

export default Model;
