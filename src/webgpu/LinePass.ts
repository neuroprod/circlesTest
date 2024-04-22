import RenderPass from "./lib/core/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";

import ModelRenderer from "./lib/model/ModelRenderer.ts";



export default class LineRenderPass extends RenderPass {
    public colorAttachment: ColorAttachment;

    private colorTarget: RenderTexture;

    public modelRenderer:ModelRenderer;

    private addTarget: RenderTexture;
    private addAttachment: ColorAttachment;

    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");
        this.modelRenderer =new ModelRenderer(renderer,"mainModelRenderer");
        this.sampleCount = 1


        this.colorTarget = new RenderTexture(renderer, "lineColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT| GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.colorTarget, {
            clearValue: {
                r: 5/255,
                g: 21/255,
                b: 40/255,
                a: 1
            }
        });


        this.addTarget = new RenderTexture(renderer, "lineAdd", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT| GPUTextureUsage.TEXTURE_BINDING
        });

        this.addAttachment = new ColorAttachment(this.addTarget, {
            clearValue: {
                r: 0,
                g: 0,
                b: 0,
                a: 1
            }
        });


        this.colorAttachments = [this.colorAttachment, this.addAttachment];





    }
    update(){

    }
    onUI(){

    }



    draw() {


        this.modelRenderer.draw(this)


    }

}
