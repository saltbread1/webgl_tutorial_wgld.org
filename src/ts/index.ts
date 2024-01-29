import { readFileSync } from 'fs';
import * as glMat from 'gl-matrix';

type Attribute = {
    attLocation: number;
    attStride: number;
};

type IBO = {
    buff: WebGLBuffer;
    length: number;
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

class ProgramCreator {
    private readonly _gl: WebGLRenderingContext;
    private readonly _vShader: WebGLShader;
    private readonly _fShader: WebGLShader;

    public constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
        this._gl = gl;
        this._vShader = this.createShader(gl.VERTEX_SHADER, vs)!;
        this._fShader = this.createShader(gl.FRAGMENT_SHADER, fs)!;
    }

    private createShader(type: number, s: string): WebGLShader | null {
        const shader: WebGLShader = this._gl.createShader(type)!;
        this._gl.shaderSource(shader, s);
        this._gl.compileShader(shader);

        if (this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS)) {
            return shader;
        } else {
            alert(this._gl.getShaderInfoLog(shader));
            return null;
        }
    }

    public createProgram(): WebGLProgram | null {
        const program: WebGLProgram = this._gl.createProgram()!;
        this._gl.attachShader(program, this._vShader);
        this._gl.attachShader(program, this._fShader);
        this._gl.linkProgram(program);

        if (this._gl.getProgramParameter(program, this._gl.LINK_STATUS)) {
            this._gl.useProgram(program);
            return program;
        } else {
            alert(this._gl.getProgramInfoLog(program));
            return null;
        }
    }
}

class AttributeManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: WebGLProgram;
    private readonly _attributeMap: Map<string, Attribute>;

    public constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this._gl = gl;
        this._program = program;
        this._attributeMap = new Map<string, Attribute>();
    }

    public addAttribute(name: string, attStride: number): void {
        const loc: number = this._gl.getAttribLocation(this._program, name);
        if (loc == -1) {
            throw new Error(`An attribute variable named \"${name}\" does not exist.`);
        }
        this._attributeMap.set(name, { attLocation: loc, attStride: attStride });
    }

    public getAttribute(key: string): Attribute {
        const ret: Attribute | undefined = this._attributeMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    public clearAttribute(): void {
        this._attributeMap.clear();
    }
}

class VBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _am: AttributeManager;
    private readonly _vboMap: Map<string, WebGLBuffer>;

    public constructor(gl: WebGLRenderingContext, am: AttributeManager) {
        this._gl = gl;
        this._am = am;
        this._vboMap = new Map<string, WebGLBuffer>();
    }

    public addVBO(name: string, data: Vertices): void {
        this._vboMap.set(name + 'Position', this.createVBO(this._gl, data.pos));
        this._vboMap.set(name + 'Normal', this.createVBO(this._gl, data.nor));
        this._vboMap.set(name + 'Color', this.createVBO(this._gl, data.col));
        this._vboMap.set(name + 'TextureCoord', this.createVBO(this._gl, data.tex));
    }

    public getVBO(key: string): WebGLBuffer {
        const ret: WebGLBuffer | undefined = this._vboMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    private createVBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const vbo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        return vbo;
    }

    public setAttribute(vboKey: string, attKey: string): void {
        const vbo: WebGLBuffer = this.getVBO(vboKey);
        const att: Attribute = this._am.getAttribute(attKey);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
        this._gl.enableVertexAttribArray(att.attLocation);
        this._gl.vertexAttribPointer(att.attLocation, att.attStride, this._gl.FLOAT, false, 0, 0);
        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
    };
}

class IBOManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _iboMap: Map<string, IBO>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._iboMap = new Map<string, IBO>();
    }

    public addIBO(name: string, data: Vertices): void {
        this._iboMap.set(name, { buff: this.createIBO(this._gl, data.idx), length: data.idx.length });
    }

    public getBuffer(key: string): WebGLBuffer {
        return this.getIBO(key).buff;
    }

    public getLength(key: string): number {
        return this.getIBO(key).length;
    }

    private getIBO(key: string): IBO {
        const ret: IBO | undefined = this._iboMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }

    private createIBO(gl: WebGLRenderingContext, data: number[]): WebGLBuffer {
        const ibo: WebGLBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        return ibo;
    };
}

class UniformManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _program: WebGLProgram;
    private readonly _uniLocationMap: Map<string, WebGLUniformLocation>;

    public constructor(gl: WebGLRenderingContext, program: WebGLProgram) {
        this._gl = gl;
        this._program = program;
        this._uniLocationMap = new Map<string, WebGLUniformLocation>();
    }

    public addUniform(name: string): void {
        const loc: WebGLUniformLocation | null = this._gl.getUniformLocation(this._program, name);
        if (loc === null) {
            throw new Error(`An uniform variable named \"${name}\" does not exist.`);
        }
        this._uniLocationMap.set(name, loc);
    }

    public getUniform(key: string): WebGLUniformLocation {
        const ret: WebGLBuffer | undefined = this._uniLocationMap.get(key);
        if (ret === undefined) {
            throw new Error(`An element corresponding the key named \"${key}\" does not existed.`);
        }
        return ret;
    }
}

abstract class ShaderObject {
    protected readonly _gl: WebGLRenderingContext;

    protected readonly _attMan: AttributeManager;
    protected readonly _vboMan: VBOManager;
    protected readonly _iboMan: IBOManager;
    protected readonly _uniMan: UniformManager;

    protected readonly _mMatrix: glMat.mat4;
    protected readonly _vMatrix: glMat.mat4;
    protected readonly _pMatrix: glMat.mat4;
    protected readonly _mvpMatrix: glMat.mat4;

    protected constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
        this._gl = gl;

        const program: WebGLProgram = new ProgramCreator(this._gl, vs, fs).createProgram()!;
        this._attMan = this.createAttributes(program);
        this._vboMan = this.createVBOs(this._attMan);
        this._iboMan = this.createIBOs();
        this._uniMan = this.createUniforms(program);

