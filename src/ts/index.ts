import Canvas0 from "./canvas/canvas0";

const initCanvas = async (): Promise<void> => {
    const c: HTMLCanvasElement = document.getElementById('canvas') as HTMLCanvasElement;
    c.width = 512;
    c.height = 512;

    const canvas: Canvas0 = new Canvas0(c);
    canvas.initialize();
    await canvas.mainShader();
};

window.addEventListener('DOMContentLoaded', initCanvas);
