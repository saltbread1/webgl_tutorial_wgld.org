import Canvas from "./canvas/canvas";
import Canvas0 from "./canvas/canvas0";
import Canvas1 from "./canvas/canvas1";
import Canvas2 from "./canvas/canvas2";
import Canvas3 from "./canvas/canvas3";

const initCanvas = async (): Promise<void> => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 960;
    c.height = 540;

    const canvas: Canvas = new Canvas0(c);
    canvas.initCanvas();
    await canvas.initShader();

    const fps: number = 30;
    const elmSuspension: HTMLInputElement = document.getElementById('suspension') as HTMLInputElement;
    elmSuspension.addEventListener('mouseup', (): void => {
        if (elmSuspension.checked) {
            canvas.play(fps);
        } else {
            canvas.pause();
        }
    });

    canvas.play(fps);
};

window.addEventListener('DOMContentLoaded', initCanvas);
