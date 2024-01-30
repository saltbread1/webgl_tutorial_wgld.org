import Canvas0 from "./canvas/canvas0";
import Canvas1 from "./canvas/canvas1";

const initCanvas = async (): Promise<void> => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const canvas0: Canvas0 = new Canvas0(c);
    const canvas1: Canvas1 = new Canvas1(c);
    canvas1.initialize();
    await canvas1.mainShader();
};

window.addEventListener('DOMContentLoaded', initCanvas);
