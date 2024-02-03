import ModelDataProcessor from "../data/modelDataProcessor";
import Model from "./model";
import {mat4} from "gl-matrix";

class Model0 extends Model {
    public constructor(gl: WebGLRenderingContext, modelData: ModelDataProcessor) {
        super(gl, modelData);
    }

    protected override mainRender(data: {mvpMatrix: mat4, invMatrix: mat4, isLight: number, isTexture: number}): void {
        this._mdp.passAttributeDataAll();

        this._mdp.passUniformData('lightDirection', (location: WebGLUniformLocation): void => {
            this._gl.uniform3fv(location, [-1.0, 1.0, 1.0]);
        });
        this._mdp.passUniformData('eyeDirection', (location: WebGLUniformLocation): void => {
            this._gl.uniform3fv(location, [0.0, 0.0, 1.0]);
        });
        this._mdp.passUniformData('ambientColor', (location: WebGLUniformLocation): void => {
            this._gl.uniform4fv(location, [0.1, 0.1, 0.1, 0.1]);
        });
        this._mdp.passUniformData('texture0', (location: WebGLUniformLocation): void => {
            this._gl.uniform1i(location, 0);
        });
        this._mdp.passUniformData('mvpMatrix', (location: WebGLUniformLocation): void => {
            this._gl.uniformMatrix4fv(location, false, data.mvpMatrix);
        });
        this._mdp.passUniformData('invMatrix', (location: WebGLUniformLocation): void => {
            this._gl.uniformMatrix4fv(location, false, data.invMatrix);
        });
        this._mdp.passUniformData('isLight', (location: WebGLUniformLocation): void => {
            this._gl.uniform1i(location, data.isLight);
        });
        this._mdp.passUniformData('isTexture', (location: WebGLUniformLocation): void => {
            this._gl.uniform1i(location, data.isTexture);
        });

        this._mdp.drawElements();
    }
}

export default Model0;
