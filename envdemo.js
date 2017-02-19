"use strict";

var cvs;
var gl;
var sphere;
var torus;
var cone;
var plane;
var ground;
var box;
var face;
var fastener;
var camera;
var worldMatrix;
var lightPos = [120,200,3,1];
var usq;
var prog1;
var prog2;
var dummytex;
var dummycube;
var skytex;
var skycube;
//var fbo;
//var fbocamera;

function main(){
    
    cvs = document.getElementById("cvs");
    cvs.addEventListener("mousedown",mousedown);
    cvs.addEventListener("mouseup",mouseup);
    cvs.addEventListener("mousemove",mousemove);
    gl = tdl.setupWebGL(cvs,{alpha:false,stencil:true,preserveDrawingBuffer:true});
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.2,0.4,0.6,1.0); //0.7,0.8,0.7,1.0);
    
    var loader = new tdl.Loader(setup);
    prog1 = new tdl.Program(loader,"vs.txt","fs.txt");
    prog2 = new tdl.Program(loader,"vs2.txt","fs2.txt");
    
    face = new SuperMesh(loader,"face.spec.mesh",
        { tex: new tdl.SolidTexture([192,192,192,255]) } );
    ground = new SuperMesh(loader,"ground.spec.mesh",
        { tex: new tdl.Texture2D(loader,"grass.png") } );
        
    sphere = new Primitive( tdl.primitives.createSphere(0.75),
        {tex: new tdl.SolidTexture([255,64,64,255])});
    fastener = new SuperMesh(loader,"fastener.spec.mesh");
    box = new Primitive(tdl.primitives.createCube(2),
        {tex: new tdl.SolidTexture([192,192,64,255]),
            scolor: new Float32Array([1,1,1,64])});
    torus = new Primitive(tdl.primitives.createTorus(0.8,0.25),
        {tex: new tdl.SolidTexture([32,224,64,255])});
    cone = new Primitive(
        tdl.primitives.createTruncatedCone(0.5,0,1.5),
        {tex: new tdl.SolidTexture([32,64,255,255])});
    plane = new Primitive(tdl.primitives.createPlane(40,40),
        {tex:new tdl.Texture2D(loader,"grass.png"),
         scolor: [0,0,0,32]});
         
         
         
    //skytex = new tdl.CubeMap(loader,
    //            { px: "px2.png", nx: "nx2.png", py: "py2.png",
    //              ny: "ny2.png", pz: "pz2.png", nz: "nz2.png"
    //            }
    //        );
    
    //the names are from blender, where y and z are switched from GL
    skytex = new tdl.CubeMap(loader,
        { px: "s3px.png", nx: "s3nx.png", py: "s3pz.png", ny: "s3nz.png",
          pz: "s3py.png", nz: "s3ny.png"
      }
    );
            
            
    skycube = new Primitive(tdl.primitives.createCube(30),
        {tex:skytex});
        
    //fbo = new tdl.CubeFramebuffer(512);
    
    dummytex = new tdl.SolidTexture([0,0,0,0.1]);
    //dummycube = new tdl.CubeMap(1);
    
    usq = new UnitSquare();
    
    worldMatrix=tdl.identity();
    camera = new Camera({eye:[-3,2.25,6,1],coi:[0,1.5,0,1],up:[0,1,0,0]});
    
    /*
    var coi
    for(var i=0;i<6;++i){
        var opts={
            fov: 90/180.0*3.14159265358979323,
            eye: [0,0,0],
        }
        if( i < 2 || i > 3 )
            opts.up = [0,1,0,0];
        else if( i === 2)  
            opts.up=[0,0,-1]; //+y
            opts.up
    }*/
    
    loader.finish();
}
  
var lmx,lmy;
var shift;
var mb;
function mousedown(ev){
    lmx = ev.clientX-cvs.offsetLeft;
    lmy = ev.clientY-cvs.offsetTop;
    if( ev.ctrlKey )
        mb=1;
    else
        mb=ev.button;
    shift = ev.shiftKey;
}

function mouseup(){
    lmx = undefined;
    console.log(camera.eye.join(","));
    console.log(camera.coi.join(","));
    console.log(camera.V.join(","));
}

function mousemove(ev){
    if( lmx === undefined )
        return;
        
    var mx,my;
    mx=ev.clientX-cvs.offsetLeft;
    my=ev.clientY-cvs.offsetTop;
    
    var dx = mx - lmx;
    var dy = my - lmy;
    if( mb === 0 ){
        if( !shift ){
            var r1 = tdl.axisRotation(camera.V,-0.01*dx);
            var r2 = tdl.axisRotation(camera.U,-0.01*dy);
            var e = [camera.eye[0],camera.eye[1],camera.eye[2],1.0];
            e=tdl.mul(e,r1,r2);
            camera.set_eye_coi(e,camera.coi,camera.V);
        }
        else{
            camera.shift(dx*-0.01,dy*0.01);
        }
    }
    else
        camera.walk(0.1*dy);
            
    lmx=mx;
    lmy=my;
    
    draw();
}

function setup(){
    draw();
}

function draw(){
    /*
       for(var i=0;i<6;++i){
        fbo.bind(i);
        draw_things(fbocamera[i],false);
        fbo.unbind();
    }
    */
    draw_things(camera,false);
}

function draw_things(camera,usefbo){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    prog1.use()
    prog1.setUniform("lightPos",lightPos);
    prog1.setUniform("lightColor",[1,1,1,1]);
    camera.draw(prog1);

    //if( usefbo )
    //    prog1.setUniform("refltexture",fbo.texture);
    //else
        prog1.setUniform("refltexture",skytex);
        
    prog1.setUniform("reflpct",0.65);

    var T = tdl.translation([-1.5,1.2,0]);
    var R = tdl.axisRotation([1,0,0],0*3.14159/2);
    var M = tdl.mul(R,T);
    prog1.setUniform("worldMatrix",M);
    face.draw(prog1);
    
    
    //var T = tdl.translation([-1.5,,0]);
    //var R = tdl.axisRotation([1,0,0],0.25);
    //var M = tdl.mul(R,T);
    //prog1.setUniform("worldMatrix",M);
    //cone.draw(prog1);
    //var T=tdl.translation([-1.5,1,0]);
    //var R=tdl.axisRotation([1,0,0],3.14159/2);
    //var M = tdl.mul(R,T);
    //prog1.setUniform("worldMatrix",M)
    //torus.draw(prog1);
    //prog1.setUniform("worldMatrix",tdl.translation([1.5,0,0]));
    //sphere.draw(prog1);

    var T = tdl.translation([-1.5,2.75,0]);
    var R = tdl.axisRotation([1,0,0],-3.14159/2);
    var M = tdl.mul(R,T);
    prog1.setUniform("worldMatrix",M);
    fastener.draw(prog1);

    
    //prog1.setUniform("reflpct",0);
    
    prog1.setUniform("worldMatrix",tdl.translation([3,0.9,0]));
    box.draw(prog1);
    
    
    var R = tdl.axisRotation([1,0,0],-3.14159/2);
    var S = tdl.scaling([50,20,50]);
    var T = tdl.translation([0,0,0,0]);
    var M = tdl.mul(R,S,T);
    prog1.setUniform("worldMatrix",M);
    prog1.setUniform("reflpct",0.0);
    ground.draw(prog1);

    prog2.use();
    camera.draw(prog2);
    prog2.setUniform("worldMatrix",tdl.scaling(20,20,20));
    skycube.draw(prog2);
    
    
    //prog1.setUniform("refltexture",dummycube);

}