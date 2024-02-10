import Renderer from "../renderer/renderer";
import Framebuffer from "../data/framebuffer";

export type AttrInfo = {
    attLocation: number;
    attStride: number;
};

export type Vertices = {
    pos?: number[];
    nor?: number[];
    col?: number[];
    st?: number[];
    idx?: number[];
};

export type Path = {
    renderer: Renderer;
    framebuffer?: Framebuffer;
    target?: number;
};
