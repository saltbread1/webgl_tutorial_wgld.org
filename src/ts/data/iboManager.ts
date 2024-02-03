class IBOManager {
    private readonly _gl: WebGLRenderingContext;
    private _buffer: WebGLBuffer | undefined;
    private _indexLength: number = -1;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    public setIBOInfo(data: number[]): void {
        this._buffer = this.create(this._gl, data);
        this._indexLength = data.length;
    }

    public get buffer(): WebGLBuffer {
        if (!this._buffer) {
            throw new Error('IBO is not be created.');
        }
        return this._buffer;
    }

    public get indexLength(): number {
        if (!this._buffer) {
            throw new Error('IBO is not be created.');
        }
        return this._indexLength;
    }

    private create(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const ibo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    };
}

export default IBOManager;
