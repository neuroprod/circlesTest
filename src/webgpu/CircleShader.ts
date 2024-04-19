import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";



export default class CircleShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec2);
            this.addAttribute("aPosPrev", ShaderType.vec2);
            this.addAttribute("aPosNext", ShaderType.vec2);
            this.addAttribute("aDir", ShaderType.vec2);
        }
        //this.renderer.texturesByLabel["GDepth"]
        this.addUniform("ratio",1)
        this.addUniform("thickness",0.01)

        this.logShaderCode =true;
    }
    getShaderCode(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput
{


    @builtin(position) position : vec4f
  
}



${this.getShaderUniforms(0)}

@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
    var posS=aPos*vec2(uniforms.ratio,1.0);
    var posSNext =aPosNext*vec2(uniforms.ratio,1.0);
     var posSPrev =aPosPrev*vec2(uniforms.ratio,1.0);
    let dir = (posSNext-posS) +    (posS-posSPrev);
    let normal =normalize(vec2(-dir.y,dir.x));
    
    
    let pos =  posS+normal*uniforms.thickness*aDir.x;
    output.position =vec4(pos.x,pos.y,0,1.0);
  
    return output;
}


@fragment
fn mainFragment() ->   @location(0) vec4f
{
 
  return vec4f(vec3(1.0),1.0);
 
}
///////////////////////////////////////////////////////////
        
        
        
        
        
        
        
        
        `
    }



}
