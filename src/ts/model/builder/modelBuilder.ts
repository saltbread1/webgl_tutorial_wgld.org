import Program from "../../data/program";
import AttributeManager from "../../data/attributeManager";
import UniformManager from "../../data/uniformManager";
import VBOManager from "../../data/vboManager";
import IBOManager from "../../data/iboManager";
import Model from "../model";
import ModelDataProcessor from "../../data/modelDataProcessor";

abstract class ModelBuilder {
    protected readonly _gl: WebGLRenderingContext;

    protected constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    protected abstract createProgram(): Program;

    protected abstract createAttributeManager(): AttributeManager;

    protected abstract createUniformManager(): UniformManager;

    protected abstract createVBOManager(): VBOManager;

    protected abstract createIBOManager(): IBOManager | undefined;

    protected abstract createModel(mdp: ModelDataProcessor): Model;

    public buildModel(): Model {
        const program: Program = this.createProgram();
        const attMan: AttributeManager = this.createAttributeManager();
        const uniMan: UniformManager = this.createUniformManager();
        const vboMan: VBOManager = this.createVBOManager();
        const iboMan: IBOManager | undefined = this.createIBOManager();
        return this.createModel(new ModelDataProcessor(this._gl, program, attMan, uniMan, vboMan, iboMan));
    }
}

export default ModelBuilder;
