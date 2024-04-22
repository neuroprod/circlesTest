import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";
import DefaultTextures from "./lib/textures/DefaultTextures.ts";
import {TextureDimension} from "./lib/WebGPUConstants.ts";
import {Vector2, Vector4} from "math.gl";



export default class DistanceShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        //this.renderer.texturesByLabel["GDepth"]
        this.addUniform("size",new Vector4(0.5,1,1,1))
        this.addUniform("pos",new Vector2(0.5,0.5))




    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{

     @location(0) uv : vec2f,
    @builtin(position) position : vec4f
  
}



${this.getShaderUniforms(0)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
   
    output.position =vec4(aPos,1.0);
    output.uv = aUV0;
  
    return output;
}

fn rand(n:vec2f)->f32 { 
return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

@fragment
fn mainFragment(@location(0) uv: vec2f) ->   @location(0) vec4f
{
var  uvV=uv-uniforms.pos;
uvV.y = uvV.y%1.0;
uvV =uvV-0.5;
let r = rand(vec2(uv.x,0.1))*0.1;
let r2 = rand(vec2(r,uv.x))*0.1;
var l =length(uvV);
let s=1.0-smoothstep(uniforms.size.y-r,uniforms.size.x-r2,l);
     var color =   vec4(s*uniforms.size.z,0.0,0.0,1.0);
    
  return  color;

}
///////////////////////////////////////////////////////////
       
        `
    }



}
