import { readFileSync } from 'fs';
import * as glMat from 'gl-matrix';

type Attribute = {
    attLocation: number;
    attStride: number;
};

enum BlendType {
    ALPHA,
    ADD,
    INVALIABLE,
}

type Vertices = {
    pos: number[];
    nor: number[];
    col: number[];
    tex: number[];
    idx: number[];
};

type Buffers = {
    f: WebGLFramebuffer | null;
    d: WebGLRenderbuffer | null;
    t: WebGLTexture | null;
};

const initCanvas = (): void => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;
    c.addEventListener('mousemove', mouseMove);

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

const setShader = async (): Promise<void> => {
    const fps: number = 30;
    const initTime: number = new Date().getTime();

    const vs: string = readFileSync('src/shader/vertex.glsl', 'utf-8');
    const fs: string = readFileSync('src/shader/fragment.glsl', 'utf-8');

    const elmCanvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
    const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
    const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;
    const elmPointSize: HTMLInputElement = document.getElementById("point_size") as HTMLInputElement;
    const elmOutlineSizeRatio: HTMLInputElement = document.getElementById("outline_size") as HTMLInputElement;
    const gl: WebGLRenderingContext = elmCanvas.getContext('webgl')!;

    const vShader: WebGLShader = createShader(gl, gl.VERTEX_SHADER, vs)!;
    const fShader: WebGLShader = createShader(gl, gl.FRAGMENT_SHADER, fs)!;

    const program: WebGLProgram = createProgram(gl, vShader, fShader)!;

    // get attributes
    const attributes: Map<string, Attribute> = new Map<string, Attribute>();
    attributes.set('position', { attLocation: gl.getAttribLocation(program, 'position'), attStride: 3 });
    attributes.set('normal', { attLocation: gl.getAttribLocation(program, 'normal'), attStride: 3 });
    attributes.set('color', { attLocation: gl.getAttribLocation(program, 'color'), attStride: 4 });
    attributes.set('textureCoord', { attLocation: gl.getAttribLocation(program, 'textureCoord'), attStride: 2 });

    // set VBO
    const squareVertices: Vertices = square(1);
    const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
    const sphereVertices: Vertices = sphere(100, 100, 2.25);

    const vboMap: Map<string, WebGLBuffer> = new Map<string, WebGLBuffer>();
    vboMap.set('squarePosition', createVBO(gl, squareVertices.pos));
    vboMap.set('squareNormal', createVBO(gl, squareVertices.nor));
    vboMap.set('squareColor', createVBO(gl, squareVertices.col));
    vboMap.set('squareTextureCoord', createVBO(gl, squareVertices.tex));
    vboMap.set('torusPosition', createVBO(gl, torusVertices.pos));
    vboMap.set('torusNormal', createVBO(gl, torusVertices.nor));
    vboMap.set('torusColor', createVBO(gl, torusVertices.col));
    vboMap.set('torusTextureCoord', createVBO(gl, torusVertices.tex));
    vboMap.set('spherePosition', createVBO(gl, sphereVertices.pos));
    vboMap.set('sphereNormal', createVBO(gl, sphereVertices.nor));
    vboMap.set('sphereColor', createVBO(gl, sphereVertices.col));
    vboMap.set('sphereTextureCoord', createVBO(gl, sphereVertices.tex));


    const iboMap: Map<string, WebGLBuffer> = new Map<string, WebGLBuffer>();
    iboMap.set('square', createIBO(gl, squareVertices.idx));
    iboMap.set('torus', createIBO(gl, torusVertices.idx));
    iboMap.set('sphere', createIBO(gl, sphereVertices.idx));

    // get uniforms
    const uniLocations: Map<string, WebGLUniformLocation> = new Map<string, WebGLUniformLocation>();
    uniLocations.set('mMatrix', gl.getUniformLocation(program, 'mMatrix')!);
    uniLocations.set('mvpMatrix', gl.getUniformLocation(program, 'mvpMatrix')!);
    uniLocations.set('invMatrix', gl.getUniformLocation(program, 'invMatrix')!);
    uniLocations.set('lightDirection', gl.getUniformLocation(program, 'lightDirection')!);
    uniLocations.set('lightPosition', gl.getUniformLocation(program, 'lightPosition')!);
    uniLocations.set('eyeDirection', gl.getUniformLocation(program, 'eyeDirection')!);
    uniLocations.set('ambientColor', gl.getUniformLocation(program, 'ambientColor')!);
    uniLocations.set('texture0', gl.getUniformLocation(program, 'texture0')!);
    uniLocations.set('texture1', gl.getUniformLocation(program, 'texture1')!);
    uniLocations.set('vertexAlpha', gl.getUniformLocation(program, 'vertexAlpha')!);
    uniLocations.set('pointSize', gl.getUniformLocation(program, 'pointSize')!);
    uniLocations.set('outlineSizeRatio', gl.getUniformLocation(program, 'outlineSizeRatio')!);
    uniLocations.set('isLight', gl.getUniformLocation(program, 'isLight')!);
    uniLocations.set('isTexture', gl.getUniformLocation(program, 'isTexture')!);

    // define matrix
    const mMatrix: glMat.mat4 = glMat.mat4.create();
    const vMatrix: glMat.mat4 = glMat.mat4.create();
    const pMatrix: glMat.mat4 = glMat.mat4.create();
    const tmpMatrix: glMat.mat4 = glMat.mat4.create();
    const mvpMatrix: glMat.mat4 = glMat.mat4.create();
    const invMatrix: glMat.mat4 = glMat.mat4.create();
    const qMatrix: glMat.mat4 = glMat.mat4.create();

    // calculate view x projection matrix
    glMat.mat4.lookAt(vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    glMat.mat4.perspective(pMatrix, 90, elmCanvas.width / elmCanvas.height, 0.1, 100);
    glMat.mat4.multiply(tmpMatrix, vMatrix, tmpMatrix);
    glMat.mat4.multiply(tmpMatrix, pMatrix, tmpMatrix);

    // direction light
    const lightDirection: number[] = [-1.0, 1.0, 1.0];
    const lightPosition: number[] = [0.0, 0.0, 0.0];
    const eyeDirection: number[] = [0.0, 0.0, 1.0];
    const ambientColor: number[] = [0.1, 0.1, 0.1, 0.1];

    // Textures must be created first or does not work.
    const texture0: WebGLTexture = await createTexture(gl, 'img/texture0.png');
    //const texture1: WebGLTexture = await createTexture(gl, 'img/texture1.png');

    // active texture unit 0
    gl.activeTexture(gl.TEXTURE0);

    // create framebuffer
    // width and height must be the format of "2^n"
    const fWidth: number = elmCanvas.width;
    const fHeight: number = elmCanvas.height;
    const buffers: Buffers = createFrameBuffer(gl, fWidth, fHeight);

    // set uniforms
    gl.uniform3fv(uniLocations.get('lightDirection')!, lightDirection);
    gl.uniform3fv(uniLocations.get('eyeDirection')!, eyeDirection);
    gl.uniform4fv(uniLocations.get('ambientColor')!, ambientColor);

    const render = (): void => {
        // time count
        const time: number = (new Date().getTime() - initTime) * 0.001;
        // gl.uniform1f(uniLocations.get('time')!, time);

        // position of the point light
        lightPosition[0] = Math.cos(time * Math.PI / 8) * 2.0;
        lightPosition[1] = Math.sin(time * Math.PI / 8) * 2.0;
        lightPosition[2] = 0;
        gl.uniform3fv(uniLocations.get('lightPosition')!, lightPosition);

        // point size
        const pointSize: number = parseFloat(elmPointSize.value);
        gl.uniform1f(uniLocations.get('pointSize')!, pointSize);

        // blend
        let blendType: BlendType = BlendType.INVALIABLE;
        if (elmTransparency.checked) { blendType = BlendType.ALPHA; }
        if (elmAdd.checked) { blendType = BlendType.ADD; }
        blend(gl, blendType);
        // alpha value
        const vertexAlpha: number = parseFloat(elmAlphaValue.value);
        const outlineSizeRatio: number = parseFloat(elmOutlineSizeRatio.value);

        // bind framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, buffers.f);

        // initialize buffer
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // disable alpha blend
        gl.disable(gl.BLEND);

        // set common uniforms
        gl.uniform1f(uniLocations.get('vertexAlpha')!, 1.0);
        gl.uniform1i(uniLocations.get('texture0')!, 0);

        // bind texture
        gl.bindTexture(gl.TEXTURE_2D, texture0);

        // set sphere attributes
        setAttribute(gl, vboMap.get('spherePosition')!, attributes.get('position')!);
        setAttribute(gl, vboMap.get('sphereNormal')!, attributes.get('normal')!);
        setAttribute(gl, vboMap.get('sphereColor')!, attributes.get('color')!);
        setAttribute(gl, vboMap.get('sphereTextureCoord')!, attributes.get('textureCoord')!);

        // apply sphere IBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboMap.get('sphere')!);

        // matrix for sphere
        glMat.mat4.fromTranslation(mMatrix, [0.0, 0.0, 0.0]);
        glMat.mat4.fromQuat(qMatrix, quat);
        glMat.mat4.multiply(mMatrix, mMatrix, qMatrix);
        glMat.mat4.rotateZ(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);

        // set uniforms for sphere
        gl.uniformMatrix4fv(uniLocations.get('mMatrix')!, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix')!, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix')!, false, invMatrix);
        gl.uniform1f(uniLocations.get('outlineSizeRatio')!, 0.0);
        gl.uniform1i(uniLocations.get('isLight')!, 0);
        gl.uniform1i(uniLocations.get('isTexture')!, 1);

        // draw the sphere background
        gl.drawElements(gl.TRIANGLES, sphereVertices.idx.length, gl.UNSIGNED_SHORT, 0);
        //gl.drawArrays(gl.POINTS, 0, sphereVertices.pos.length / 3);


        // set torus attributes
        setAttribute(gl, vboMap.get('torusPosition')!, attributes.get('position')!);
        setAttribute(gl, vboMap.get('torusNormal')!, attributes.get('normal')!);
        setAttribute(gl, vboMap.get('torusColor')!, attributes.get('color')!);
        setAttribute(gl, vboMap.get('torusTextureCoord')!, attributes.get('textureCoord')!);

        // apply torus IBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboMap.get('torus')!);

        // matrix for torus
        glMat.mat4.fromTranslation(mMatrix, [0.0, 0.0, 0.0]);
        glMat.mat4.fromQuat(qMatrix, quat);
        glMat.mat4.multiply(mMatrix, mMatrix, qMatrix);
        glMat.mat4.rotateZ(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);

        // set uniforms for torus inline
        gl.uniformMatrix4fv(uniLocations.get('mMatrix')!, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix')!, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix')!, false, invMatrix);
        gl.uniform1f(uniLocations.get('outlineSizeRatio')!, 0.0);
        gl.uniform1i(uniLocations.get('isLight')!, 1);
        gl.uniform1i(uniLocations.get('isTexture')!, 0);

        // draw the torus inline
        gl.drawElements(gl.TRIANGLES, torusVertices.idx.length, gl.UNSIGNED_SHORT, 0);


        // unbind framebuffer: flush automatically
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // initialize canvas
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // set square attributes
        setAttribute(gl, vboMap.get('squarePosition')!, attributes.get('position')!);
        setAttribute(gl, vboMap.get('squareNormal')!, attributes.get('normal')!);
        setAttribute(gl, vboMap.get('squareColor')!, attributes.get('color')!);
        setAttribute(gl, vboMap.get('squareTextureCoord')!, attributes.get('textureCoord')!);

        // set common uniforms
        gl.uniform1i(uniLocations.get('texture0')!, 0);
        gl.uniform1f(uniLocations.get('vertexAlpha')!, vertexAlpha);
        gl.uniform1f(uniLocations.get('outlineSizeRatio')!, 0.0);
        gl.uniform1i(uniLocations.get('isLight')!, 0);
        gl.uniform1i(uniLocations.get('isTexture')!, 1);

        // bind texture
        gl.bindTexture(gl.TEXTURE_2D, buffers.t);

        // apply square IBO
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboMap.get('square')!);

        // enable alpha blend
        gl.enable(gl.BLEND);

        // model 1: rotate on z axis
        // MVP matrix
        glMat.mat4.fromTranslation(mMatrix, [0.25, 0.25, 1.0]);
        glMat.mat4.rotateZ(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);
        // set uniforms
        gl.uniformMatrix4fv(uniLocations.get('mMatrix')!, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix')!, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix')!, false, invMatrix);
        // draw the model to the buffer
        gl.drawElements(gl.TRIANGLES, squareVertices.idx.length, gl.UNSIGNED_SHORT, 0);

        // model 2: rotate on y axis
        // MVP matrix
        glMat.mat4.fromTranslation(mMatrix, [-0.25, -0.25, 1.2]);
        glMat.mat4.rotateY(mMatrix, mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(mvpMatrix, tmpMatrix, mMatrix);
        glMat.mat4.invert(invMatrix, mMatrix);
        // set uniforms
        gl.uniformMatrix4fv(uniLocations.get('mMatrix')!, false, mMatrix);
        gl.uniformMatrix4fv(uniLocations.get('mvpMatrix')!, false, mvpMatrix);
        gl.uniformMatrix4fv(uniLocations.get('invMatrix')!, false, invMatrix);
        // draw the model to the buffer
        gl.drawElements(gl.TRIANGLES, squareVertices.idx.length, gl.UNSIGNED_SHORT, 0);

        gl.flush();
    };

    setInterval(render, 1000 / fps);
};

