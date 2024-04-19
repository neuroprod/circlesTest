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
import {BlendFactor, BlendOperation} from "./lib/WebGPUConstants.ts";
import TextureLoader from "./lib/textures/TextureLoader.ts";




export default class Main{
    numDiv =400;
    numInstances =500;
    private canvasManager: CanvasManager;

    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    private canvasRenderPass: any;
    private camera
    private model: Model;

    private circleMesh: CircleMesh;
    private thickness: number =0.0005;
    private bufferPosA: GPUBuffer;
    private texure: TextureLoader;

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

        this.texure =new TextureLoader(this.renderer,"noiseTexture.png",{})

        this.camera =new Camera(this.renderer,"mainCamera")
        this.canvasRenderPass.modelRenderer.camera =this.camera
        this.circleMesh =new CircleMesh(this.renderer,this.numDiv);
        this.model = new Model(this.renderer,"partModel")
        this.model.mesh =this.circleMesh.mesh;
        this.model.material =new Material(this.renderer,"modelMat",new CircleShader(this.renderer,"particleShader"))
        this.model.material.cullMode="none";
        this.model.material.uniforms.setTexture("offsetTexture",this.texure)
        this.model.numInstances =this.numInstances;
        let l: GPUBlendState = {

            color: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.One,
                operation: BlendOperation.Add,
            },
            alpha: {
                srcFactor: BlendFactor.One,
                dstFactor: BlendFactor.OneMinusSrcAlpha,
                operation: BlendOperation.Add,
            }
        }
        this.model.material.blendModes =[l]
        this.makeInstances();
        this.canvasRenderPass.modelRenderer.addModel(this.model);


        this.tick()

    }
    tick() {

        window.requestAnimationFrame(() => this.tick());
        Timer.update()
        UI.pushWindow("Settings");
        UI.floatPrecision =4;
     //  this.thickness = UI.LFloatSlider("thickness",this.thickness,0,0.01)
        UI.popWindow();

        this.thickness =1/window.innerHeight/2;

        this.model.material.uniforms.setUniform("ratio",  1/this.renderer.ratio)
        this.model.material.uniforms.setUniform("thickness",this.thickness)


        this.renderer.update(this.onDraw.bind(this));
    }
    onDraw(){


        this.canvasRenderPass.add();

    }

    private makeInstances() {



        let data =new Float32Array( this.model.numInstances*2)
       let byteLength   =data.byteLength
        let index =0;
        let y =0;
        for(let i=0;i<this.model.numInstances;i++ ){


            data[index++]=i;
            data[index++]=0;


        }



        this.bufferPosA= this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(this.bufferPosA.getMappedRange());
        dst.set(data);

        this.bufferPosA.unmap();
        this.bufferPosA.label = "instanceBufferA" ;
        this.model.addBuffer("aInstancePos",this.bufferPosA)
    }

}
