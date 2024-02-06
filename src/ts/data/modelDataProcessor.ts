import {AttrInfo} from "../util/type";
import Program from "./program";
import AttributeManager from "./attributeManager";
import VBOManager from "./vboManager";
import IBOManager from "./iboManager";
import UniformManager from "./uniformManager";
import {UniformType} from "../util/enum";

class ModelDataProcessor {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: Program;
    private readonly _attMan: AttributeManager;
    private readonly _uniMan: UniformManager;
    private readonly _vboMan: VBOManager;
    private readonly _iboMan: IBOManager | undefined;

    public constructor(gl: WebGLRenderingContext, program: Program, attMan: AttributeManager,
                       uniMan: UniformManager, vboMan: VBOManager, iboMan?: IBOManager) {
        this._gl = gl;
        this._program = program;
        this._attMan = attMan;
        this._uniMan = uniMan;
        this._vboMan = vboMan;
        this._iboMan = iboMan;
    }

    public useProgram(func: () => void): void {
        this._gl.useProgram(this._program.get);
        func();
        this._gl.useProgram(null);
    }

    private useIBO(func: () => void): void {
        if (!this._iboMan) {
            throw new Error('IBO is undefined.');
        }
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

    public passUniformData(type: UniformType, name: string, data: number | Float32List | Int32List, isMatTrance: boolean = false): void {
        const loc: WebGLUniformLocation = this._uniMan.getLocation(name);
        data = typeof data == 'number' ? [data] : data;
        switch (type) {
            case UniformType.ONE_FLOAT:
                this._gl.uniform1fv(loc, data as Float32List);
                break;
            case UniformType.ONE_INT:
                this._gl.uniform1iv(loc, data as Int32List);
                break;
            case UniformType.TWO_FLOAT:
                this._gl.uniform2fv(loc, data as Float32List);
                break;
            case UniformType.TWO_INT:
                this._gl.uniform2iv(loc, data as Int32List);
                break;
            case UniformType.THREE_FLOAT:
                this._gl.uniform3fv(loc, data as Float32List);
                break;
            case UniformType.THREE_INT:
                this._gl.uniform3iv(loc, data as Int32List);
                break;
            case UniformType.FOUR_FLOAT:
                this._gl.uniform4fv(loc, data as Float32List);
                break;
            case UniformType.FOUR_INT:
                this._gl.uniform4iv(loc, data as Int32List);
                break;
            case UniformType.TWO_MATRIX:
                this._gl.uniformMatrix2fv(loc, isMatTrance, data as Float32List);
                break;
            case UniformType.THREE_MATRIX:
                this._gl.uniformMatrix3fv(loc, isMatTrance, data as Float32List);
                break;
            case UniformType.FOUR_MATRIX:
                this._gl.uniformMatrix4fv(loc, isMatTrance, data as Float32List);
                break;
        }
    }

    public drawArrays(args?: {mode?: number, offset?: number}): void {
        const mode: number = args && args.mode ? args.mode : this._gl.POINTS;
        const first: number = args && args.offset ? args.offset : 0;
        this._gl.drawArrays(mode, first, this._vboMan.pointLength);
    }

    public drawElements(args?: {mode?: number, type?: number, offset?: number}): void {
        if (!this._iboMan) {
            throw new Error('IBO is undefined.');
        }
        const mode: number = args && args.mode ? args.mode : this._gl.TRIANGLES;
        const type: number = args && args.type ? args.type : this._gl.UNSIGNED_SHORT;
        const offset: number = args && args.offset ? args.offset : 0;
        this.useIBO((): void => {
            this._gl.drawElements(mode, this._iboMan!.indexLength, type, offset);
        });
    }
}

export default ModelDataProcessor;
