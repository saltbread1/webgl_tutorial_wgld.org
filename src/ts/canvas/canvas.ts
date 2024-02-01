import ShaderPath from "../shaderPath";

abstract class Canvas {
    protected readonly _c: HTMLCanvasElement;
    protected readonly _gl: WebGLRenderingContext;
    protected readonly _path: ShaderPath;

    protected constructor(c: HTMLCanvasElement) {
        this._c = c;
        this._gl = c.getContext('webgl')!;
        this._path = new ShaderPath(this._gl);
    }

    public initCanvas(): void {
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // enable culling
        // this._gl.enable(this._gl.CULL_FACE);

        // enable depth test
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);

        // const pointSizeRange: number[] = this._gl.getParameter(this._gl.ALIASED_POINT_SIZE_RANGE);
        // console.log(`pointSizeRange: ${pointSizeRange[0]} - ${pointSizeRange[1]}`);
    }

    public abstract initShader(): void | Promise<void>;

    public startShader(): void {
        this._path.startShader(30);
    }

    public suspendShader(): void {
        this._path.suspendShader();
    }
}

export default Canvas;
