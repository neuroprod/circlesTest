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

import TextureLoader from "./lib/textures/TextureLoader.ts";
import OffsetRenderPass from "./OffsetRenderPass.ts";
import Blend from "./lib/Blend.ts";
import LineRenderPass from "./LinePass.ts";




export default class Main{
    numDiv =256;
    numInstances =256;
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
    private texureColor: TextureLoader;
    private offsetRenderPass: OffsetRenderPass;
    private lineRenderPass: LineRenderPass;

    constructor() {
        console.log("setup");
        this.canvas = document.getElementById("webgpuCanvas") as HTMLCanvasElement
        this.canvasManager = new CanvasManager(this.canvas);
        this.renderer = new Renderer()

        this.renderer.setup(this.canvas).then(() => {
            setTimeout(this.setup.bind(this),60);
        }).catch(() => {
           console.error("noWebgpu")
        })

    }

    setup() {

        this.offsetRenderPass =new OffsetRenderPass(this.renderer)
        this.lineRenderPass  =new LineRenderPass(this.renderer)

        this.canvasRenderPass = new CanvasRenderPass(this.renderer);
        this.renderer.setCanvasColorAttachment(this.canvasRenderPass.canvasColorAttachment)





        UI.setWebGPU(this.renderer)

        this.texure =new TextureLoader(this.renderer,"noiseTexture.png",{})
        this.texureColor =new TextureLoader(this.renderer,"gradient.png",{})
        this.camera =new Camera(this.renderer,"mainCamera")

        this.canvasRenderPass.modelRenderer.camera =this.camera

        this.circleMesh =new CircleMesh(this.renderer,this.numDiv);
        this.model = new Model(this.renderer,"partModel")
        this.model.mesh =this.circleMesh.mesh;
        this.model.material =new Material(this.renderer,"modelMat",new CircleShader(this.renderer,"particleShader"))
        this.model.material.cullMode="none";
        this.model.material.uniforms.setTexture("offsetTexture",this.renderer.texturesByLabel["offsetTexture"]);
        this.model.material.uniforms.setTexture("colorTexture",this.texureColor)
        this.model.numInstances =this.numInstances;

        this.model.material.depthWrite=false;
        this.model.material.blendModes =[Blend.preMultAlpha(),Blend.add()];
        this.makeInstances();
        this.lineRenderPass.modelRenderer.addModel(this.model);


        this.tick()

    }
    tick() {

        window.requestAnimationFrame(() => this.tick());
        Timer.update()
        UI.pushWindow("Settings");
        UI.floatPrecision =3;
     //  this.thickness = UI.LFloatSlider("thickness",this.thickness,0,0.01)
        this.offsetRenderPass.onUI();
        UI.popWindow();

        this.thickness =1/window.innerHeight*2;

        this.model.material.uniforms.setUniform("ratio",  1/this.renderer.ratio)
        this.model.material.uniforms.setUniform("thickness",this.thickness)
        this.canvasRenderPass.update()


        this.renderer.update(this.onDraw.bind(this));
    }
    onDraw(){

        this.offsetRenderPass.add();
        this.lineRenderPass.add();

        this.canvasRenderPass.add();

    }

    private makeInstances() {



        let data =new Float32Array( this.model.numInstances*3)
       let byteLength   =data.byteLength
        let index =0;
        let y =0;
        for(let i=0;i<this.model.numInstances;i++ ){


            data[index++]=i;
            data[index++]=i/256+Math.random()*0.01;
            data[index++]=Math.random();

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
