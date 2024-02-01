import {Vertices} from "./types";

type Attribute = {
    attLocation: number;
    attStride: number;
};

export class ProgramCreator {
    private readonly _gl: WebGLRenderingContext;
    private readonly _vShader: WebGLShader;
    private readonly _fShader: WebGLShader;

    public constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
        this._gl = gl;
        this._vShader = this.createShader(gl.VERTEX_SHADER, vs)!;
        this._fShader = this.createShader(gl.FRAGMENT_SHADER, fs)!;
    }

    private createShader(type: number, s: string): WebGLShader | null {
        const shader: WebGLShader = this._gl.createShader(type)!;
        this._gl.shaderSource(shader, s);
        this._gl.compileShader(shader);

        if (this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            return shader;
        } else {
            alert(this._gl.getShaderInfoLog(shader));
            return null;
        }
    }

    public createProgram(): WebGLProgram | null {
        const program: WebGLProgram = this._gl.createProgram()!;
        this._gl.attachShader(program, this._vShader);
        this._gl.attachShader(program, this._fShader);
        this._gl.linkProgram(program);

        if (this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            this._gl.useProgram(program);
            return program;
        } else {
            alert(this._gl.getProgramInfoLog(program));
            return null;
        }
    }
}

export class AttributeManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: WebGLProgram;
    private readonly _attributeMap: Map<string, Attribute>;

    public constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this._gl = gl;
        this._program = program;
        this._attributeMap = new Map<string, Attribute>();
    }

    public addAttribute(name: string, attStride: number): void {
        const loc: number = this._gl.getAttribLocation(this._program, name);
        if (loc == -1) {
            throw new Error(`An attribute variable named \"${name}\" does not exist.`);
        }
        this._attributeMap.set(name, { attLocation: loc, attStride: attStride });
    }

    public getAttribute(key: string): Attribute {
        const ret: Attribute | undefined = this._attributeMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    public clearAttribute(): void {
        this._attributeMap.clear();
    }
}

export class VBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _am: AttributeManager;
    private readonly _vboMap: Map<string, WebGLBuffer>;

    public constructor(gl: WebGLRenderingContext, am: AttributeManager) {
        this._gl = gl;
        this._am = am;
        this._vboMap = new Map<string, WebGLBuffer>();
    }

    public addVBO(name: string, data: Vertices): void {
        this._vboMap.set(name + 'Position', this.createVBO(this._gl, data.pos));
        this._vboMap.set(name + 'Normal', this.createVBO(this._gl, data.nor));
        this._vboMap.set(name + 'Color', this.createVBO(this._gl, data.col));
        this._vboMap.set(name + 'TextureCoord', this.createVBO(this._gl, data.tex));
    }

    public getVBO(key: string): WebGLBuffer {
        const ret: WebGLBuffer | undefined = this._vboMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    private createVBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const vbo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vbo;
    }

    public setAttribute(vboKey: string, attKey: string): void {
        const vbo: WebGLBuffer = this.getVBO(vboKey);
        const att: Attribute = this._am.getAttribute(attKey);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
        this._gl.enableVertexAttribArray(att.attLocation);
        this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    };
}

export class IBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _iboMap: Map<string, {buff: WebGLBuffer, length: number}>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._iboMap = new Map<string, {buff: WebGLBuffer, length: number}>();
    }

    public addIBO(name: string, data: Vertices): void {
        this._iboMap.set(name, { buff: this.createIBO(this._gl, data.idx), length: data.idx.length });
    }

    public getBuffer(key: string): WebGLBuffer {
        return this.getIBO(key).buff;
    }

    public getLength(key: string): number {
        return this.getIBO(key).length;
    }

    private getIBO(key: string): {buff: WebGLBuffer, length: number} {
        const ret: {buff: WebGLBuffer, length: number} | undefined = this._iboMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    private createIBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const ibo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    };
}

export class UniformManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: WebGLProgram;
    private readonly _uniLocationMap: Map<string, WebGLUniformLocation>;

    public constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this._gl = gl;
        this._program = program;
        this._uniLocationMap = new Map<string, WebGLUniformLocation>();
    }

    public addUniform(name: string): void {
        const loc: WebGLUniformLocation | null = this._gl.getUniformLocation(this._program, name);
        if (loc === null) {
            throw new Error(`An uniform variable named \"${name}\" does not exist.`);
        }
        this._uniLocationMap.set(name, loc);
    }

    public getUniform(key: string): WebGLUniformLocation {
        const ret: WebGLBuffer | undefined = this._uniLocationMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }
}
