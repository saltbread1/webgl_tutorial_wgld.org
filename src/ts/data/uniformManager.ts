class UniformManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _uniLocMap: Map<string, WebGLUniformLocation>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._uniLocMap = new Map<string, WebGLUniformLocation>();
    }

    public addLocations(program: WebGLProgram, ...names: string[]): void {
        names.forEach((name: string): void => {
            this.addLocation(program, name);
        });
    }

    public addLocation(program: WebGLProgram, name: string): void {
        const loc: WebGLUniformLocation | null = this._gl.getUniformLocation(program, name);
        if (!loc) {
            //throw new Error(`An uniform variable named \"${name}\" does not exist.`);
            console.warn(`An attribute variable named \"${name}\" does not exist.`);
            return;
        }
        this._uniLocMap.set(name, loc);
    }

    public getLocation(key: string): WebGLUniformLocation {
        const ret: WebGLUniformLocation | undefined = this._uniLocMap.get(key);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }
}

export default UniformManager;
