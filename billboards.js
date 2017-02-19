"use strict";

var cvs;
var gl;
var camera;
var prog1;      //normal meshes 
var bbprog;     //billboards
var ground;
var bbquad;
var sparktex;
var treetex;
var treelocs=[];

function randrange(a,b){
    return a + Math.random()*(b-a);
}

function main(){
    
    cvs = document.getElementById("cvs");
    cvs.addEventListener("mousedown",mousedown);
    cvs.addEventListener("mouseup",mouseup);
    cvs.addEventListener("mousemove",mousemove);
    gl = tdl.setupWebGL(cvs,{alpha:false,stencil:true,preserveDrawingBuffer:true});

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.2,0.4,0.7,0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    var loader = new tdl.Loader(setup);
    prog1 = new tdl.Program(loader,"vs.txt","fs.txt");
    bbprog = new tdl.Program(loader,"bbvs.txt","bbfs.txt");
    
    sparktex = new tdl.Texture2D(loader,"sparkle.png");
    treetex = new tdl.Texture2D(loader,"tupelo.png");
    
    var groundsize=20;
    

    loader.loadImage("noise.png", 
        function(img){
            var PL = tdl.primitives.createPlane( 
                            groundsize,groundsize,        //size
                            20,20,          //num subdivisions
                            undefined,
                            img);
            var S = tdl.scaling([2,2,2]);
            
            ground = new tdl.primitives.Mesh(
                PL,
                {
                    position: "vec3 a_position",
                    normal: "vec3 a_normal",
                    texCoord: "vec2 a_texcoord"
                },
                S,
                {
                    "texture":new tdl.Texture2D(loader,"noise.png"),
                    textureMatrix: tdl.scaling([8,8,8]),
                    textureColorMatrix: tdl.translation([0.25,0.5,0.125])
                } //SolidTexture([64,128,16,255])}
            )
            
            
            for(var j=0;j<50;++j)
			{
                var idx = randrange(0,PL.position.numElements);
                idx = Math.floor(idx);
                var x = PL.position.buffer[idx*3];
                var y = PL.position.buffer[idx*3+1];
                var z = PL.position.buffer[idx*3+2];
                var tmp = [x,y,z,1];
                tmp = tdl.mul(tmp,S);
                tmp[1] += 0.85;
                treelocs.push(tmp.slice(0,3));
            }
            console.log(treelocs);
        }
    );

    

    bbquad = new tdl.primitives.Mesh(
        tdl.primitives.createPlane( 0,0, 1,1 ),
        {
            position: {name:"a_position", number: 3},
            texCoord: {name: "a_texcoord", number: 2}
        }
    );

    camera = new Camera({eye:[0,2,5,1],coi:[0,2,0,1]});
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

function mouseup(ev){
    lmx = undefined;
    if( ev.button === 2 )
        ev.preventDefault();
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
            camera.turn(-0.01*dx,true);
            //camera.walk(0.02*dy,true);
            //camera.tilt(0.01*dy);
        }
        else{
            //camera.shift(dx*-0.02,dy*0.02);
        }
    }
    else{
        //camera.walk(0.02*dy);
        camera.tilt(0.02*dy);
    }
    
    lmx=mx;
    lmy=my;
    
    draw();
}

function setup(){
    draw();
}

function draw(){
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    prog1.use()
    camera.draw(prog1);
    prog1.setUniform("worldMatrix",tdl.identity());
    prog1.setUniform("lightPos",[1,1,1,0]);
    ground.draw(prog1);
        
    //var dmode = document.getElementById("dmode").selectedIndex;

    bbprog.use();
    camera.draw(bbprog);
    //bbprog.setUniform("dmode",dmode);

    bbprog.setUniform("texture",treetex);
    for(var i=0;i<treelocs.length;++i)
	{
        bbprog.setUniform("translation",treelocs[i]);
        bbquad.draw(bbprog);
    }
    
    bbprog.setUniform("translation", [0,2,0] );
    bbprog.setUniform("texture",sparktex);
    bbquad.draw(bbprog);

}
