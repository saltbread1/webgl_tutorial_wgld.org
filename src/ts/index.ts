import ShaderModel0 from "./shaderModels/shaderModel0";
import ShaderModel1 from "./shaderModels/shaderModel1";
import ShaderPath from "./shaderPath";
import {Buffers} from "./types";

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
    //const elmPointSize: HTMLInputElement = document.getElementById("point_size") as HTMLInputElement;

    const shaderModel0: ShaderModel0 = new ShaderModel0(gl, elmCanvas);
    await shaderModel0.initialize();
    elmCanvas.addEventListener('mousemove', shaderModel0.mouseMove);
    const shaderModel1: ShaderModel1 = new ShaderModel1(gl, elmCanvas, elmTransparency, elmAdd, elmAlphaValue);
    shaderModel1.initialize();
    const path: ShaderPath = new ShaderPath(gl);
    path.addPath({model: shaderModel0, buffers: createFrameBuffer(gl, elmCanvas.width, elmCanvas.height)},
        {model: shaderModel1, buffers: {f: null, t: null, d: null}});
    path.startShader(30);
};

const createFrameBuffer = (gl: WebGLRenderingContext, width: number, height: number): Buffers => {
    const frameBuffer: WebGLFramebuffer | null = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

    const depthRenderBuffer: WebGLRenderbuffer | null = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);

    const fTexture: WebGLTexture | null = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, fTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {f: frameBuffer, d: depthRenderBuffer, t: fTexture};
};

window.addEventListener('DOMContentLoaded', initCanvas);
window.addEventListener('DOMContentLoaded', mainShader);
