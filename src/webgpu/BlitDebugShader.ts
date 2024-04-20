import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";
import {Vector2} from "math.gl";
import DefaultTextures from "./lib/textures/DefaultTextures.ts";


export default class BlitDebugShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }
        this.addUniform("size",new Vector2(256,256))
        this.addUniform("screenSize",new Vector2(256,256))
        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))


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
    var p = aPos*0.5+0.5;
  p = p/vec3(uniforms.screenSize.x,uniforms.screenSize.y,1.0);
  p = p*vec3(uniforms.size.x,uniforms.size.y,1.0)*2.0;
  p=p+vec3(-1,-1.0,0.0);
    output.position =vec4(p,1.0);
    output.uv = aUV0;
  
    return output;
}


@fragment
fn mainFragment(@location(0) uv: vec2f) ->   @location(0) vec4f
{
  let textureSize =vec2<f32>( textureDimensions(colorTexture));
    let uvPos = vec2<i32>(floor(uv*textureSize));

     var color =  textureLoad(colorTexture,  uvPos ,0);
    
  return  color;

}
///////////////////////////////////////////////////////////
       
        `
    }



}
