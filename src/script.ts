import { readFileSync } from 'fs';
import * as glMat from 'gl-matrix';

let texture0: WebGLTexture | null = null;

type Attribute = {
    attLocation: number;
    attStride: number;
};

const initCanvas = (): void => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const gl: WebGLRenderingContext = c.getContext('webgl') as WebGLRenderingContext;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // enable culling
    // gl.enable(gl.CULL_FACE);

    // enable depth test
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
};

const setShader = (): void => {
    const fps: number = 30;
    const initTime: number = new Date().getTime();

    const vs: string = readFileSync('src/shader/vertex.glsl', 'utf-8');
    const fs: string = readFileSync('src/shader/fragment.glsl', 'utf-8');

    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = c.getContext('webgl') as WebGLRenderingContext;

    const vShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vs) as WebGLShader;
    const fShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fs) as WebGLShader;

    const program: WebGLProgram = createProgram(gl, vShader, fShader) as WebGLProgram;

    // get attributes
    const attributes: Map<string, Attribute> = new Map<string, Attribute>();
    attributes.set('position', { attLocation: gl.getAttribLocation(program, 'position'), attStride: 3 });
    attributes.set('normal', { attLocation: gl.getAttribLocation(program, 'normal'), attStride: 3 });
    attributes.set('color', { attLocation: gl.getAttribLocation(program, 'color'), attStride: 4 });
    attributes.set('textureCoord', { attLocation: gl.getAttribLocation(program, 'textureCoord'), attStride: 2 });

    // set VBO
    const position: number[] = [
        -1.0,  1.0,  0.0,
         1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0,
    ];
    const normal: number[] = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
    ];
    const color: number[] = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
    ];
    const textureCoord: number[] = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
    ];
    const index: number[] = [
        0, 1, 2,
        3, 2, 1,
    ];
    const vboMap: Map<string, WebGLBuffer> = new Map<string, WebGLBuffer>();
    vboMap.set('position', createVBO(gl, position));
    vboMap.set('normal', createVBO(gl, normal));
    vboMap.set('color', createVBO(gl, color));
    vboMap.set('textureCoord', createVBO(gl, textureCoord));
    const ibo: WebGLBuffer = createIBO(gl, index);

    // set attributes
    setAttribute(gl, vboMap.get('position') as WebGLBuffer, attributes.get('position') as Attribute);
    setAttribute(gl, vboMap.get('normal') as WebGLBuffer, attributes.get('normal') as Attribute);
    setAttribute(gl, vboMap.get('color') as WebGLBuffer, attributes.get('color') as Attribute);
    setAttribute(gl, vboMap.get('textureCoord') as WebGLBuffer, attributes.get('textureCoord') as Attribute);

    // get uniforms
    const uniLocations: Map<string, WebGLUniformLocation> = new Map<string, WebGLUniformLocation>();
    uniLocations.set('mMatrix', gl.getUniformLocation(program, 'mMatrix') as WebGLUniformLocation);
    uniLocations.set('mvpMatrix', gl.getUniformLocation(program, 'mvpMatrix') as WebGLUniformLocation);
    uniLocations.set('invMatrix', gl.getUniformLocation(program, 'invMatrix') as WebGLUniformLocation);
    uniLocations.set('lightDirection', gl.getUniformLocation(program, 'lightDirection') as WebGLUniformLocation);
    uniLocations.set('lightPosition', gl.getUniformLocation(program, 'lightPosition') as WebGLUniformLocation);
    uniLocations.set('eyeDirection', gl.getUniformLocation(program, 'eyeDirection') as WebGLUniformLocation);
    uniLocations.set('ambientColor', gl.getUniformLocation(program, 'ambientColor') as WebGLUniformLocation);
    uniLocations.set('texture0', gl.getUniformLocation(program, 'texture0') as WebGLUniformLocation);
    uniLocations.set('time', gl.getUniformLocation(program, 'time') as WebGLUniformLocation);

    // define matrix
    const mMatrix: glMat.mat4 = glMat.mat4.create();
    const vMatrix: glMat.mat4 = glMat.mat4.create();
    const pMatrix: glMat.mat4 = glMat.mat4.create();
    const tmpMatrix: glMat.mat4 = glMat.mat4.create();
    const mvpMatrix: glMat.mat4 = glMat.mat4.create();
    const invMatrix: glMat.mat4 = glMat.mat4.create();

    // calculate view x projection matrix
    glMat.mat4.lookAt(vMatrix, [0.0, 1.0, 3.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    glMat.mat4.perspective(pMatrix, 90, c.width / c.height, 0.1, 100);
    glMat.mat4.multiply(tmpMatrix, vMatrix, tmpMatrix);
    glMat.mat4.multiply(tmpMatrix, pMatrix, tmpMatrix);

    // direction light
    const lightDirection: number[] = [-1.0, 1.0, 1.0];
    const lightPosition: number[] = [0.0, 0.0, 0.0];
    const eyeDirection: number[] = [0.0, 0.0, 1.0];
    const ambientColor: number[] = [0.1, 0.1, 0.1, 0.1];

    // texture
    createTexture(gl, 'saltbread.png');
    // if (texture0 == null)
    // {
    //     alert('texture is null');
    // }
    gl.activeTexture(gl.TEXTURE0);

    // set uniforms
    gl.uniform3fv(uniLocations.get('lightDirection') as WebGLUniformLocation, lightDirection);
    gl.uniform3fv(uniLocations.get('eyeDirection') as WebGLUniformLocation, eyeDirection);
    gl.uniform4fv(uniLocations.get('ambientColor') as WebGLUniformLocation, ambientColor);

    const render = (): void => {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // time count
        const time: number = (new Date().getTime() - initTime) * 0.001;
        gl.uniform1f(uniLocations.get('time') as WebGLUniformLocation, time);

        // position of the point light
        lightPosition[0] = Math.cos(time * Math.PI / 8) * 2.0;
        lightPosition[1] = Math.sin(time * Math.PI / 8) * 2.0;
        lightPosition[2] = 0;
        gl.uniform3fv(uniLocations.get('lightPosition') as WebGLUniformLocation, lightPosition);

        // texture
        gl.bindTexture(gl.TEXTURE_2D, texture0);
        gl.uniform1i(uniLocations.get('texture0') as WebGLUniformLocation, 0);
        //gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

        // model 1: rotate on z axis
        // MVP matrix
        glMat.mat4.fromTranslation(mMatrix, [-2.0, 0.0, 0.0]);
        glMat.mat4.rotateZ(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mMatrix') as WebGLUniformLocation, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix') as WebGLUniformLocation, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix') as WebGLUniformLocation, false, invMatrix);
        // draw the model to the buffer
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        // model 2: rotate on y axis
        // MVP matrix
        glMat.mat4.fromTranslation(mMatrix, [2.0, 0.0, 0.0]);
        glMat.mat4.rotateY(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mMatrix') as WebGLUniformLocation, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix') as WebGLUniformLocation, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix') as WebGLUniformLocation, false, invMatrix);
        // draw the model to the buffer
        gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.flush();

        setTimeout(render, 1000 / fps);
    };

    render();
};

const createShader = (gl: WebGLRenderingContext, type: number, s: string): WebGLShader | null => {
    const shader: WebGLShader = gl.createShader(type) as WebGLShader;
    gl.shaderSource(shader, s);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    } else {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
};

const createProgram = (gl: WebGLRenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram | null => {
    const program: WebGLProgram = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.useProgram(program);
        return program;
    } else {
        alert(gl.getProgramInfoLog(program));
        return null;
    }
};

const createVBO = (gl: WebGLRenderingContext, data: number[]): WebGLBuffer => {
    const vbo: WebGLBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
};

const createIBO = (gl: WebGLRenderingContext, data: number[]): WebGLBuffer => {
    const ibo: WebGLBuffer = gl.createBuffer() as WebGLBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return ibo;
};

const setAttribute = (gl: WebGLRenderingContext, vbo: WebGLBuffer, attribute: Attribute): void => {
    gl.enableVertexAttribArray(attribute.attLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.vertexAttribPointer(attribute.attLocation, attribute.attStride, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

const createTexture = (gl: WebGLRenderingContext, source: string): void => {
    const img: HTMLImageElement = new Image();

    img.onload = (): void => {
        const tex: WebGLTexture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture0 = tex;
    };
    img.src = source;
};

window.addEventListener('DOMContentLoaded', initCanvas);
window.addEventListener('DOMContentLoaded', setShader);
