import RenderPass from "./lib/core/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";
import {TextureFormat} from "./lib/WebGPUConstants.ts";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment.ts";
import UI from "./lib/UI/UI.ts";
import ModelRenderer from "./lib/model/ModelRenderer.ts";
import Material from "./lib/core/Material.ts";
import DistanceShader from "./DistanceShader.ts";
import Blit from "./lib/Blit.ts";
import BlitDebugShader from "./BlitDebugShader.ts";
import {Vector2} from "math.gl";
import BlitLinesShader from "./BlitLinesShader.ts";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;

    private canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;
public modelRenderer:ModelRenderer;
    private materialD: Material;
    private blitD: Blit;
    private materialLines: Material;
    private blitLines: Blit;
    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");
        this.modelRenderer =new ModelRenderer(renderer,"mainModelRenderer");
        this.sampleCount = 4


        this.canvasColorTarget = new RenderTexture(renderer, "canvasColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget, {
            clearValue: {
                r: 5/255,
                g: 21/255,
                b: 40/255,
                a: 1
            }
        });
        this.colorAttachments = [this.canvasColorAttachment];

        this.canvasDepthTarget = new RenderTexture(renderer, "canvasDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.canvasDepthTarget);

        this.materialLines =new Material(renderer,"blitLinesMat",new BlitLinesShader(this.renderer,"blitLines"))
        this.materialLines.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["lineColor"]);
        this.materialLines.uniforms.setTexture("addTexture",this.renderer.texturesByLabel["lineAdd"]);
        this.blitLines =new Blit(this.renderer,"blit",this.materialLines);

        this.materialD =new Material(renderer,"debugtMat",new BlitDebugShader(this.renderer,"blitdebug"))
        this.materialD.uniforms.setTexture("colorTexture",this.renderer.texturesByLabel["offsetTexture"]);
        this.blitD =new Blit(this.renderer,"blit",this.materialD);

    }
update(){
    this.materialD.uniforms.setUniform("screenSize",this.renderer.size)
}
    onUI(){

    }



    draw() {


        this.modelRenderer.draw(this)
        this.blitLines.draw(this);
        this.blitD.draw(this)

        UI.drawGPU(this.passEncoder, true)
    }

}
