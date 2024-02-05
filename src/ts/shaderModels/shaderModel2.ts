import {mat4} from "gl-matrix";
import {Vertices} from "../type";
import {square} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../data/modelDataProcessor";
import {readFileSync} from "fs";
import {TextureBufferManager} from "../textureManager/textureManager";
import Framebuffer from "../framebuffer";

class ShaderModel2 extends ShaderModel {
    private readonly _tmpMatrix: mat4;

    private readonly _elmCanvas: HTMLCanvasElement;
    private readonly _elmBlur: HTMLInputElement;

    public constructor(gl: WebGLRenderingContext, elmCanvas: HTMLCanvasElement, elmBlur: HTMLInputElement) {
        super(gl, readFileSync('src/shader/2d_model.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/quad_blur.frag', {encoding: 'utf-8'}));

        this._tmpMatrix = mat4.create();

        this._elmCanvas = elmCanvas;
        this._elmBlur = elmBlur;
    }

    public override initialize(): void {
        // calculate MVP matrix
        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.lookAt(this._vMatrix, [0.0, 0.0, 0.5], [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.ortho(this._pMatrix, -1.0, 1.0, 1.0, -1.0, 0.1, 1.0);
        mat4.multiply(this._mvpMatrix, this._mMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        // active texture unit 0
        this._gl.activeTexture(this._gl.TEXTURE0);

        const kernel: number[] = [
            0.02, 0.02, 0.02, 0.02, 0.02,
            0.02, 0.04, 0.04, 0.04, 0.02,
            0.02, 0.04, 0.36, 0.04, 0.02,
            0.02, 0.04, 0.04, 0.04, 0.02,
            0.02, 0.02, 0.02, 0.02, 0.02];

        // set uniforms
        this._gl.useProgram(this._program);
        this._gl.uniform2f(this._uniMan.getUniform('resolution'), this._elmCanvas.width, this._elmCanvas.height);
        this._gl.uniform1fv(this._uniMan.getUniform('kernel'), kernel);
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);
        this._gl.uniform1f(this._uniMan.getUniform('vertexAlpha'), 1.0);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
    }

    public override render<T extends TextureBufferManager>(framebuffer: Framebuffer<T> | null): void {
        // initialize canvas
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        this._gl.useProgram(this._program);

        // set square attributes
        this._vboMan.setAttribute('squarePosition', 'position');
        this._vboMan.setAttribute('squareColor', 'color');
        this._vboMan.setAttribute('squareTextureCoord', 'textureCoord');

        this._gl.uniform1i(this._uniMan.getUniform('isBlur'), this._elmBlur.checked ? 1 : 0);

        // bind texture
        framebuffer?.getTextureManager().bindTexture();
        // apply square IBO
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._iboMan.getBuffer('square')!);
        // disable alpha blend
        this._gl.disable(this._gl.BLEND);
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
        const squareVertices: Vertices = square(2);

        const vm: VBOManager = new VBOManager(this._gl, attMan);
        vm.addVBOFromVertices('square', squareVertices);

        const im: IBOManager = new IBOManager(this._gl);
        im.addIBO('square', squareVertices);

        return {vm: vm, im: im};
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('resolution');
        ret.addUniform('kernel');
        ret.addUniform('mvpMatrix');
        ret.addUniform('texture0');
        ret.addUniform('vertexAlpha');
        ret.addUniform('isBlur');

        return ret;
    }
}

export default ShaderModel2;
