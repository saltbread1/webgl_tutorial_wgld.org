import {mat4} from "gl-matrix";
import {Vertices, BlendType} from "../type";
import {square} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../data/modelData";
import {readFileSync} from "fs";
import {TextureBufferManager} from "../textureManager/textureManager";
import Framebuffer from "../frameBuffer/framebuffer";

class ShaderModel1 extends ShaderModel {
    private readonly _tmpMatrix: mat4;

    private readonly _elmCanvas: HTMLCanvasElement;
    private readonly _elmTransparency: HTMLInputElement;
    private readonly _elmAdd: HTMLInputElement;
    private readonly _elmAlphaValue: HTMLInputElement;

    public constructor(gl: WebGLRenderingContext, elmCanvas: HTMLCanvasElement,
                       elmTransparency: HTMLInputElement, elmAdd: HTMLInputElement, elmAlphaValue: HTMLInputElement) {
        super(gl, readFileSync('src/shader/quad.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/quad.frag', {encoding: 'utf-8'}));

        this._tmpMatrix = mat4.create();

        this._elmCanvas = elmCanvas;
        this._elmTransparency = elmTransparency;
        this._elmAdd = elmAdd;
        this._elmAlphaValue = elmAlphaValue;
    }

    public override initialize(): void {
        // calculate view x projection matrix
        mat4.lookAt(this._vMatrix, [0.0, 0.0, 2.0], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 90, this._elmCanvas.width / this._elmCanvas.height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        // active texture unit 0
        this._gl.activeTexture(this._gl.TEXTURE0);
    }

    public override render<T extends TextureBufferManager>(framebuffer: Framebuffer<T> | null): void {
        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // blend
        let blendType: BlendType = BlendType.INVALIABLE;
        if (this._elmTransparency.checked) { blendType = BlendType.ALPHA; }
        if (this._elmAdd.checked) { blendType = BlendType.ADD; }
        this.blend(blendType);
        // alpha value
        const vertexAlpha: number = parseFloat(this._elmAlphaValue.value);

        // initialize canvas
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        this._gl.useProgram(this._program);

        // set square attributes
        this._vboMan.setAttribute('squarePosition', 'position');
        this._vboMan.setAttribute('squareColor', 'color');
        this._vboMan.setAttribute('squareTextureCoord', 'textureCoord');

        // set common uniforms
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), vertexAlpha);
        this._gl.uniform1i(this._uniMan.getUniform('isTexture'), 1);

        // bind texture
        framebuffer?.getTextureManager().bindTexture();

        // apply square IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('square')!);

        // enable alpha blend
        this._gl.enable(this._gl.BLEND);

        // model 1: rotate on z axis
        // MVP matrix
        mat4.fromTranslation(this._mMatrix, [0.25, 0.25, 1.0]);
        mat4.rotateZ(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);

        // model 2: rotate on y axis
        // MVP matrix
        mat4.fromTranslation(this._mMatrix, [-0.25, -0.25, 1.2]);
        mat4.rotateY(this._mMatrix, this._mMatrix, time * Math.PI / 4);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        // set uniforms
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        // draw the model to the buffer
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('square'), this._gl.UNSIGNED_SHORT, 0);
    }

    protected override createAttributes(program: WebGLProgram): AttributeManager {
        const ret: AttributeManager = new AttributeManager(this._gl, program);

        ret.addAttribute('position', 3);
        ret.addAttribute('color', 4);
        ret.addAttribute('textureCoord', 2);

        return ret;
    }

    protected override createVBOAndIBO(attMan: AttributeManager): {vm: VBOManager, im: IBOManager} {
        const squareVertices: Vertices = square(1);

        const vm: VBOManager = new VBOManager(this._gl, attMan);
        vm.addVBOFromVertices('square', squareVertices);

        const im: IBOManager = new IBOManager(this._gl);
        im.addIBO('square', squareVertices);

        return {vm: vm, im: im};
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mvpMatrix');
        ret.addUniform('texture0');
        ret.addUniform('vertexAlpha');
        ret.addUniform('isTexture');

        return ret;
    }
}

export default ShaderModel1;
