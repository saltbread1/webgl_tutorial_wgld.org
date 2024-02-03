import Framebuffer from "./framebuffer";
import Renderer from "./renderer/renderer";

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
};
