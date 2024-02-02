class Program {
    private readonly _gl: WebGLRenderingContext;
    private _program: WebGLProgram | undefined;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
    }

    public get get(): WebGLProgram {
        if (!this._program) {
            throw new Error('The program is undefined.');
        }
        return this._program;
    }

    private createShader(type: number, s: string): WebGLShader {
        const shader: WebGLShader = this._gl.createShader(type)!;
        this._gl.shaderSource(shader, s);
        this._gl.compileShader(shader);

        if (!this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            throw new Error(this._gl.getShaderInfoLog(shader)!);
        }
        return shader;
    }

    public create(vs: string, fs: string): void {
        const program: WebGLProgram = this._gl.createProgram()!;
        const vShader: WebGLShader = this.createShader(this._gl.VERTEX_SHADER, vs);
        const fShader: WebGLShader = this.createShader(this._gl.FRAGMENT_SHADER, fs);
        this._gl.attachShader(program, vShader);
        this._gl.attachShader(program, fShader);
        this._gl.linkProgram(program);

        if (!this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            throw new Error(this._gl.getProgramInfoLog(program)!);
        }
        this._program = program;
    }
}

export default Program;
