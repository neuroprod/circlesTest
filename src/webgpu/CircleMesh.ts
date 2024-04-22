import Renderer from "./lib/Renderer.ts";
import {Vector2} from "math.gl";
import Mesh from "./lib/core/Mesh.ts";

export default class CircleMesh{
    private numDiv: number;
    private basePoint:Array<Vector2>=[]
    mesh: Mesh;
    constructor(renderer:Renderer, numDiv:number) {
        this.numDiv =numDiv;
        let angleStep = Math.PI*2/this.numDiv;


        for(let i=0;i<numDiv;i++){

            let angle = i* angleStep;
            this.basePoint.push(new Vector2(Math.sin(angle),Math.cos(angle)))
        }
        const dir = [];
        const vertices = [];
        const verticesPrev = [];
        const verticesNext = [];
        for(let i=0;i<numDiv;i++){
            dir.push(1,i,-1,i);

            let v =  this.basePoint[this.getIndex(i)]
            vertices.push(v.x,v.y)
            vertices.push(v.x,v.y)

            let vp =  this.basePoint[this.getIndex(i-1)]
            verticesPrev.push(vp.x,vp.y)
            verticesPrev.push(vp.x,vp.y)

            let vn =  this.basePoint[this.getIndex(i+1)]
            verticesNext.push(vn.x,vn.y)
            verticesNext.push(vn.x,vn.y)
        }

        const indices = [];
        let indexCount =0
        for(let i=0;i<numDiv-1;i++){
            indices.push(indexCount,indexCount+2,indexCount+1)
            indices.push(indexCount+1,indexCount+2,indexCount+3)
            indexCount+=2;
        }
        indices.push(indexCount,0,indexCount+1)
        indices.push(indexCount+1,0,1)

       this.mesh =new Mesh(renderer,"circleMesh")
        this.mesh.setAttribute("aDir",new Float32Array(dir));
        this.mesh.setAttribute("aPos",new Float32Array(vertices));
        this.mesh.setAttribute("aPosPrev",new Float32Array(verticesPrev));
        this.mesh.setAttribute("aPosNext",new Float32Array(verticesNext));
        this.mesh.setIndices(new Uint16Array(indices))
    }

    getIndex(index:number){
        if(index<0) index+=   this.numDiv;
        if(index>=this.numDiv) index -=this.numDiv;
        return index;

    }


}
