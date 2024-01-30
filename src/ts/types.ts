export type Attribute = {
    attLocation: number;
    attStride: number;
};

export type IBO = {
    buff: WebGLBuffer;
    length: number;
};

export type Vertices = {
    pos: number[];
    nor: number[];
    col: number[];
    tex: number[];
    idx: number[];
};

export type Buffers = {
    f: WebGLFramebuffer | null;
    d: WebGLRenderbuffer | null;
    t: WebGLTexture | null;
};

export enum BlendType {
    ALPHA,
    ADD,
    INVALIABLE,
}
