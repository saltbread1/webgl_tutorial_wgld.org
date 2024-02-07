import Canvas from "./canvas/canvas";
// @ts-ignore
import Canvas0 from "./canvas/canvas0";
// @ts-ignore
import Canvas1 from "./canvas/canvas1";
// @ts-ignore
import Canvas2 from "./canvas/canvas2";
// @ts-ignore
import Canvas3 from "./canvas/canvas3";

const initCanvas = async (): Promise<void> => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 960;
    c.height = 540;

    const canvas: Canvas = new Canvas1(c);
    canvas.initCanvas();
    await canvas.initShader();

    const fps: number = 30;
    const elmSuspension: HTMLInputElement = document.getElementById('pause') as HTMLInputElement;
    canvas.play(fps, elmSuspension);
};

window.addEventListener('DOMContentLoaded', initCanvas);
