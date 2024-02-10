class VBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _bufferMap: Map<string, WebGLBuffer>;
    private _pointLength: number = -1;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._bufferMap = new Map<string, WebGLBuffer>();
    }

    public addBuffers(...info: {name: string, data: number[], stride: number}[]): void {
        info.forEach((i: {name: string, data: number[], stride: number}): void => {
            this.addBuffer(i.name, i.data, i.stride);
        });
    }

    public addBuffer(name: string, data: number[], stride: number): void {
        // Check data size error.
        if (this._pointLength == -1) {
            this._pointLength = data.length / stride;
        } else if (data.length / stride != this._pointLength) {
            throw new Error('The size of data array is invalid.');
        }

        this._bufferMap.set(name, this.create(this._gl, data));
    }

    public getBuffer(key: string): WebGLBuffer {
        const ret: WebGLBuffer | undefined = this._bufferMap.get(key);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    public get bufferMap(): Map<string, WebGLBuffer> {
        return this._bufferMap;
    }

    public get pointLength(): number {
        if (this._pointLength == -1) {
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

export default VBOManager;