const createShader = (gl: WebGLRenderingContext, type: number, s: string): WebGLShader | null => {
    const shader: WebGLShader = gl.createShader(type)!;
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
    const program: WebGLProgram = gl.createProgram()!;
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
    const vbo: WebGLBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return vbo;
};

const createIBO = (gl: WebGLRenderingContext, data: number[]): WebGLBuffer => {
    const ibo: WebGLBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    return ibo;
};

const setAttribute = (gl: WebGLRenderingContext, vbo: WebGLBuffer, attribute: Attribute): void => {
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(attribute.attLocation);
    gl.vertexAttribPointer(attribute.attLocation, attribute.attStride, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

const createTexture = (gl: WebGLRenderingContext, source: string): Promise<WebGLTexture> =>
    new Promise<WebGLTexture>((resolve: (value: WebGLTexture) => void): void => {
        const img: HTMLImageElement = new Image();

        img.onload = (): void => {
            const texture: WebGLTexture = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            resolve(texture);
        };
        img.src = source;
    });

const blend = (gl: WebGLRenderingContext, type: BlendType): void => {
    switch (type) {
        case BlendType.ALPHA:
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
            break;
        case BlendType.ADD:
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
            break;
        default:
            throw new Error('This blend type is illegal.');
    }
};

const torus = (lRes: number, mRes: number, sRad: number, lRad: number): Vertices => {
    const vertices: Vertices = {pos: [], nor: [], col: [], tex: [], idx: []};
    for (let lon: number = 0; lon <= lRes; lon++) {
        const t: number = Math.PI * 2 / lRes * lon;
        for (let mer: number = 0; mer <= mRes; mer++) {
            // position
            const p: number = Math.PI * 2 / mRes * mer;
            const x: number = lRad * Math.cos(t) + sRad * Math.cos(p) * Math.cos(t);
            const y: number = lRad * Math.sin(t) + sRad * Math.cos(p) * Math.sin(t);
            const z: number = sRad * Math.sin(p);
            vertices.pos.push(x, y, z);

            // normal
            const nx: number = Math.cos(p) * Math.cos(t);
            const ny: number = Math.cos(p) * Math.sin(t);
            const nz: number = Math.sin(p);
            vertices.nor.push(nx, ny, nz);

            // color
            const rgb: number[] = hsv2rgb(lon/lRes, 1, 1, 1);
            vertices.col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            // texCoord
            vertices.tex.push(mer/mRes, lon/lRes);
        }
    }

    for (let lon: number = 0; lon < lRes; lon++) {
        for (let mer: number = 0; mer < mRes; mer++) {
            const i: number = mer + (mRes+1) * lon;
            vertices.idx.push(i, i+1, i+mRes+1);
            vertices.idx.push(i+1, i+mRes+2, i+mRes+1);
        }
    }

    return vertices;
};

const sphere = (latRes: number, lonRes: number, r: number): Vertices => {
    const vertices: Vertices = {pos: [], nor: [], col: [], tex: [], idx: []};
    for (let lon: number = 0; lon <= lonRes; lon++) {
        const theta: number = Math.PI * lon / lonRes;
        for (let lat: number = 0; lat <= latRes; lat++) {
            const phi: number = 2 * Math.PI * lat / latRes;
            const x: number = Math.sin(theta)*Math.cos(phi);
            const y: number = Math.sin(theta)*Math.sin(phi);
            const z: number = Math.cos(theta);
            vertices.pos.push(r*x, r*y, r*z);
            vertices.nor.push(x, y, z);

            const rgb: number[] = hsv2rgb(lat/latRes, 1, 1, 1);
            vertices.col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            vertices.tex.push(lat/latRes, lon/lonRes);
        }
    }

    for (let lon: number = 0; lon < lonRes; lon++) {
        for (let lat: number = 0; lat < latRes; lat++) {
            const i: number = lat + (latRes+1) * lon;
            vertices.idx.push(i, i+1, i+latRes+1);
            vertices.idx.push(i+1, i+latRes+2, i+latRes+1);
        }
    }

    return vertices;
};

const square = (edgeLength: number): Vertices => {
    const position: number[] = [
        -1.0,  1.0,  0.0,
        1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
    ].map((n: number) => n * 0.5 * edgeLength);
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

    return {pos: position, nor: normal, col: color, tex: textureCoord, idx: index};
};

const hsv2rgb = (h: number, s: number, v: number, a: number): number[] => {
    const r: number = ((clamp01(Math.abs(fract(h+0/3)*6-3)-1)-1)*s+1)*v;
    const g: number = ((clamp01(Math.abs(fract(h+2/3)*6-3)-1)-1)*s+1)*v;
    const b: number = ((clamp01(Math.abs(fract(h+1/3)*6-3)-1)-1)*s+1)*v;
    return [r, g, b, a];
};

const fract = (x: number): number => {
    return x - Math.floor(x);
};

const clamp01 = (x: number): number => {
    return Math.max(Math.min(x, 1), 0);
};

const quat: glMat.quat = glMat.quat.create();

const mouseMove = (e: MouseEvent): void => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const halfW: number = c.width / 2;
    const halfH: number = c.height / 2;
    const x: number = e.clientX - (c.clientLeft + halfW);
    const y: number = -(e.clientY - (c.clientTop + halfH));
    const rad: number = Math.PI * Math.sqrt((x*x+y*y)/(halfW*halfW+halfH*halfH));
    const axis: glMat.vec3 = glMat.vec3.create();
    glMat.vec3.normalize(axis, [x, y, 0]);
    glMat.vec3.rotateZ(axis, axis, [0, 0, 0], Math.PI/2);
    glMat.quat.setAxisAngle(quat, axis, rad);
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
window.addEventListener('DOMContentLoaded', setShader);
