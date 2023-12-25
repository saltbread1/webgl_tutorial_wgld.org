const initCanvas = () : void => {
    const c : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const gl : WebGLRenderingContext = c.getContext("webgl");
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};

const setShader = () : void => {
    const vs : string = `
        attribute vec3 position;
        
        void main() {
            gl_Position = vec4(position, 1.0);
        }
    `;

    const fs : string = `
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    `;

    const c : HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
    const gl : WebGLRenderingContext = c.getContext("webgl");

    const vShader : WebGLShader = createShader(gl, gl.VERTEX_SHADER, vs);
    const fShader : WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

    const program : WebGLProgram = createProgram(gl, vShader, fShader);

    const attLocation : number = gl.getAttribLocation(program, "position");
    const attStride : number = 3;

    const vertexPosition : number[] = [
        0.0, 1.0, 0.0,
        1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
    ];

    const vbo : WebGLBuffer = createVBO(gl, vertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
};

const createShader = (gl: WebGLRenderingContext, type: number, s: string) : WebGLShader => {
    const shader: WebGLShader = gl.createShader(type);
    gl.shaderSource(shader, s);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }
    else {
        alert(gl.getShaderInfoLog(shader));
    }
};

const createProgram = (gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader) : WebGLProgram => {
    const program : WebGLProgram = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        return program;
    }
    else {
        alert(gl.getProgramInfoLog(program));
    }
};

const createVBO = (gl: WebGLRenderingContext, data: number[]) : WebGLBuffer => {
    const vbo : WebGLBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
};

window.addEventListener("DOMContentLoaded", initCanvas);
window.addEventListener("DOMContentLoaded", setShader);
