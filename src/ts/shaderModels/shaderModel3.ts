import {vec3, mat4} from "gl-matrix";
import {Buffers, Vertices} from "../types";
import {sphere} from "../util";
import ShaderModel from "./shaderModel";
import {AttributeManager, VBOManager, IBOManager, UniformManager} from "../shaderData";
import {readFileSync} from "fs";

class ShaderModel3 extends ShaderModel {
    private readonly _tmpMatrix: mat4;
    private readonly _invMatrix: mat4;

    private readonly _elmCanvas: HTMLCanvasElement;

    private _texture0: WebGLTexture | undefined;

    public constructor(gl: WebGLRenderingContext, elmCanvas: HTMLCanvasElement) {
        super(gl, readFileSync('src/shader/bump_map.vert', {encoding: 'utf-8'}),
            readFileSync('src/shader/bump_map.frag', {encoding: 'utf-8'}));

        this._tmpMatrix = mat4.create();
        this._invMatrix = mat4.create();

        this._elmCanvas = elmCanvas;
    }

    public override async initialize(): Promise<void> {
        const lightPosition: vec3 = [-16.0, 16.0, 8.0];
        const eyePosition: vec3 = [0.0, 0.0, 4.0];

        // calculate view x projection matrix
        mat4.lookAt(this._vMatrix, eyePosition, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
        mat4.perspective(this._pMatrix, 45, this._elmCanvas.width / this._elmCanvas.height, 0.1, 100);
        mat4.multiply(this._tmpMatrix, this._vMatrix, this._tmpMatrix);
        mat4.multiply(this._tmpMatrix, this._pMatrix, this._tmpMatrix);

        this._texture0 = await this.createTexture('img/normal0.png');
        // active texture unit 0
        this._gl.activeTexture(this._gl.TEXTURE0);
        this._gl.uniform1i(this._uniMan.getUniform('texture0'), 0);

        // set lights
        this._gl.useProgram(this._program);
        this._gl.uniform3fv(this._uniMan.getUniform('lightPosition'), lightPosition);
        this._gl.uniform3fv(this._uniMan.getUniform('eyePosition'), eyePosition);
    }

    public override render(buffers: Buffers): void {
        // time count
        const time: number = (new Date().getTime() - this._initTime) * 0.001;

        // initialize buffer
        this._gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);

        this._gl.useProgram(this._program);

        // disable alpha blend
        this._gl.disable(this._gl.BLEND);

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
        mat4.fromTranslation(this._mMatrix, [0.0, 0.0, 0.0]);
        mat4.rotateY(this._mMatrix, this._mMatrix, -time * Math.PI * 0.15);
        mat4.rotateX(this._mMatrix, this._mMatrix, -Math.PI * 0.5);
        mat4.multiply(this._mvpMatrix, this._tmpMatrix, this._mMatrix);
        mat4.invert(this._invMatrix, this._mMatrix);

        // set uniforms for sphere
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mMatrix'), false, this._mMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('mvpMatrix'), false, this._mvpMatrix);
        this._gl.uniformMatrix4fv(this._uniMan.getUniform('invMatrix'), false, this._invMatrix);

        // draw the sphere background
        this._gl.drawElements(this._gl.TRIANGLES, this._iboMan.getLength('sphere'), this._gl.UNSIGNED_SHORT, 0);
    }

    protected override createAttributes(program: WebGLProgram): AttributeManager {
        const ret: AttributeManager = new AttributeManager(this._gl, program);

        ret.addAttribute('position', 3);
        ret.addAttribute('normal', 3);
        ret.addAttribute('color', 4);
        ret.addAttribute('textureCoord', 2);

        return ret;
    }

    protected override createVBOAndIBO(attMan: AttributeManager): {vm: VBOManager, im: IBOManager} {
        const sphereVertices: Vertices = sphere(128, 128, 1);

        const vm: VBOManager = new VBOManager(this._gl, attMan);
        vm.addVBO('sphere', sphereVertices);

        const im: IBOManager = new IBOManager(this._gl);
        im.addIBO('sphere', sphereVertices);

        return {vm: vm, im: im};
    }

    protected override createUniforms(program: WebGLProgram): UniformManager {
        const ret: UniformManager = new UniformManager(this._gl, program);

        ret.addUniform('mMatrix');
        ret.addUniform('mvpMatrix');
        ret.addUniform('invMatrix');
        ret.addUniform('lightPosition');
        ret.addUniform('eyePosition');
        ret.addUniform('texture0');

        return ret;
    }
}

export default ShaderModel3;
