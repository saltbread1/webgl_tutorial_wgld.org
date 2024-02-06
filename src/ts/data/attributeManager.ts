import {AttrInfo} from "../util/type";

class AttributeManager {
    private readonly _gl: WebGLRenderingContext;
    private readonly _attributeMap: Map<string, AttrInfo>;

    public constructor(gl: WebGLRenderingContext) {
        this._gl = gl;
        this._attributeMap = new Map<string, AttrInfo>();
    }

    public addAttributeInfos(program: WebGLProgram, ...data: {name: string, stride: number}[]): void {
        data.forEach((d: {name: string, stride: number}): void => {
            this.addAttributeInfo(program, d.name, d.stride);
        })
    }

    public addAttributeInfo(program: WebGLProgram, name: string, stride: number): void {
        const loc: number = this._gl.getAttribLocation(program, name);
        if (loc == -1) {
            //throw new Error(`An attribute variable named \"${name}\" does not exist.`);
            console.warn(`An attribute variable named \"${name}\" does not exist.`);
            return;
        }
        this._attributeMap.set(name, { attLocation: loc, attStride: stride });
    }

    public getAttributeInfo(name: string): AttrInfo {
        const ret: AttrInfo | undefined = this._attributeMap.get(name);
        if (!ret) {
            throw new Error(`An element corresponding the key named \"${name}\" does not existed.`);
        }
        return ret;
    }

    public get attributeMap(): Map<string, AttrInfo> {
        return this._attributeMap;
    }
}

export default AttributeManager;
