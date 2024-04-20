import RenderPass from "./lib/core/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";
import {TextureFormat} from "./lib/WebGPUConstants.ts";

import ModelRenderer from "./lib/model/ModelRenderer.ts";
import Material from "./lib/core/Material.ts";
import DistanceShader from "./DistanceShader.ts";
import Blit from "./lib/Blit.ts";
import {Vector2, Vector3, Vector4} from "math.gl";
import UI from "./lib/UI/UI.ts";


export default class OffsetRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;

    private colorTarget: RenderTexture;

    public modelRenderer:ModelRenderer;
    private material: Material;
    private blit: Blit;
private pos =new Vector2()
    private size: number=0.3;
    private hardness: number=0.2;
    private alpha: number=1.0;
    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");

        this.sampleCount = 1


        this.colorTarget = new RenderTexture(renderer, "offsetTexture", {
            format: TextureFormat.R16Float,
            sampleCount: this.sampleCount,
            width:256,
            height:256,

            usage: GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make();
        this.canvasColorAttachment = new ColorAttachment(this.colorTarget, {
            clearValue: {
                r:0.0,
                g: 0,
                b: 0,
                a: 1
            }
        });
        this.colorAttachments = [this.canvasColorAttachment];
        this.material =new Material(renderer,"distMat",new DistanceShader(this.renderer,"distshader"))



        this.blit =new Blit(this.renderer,"blit",this.material)



    }




    draw() {

        this.blit.draw(this)

    }

    onUI() {
        UI.LVector("pos",this.pos)
       this.size = UI.LFloatSlider("size",this.size,0,1)
       this.hardness= UI.LFloatSlider("hardness",this.hardness,0,1)
        this.alpha= UI.LFloatSlider("alpha",this.alpha,0,1)
        this.material.uniforms.setUniform("pos",this.pos)


        this.material.uniforms.setUniform("size",new Vector4(this.size,(this.size)*this.hardness,this.alpha,1))
    }
}
