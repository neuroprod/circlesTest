import Shader from "./lib/core/Shader.ts";
import {ShaderType} from "./lib/core/ShaderTypes.ts";
import {Vector2} from "math.gl";
import DefaultTextures from "./lib/textures/DefaultTextures.ts";


export default class BlitLinesShader extends Shader{


    init(){

        if(this.attributes.length==0) {
            this.addAttribute("aPos", ShaderType.vec3);
            this.addAttribute("aUV0", ShaderType.vec2);

        }

        this.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))
        this.addTexture("addTexture",DefaultTextures.getWhite(this.renderer))

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


@fragment
fn mainFragment(@location(0) uv: vec2f) ->   @location(0) vec4f
{
    let textureSize =vec2<f32>( textureDimensions(colorTexture));
    let uvPos = vec2<i32>(floor(uv*textureSize));

     var color =  textureLoad(colorTexture,  uvPos ,0) + vec4(textureLoad(addTexture,  uvPos ,0).x-0.3)*0.5;
    color.a =1.0;
  return  color;

}
///////////////////////////////////////////////////////////
       
        `
    }



}
