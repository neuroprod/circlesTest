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
import BlitCircle from "./BlitCircle.ts";


export default class OffsetRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;

    private colorTarget: RenderTexture;

    public modelRenderer:ModelRenderer;
    private blitCircle1: BlitCircle;
    private blitCircle2: BlitCircle;
    private blitCircle3: BlitCircle;
    constructor(renderer: Renderer,numInstances:number, numDivisions:number) {

        super(renderer, "canvasRenderPass");

        this.sampleCount = 1


        this.colorTarget = new RenderTexture(renderer, "offsetTexture", {
            format: TextureFormat.RG16Float,
            sampleCount: this.sampleCount,
            width: numInstances,
            height: numDivisions,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorTarget.make();
        this.canvasColorAttachment = new ColorAttachment(this.colorTarget, {
            clearValue: {
                r: 0.0,
                g: 0,
                b: 0,
                a: 1
            }
        });
        this.colorAttachments = [this.canvasColorAttachment];


        this.blitCircle1 = new BlitCircle(this.renderer, 0);
        this.blitCircle1.pos.x = 0;
        this.blitCircle1.pos.y =0;



    }

    draw() {

        this.blitCircle1.draw(this)

    }

    onUI() {
        this.blitCircle1.onUI()

    }
}
