import {readFileSync} from 'fs';
import ShaderModel0 from "./shaderModels/shaderModel0";

const initCanvas = (): void => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const gl: WebGLRenderingContext = c.getContext('webgl', {stencil: true})!;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // enable culling
    // gl.enable(gl.CULL_FACE);

    // enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    const pointSizeRange: number[] = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);
    console.log(`pointSizeRange: ${pointSizeRange[0]} - ${pointSizeRange[1]}`);
};

const mainShader = async (): Promise<void> => {
    const elmCanvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = elmCanvas.getContext('webgl')!;
    const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
    const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
    const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;
    const elmPointSize: HTMLInputElement = document.getElementById("point_size") as HTMLInputElement;

    const vs: string = readFileSync('src/shader/vertex.glsl', {encoding: 'utf-8'});
    const fs: string = readFileSync('src/shader/fragment.glsl', {encoding: 'utf-8'});
    const shaderModel0: ShaderModel0 = new ShaderModel0(gl, vs, fs,
        elmCanvas, elmTransparency, elmAdd, elmAlphaValue, elmPointSize);
    await shaderModel0.initialize();
    elmCanvas.addEventListener('mousemove', shaderModel0.mouseMove);
    shaderModel0.startShader(30);
};

window.addEventListener('DOMContentLoaded', initCanvas);
window.addEventListener('DOMContentLoaded', mainShader);
