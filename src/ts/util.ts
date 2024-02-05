import {Vertices} from './type';
import {BlendType} from "./enum";

export const torus = (lRes: number, mRes: number, sRad: number, lRad: number, isColorful: boolean = false): Vertices => {
    const pos: number[] = [];
    const nor: number[] = [];
    const col: number[] = [];
    const st: number[] = [];
    const idx: number[] = [];

    for (let lon: number = 0; lon <= lRes; lon++) {
        const t: number = Math.PI * 2 / lRes * lon;
        for (let mer: number = 0; mer <= mRes; mer++) {
            // position
            const p: number = Math.PI * 2 / mRes * mer;
            const x: number = lRad * Math.cos(t) + sRad * Math.cos(p) * Math.cos(t);
            const y: number = lRad * Math.sin(t) + sRad * Math.cos(p) * Math.sin(t);
            const z: number = sRad * Math.sin(p);
            pos.push(x, y, z);

            // normal
            const nx: number = Math.cos(p) * Math.cos(t);
            const ny: number = Math.cos(p) * Math.sin(t);
            const nz: number = Math.sin(p);
            nor.push(nx, ny, nz);

            // color
            const rgb: number[] = isColorful ? hsv2rgb(lon/lRes, 1, 1, 1) : [1.0, 1.0, 1.0, 1.0];
            col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            // st-coordinate
            st.push(mer/mRes, lon/lRes);
        }
    }

    for (let lon: number = 0; lon < lRes; lon++) {
        for (let mer: number = 0; mer < mRes; mer++) {
            const i: number = mer + (mRes+1) * lon;
            idx.push(i, i+1, i+mRes+1);
            idx.push(i+1, i+mRes+2, i+mRes+1);
        }
    }

    return {pos: pos, nor: nor, col: col, st: st, idx: idx};
};

export const sphere = (latRes: number, lonRes: number, r: number, isColorful: boolean = false): Vertices => {
    const pos: number[] = [];
    const nor: number[] = [];
    const col: number[] = [];
    const st: number[] = [];
    const idx: number[] = [];

    for (let lat: number = 0; lat <= latRes; lat++) {
        const theta: number = Math.PI * lat / latRes;
        for (let lon: number = 0; lon <= lonRes; lon++) {
            const phi: number = 2 * Math.PI * lon / lonRes;
            const x: number = Math.sin(theta)*Math.cos(phi);
            const y: number = Math.sin(theta)*Math.sin(phi);
            const z: number = Math.cos(theta);
            pos.push(r*x, r*y, r*z);
            nor.push(x, y, z);

            const rgb: number[] = isColorful ? hsv2rgb(lon/lonRes, 1, 1, 1) : [1.0, 1.0, 1.0, 1.0];
            col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            st.push(lon/lonRes, lat/latRes);
        }
    }

    for (let lat: number = 0; lat < latRes; lat++) {
        for (let lon: number = 0; lon < lonRes; lon++) {
            const i: number = lon + (lonRes+1) * lat;
            idx.push(i, i+1, i+lonRes+1);
            idx.push(i+1, i+lonRes+2, i+lonRes+1);
        }
    }

    return {pos: pos, nor: nor, col: col, st: st, idx: idx};
};

export const square = (edgeLength: number, isColorful: boolean = false): Vertices => {
    const pos: number[] = [
        -1.0,  1.0,  0.0,
        1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
    ].map((n: number) => n * 0.5 * edgeLength);
    const col: number[] = [];
    for(let i: number = 0; i < pos.length / 3; i++) {
        const rgb: number[] = isColorful ? hsv2rgb(i*3/pos.length, 1, 1, 1) : [1.0, 1.0, 1.0, 1.0];
        col.push(rgb[0], rgb[1], rgb[2], rgb[3]);
    }
    const st: number[] = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
    ];
    const idx: number[] = [
        2, 1, 0,
        1, 2, 3,
    ];

    return {pos: pos, col: col, st: st, idx: idx};
};

export const cube = (edgeLength: number, isColorful: boolean = false): Vertices => {
    const pos: number[] = [
        -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0, -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,  1.0, -1.0, -1.0,  1.0, -1.0,  1.0, -1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,  1.0,  1.0, -1.0,  1.0,  1.0,  1.0,  1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
    ].map((n: number) => n * 0.5 * edgeLength);
    const nor: number[] = pos;
    const col: number[] = [];
    for(let i: number = 0; i < pos.length / 3; i++) {
        const rgb: number[] = isColorful ? hsv2rgb(i*3/pos.length, 1, 1, 1) : [1.0, 1.0, 1.0, 1.0];
        col.push(rgb[0], rgb[1], rgb[2], rgb[3]);
    }
    const st: number[] = [
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
    ];
    const idx: number[] = [
        0,  1,  2,  0,  2,  3,
        4,  5,  6,  4,  6,  7,
        8,  9, 10,  8, 10, 11,
        12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19,
        20, 21, 22, 20, 22, 23
    ];
    return {pos: pos, nor: nor, col: col, st: st, idx: idx};
};

export const hsv2rgb = (h: number, s: number, v: number, a: number): number[] => {
    const r: number = ((clamp01(Math.abs(fract(h+0/3)*6-3)-1)-1)*s+1)*v;
    const g: number = ((clamp01(Math.abs(fract(h+2/3)*6-3)-1)-1)*s+1)*v;
    const b: number = ((clamp01(Math.abs(fract(h+1/3)*6-3)-1)-1)*s+1)*v;
    return [r, g, b, a];
};

export const fract = (x: number): number => {
    return x - Math.floor(x);
};

export const clamp01 = (x: number): number => {
    return Math.max(Math.min(x, 1), 0);
};


export const blend = (gl: WebGLRenderingContext, type: BlendType): void => {
    switch (type) {
    case BlendType.ALPHA:
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE);
        break;
    case BlendType.ADD:
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
        break;
    default:
        throw new Error('This blend type is illegal.');
    }
};
