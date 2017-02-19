"use strict";

var cvs;
var gl;
var ground;
var box;
var face;
var camera;
var worldMatrix;
var lightPos = [-40,100,40,1];
var usq;
var prog1;
var prog2;
var prog3;  //debugging
var dummytex;
var dummycube;
var skytex;
var skycube;
var fbo;
var fbocameras=[];
var fbocamtrans=[0,1.25,0,0];
var noisetex;

function main(){
    
    cvs = document.getElementById("cvs");
    cvs.addEventListener("mousedown",mousedown);
    cvs.addEventListener("mouseup",mouseup);
    cvs.addEventListener("mousemove",mousemove);
    gl = tdl.setupWebGL(cvs,{alpha:false,stencil:true,preserveDrawingBuffer:true});
    //var X=gl.bindFramebuffer ;
    //gl.bindFramebuffer = function(a,b){
    //    console.log("bound fb");
    //    X.apply(gl,[a,b]);
    //}
    
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(1,0,1,1); //0.2,0.4,0.6,1.0); //0.7,0.8,0.7,1.0);
    
    var loader = new tdl.Loader(setup);
    prog1 = new tdl.Program(loader,"vs.txt","fs.txt");
    prog2 = new tdl.Program(loader,"vs2.txt","fs2.txt");
    prog3 = new tdl.Program(loader,"vs3.txt","fs3.txt");
    
    face = new Mesh(loader,"face.obj.mesh",
        { basetexture: new tdl.SolidTexture([192,192,192,255]) } );
        
    ground = new Mesh(loader,"ground.obj.mesh",
        { basetexture: new tdl.Texture2D(loader,"grass.png") } );
        
    box = new tdl.primitives.Mesh(
            tdl.primitives.createCube(3),
            { position: "vec3 a_position", normal: "vec3 a_normal", texCoord: "vec2 a_texcoord"},
            tdl.identity(),
            {
                basetexture: new tdl.SolidTexture([192,192,64,255]),
            }
    );
    
    //the names are from blender, where y and z are switched from GL
    skytex = new tdl.CubeMap(loader,
        { px: "s3px.png", nx: "s3nx.png", py: "s3pz.png", ny: "s3nz.png",
          pz: "s3py.png", nz: "s3ny.png"
      }
    );


    skycube = new tdl.primitives.Mesh(
        tdl.primitives.createCube(30),
        { position: "vec3 a_position", normal: "vec3 a_normal", texCoord: "vec2 a_texcoord" },
        tdl.identity(),
        {
            basetexture:skytex
        }
    );
    
    noisetex = new tdl.Texture2D(loader,"noise.png");
        
    fbo = new tdl.Framebuffer(512,512,{cubemap:true});
    
    dummytex = new tdl.SolidTexture([0,0,0,255]);
    dummycube = new tdl.CubeMap(null,{size:1});
    
    usq = new UnitSquare();
    
    worldMatrix=tdl.identity();
    camera = new Camera({
        //eye:[-3,2.25,6,1],
        //eye:[0,3,6,1],
        eye: [10,2.25,3,1],
        coi:[0,1.5,0,1],
        up:[0,1,0,0]
    });
    
    var cois=[
        [1,0,0,0], 
        [-1,0,0,0], 
        [0,1,0,0], 
        [0,-1,0,0], 
        [0,0,1,0], 
        [0,0,-1,0] 
    ];
    var ups=[ 
        [0,-1,0,0], 
        [0,-1,0,0], 
        [0,0,1,0], 
        [0,0,-1,0], 
        [0,-1,0,0], 
        [0,-1,0,0] ];
    
    for(var i=0;i<6;++i){
        var opts={
            fov: 90,
            hither: 0.1,
            yon: 500.0,
            eye: fbocamtrans,
            coi: tdl.add(fbocamtrans,cois[i]),
            up: ups[i]
        }
        fbocameras.push( new Camera(opts) );
    }
    
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
    //console.log(camera.eye.join(","));
    //console.log(camera.coi.join(","));
    //console.log(camera.V.join(","));
    
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

var did_env=false;
function draw(){
    
    var clears=[
        [1,0,0],[0.5,0,0], [0,1,0],[0,0.5,0], [0,0,1], [0,0,0.5] ];

    if(!did_env ){
        did_env=true;
        for(var i=0;i<6;++i){
            fbo.bind(i);
            gl.clearColor( clears[i][0],clears[i][1],clears[i][2], 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
            //continue;
            
            
            draw_things(fbocameras[i],true);
            
            prog3.use();
            var colr = clears[i];
            colr[3]=0.015;
            prog3.setUniform("color",colr);
            usq.draw(prog3);
            
            //gl.clear(gl.COLOR_BUFFER_BIT);
            fbo.unbind();
        }
        
        for(var i=0;i<6;++i){
            var C = fbo.texture.getCanvas(i);
            var D = document.getElementById("c"+i);
            var ctx = D.getContext("2d");
            ctx.save();
            ctx.translate(D.width/2,D.height/2);
            ctx.rotate(3.14159);
            ctx.translate(-D.width/2,-D.height/2);
            ctx.drawImage(C,0,0,D.width,D.height);
            ctx.restore();
        }
    }
    draw_things(camera,false);
}

function draw_things(camera,drawingfbo){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //if(drawingfbo)
    //    return;
    
    prog1.use()
    prog1.setUniform("lightPos",lightPos);
    prog1.setUniform("lightColor",[1,1,1,1]);
    camera.draw(prog1);

    if( !drawingfbo ){
        prog1.setUniform("refltexture",fbo.texture);
    }
    else
        prog1.setUniform("refltexture",dummycube);
        
        
    //box
    if( !drawingfbo ){
        prog1.setUniform("noisetexture",noisetex);
        prog1.setUniform("reflpct",0.65);
        var T = tdl.translation(fbocamtrans);
        prog1.setUniform("worldMatrix",T);
        box.draw(prog1);
    }
    
    prog1.setUniform("noisetexture",dummytex);
    
    //face
    prog1.setUniform("reflpct",0.0);
    var T = tdl.translation([6,0.7,0,0]);
    var R = tdl.axisRotation([1,0,0],0*3.14159/2);
    var M = tdl.mul(R,T);
    prog1.setUniform("worldMatrix",M);
    face.draw(prog1);
    
    //ground
    var S = tdl.scaling([50,20,50]);
    var T = tdl.translation([0,0,0,0]);
    var M = tdl.mul(S,T);
    prog1.setUniform("worldMatrix",M);
    prog1.setUniform("reflpct",0.0);
    ground.draw(prog1);

    prog1.setUniform("refltexture",dummycube);

    prog2.use();
    camera.draw(prog2);
    prog2.setUniform("worldMatrix",tdl.scaling(10,10,10));
    skycube.draw(prog2);
    
    

}
