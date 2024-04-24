import Renderer from "./lib/Renderer.ts";
import UI from "./lib/UI/UI.ts";
import {Vector2, Vector4} from "math.gl";
import Material from "./lib/core/Material.ts";
import DistanceShader from "./DistanceShader.ts";
import Blit from "./lib/Blit.ts";
import OffsetRenderPass from "./OffsetRenderPass.ts";
import RenderPass from "./lib/core/RenderPass.ts";
import Blend from "./lib/Blend.ts";

export default class BlitCircle{

    private material: Material;
    private renderer: Renderer;
    private blit: Blit;

    pos =new Vector2(0.000,0)


   alpha: number=0.3;
    private sizeX: number=0.2;
    private sizeY: number=0.2;
    private softX: number=0.2;
    private softY: number=0.2;

    private name: string;

    constructor(renderer:Renderer,index:number) {
        this.renderer = renderer;
        this.material =new Material(renderer,"distMat",new DistanceShader(this.renderer,"distshader"))
        this.material.blendModes =[Blend.add()]
        this.name ="c"+index;

        this.blit =new Blit(this.renderer,"blit",this.material)
    }
    onUI() {
        UI.pushID(this.name);
        UI.separator(this.name);
        UI.LVector("pos",this.pos)
        this.sizeX= UI.LFloatSlider("sizeX",this.sizeX,0,1)
        this.softX= UI.LFloatSlider("softX",this.softX,0,1)
        this.sizeY= UI.LFloatSlider("sizeY",this.sizeY,0,1)
        this.softY= UI.LFloatSlider("softY",this.softY,0,1)
        this.alpha= UI.LFloatSlider("alpha",this.alpha,0,1)
        this.material.uniforms.setUniform("pos",this.pos)


        this.material.uniforms.setUniform("sizeX",new Vector4(this.sizeX,this.softX,this.alpha,1))
        this.material.uniforms.setUniform("sizeY",new Vector4(this.sizeY,this.softY,this.alpha,1))
        UI.popID();
    }

    draw(p: RenderPass){
        this.blit.draw(p)
    }
}
