import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";
import DefaultTextures from "./lib/textures/DefaultTextures.ts";
import {TextureDimension} from "./lib/WebGPUConstants.ts";



export default class CircleShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec2);
            this.addAttribute("aPosPrev", ShaderType.vec2);
            this.addAttribute("aPosNext", ShaderType.vec2);
            this.addAttribute("aDir", ShaderType.vec2);
            this.addAttribute("aInstancePos", ShaderType.vec3,1,"instance");
        }
        //this.renderer.texturesByLabel["GDepth"]
        this.addUniform("ratio",1)
        this.addUniform("thickness",0.01)
        this.addTexture("offsetTexture",DefaultTextures.getWhite(this.renderer),"float",TextureDimension.TwoD,GPUShaderStage.VERTEX)
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))


    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

     @location(0) l : vec2f,
    @builtin(position) position : vec4f
  
}



${this.getShaderUniforms(0)}
fn getPos( pos: vec2f,inst:vec3f,dir:vec2f,indexOff:f32)->vec2f
{
    var posR =pos;
    let p = vec2f(inst.x,dir.y+indexOff);

        let uvPos = vec2<i32>(p);
   posR*= 1.0+ (textureLoad(offsetTexture,  uvPos ,0).x)*2.0 ;
    posR.x +=inst.y/2;
      posR.y +=inst.x/5000;
    return  posR*vec2(uniforms.ratio,1.0);
}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    var posS=getPos(aPos,aInstancePos,aDir,0.0);
    var posSNext =getPos(aPosNext,aInstancePos,aDir,1.0);
     var posSPrev =getPos(aPosPrev,aInstancePos,aDir,-1.0);
    let dir = (posSNext-posS) +    (posS-posSPrev);
    let normal =normalize(vec2(-dir.y,dir.x));
    
    
    let pos =  posS+normal*uniforms.thickness*aDir.x;
    output.position =vec4(pos.x,pos.y,0,1.0);
  output.l = aDir;
  
    return output;
}


@fragment
fn mainFragment(@location(0) l: vec2f) ->   @location(0) vec4f
{
 let a =1.0-abs(l.x);
 
 var f =((l.y+240)%255)/255;
 f=abs(f*2.0-1.0);
 
     let uvPos = vec2<i32>(vec2f(f*255)%255);
     var color =   textureLoad(colorTexture, uvPos ,0);
     color=color*a;
  return  color;

}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}
