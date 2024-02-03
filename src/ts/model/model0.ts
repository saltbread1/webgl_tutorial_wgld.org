import ModelDataManager from "../data/modelData";
import Model from "./model";
import {mat4} from "gl-matrix";

class Model0 extends Model {
    public constructor(gl: WebGLRenderingContext, modelData: ModelDataManager) {
        super(gl, modelData);
    }

    public override preProcess(): void {
        super.preProcess();

        const lightDirection: number[] = [-1.0, 1.0, 1.0];
        const eyeDirection: number[] = [0.0, 0.0, 1.0];
        const ambientColor: number[] = [0.1, 0.1, 0.1, 0.1];

        this._modelData.useProgram((): void => {
            this._gl.uniform3fv(this._modelData.getUniformLocation('lightDirection'), lightDirection);
            this._gl.uniform3fv(this._modelData.getUniformLocation('eyeDirection'), eyeDirection);
            this._gl.uniform4fv(this._modelData.getUniformLocation('ambientColor'), ambientColor);
            this._gl.uniform1i(this._modelData.getUniformLocation('texture0'), 0);
        });
    }

    public override render(data: {mvpMatrix: mat4, invMatrix: mat4, isLight: number, isTexture: number}): void {
        this._modelData.useProgram((): void => {
            this._modelData.passAttributeDataAll();

            this._gl.uniformMatrix4fv(this._modelData.getUniformLocation('mvpMatrix'), false, data.mvpMatrix);
            this._gl.uniformMatrix4fv(this._modelData.getUniformLocation('invMatrix'), false, data.invMatrix);
            this._gl.uniform1i(this._modelData.getUniformLocation('isLight'), data.isLight);
            this._gl.uniform1i(this._modelData.getUniformLocation('isTexture'), data.isTexture);

            this._modelData.useIBO((): void => {
                this._gl.drawElements(this._gl.TRIANGLES, this._modelData.getIndexLength, this._gl.UNSIGNED_SHORT, 0);
            });
        });
    }
}

export default Model0;
