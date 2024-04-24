import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";
import DefaultTextures from "./lib/textures/DefaultTextures.ts";
import {TextureDimension} from "./lib/WebGPUConstants.ts";




export default class DotShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);
            this.addAttribute("aInstancePos", ShaderType.vec4,1,"instance");
        }
        //this.renderer.texturesByLabel["GDepth"]
        this.addUniform("ratio",1)
        this.addUniform("time",1)
        this.addTexture("offsetTexture",DefaultTextures.getWhite(this.renderer),"float",TextureDimension.TwoD,GPUShaderStage.VERTEX)
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))
        this.addSampler("mySampler",GPUShaderStage.FRAGMENT,"mirror-repeat");
    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

    @location(0) uv : vec2f,
     @location(1) uvc:f32,
    @builtin(position) position : vec4f
  
}



${this.getShaderUniforms(0)}
fn getPos( pos: vec2f,inst:vec4f,angleIn:f32)->vec2f
{
    var posR =pos;
    let angle  = ((angleIn)*512.0)%512;
    let p =vec2f(inst.x,floor(angle));
     let uvPos = vec2<i32>(p);
    
 posR*= 0.5+ (textureLoad(offsetTexture,  uvPos ,0).x)*1.0;
    posR.x +=inst.y/4;
    posR.y +=inst.x/5000;
    return  posR;
}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{

    var output:VertexOutput;
    let offsetAngle = (aInstancePos.w+uniforms.time*aInstancePos.z);
    let angle  = (offsetAngle)*3.1415*2;
    let circlePos = vec2(sin(angle),cos(angle));
    var offset = getPos(circlePos,aInstancePos,offsetAngle);
   var pos = aPos.xy*0.004;
   pos += offset;
  
    output.position =vec4(pos.x* uniforms.ratio,pos.y,0,1.0);
    output.uv = aUV0;
  output.uvc = offsetAngle;
    return output;
}


@fragment
fn mainFragment(@location(0) uv: vec2f,@location(1) uvc: f32) ->    @location(0) vec4f
{
let a  =1.0-smoothstep(0.9,1.0,length(uv-vec2(0.5))*2.0);
    
 
     let uvPos =vec2f(uvc*2.0 +1.0);
     var color =textureSample(colorTexture, mySampler,  uvPos);
color+=vec4(0.5,0.5,0.5,0.0);
color*=a;
  return color;

}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}
