import { Vertices } from './types';

export const torus = (lRes: number, mRes: number, sRad: number, lRad: number): Vertices => {
    const vertices: Vertices = {pos: [], nor: [], col: [], tex: [], idx: []};
    for (let lon: number = 0; lon <= lRes; lon++) {
        const t: number = Math.PI * 2 / lRes * lon;
        for (let mer: number = 0; mer <= mRes; mer++) {
            // position
            const p: number = Math.PI * 2 / mRes * mer;
            const x: number = lRad * Math.cos(t) + sRad * Math.cos(p) * Math.cos(t);
            const y: number = lRad * Math.sin(t) + sRad * Math.cos(p) * Math.sin(t);
            const z: number = sRad * Math.sin(p);
            vertices.pos.push(x, y, z);

            // normal
            const nx: number = Math.cos(p) * Math.cos(t);
            const ny: number = Math.cos(p) * Math.sin(t);
            const nz: number = Math.sin(p);
            vertices.nor.push(nx, ny, nz);

            // color
            const rgb: number[] = hsv2rgb(lon/lRes, 1, 1, 1);
            vertices.col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            // texCoord
            vertices.tex.push(mer/mRes, lon/lRes);
        }
    }

    for (let lon: number = 0; lon < lRes; lon++) {
        for (let mer: number = 0; mer < mRes; mer++) {
            const i: number = mer + (mRes+1) * lon;
            vertices.idx.push(i, i+1, i+mRes+1);
            vertices.idx.push(i+1, i+mRes+2, i+mRes+1);
        }
    }

    return vertices;
};

export const sphere = (latRes: number, lonRes: number, r: number): Vertices => {
    const vertices: Vertices = {pos: [], nor: [], col: [], tex: [], idx: []};
    for (let lon: number = 0; lon <= lonRes; lon++) {
        const theta: number = Math.PI * lon / lonRes;
        for (let lat: number = 0; lat <= latRes; lat++) {
            const phi: number = 2 * Math.PI * lat / latRes;
            const x: number = Math.sin(theta)*Math.cos(phi);
            const y: number = Math.sin(theta)*Math.sin(phi);
            const z: number = Math.cos(theta);
            vertices.pos.push(r*x, r*y, r*z);
            vertices.nor.push(x, y, z);

            const rgb: number[] = hsv2rgb(lat/latRes, 1, 1, 1);
            vertices.col.push(rgb[0], rgb[1], rgb[2], rgb[3]);

            vertices.tex.push(lat/latRes, lon/lonRes);
        }
    }

    for (let lon: number = 0; lon < lonRes; lon++) {
        for (let lat: number = 0; lat < latRes; lat++) {
            const i: number = lat + (latRes+1) * lon;
            vertices.idx.push(i, i+1, i+latRes+1);
            vertices.idx.push(i+1, i+latRes+2, i+latRes+1);
        }
    }

    return vertices;
};

export const square = (edgeLength: number): Vertices => {
    const position: number[] = [
        -1.0,  1.0,  0.0,
        1.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
        1.0, -1.0,  0.0,
    ].map((n: number) => n * 0.5 * edgeLength);
    const normal: number[] = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
    ];
    const color: number[] = [
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
        1.0, 1.0, 1.0, 1.0,
    ];
    const textureCoord: number[] = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,
    ];
    const index: number[] = [
        0, 1, 2,
        3, 2, 1,
    ];

    return {pos: position, nor: normal, col: color, tex: textureCoord, idx: index};
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
