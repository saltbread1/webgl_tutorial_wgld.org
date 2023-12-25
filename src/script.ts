window.onload = () : void => {
    const c : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const gl : WebGLRenderingContext = c.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};