        this._mMatrix = glMat.mat4.create();
        this._vMatrix = glMat.mat4.create();
        this._pMatrix = glMat.mat4.create();
        this._mvpMatrix = glMat.mat4.create();
    }

    protected abstract render(): void;

    public startShader(fps: number): void {
        //setInterval(this.render, 1000 / fps);
        setTimeout(() => this.startShader(fps), 1000 / fps);
        this.render();
    }

    protected abstract createAttributes(program: WebGLProgram): AttributeManager;

    protected abstract createVBOs(attMan: AttributeManager): VBOManager;

    protected abstract createIBOs(): IBOManager;

    protected abstract createUniforms(program: WebGLProgram): UniformManager;

    protected createTexture(gl: WebGLRenderingContext, source: string): Promise<WebGLTexture> {
        return new Promise<WebGLTexture>((resolve: (value: WebGLTexture) => void): void => {
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
    }

    protected blend(gl: WebGLRenderingContext, type: BlendType): void {
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
}

class ShaderObject1 extends ShaderObject {
    private readonly _tmpMatrix: glMat.mat4;
    private readonly _invMatrix: glMat.mat4;
    private readonly _qMatrix: glMat.mat4;

    private readonly _lightDirection: number[];
    private readonly _eyeDirection: number[];
    private readonly _ambientColor: number[];

    private readonly _initTime: number;

    private _texture0: WebGLTexture | undefined;
    private _buffers: Buffers | undefined;

    private readonly _elmTransparency: HTMLInputElement;
    private readonly _elmAdd: HTMLInputElement;
    private readonly _elmAlphaValue: HTMLInputElement;
    private readonly _elmPointSize: HTMLInputElement;

    public constructor(gl: WebGLRenderingContext, vs: string, fs: string,
                       elmTransparency: HTMLInputElement, elmAdd: HTMLInputElement,
                       elmAlphaValue: HTMLInputElement, elmPointSize: HTMLInputElement) {
        super(gl, vs, fs);

        this._tmpMatrix = glMat.mat4.create();
        this._invMatrix = glMat.mat4.create();
        this._qMatrix = glMat.mat4.create();

        this._lightDirection = [-1.0, 1.0, 1.0];
        this._eyeDirection = [0.0, 0.0, 1.0];
        this._ambientColor = [0.1, 0.1, 0.1, 0.1];

        this._initTime = new Date().getTime();

        this._elmTransparency = elmTransparency;
        this._elmAdd = elmAdd;
        this._elmAlphaValue = elmAlphaValue;
        this._elmPointSize = elmPointSize;
    }

    public async initialize(canvas: HTMLCanvasElement): Promise<void> {
        // calculate view x projection matrix
        glMat.mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        glMat.mat4.perspective(this._pMatrix, 90, canvas.width / canvas.height, 0.1, 100);
        glMat.mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        glMat.mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        this._texture0 = await this.createTexture(this._gl, 'img/texture0.png');
        // active texture unit 0
        this._gl.activeTexture(this._gl.TEXTURE0);

        this._buffers = createFrameBuffer(this._gl, canvas.width, canvas.height);

        // set lights
        this._gl.uniform3fv(this._uniMan.getUniform('lightDirection'), this._lightDirection);
        this._gl.uniform3fv(this._uniMan.getUniform('eyeDirection'), this._eyeDirection);
        this._gl.uniform4fv(this._uniMan.getUniform('ambientColor'), this._ambientColor);
    }

    protected override render(): void {
        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // point size
        const pointSize: number = parseFloat(this._elmPointSize.value);
        this._gl.uniform1f(this._uniMan.getUniform('pointSize'), pointSize);

        // blend
        let blendType: BlendType = BlendType.INVALIABLE;
        if (this._elmTransparency.checked) { blendType = BlendType.ALPHA; }
        if (this._elmAdd.checked) { blendType = BlendType.ADD; }
        this.blend(this._gl, blendType);
        // alpha value
        const vertexAlpha: number = parseFloat(this._elmAlphaValue.value);

        // bind framebuffer
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._buffers!.f);

        // initialize buffer
        this._gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // disable alpha blend
        this._gl.disable(this._gl.BLEND);

        // set common uniforms
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), 1.0);
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);

        // bind texture
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._texture0!);

        // set sphere attributes
        this._vboMan.setAttribute('spherePosition', 'position');
        this._vboMan.setAttribute('sphereNormal', 'normal');
        this._vboMan.setAttribute('sphereColor', 'color');
        this._vboMan.setAttribute('sphereTextureCoord', 'textureCoord');

        // apply sphere IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('sphere')!);

        // matrix for sphere
        glMat.mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        glMat.mat4.fromQuat(this._qMatrix, quat);
        glMat.mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        glMat.mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        glMat.mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for sphere
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 0);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 1);

        // draw the sphere background
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('sphere'), this._gl.UNSIGNED_SHORT, 0);
        //gl.drawArrays(gl.POINTS, 0, sphereVertices.pos.length / 3);


        // set torus attributes
        this._vboMan.setAttribute('torusPosition', 'position');
        this._vboMan.setAttribute('torusNormal', 'normal');
        this._vboMan.setAttribute('torusColor', 'color');
        this._vboMan.setAttribute('torusTextureCoord', 'textureCoord');

        // apply torus IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('torus')!);

        // matrix for torus
        glMat.mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        glMat.mat4.fromQuat(this._qMatrix, quat);
        glMat.mat4.multiply(this._mMatrix, this._mMatrix, this._qMatrix);
        glMat.mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        glMat.mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for torus inline
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 1);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 0);

        // draw the torus inline
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('torus'), this._gl.UNSIGNED_SHORT, 0);


        // unbind framebuffer: flush automatically
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

        // initialize canvas
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        // set square attributes
        this._vboMan.setAttribute('squarePosition', 'position');
        this._vboMan.setAttribute('squareNormal', 'normal');
        this._vboMan.setAttribute('squareColor', 'color');
        this._vboMan.setAttribute('squareTextureCoord', 'textureCoord');

        // set common uniforms
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), vertexAlpha);
        this._gl.uniform1f(this._uniMan.getUniform('outlineSizeRatio'), 0.0);
        this._gl.uniform1i(this._uniMan.getUniform('isLight'), 0);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 1);

        // bind texture
        this._gl.bindTexture(this._gl.TEXTURE_2D, this._buffers!.t);

        // apply square IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('square')!);

        // enable alpha blend
        this._gl.enable(this._gl.BLEND);

        // model 1: rotate on z axis
        // MVP matrix
        glMat.mat4.fromTranslation(this._mMatrix, [0.25, 0.25, 1.0]);
        glMat.mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        glMat.mat4.invert(this._invMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);

        // model 2: rotate on y axis
        // MVP matrix
        glMat.mat4.fromTranslation(this._mMatrix, [-0.25, -0.25, 1.2]);
        glMat.mat4.rotateY(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        glMat.mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        glMat.mat4.invert(this._invMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);

        this._gl.flush();
    }

    protected override createAttributes(program: WebGLProgram): AttributeManager {
        const ret: AttributeManager = new AttributeManager(this._gl, program);
        ret.addAttribute('position', 3);
        ret.addAttribute('normal', 3);
        ret.addAttribute('color', 4);
        ret.addAttribute('textureCoord', 2);

        return ret;
    }

    protected override createVBOs(attMan: AttributeManager): VBOManager {
        const squareVertices: Vertices = square(1);
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: VBOManager = new VBOManager(this._gl, attMan);
        ret.addVBO('square', squareVertices);
        ret.addVBO('torus', torusVertices);
        ret.addVBO('sphere', sphereVertices);

        return ret;
    }

    protected override createIBOs(): IBOManager {
        const squareVertices: Vertices = square(1);
        const torusVertices: Vertices = torus(100, 100, 0.2, 1.5);
        const sphereVertices: Vertices = sphere(100, 100, 2.25);

        const ret: IBOManager = new IBOManager(this._gl);
        ret.addIBO('square', squareVertices);
        ret.addIBO('torus', torusVertices);
        ret.addIBO('sphere', sphereVertices);

        return ret;
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mMatrix');
        ret.addUniform('mvpMatrix');
        ret.addUniform('invMatrix');
        ret.addUniform('lightDirection');
        //uniformManager.addUniform('lightPosition');
        ret.addUniform('eyeDirection');
        ret.addUniform('ambientColor');
        ret.addUniform('texture0');
        ret.addUniform('texture1');
        ret.addUniform('vertexAlpha');
        ret.addUniform('pointSize');
        ret.addUniform('outlineSizeRatio');
        ret.addUniform('isLight');
        ret.addUniform('isTexture');

        return ret;
    }
}

const mainShader = async (): Promise<void> => {
    const elmCanvas: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    const gl: WebGLRenderingContext = elmCanvas.getContext('webgl')!;
    const elmTransparency: HTMLInputElement = document.getElementById('transparency') as HTMLInputElement;
    const elmAdd: HTMLInputElement = document.getElementById('add') as HTMLInputElement;
    const elmAlphaValue: HTMLInputElement = document.getElementById('alpha_value') as HTMLInputElement;
    const elmPointSize: HTMLInputElement = document.getElementById("point_size") as HTMLInputElement;

    const vs: string = readFileSync('src/shader/vertex.glsl', {encoding: 'utf-8'});
    const fs: string = readFileSync('src/shader/fragment.glsl', {encoding: 'utf-8'});
    const so1: ShaderObject1 = new ShaderObject1(gl, vs, fs,
        elmTransparency, elmAdd, elmAlphaValue, elmPointSize);
    await so1.initialize(elmCanvas);
    so1.startShader(30);
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
window.addEventListener('DOMContentLoaded', mainShader);
