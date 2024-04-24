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
        this.addUniform("sizeY",new Vector4(0.5,1,1,1))
        this.addUniform("sizeX",new Vector4(0.5,1,1,1))
        this.addUniform("pos",new Vector2(0.5,0.5))
        this.addUniform("time",0.5)



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
fn mod289_3(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
fn permute_4(x: vec4<f32>) -> vec4<f32> {
  return mod289_4(((x * 34.0) + 10.0) * x);
}
fn taylorInvSqrt_4(r: vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}


   fn snoise3d(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0) ;
  let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, C.yyy));
  let x0 = v - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min( g.xyz, l.zxy );
  let i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  let x1 = x0 - i1 + C.xxx;
  let x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  let x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289_3(i);
  let p = permute_4(
    permute_4(
      permute_4(i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0)) + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0)
    ) + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0)
  );

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  let n_ = 0.142857142857; // 1.0/7.0
  let  ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p, 7 * 7)

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_); // mod(j, N)

  let x = x_ * ns.x + ns.yyyy;
  let y = y_ * ns.x + ns.yyyy;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>(x.xy, y.xy);
  let b1 = vec4<f32>(x.zw, y.zw);

  // let s0 = vec4<f32>(lessThan(b0,0.0))*2.0 - 1.0;
  // let s1 = vec4<f32>(lessThan(b1,0.0))*2.0 - 1.0;
  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.0));

  let a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw*sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt_4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 = p0 * norm.x;
  p1 = p1 * norm.y;
  p2 = p2 * norm.z;
  p3 = p3 * norm.w;

  // Mix final noise value
  var m = max(0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
  m = m * m;

  return 42.0 * dot(
    m * m,
    vec4<f32>(dot(p0, x0), dot(p1,x1), dot(p2,x2), dot(p3,x3))
  );
}
@fragment
fn mainFragment(@location(0) uv: vec2f) ->   @location(0) vec4f
{
var  uvV=uv-uniforms.pos;
uvV.y = uvV.y%1.0;
uvV =uvV-0.5;
uvV =uvV%1.0;

let x =1.0- smoothstep(uniforms.sizeX.x-uniforms.sizeX.x*uniforms.sizeX.y,uniforms.sizeX.x,abs(uvV.x));
let y =1.0-smoothstep(uniforms.sizeY.x-uniforms.sizeY.x*uniforms.sizeY.y,uniforms.sizeY.x,abs(uvV.y));
//let r = rand(vec2(uv.x,0.1))*0.1;
//let r2 = rand(vec2(r,uv.x))*0.1;

     var color =   vec4(x*y*uniforms.sizeX.z*(1.0+snoise3d(vec3f(uv*8.0,uniforms.time*0.3))),0.0,0.0,1.0);
    
  return  color;

}
///////////////////////////////////////////////////////////
       
        `
    }



}
