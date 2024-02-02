import {AttrInfo, IBOInfo} from "../type";
import Program from "./program";

class ModelDataManager {
    private readonly _gl: WebGLRenderingContext;

    private readonly _program: Program;
    private readonly _attMan: AttributeManager;
    private readonly _vboMan: VBOManager;
    private readonly _iboMan: IBOManager;
    private readonly _uniMan: UniformManager;

    public constructor(gl: WebGLRenderingContext, program: Program) {
        this._gl = gl;
        this._program = program;
        this._attMan = new AttributeManager(gl);
        this._vboMan = new VBOManager(gl);
        this._iboMan = new IBOManager(gl);
        this._uniMan = new UniformManager(gl);
    }

    public useProgram(): void {
        this._gl.useProgram(this._program.get);
    }

    public disuseProgram(): void {
        this._gl.useProgram(null);
    }

    public createVertexData(name: string, data: number[], stride: number): void {
        this._attMan.add(this._program.get, name, stride);
        this._vboMan.add(name, data, stride);
    }

    public passAttributeData(name: string): void {
        const vbo: WebGLBuffer = this._vboMan.get(name);
        const att: AttrInfo = this._attMan.get(name);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
        this._gl.enableVertexAttribArray(att.attLocation);
        this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    };

    public passAttributeDataAll(): void {
        this._attMan.getMap.forEach((att: AttrInfo, key: string): void => {
            const vbo: WebGLBuffer = this._vboMan.get(key);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
            this._gl.enableVertexAttribArray(att.attLocation);
            this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
        });
    }

    public createIBO(data: number[]): void {
        this._iboMan.set(data);
    }

    public get getIndexLength(): number {
        return this._iboMan.getIndexLength;
    }

    public get getPointLength(): number {
        return this._vboMan.getPointLength;
    }

    public bindIBO(): void {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.get)
    }

    public unbindIBO(): void {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public createUniformData(name: string): void {
        this._uniMan.add(this._program.get, name);
    }

    public getUniformLocation(name: string): WebGLUniformLocation {
        return this._uniMan.get(name);
    }
}

class VBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _vboMap: Map<string, WebGLBuffer>;
    private _pointLength: number | undefined;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._vboMap = new Map<string, WebGLBuffer>();
    }

    public add(name: string, data: number[], stride: number): void {
        if (!this._pointLength) {
            this._pointLength = data.length / stride;
        } else if (data.length / stride != this._pointLength) {
            throw new Error('The size of data array is invalid.');
        }

        this._vboMap.set(name, this.create(this._gl, data));
    }

    public get(key: string): WebGLBuffer {
        const ret: WebGLBuffer | undefined = this._vboMap.get(key);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    public get getMap(): Map<string, WebGLBuffer> {
        return this._vboMap;
    }

    public get getPointLength(): number {
        if (!this._pointLength) {
            throw new Error('None of VBO is created.');
        }
        return this._pointLength;
    }

    private create(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const vbo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vbo;
    }
}

class IBOManager {
    private readonly _gl: WebGLRenderingContext;
    private _iboInfo: IBOInfo | undefined;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    public set(data: number[]): void {
        this._iboInfo = { buff: this.create(this._gl, data), length: data.length };
    }

    public get get(): WebGLBuffer {
        if (!this._iboInfo) {
            throw new Error('IBO is not be created.');
        }
        return this._iboInfo.buff;
    }

    public get getIndexLength(): number {
        if (!this._iboInfo) {
            throw new Error('IBO is not be created.');
        }
        return this._iboInfo.length;
    }

    private create(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const ibo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    };
}

class AttributeManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _attributeMap: Map<string, AttrInfo>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._attributeMap = new Map<string, AttrInfo>();
    }

    public add(program: WebGLProgram, name: string, stride: number): void {
        const loc: number = this._gl.getAttribLocation(program, name);
        if (loc == -1) {
            //throw new Error(`An attribute variable named \"${name}\" does not exist.`);
            console.warn(`An attribute variable named \"${name}\" does not exist.`);
            return;
        }
        this._attributeMap.set(name, { attLocation: loc, attStride: stride });
    }

    public get(name: string): AttrInfo {
        const ret: AttrInfo | undefined = this._attributeMap.get(name);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${name}\" does not existed.`);
        }
        return ret;
    }

    public get getMap(): Map<string, AttrInfo> {
        return this._attributeMap;
    }
}

class UniformManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _uniLocationMap: Map<string, WebGLUniformLocation>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._uniLocationMap = new Map<string, WebGLUniformLocation>();
    }

    public add(program: WebGLProgram, name: string): void {
        const loc: WebGLUniformLocation | null = this._gl.getUniformLocation(program, name);
        if (!loc) {
            //throw new Error(`An uniform variable named \"${name}\" does not exist.`);
            console.warn(`An attribute variable named \"${name}\" does not exist.`);
            return;
        }
        this._uniLocationMap.set(name, loc);
    }

    public get(key: string): WebGLUniformLocation {
        const ret: WebGLBuffer | undefined = this._uniLocationMap.get(key);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }
}

export default ModelDataManager;
