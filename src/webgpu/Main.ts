import CanvasManager from "./lib/CanvasManager.ts";
import Renderer from "./lib/Renderer.ts";
import UI from "./lib/UI/UI.ts";
import CanvasRenderPass from "./CanvasRenderPass.ts";
import Camera from "./lib/Camera.ts";
import Model from "./lib/model/Model.ts";

import Material from "./lib/core/Material.ts";

import Timer from "./lib/Timer.ts";
import CircleMesh from "./CircleMesh.ts";
import CircleShader from "./CircleShader.ts";




export default class Main{
    private canvasManager: CanvasManager;

    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    private canvasRenderPass: any;
    private camera
    private model: Model;

    private circleMesh: CircleMesh;
    private thickness: number =0.0005;

    constructor() {
        console.log("setup");
        this.canvas = document.getElementById("webgpuCanvas") as HTMLCanvasElement
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer()

        this.renderer.setup(this.canvas).then(() => {
            this.setup();
        }).catch(() => {
           console.error("noWebgpu")
        })
    }

    setup() {
        this.canvasRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)

        UI.setWebGPU(this.renderer)

        this.camera =new Camera(this.renderer,"mainCamera")
        this.canvasRenderPass.modelRenderer.camera =this.camera
        this.circleMesh =new CircleMesh(this.renderer,100);
        this.model = new Model(this.renderer,"partModel")
        this.model.mesh =this.circleMesh.mesh;
        this.model.material =new Material(this.renderer,"modelMat",new CircleShader(this.renderer,"particleShader"))
        this.model.material.cullMode="none";

        this.canvasRenderPass.modelRenderer.addModel(this.model);

        this.tick()

    }
    tick() {

        window.requestAnimationFrame(() => this.tick());
        Timer.update()
        UI.pushWindow("Settings");
        UI.floatPrecision =4;
       this.thickness = UI.LFloatSlider("thickness",this.thickness,0,0.01)
        UI.popWindow();

console.log(this.renderer.ratio)
        this.model.material.uniforms.setUniform("ratio",  1/this.renderer.ratio)
        this.model.material.uniforms.setUniform("thickness",this.thickness)


        this.renderer.update(this.onDraw.bind(this));
    }
    onDraw(){


        this.canvasRenderPass.add();

    }

}
