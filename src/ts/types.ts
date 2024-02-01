export type Vertices = {
    pos: number[];
    nor: number[];
    col: number[];
    tex: number[];
    idx: number[];
};

export enum BlendType {
    ALPHA,
    ADD,
    INVALIABLE,
}
