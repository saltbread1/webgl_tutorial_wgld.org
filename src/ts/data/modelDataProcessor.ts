import {AttrInfo} from "../type";
import Program from "./program";
import AttributeManager from "./attributeManager";
import VBOManager from "./vboManager";
import IBOManager from "./iboManager";
import UniformManager from "./uniformManager";

class ModelDataProcessor {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: Program;
    private readonly _attMan: AttributeManager;
    private readonly _vboMan: VBOManager;
    private readonly _iboMan: IBOManager;
    private readonly _uniMan: UniformManager;

    public constructor(gl: WebGLRenderingContext, program: Program, attMan: AttributeManager,
                       vboMan: VBOManager, iboMan: IBOManager, uniMan: UniformManager) {
        this._gl = gl;
        this._program = program;
        this._attMan = attMan;
        this._vboMan = vboMan;
        this._iboMan = iboMan;
        this._uniMan = uniMan;
    }

    public useProgram(func: () => void): void {
        this._gl.useProgram(this._program.get);
        func();
        this._gl.useProgram(null);
    }

    private useIBO(func: () => void): void {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.buffer);
        func();
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public passAttributeData(name: string): void {
        const vbo: WebGLBuffer = this._vboMan.getBuffer(name);
        const att: AttrInfo = this._attMan.getAttributeInfo(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
        this._gl.enableVertexAttribArray(att.attLocation);
        this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    };

    public passAttributeDataAll(): void {
        this._attMan.attributeMap.forEach((att: AttrInfo, key: string): void => {
            const vbo: WebGLBuffer = this._vboMan.getBuffer(key);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
            this._gl.enableVertexAttribArray(att.attLocation);
            this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
        });
    }

    public passUniformData(name: string, func: (location: WebGLUniformLocation) => void): void {
        func(this._uniMan.getLocation(name));
    }

    public drawArrays(args?: {mode?: number, offset?: number}): void {
        const mode: number = args && args.mode ? args.mode : this._gl.POINTS;
        const first: number = args && args.offset ? args.offset : 0;
        this._gl.drawArrays(mode, first, this._vboMan.pointLength);
    }

    public drawElements(args?: {mode?: number, type?: number, offset?: number}): void {
        const mode: number = args && args.mode ? args.mode : this._gl.TRIANGLES;
        const type: number = args && args.type ? args.type : this._gl.UNSIGNED_SHORT;
        const offset: number = args && args.offset ? args.offset : 0;
        this.useIBO((): void => {
            this._gl.drawElements(mode, this._iboMan.indexLength, type, offset);
        });
    }
}

export default ModelDataProcessor;
