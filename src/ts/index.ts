import Canvas0 from "./canvas/canvas0";
import Canvas1 from "./canvas/canvas1";
import Canvas2 from "./canvas/canvas2";

const initCanvas = async (): Promise<void> => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const elmSuspension: HTMLInputElement = document.getElementById('suspension') as HTMLInputElement;

    const canvas0: Canvas0 = new Canvas0(c);
    const canvas1: Canvas1 = new Canvas1(c);
    const canvas2: Canvas2 = new Canvas2(c);
    canvas2.initCanvas();
    await canvas2.initShader();
    elmSuspension.addEventListener('mouseup', (e: MouseEvent): void => {
        if (elmSuspension.checked) {
            canvas2.startShader();
        } else {
            canvas2.suspendShader();
        }
    });
    canvas2.startShader();
};

window.addEventListener('DOMContentLoaded', initCanvas);
