"use strict";
var gl;
var showShadowBuffer =false;
var commonvb,percopyvb,ibuff,
shadowbuffer,blurfbo;
var cam,lightcamera;
var fbo_color,fbo_position,fbo_normal,fbo_specular;
var fbo_position2,fbo_color2,fbo_normal2,fbo_specular2;
var playerheight = 4;
var bbplane,plan,usq;
var treesize,treetexture,woodtexture,grasstexture,greengrasstexture,
dummytex;
var instancingExtension;
var numBlurRounds = 10;
var numbillboards;
var wallRotate = -0.1;
var pretty_picture;
var pretty_picturefile = "pretty_picture.OBJ.mesh";
var brickWall,blahmesh;
var brickMesh = "basicFloor.OBJ.mesh";
var ground = new Ground();
var pagescollected = 0;
var tempground,pageone,pagetwo,pagethree,pagefour;
var pagelist = ["pageOne.OBJ.mesh","pagetwo.OBJ.mesh",
"pagethree.OBJ.mesh","pagefour.OBJ.mesh"];
var soundlist = ["walkingshort1.wav","walkingshort2.wav","Page_Turn.wav","wood_foot1.wav","wood_foot2.wav"];
var soundswap = 0;
var statuePosition = [-100,1,100];
var wellPosition = [-2,0,40];
/*
the first page is inside the Cabin,
second is on the brick wall, and the third
is on the obelisk
The fourth is on the well.
*/
var pageonecollect = false;
var pagetwocollect = false;
var pagethreecollect = false;
var pagefourcollect = false;
var shadowprog,shadowprogtwo,blurfbo1;//,blurfbo2;
var blurprog,progone,progtwo,progthree,progfour,
  progfive,progsix,progseven,progeight;
var cabin_pos = [-6,0.2,4,1];
var brick_wall_loc = [-25,0,10];
var pagepositions = [[-5,2.5,3],//[-5,cabin_pos[1]+4,cabin_pos[2]-6.3],
                     [brick_wall_loc[0]+1.2,brick_wall_loc[1]+5,brick_wall_loc[2]],
					 [statuePosition[0],playerheight,statuePosition[2]-1.1],
					 [wellPosition[0],wellPosition[1]+3,wellPosition[2]+1.1]];
var cabin_width = 18;// Side to Side
var cabin_length = 12;//Door to back wall
var myCabin = new cabin(cabin_pos);
var walking = false;
var sprinting = false;
var groundsize = 200;
var treelocsize = (groundsize - 100);
var walktimer = 0.0;
var scale_factor = 5;
var treelocs = [];
var statue,well;
var wallwidth = 10;
var walllength = 30;
var skytex;
var fbos;
var lightfov = 120;
//var lightfov = 180;
var tempLightShadowPos = [10,5,25,1];
var deferredDraw = 5.0; // Default to Full Scene
var skycube,cube;
var bumpCabin,sphere,box,torus,cone,plane;
//var lightposY = 55;
var lightposY = 25;
var statueEye = [statuePosition[0],statuePosition[1],statuePosition[2],1];
var lights = {"pos":[-5,lightposY,45,1],"color":[1.0,1.0,1.0,1.0]};
var lightOpts = {"eye":[-5,lightposY,45,1],"coi":[0,0,0,1],
				"fov":lightfov,"hither":0.01,"yon":1000.0};
var opts = {
	"eye":[-3,playerheight,20,1],
	//"eye":[-5,lightposY,45,1],
	"coi":[-3,playerheight,-250,0],
	"fov":70.0,
	"up":[0,1,0,0]};
	
var pagefourRotation = 0.8;
var pagethreeRotation = 3.1;
var pagethreeAxisone = [0,0,1];
var pagethreeAxistwo = [1,0,0];
var pagetrott = 1.6;

var playerspeedx = 0.0;
var playerspeedz = 0.0;

var skyboxrendery = -120;
//var skyboxrendery = -140;

var pressed = false;
var controllerLock = false;

function randomRange(a,b)
{
	return a + Math.random() * (b-a);
}

function main()
{
	var cvs = document.getElementById("cvs");
	var tmp = document.getElementsByTagName("body");
	var body = tmp[0];
	body.addEventListener("keydown",keydown_callback,false);
	//body.addEventListener("keyup",keydown_callback,false);
	gl = tdl.setupWebGL(cvs,{alpha:false,stencil:true,preserveDrawingBuffer:true});
	
	//gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.2,0.5,0.8,1.0);//blue sky
    //gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	var loader = new tdl.Loader(setup);
	
	shadowprog = new tdl.Program(loader,"svs.txt","sfs.txt");
	shadowprogtwo = new tdl.Program(loader,"svs2.txt","sfs2.txt");
	//shadowprogthree = new tdl.Program(loader,"svs2.txt","fs2.txt");
	blurprog = new tdl.Program(loader,"blurvs.txt","blurfs.txt");
	
	//progone = new tdl.Program(loader,"lightingvs.txt","lightingfs.txt");
	progtwo = new tdl.Program(loader,"bbvs.txt","bbfs.txt"); // Billboards
	progthree = new tdl.Program(loader,"lab10vs.txt","lab10fs.txt"); // Sky
	progfour = new tdl.Program(loader,"vs.txt","fs.txt");
	progfive = new tdl.Program(loader,"vs2.txt","fs2.txt"); // PASS ONE
	progsix = new tdl.Program(loader,"vs3.txt","fs3.txt"); // PASS TWO
	progseven = new tdl.Program(loader,"bbvs2.txt","bbfs2.txt"); // Billboard pass two
	progeight = new tdl.Program(loader,"vs3.txt","lab10pass2.txt"); // Sky pass two
	
	// Textures
	treetexture = new tdl.Texture2D(loader,"tupelo.png");
	//woodtexture = new tdl.Texture2D(loader,"darkwood.png");
	//grasstexture = new tdl.Texture2D(loader,"grass.png");
	//greengrasstexture = new tdl.SolidTexture([0,55,0,255]);
	greengrasstexture = new tdl.SolidTexture([0,100,0,255]);
	
	// Normal Maps
	//var grassbmap = new tdl.Texture2D(loader,"bm20.png");
	//var woodbmap = new tdl.Texture2D(loader,"bmwood.png");
	
	treesize = [10,10];
	numbillboards = 1000;
	
	//Load some meshes here
	
	//Brick wall
	plan = new mesh(loader,"plan.OBJ.mesh");
	cabin.loadmesh(loader);
	pageone = new mesh(loader,"pageOne.OBJ.mesh");
	pagetwo = new mesh(loader,"pagetwo.OBJ.mesh");
	pagethree = new mesh(loader,"pagethree.OBJ.mesh");
	pagefour = new mesh(loader,"pagefour.OBJ.mesh");
	statue = new mesh(loader,"obelisk.OBJ.mesh");
	well = new mesh(loader,"well.OBJ.mesh");
	//pretty_picture = new mesh(loader,pretty_picturefile);
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.depthMask(true);
	
	loader.loadImage("grass.png",
        function(img)
		{
            var Plane = tdl.primitives.createPlane(
			groundsize,groundsize,
			20,20);
			
            var S = tdl.scaling([2,2,2]);
            
            tempground = new tdl.primitives.Mesh
			(
                Plane,
                {
                    position: "vec3 position",
                    normal: "vec3 normal",
                    texCoord: "vec2 texcoord"
                },
                S,
                {
                    "basetexture":greengrasstexture,//new tdl.Texture2D(loader,"grass.png"),
					//"normalmap":new tdl.Texture2D(loader,"bm20.png"),
                    textureMatrix: tdl.scaling([8,8,8]),
                    textureColorMatrix: tdl.translation([0.25,0.5,0.125])
                }
            )
            
            for(var j=0;j<numbillboards;++j)
			{
                var idx = randomRange(0,Plane.position.numElements);
                idx = Math.floor(idx);
				
				var x1 = randomRange(-100,-treelocsize);
				//var x1 = -100;
				var x2 = randomRange(100,treelocsize);
				//var x2 = 100;
				var z1 = randomRange(-100,-treelocsize);
				//var z1 = -100;
				var z2 = randomRange(100,treelocsize);
				//var z2 = 100;
				
				var x = randomRange((x1),(x2));
				var y = Plane.position.buffer[idx*3+1];
				var z = randomRange((z1),(z2));
				
				if(x > -52 && x <= -48)
				{
					if(z > -23 && z <= 4)
					{
						x = randomRange(-treelocsize,treelocsize);
						z = randomRange(-treelocsize,treelocsize);
					}
				}
				
				// To keep trees from spawning in cabin
				var xconstraintone = 4; // Right side (facing door)
				var xconstrainttwo = -10; // Left side (facing door)
				var zconstraintone = 8; // Front door
				var zconstrainttwo = -5; //Back wall
				
				var brickxone = -15;
				var brickxtwo = -10;
				var brickzone = 24;
				var brickztwo = -4;
				
				if(x > xconstrainttwo && x <= xconstraintone)
				{
					if(z > zconstrainttwo && z <= zconstraintone)
					{
						x = randomRange(-treelocsize,treelocsize);
						z = randomRange(-treelocsize,treelocsize);
					}
				}
				
				if(z > zconstrainttwo && z <= zconstraintone)
				{
					if(x > xconstrainttwo && x <= xconstraintone)
					{
						x = randomRange(-treelocsize,treelocsize);
						z = randomRange(-treelocsize,treelocsize);
					}
				}
				
				if(x > brickxone && x <= brickxtwo)
				{
					if(z > brickztwo && z <= brickzone)
					{
						x = randomRange(-treelocsize,treelocsize);
						z = randomRange(-treelocsize,treelocsize);
					}
				}
				
                var tmp = [x,y,z,1];
				tmp = tdl.mul(tmp,S);
                tmp[1] = 9;
                treelocs.push(tmp[0],tmp[1],tmp[2]);
            }
            //console.log(treelocs);
        }
    );
	
	bbplane = new tdl.primitives.Mesh(
        tdl.primitives.createPlane(0,0,1,1),
        {
            position: {name:"position", number: 3},
            texCoord: {name:"texcoord", number: 2}
			//a_size: {name:"a_size", number: 2}
        }
    );
	
	skytex = new tdl.CubeMap(loader,
		//{px:"px2.png",nx:"nx2.png",py:"py2.png",ny:"ny2.png",
		// pz:"pz2.png",nz:"nz2.png"
		//}
		
		{px:"a5.png",nx:"a1.png",py:"a4.png",ny:"a2.png",
		 pz:"a3.png",nz:"a6.png"
		}
		
		//{px:"five.png",nx:"one.png",py:"four.png",ny:"two.png",
		// pz:"three.png",nz:"six.png"
		//}
            );
	
    skycube = new tdl.primitives.Mesh(tdl.primitives.createCube(30),
		{position:"vec3 position",normal:"vec3 a_normal",texCoord:"vec2 texcoord"},
		tdl.identity(),
		{
			basetexture:skytex
		}
	);
	
	dummytex = new tdl.SolidTexture([0,0,0,0.1]);
	
	// Variance Shadow Maps
	
	shadowbuffer = new tdl.Framebuffer(512,512,{format:[[gl.RGBA,gl.FLOAT]]});
    blurfbo1 = new tdl.Framebuffer(512,512,{format:[[gl.RGBA,gl.FLOAT]]});
	//blurfbo2 = new tdl.Framebuffer(512,512,{format:[[gl.RGBA,gl.FLOAT]]});
	
	// Deferred 
	fbo_position = new tdl.Framebuffer(512,512,{format: [[gl.RGBA, gl.FLOAT]]});
    fbo_normal = new tdl.Framebuffer(512,512,{format: [[gl.RGBA,gl.FLOAT]]});
    fbo_color = new tdl.Framebuffer(512,512,{format: [[gl.RGBA,gl.FLOAT]]});
    fbo_specular = new tdl.Framebuffer(512,512,{format: [[gl.RGBA,gl.FLOAT]]});
	
	usq = new UnitSquare();
	
	cam = new Camera(opts);
	lightcamera = new Camera(lightOpts);
	loader.finish();
}

function playsound(which)
{
	var thissound = soundlist[which];
	var newsnd = new Audio(thissound);
	newsnd.play();
}

function displayPageText(which)
{
	//if(which === int || which == float){throw new Error("Pass a string for the page.");}
	if(which === "pageone")
	{
		var stringone = "There was a man here. A bad, angry man.";
		var stringtwo = "He looks for victims near this same cabin.";
		console.log("\n");
		console.log(stringone);
		console.log(stringtwo);
		console.log("\n");
	}
	else if(which === "pagetwo")
	{
		var stringone = "Watch your back..";
		var stringtwo = "He hunts those that seek the pages..";
		console.log("\n");
		console.log(stringone);
		console.log(stringtwo);
		console.log("\n");
	}
	else if(which === "pagethree")
	{
		var stringone = "Be careful... He might be right behind you";
		console.log("\n");
		console.log(stringone);
		//console.log(stringtwo);
		console.log("\n");
	}
	else if(which === "pagefour")
	{
		var stringone = "He might be right behind you...";
		console.log("\n");
		console.log(stringone);
		//console.log(stringtwo);
		console.log("\n");
	}
	else
	{
		console.log("ERROR");
	}
}

var beforeela = Date.now();

function keydown_callback(ev)
{
	var h,v,d;
	var rotval;
	var walkingSpeed;
	var nowela = Date.now();
	var tempela = nowela-beforeela;
	beforeela=nowela;
	var defDict = {1.0:"position",2.0:"normal",3.0:"color",4.0:"specular"};
	//console.log(cam.eye);
	
	/*
	if(ev.keyCode === 86)
	{
		lightposY+=1;
		console.log(lightposY);
	}
	if(ev.keyCode === 67)
	{
		lightposY-=1;
		console.log(lightposY);
	} */
	
	// Spacebar
	if(ev.keyCode === 32)
	{
		// Reset the player's position 
		cam.set(opts.eye,opts.coi,opts.up);
		//cam.set(statueEye,[0,playerheight,statueEye[2],0],opts.up);
	}
	
	if(ev.keyCode === 16)
	{
		console.log("SHIFT");
		walkingSpeed = 10;
		console.log(cam.eye);
	}
	
	// Up Arrow
	if(ev.keyCode === 38)
	{
		if(deferredDraw === 5)
		{
			console.log("No further increase");
		}
		else
		{
			deferredDraw++;
			if(deferredDraw === 1.0)
			{
				console.log("worldPosition");
			}
			else if(deferredDraw === 2.0)
			{
				console.log("normal");
			}
			else if(deferredDraw === 3.0)
			{
				console.log("color");
			}
			else if(deferredDraw === 4.0)
			{
				console.log("specular");
			}
			else if(deferredDraw === 5.0)
			{
				console.log("Full Scene");
			}
		}
	}
	
	// Down Arrow
	if(ev.keyCode === 40)
	{
		if(deferredDraw === 0)
		{
			console.log("No further decrease");
		}
		else
		{
			deferredDraw--;
			if(deferredDraw === 0.0)
			{
				console.log("shadow buffer");
			}
			if(deferredDraw === 1.0)
			{
				console.log("worldPosition");
			}
			else if(deferredDraw === 2.0)
			{
				console.log("normal");
			}
			else if(deferredDraw === 3.0)
			{
				console.log("color");
			}
			else if(deferredDraw === 4.0)
			{
				console.log("specular");
			}
			else if(deferredDraw === 5.0)
			{
				console.log("Full Scene");
			}
		}
	}
	
	// W
	if(ev.type === "keydown")
	{
		//playerspeedz = -1.0;
		
		if(ev.keyCode === 87)
		{
			//move camera foreward
			walkingSpeed = 0.1
			walking=true;
			h = 0.0;
			v = 0.0;
			d = walkingSpeed;
			cam.strafe(h,v,d);
			//walking=false;
		}
		
	}
	
	// A
	if(ev.keyCode === 65)// && key_pressed === false)
	{
		//playerspeedx = -1.0;
		
		walkingSpeed = -0.1;
		walking=true;
		h = walkingSpeed;
		v = 0.0;
		d = 0.0;
		cam.strafe(h,v,d);
		
	}
	
	// S
	if(ev.keyCode === 83)// && key_pressed === false)
	{
		//playerspeedz = -1.0;
		
		//Strafe camera back;
		walkingSpeed=-0.1;
		walking=true;
		h = 0.0;
		v = 0.0;
		d = walkingSpeed;
		cam.strafe(h,v,d);
		
	}
	
	// D
	if(ev.keyCode === 68)// && key_pressed === false)
	{
		//playerspeedx = 1.0;
		
		walkingSpeed = 0.1;
		walking=true;
		h = walkingSpeed;
		v = 0.0;
		d = 0.0;
		cam.strafe(h,v,d);
		
	}
	
	// Q
	if(ev.keyCode === 81)// && key_pressed === false)
	{
		//console.log("Q");
		rotval = 0.05;
		cam.turn(rotval);
	}
	
	
	// E
	if(ev.keyCode == 69)// && key_pressed === false)
	{
		//console.log("E");
		rotval = -0.05;
		cam.turn(rotval);
	}
	
	// F
	if(ev.keyCode === 70)
	{
		console.log("X: "+cam.eye[0]);
		console.log("Y: "+cam.eye[1]);
		console.log("Z: "+cam.eye[2]);
		console.log("\n");
		
		if(cam.eye[2] > 7 && cam.eye[2] < 11)
		{
			if(cam.eye[0] > -24 && cam.eye[0] < -20)
			{
				pagetwocollect = true;
				playsound(2);
				pagescollected++;
				console.log("Pages Collected: "+pagescollected);
				displayPageText("pagetwo");
			}
		}
		
		if(cam.eye[2] < 6 && cam.eye[2] > 4)
		{
			if(cam.eye[0] > -5 && cam.eye[0] < -4)
			{
				pageonecollect = true;
				playsound(2);
				pagescollected++;
				console.log("Pages Collected: "+pagescollected);
				displayPageText("pageone");
			}
		}
		
		if(cam.eye[2] < 98 && cam.eye[2] > 96 )
		{
			if(cam.eye[0] > -102 && cam.eye[0] < -99)
			{
				pagethreecollect = true;
				playsound(2);
				pagescollected++;
				console.log("Pages Collected: "+pagescollected);
				displayPageText("pagethree");
			}
		}
		if(cam.eye[2] > 41 && cam.eye[2] < 43)
		{
			if(cam.eye[2] > -2 && cam.eye[0] < -1)
			{
				pagefourcollect = true;
				playsound(2);
				pagescollected++;
				console.log("Pages Collected: "+pagescollected);
				displayPageText("pagefour");
			}
		}
	}
	
	// L
	if(ev.keyCode == 76)
	{
		console.log("L");
		cam.strafe(0,1,0);
		//cam.tilt(0.1);
	}
	
	// G
	//if(ev.keyCode == 71)
	//{
		//console.log("G");
		/*
		if(showShadowBuffer)
		{
			showShadowBuffer = false;
			cam.set(opts.eye,opts.coi,opts.up);
		}
		else
		{
			showShadowBuffer = true;
			cam.set(lightcamera.eye,lightcamera.coi,[0,1,0,0]);
		} */
	//}
	
	// M
	if(ev.keyCode == 77)
	{
		console.log("M");
		cam.strafe(0,-1,0);
		//cam.tilt(-0.1);
	}
}

function setup()
{
	var vbtmp = 
	[0,0, 1,1,
	1,0, 1,1,
	1,1, 1,1,
    0,0, 1,1,
	1,1, 1,1,
	0,1, 1,1];
	
	commonvb = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER,commonvb);
	gl.bufferData(gl.ARRAY_BUFFER,
	new Float32Array(vbtmp),
	gl.STATIC_DRAW);
	
	percopyvb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,percopyvb);
	gl.bufferData(gl.ARRAY_BUFFER,
	new Float32Array(treelocs),
	gl.STATIC_DRAW);
	
	instancingExtension = gl.getExtension("ANGLE_instanced_arrays");
	if(!instancingExtension)
    throw new Error("Instancing not supported");
	//setInterval(update,20);
	update_and_draw();
	//old();
	//drawShadows();
}

var before;
var last;

function update()
{
	//Check to see if gamepad is supported ?
	
	var now = Date.now();
	
	var elapsed = now-last;
	last=now;
	//console.log(elapsed);
	
	var gamepad = navigator.getGamepads();
	if(gamepad)
	{
		gamepad = gamepad[0];
	}
    if(gamepad)
	{
		//console.log(gamepad.axes);
        var xaxis = gamepad.axes[0]; //-1...1
        var yaxis = gamepad.axes[1];
		var zaxis = gamepad.axes[2];
		
		var dx;
		var dy;
		var dz;
		
		var h,v,d;
		
		var gamepadWalkSpeeddx = 0.1;
		var gamepadWalkSpeeddy = 0.1;
		var gamepadWalkSpeeddz = 0.1;
		
		dx=xaxis*gamepadWalkSpeeddx;
		dy=yaxis*-gamepadWalkSpeeddy;
		dz=zaxis*-gamepadWalkSpeeddz;
		
		//console.log(dx);
		if(controllerLock === false)
		{
			cam.strafe(dx,0,dy);
			cam.turn(dz);
		}
		
        pressed = gamepad.buttons[0].pressed;
		
		//Axes
		
		//BUTTONS
		if(gamepad.buttons[0].pressed)
		{
			console.log("A Pressed");
			console.log("X: "+cam.eye[0]);
			console.log("Y: "+cam.eye[1]);
			console.log("Z: "+cam.eye[2]);
			console.log("\n");
			
			if(cam.eye[2] > 7 && cam.eye[2] < 11)
			{
				if(cam.eye[0] > -24 && cam.eye[0] < -20)
				{
					pagetwocollect = true;
					playsound(2);
					pagescollected++;
					console.log("Pages Collected: "+pagescollected);
					displayPageText("pagetwo");
				}
			}
			
			if(cam.eye[2] < 6 && cam.eye[2] > 4)
			{
				if(cam.eye[0] > -5 && cam.eye[0] < -4)
				{
					pageonecollect = true;
					playsound(2);
					pagescollected++;
					console.log("Pages Collected: "+pagescollected);
					displayPageText("pageone");
				}
			}
			
			if(cam.eye[2] < 98 && cam.eye[2] > 96 )
			{
				if(cam.eye[0] > -102 && cam.eye[0] < -99)
				{
					pagethreecollect = true;
					playsound(2);
					pagescollected++;
					console.log("Pages Collected: "+pagescollected);
					displayPageText("pagethree");
				}
			}
			if(cam.eye[2] > 41 && cam.eye[2] < 43)
			{
				if(cam.eye[2] > -2 && cam.eye[0] < -1)
				{
					pagefourcollect = true;
					playsound(2);
					pagescollected++;
					console.log("Pages Collected: "+pagescollected);
					displayPageText("pagefour");
				}
			}
        }
		if(gamepad.buttons[1].pressed)
		{
			console.log("B Pressed");
        }
		if(gamepad.buttons[2].pressed)
		{
			console.log("X Pressed");
			/*if(showShadowBuffer)
			{
				showShadowBuffer = false;
				cam.set(opts.eye,opts.coi,opts.up);
			}
			else
			{
				showShadowBuffer = true;
				cam.set(lightcamera.eye,lightcamera.coi,[0,1,0,0]);
			}*/
        }
        if(gamepad.buttons[3].pressed)
		{
			console.log("Y Pressed");
			if(controllerLock)
			{
				controllerLock = false;
				cam.set(opts.eye,opts.coi,opts.up);
			}
			else
			{
				controllerLock = true;
				cam.set([-98,27,103,1],opts.coi,opts.up);
			}
        }
		if(gamepad.buttons[4].pressed)
		{
			console.log("Left Bumper Pressed");
			//cam.strafe(0,-dy,0);
		}
		if(gamepad.buttons[5].pressed)
		{
			console.log("Right Bumper Pressed");
			//cam.strafe(0,dy,0);		
		}
		if(gamepad.buttons[6].pressed)
		{
			console.log("Left Trigger triggered.");
			h = 0.0;
			v = 1.0;
			d = 0.0;
			cam.strafe(h,v,d);
		}
		if(gamepad.buttons[7].pressed)
		{
			console.log("Right Trigger triggered.");
			h = 0.0;
			v = -1.0;
			d = 0.0;
			cam.strafe(h,v,d);
		}
		if(gamepad.buttons[10].pressed)
		{
			console.log("Left axis pad pushed");
		}
	
		if(gamepad.buttons[11].pressed)
		{
			console.log("Right axis pad pushed");
		}
		
		if(gamepad.buttons[12].pressed)
		{
			console.log("UP D-PAD Pressed");
			if(deferredDraw === 5)
			{
				console.log("No further increase");
			}
			else
			{
				deferredDraw++;
				if(deferredDraw === 1.0)
				{
					console.log("worldPosition");
				}
				else if(deferredDraw === 2.0)
				{
					console.log("normal");
				}
				else if(deferredDraw === 3.0)
				{
					console.log("color");
				}
				else if(deferredDraw === 4.0)
				{
					console.log("specular");
				}
				else if(deferredDraw === 5.0)
				{
					console.log("Full Scene");
				}
			}
		}
		
		if(gamepad.buttons[13].pressed)
		{
			console.log("DOWN D-PAD Pressed");
			if(deferredDraw === 0)
			{
				console.log("No further decrease");
			}
			else
			{
				deferredDraw--;
				if(deferredDraw === 0.0)
				{
					console.log("shadow buffer");
				}
				if(deferredDraw === 1.0)
				{
					console.log("worldPosition");
				}
				else if(deferredDraw === 2.0)
				{
					console.log("normal");
				}
				else if(deferredDraw === 3.0)
				{
					console.log("color");
				}
				else if(deferredDraw === 4.0)
				{
					console.log("specular");
				}
				else if(deferredDraw === 5.0)
				{
					console.log("Full Scene");
				}
			}
		}
		
		if(gamepad.buttons[14].pressed)
		{
			console.log("LEFT D-PAD Pressed");
		}
		
		if(gamepad.buttons[15].pressed)
		{
			console.log("RIGHT D-PAD Pressed");
		}
    }
	//update_and_draw();
}

var before = Date.now();

function old()
{
	if(before === undefined)
	{
		before = Date.now();
	}
	
	var now = Date.now();
	var elapsed = now-before;
	before=now;
	//console.log(elapsed);
	walktimer+=0.01;
	
	if(walking)
	{
		if(soundswap === 0)
		{
			soundswap = 1;
		}
		else
		{
			soundswap = 0;
		}
		if(walktimer >= 0.5)
		{
			//console.log(cam.eye);
			if(cam.eye[2] > -2 && cam.eye[2] < 9)
			{
				if(cam.eye[0] > -11 && cam.eye[0] < 1)
				{
					console.log("WOOD STEPS\n");
					var cho = randomRange(-10,10);
					if(cho < 0)
					{
						playsound(3);
					}
					else
					{
						playsound(4);
					}
				}
			}
			else
			{
				playsound(soundswap);
			}
			walktimer=0.0;
		}
		walking=false;
	}
	
	//useBlur(blurprog);
	drawBuildings(progone,cam);
	//useBlur(blurprog);
	drawPapers(progone,cam);
	//useBlur(blurprog);
	drawBillboards(progtwo,cam);
	//useBlur(blurprog);
	//drawSky(progthree,cam);
	drawShadowFirstPass(shadowprog,lightcamera);
	useBlur(blurprog);
	drawShadowSecondPass(shadowprogtwo,cam);
	
	tdl.requestAnimationFrame(old);
}

function update_and_draw()
{
	if(before === undefined)
	{
		before = Date.now();
	}
	var now = Date.now();
	var elapsed = now-before;
	before=now;
	//console.log(elapsed);
	walktimer += 0.01;
	
	update();
	//cam.set([playerspeedx,playerheight,playerspeedz,1.0],opts.coi,opts.up)
	
	if(walking)
	{
		if(soundswap === 0)
		{
			soundswap = 1;
		}
		else
		{
			soundswap = 0;
		}
		if(walktimer >= 0.5)
		{
			//console.log(cam.eye);
			if(cam.eye[2] > -2 && cam.eye[2] < 9)
			{
				if(cam.eye[0] > -12 && cam.eye[0] < 1)
				{
					console.log("WOOD STEPS\n");
					var cho = randomRange(-10,10);
					if(cho < 0)
					{
						playsound(3);
					}
					else
					{
						playsound(4);
					}
				}
			}
			else
			{
				playsound(soundswap);
			}
			walktimer=0.0;
		}
		walking=false;
	}
	
	// Draw Papers then Buildings
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.disable(gl.BLEND);
	var worldM = tdl.identity();
	
	//drawShadowFirstPass(shadowprog,lightcamera);
	
	progfive.use();
	cam.draw(progfive);
	
	progfive.setUniform("mode",0);
	fbo_position.bind();
	drawPapers(progfive,cam);
	drawBuildings(progfive,cam);
	//drawSky(progfive,cam);
	fbo_position.unbind();
	
	progfive.setUniform("mode",1);
	fbo_normal.bind();
	drawPapers(progfive,cam);
	drawBuildings(progfive,cam);
	//drawSky(progthree,cam);
	fbo_normal.unbind();
	
	progfive.setUniform("mode",2);
	fbo_color.bind();
	drawPapers(progfive,cam);
	drawBuildings(progfive,cam);
	//drawSky(progthree,cam);
	fbo_color.unbind();
	
	progfive.setUniform("mode",3);
	fbo_specular.bind();
	drawPapers(progfive,cam);
	drawBuildings(progfive,cam);
	//drawSky(progthree,cam);
	fbo_specular.unbind();
	
	//useBlur(blurprog);
	
	gl.enable(gl.BLEND);
	progsix.use();
	cam.draw(progsix);
	progsix.setUniform("lightPos",lights.pos);
	progsix.setUniform("lightColor",lights.color);
	progsix.setUniform("position_texture",fbo_position.texture);
	progsix.setUniform("normal_texture",fbo_normal.texture);
	progsix.setUniform("color_texture",fbo_color.texture);
	progsix.setUniform("specular_texture",fbo_specular.texture);
	progsix.setUniform("ddraw",deferredDraw);
	progsix.setUniform("shadowbuffer",shadowbuffer.texture);
	progsix.setUniform("light_viewMatrix",lightcamera.VM);
	progsix.setUniform("light_projMatrix",lightcamera.projectionMatrix);
	progsix.setUniform("scale_factor",scale_factor);
	progsix.setUniform("light_hitheryon",
	[lightcamera.hither,lightcamera.yon,lightcamera.yon-
	lightcamera.hither]);
	progsix.setUniform("magic_constant",15);
	usq.draw(progsix);
	
	//drawShadowSecondPass(progsix,cam);
	
	gl.disable(gl.BLEND);
	//ATTATCH DUMMY TEXTURES DISABLE BLENDING
	progsix.setUniform("position_texture",dummytex);
	progsix.setUniform("normal_texture",dummytex);
	progsix.setUniform("color_texture",dummytex);
	progsix.setUniform("specular_texture",dummytex);
	progsix.setUniform("shadowbuffer",dummytex);
	
	//Billboards
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	//gl.clearColor(1,1,1,1);
	progtwo.use();
	cam.draw(progtwo);
	
	progtwo.setUniform("mode",0);
	fbo_position.bind();
	drawBillboards(progtwo,cam);
	fbo_position.unbind();
	
	progtwo.setUniform("mode",1);
	fbo_normal.bind();
	drawBillboards(progtwo,cam);
	fbo_normal.unbind();
	
	progtwo.setUniform("mode",2);
	fbo_color.bind();
	drawBillboards(progtwo,cam);
	fbo_color.unbind();
	
	progtwo.setUniform("mode",3);
	fbo_specular.bind();
	drawBillboards(progtwo,cam);
	fbo_specular.unbind();
	
	gl.enable(gl.BLEND);
	progseven.use()
	cam.draw(progseven);
	progseven.setUniform("lightPos",lights.pos);
	progseven.setUniform("lightColor",lights.color);
	progseven.setUniform("position_texture",fbo_position.texture);
	progseven.setUniform("normal_texture",fbo_normal.texture);
	progseven.setUniform("color_texture",fbo_color.texture);
	progseven.setUniform("specular_texture",fbo_specular.texture);
	progseven.setUniform("ddraw",deferredDraw);
	usq.draw(progseven);
	gl.disable(gl.BLEND);
	
	//ATTATCH DUMMY TEXTURES DISABLE BLENDING
	progseven.setUniform("position_texture",dummytex);
	progseven.setUniform("normal_texture",dummytex);
	progseven.setUniform("color_texture",dummytex);
	progseven.setUniform("specular_texture",dummytex);
	
	// Sky
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	shadowbuffer.texture.setParameter(gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	
	shadowbuffer.bind();
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shadowprog.use();
    shadowprog.setUniform("scale_factor",scale_factor);
	
	drawShadowedPages(shadowprog,lightcamera);
	drawShadowedBuildings(shadowprog,lightcamera);
    shadowbuffer.unbind();
	
	useBlur(blurprog);
	
	gl.clearColor(0.2,0.5,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	if(showShadowBuffer)
	{
        blurprog.use();
        blurprog.setUniform("scale_factor",1.0/scale_factor);
        blurprog.setUniform("tex",shadowbuffer.texture);
        blurprog.setUniform("deltas",[0,0]);
        usq.draw(blurprog);
        blurprog.setUniform("tex",dummytex);
        return;
    }
	
	progthree.use();
	cam.draw(progthree);
	
	progthree.setUniform("mode",0);
	fbo_position.bind();
	//drawSky(progthree,cam);
	var worldM = tdl.identity();
	worldM = tdl.mul(tdl.scaling([10,10,10]),tdl.translation([1,skyboxrendery,1,1]));
	progthree.setUniform("worldMatrix",worldM);
	skycube.draw(progthree);
	fbo_position.unbind();
	
	progthree.setUniform("mode",1);
	fbo_normal.bind();
	//drawSky(progthree,cam);
	fbo_normal.unbind();
	
	progthree.setUniform("mode",2);
	fbo_color.bind();
	drawSky(progthree,cam);
	fbo_color.unbind();
	
	progthree.setUniform("mode",3);
	fbo_specular.bind();
	//drawSky(progthree,cam);
	fbo_specular.unbind();
	
	gl.enable(gl.BLEND);
	progeight.use()
	cam.draw(progeight);
	progeight.setUniform("magic_constant",15);
	progeight.setUniform("scale_factor",scale_factor);
	progeight.setUniform("lightPos",lights.pos);
	progeight.setUniform("eyePos",cam.eye);
	progeight.setUniform("lightColor",lights.color);
	progeight.setUniform("position_texture",fbo_position.texture);
	progeight.setUniform("normal_texture",fbo_normal.texture);
	progeight.setUniform("color_texture",fbo_color.texture);
	progeight.setUniform("specular_texture",fbo_specular.texture);
	progeight.setUniform("ddraw",deferredDraw);
	progeight.setUniform("shadowbuffer",shadowbuffer.texture);
	progeight.setUniform("light_viewMatrix",lightcamera.VM);
	progeight.setUniform("light_projMatrix",lightcamera.projectionMatrix);
	progeight.setUniform("light_hitheryon",
	[lightcamera.hither,lightcamera.yon,lightcamera.yon-
	lightcamera.hither]);
	
	usq.draw(progeight);
	
	gl.disable(gl.BLEND);
	
	//ATTATCH DUMMY TEXTURES DISABLE BLENDING
	progeight.setUniform("position_texture",dummytex);
	progeight.setUniform("normal_texture",dummytex);
	progeight.setUniform("color_texture",dummytex);
	progeight.setUniform("specular_texture",dummytex);
	progeight.setUniform("shadowbuffer",dummytex);
	
	tdl.requestAnimationFrame(update_and_draw);
}

function drawSky(progthree,cams)
{
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	progthree.use();
	cams.draw(progthree);
	var worldM = tdl.identity();
	//worldM = tdl.mul(tdl.scaling([10,10,10]),tdl.translation([-100,-100,100,1]));
	worldM = tdl.scaling([10,10,10]);
	progthree.setUniform("worldMatrix",worldM);
	skycube.draw(progthree);
}

function drawBuildings(prog,cams)
{
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	prog.use();
	cams.draw(prog);
	var worldM = tdl.identity();
	prog.setUniform("worldMatrix",worldM);
	
	tempground.draw(prog);
	
	myCabin.draw(prog);
	worldM = tdl.mul(tdl.scaling([10,5,5]),tdl.axisRotation([0,1,0],wallRotate),
	tdl.translation(brick_wall_loc));
	prog.setUniform("worldMatrix",worldM);
	plan.draw(prog);
	worldM = tdl.translation(statuePosition);
	prog.setUniform("worldMatrix",worldM);
	statue.draw(prog);
	worldM = tdl.mul(tdl.scaling([1,1,1]),tdl.translation(wellPosition));
	prog.setUniform("worldMatrix",worldM);
	well.draw(prog);
}

function drawPapers(progfive,cams)
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	progfive.use();
	cams.draw(progfive);
	var worldM = tdl.identity();
	progfive.setUniform("worldMatrix",worldM);
	//tempground.draw(progfive);
	if(pageonecollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([1,0,0],0.1),tdl.translation(pagepositions[0]));
		progfive.setUniform("worldMatrix",worldM);
		pageone.draw(progfive);
	}
	if(pagetwocollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([0,0,1],-1.5),tdl.axisRotation([1,0,0],1.5),tdl.translation(pagepositions[1]));
		progfive.setUniform("worldMatrix",worldM);
		pagetwo.draw(progfive);
	}
	if(pagethreecollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation(pagethreeAxisone,pagethreeRotation),
		tdl.axisRotation(pagethreeAxistwo,pagetrott),tdl.translation(pagepositions[2]));
		//worldM = tdl.identity();
		progfive.setUniform("worldMatrix",worldM);
		//Draw the third page
		pagethree.draw(progfive);
	}
	if(pagefourcollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([1,0,0],pagefourRotation),tdl.translation(pagepositions[3]));
		progfive.setUniform("worldMatrix",worldM);
		pagefour.draw(progfive);
	}
}

function drawBillboards(progtwo,cams)
{
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	progtwo.use();
	cams.draw(progtwo);
	
	progtwo.setUniform("texture",treetexture);
	progtwo.setUniform("a_size",treesize);
	
	progtwo.setVertexFormatInstanced
	(
		[commonvb, 0, "texcoord", 2,
		gl.FLOAT,"",2,gl.FLOAT],
		[percopyvb, 1, "position", 3,
		gl.FLOAT]
	);
	instancingExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, numbillboards);
    
    progtwo.setUniform("translation",[0,2,0]);
}

function useBlur(bprog)
{
	var use_blur = true;
	bprog.use();
    bprog.setUniform("scale_factor",1.0);
    blurfbo1.bind();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    bprog.setUniform("tex",shadowbuffer.texture);
    if(use_blur)
	{
        bprog.setUniform("deltas",[1,0]);
	}
    else
	{
        bprog.setUniform("deltas",[0,0]);
	}
    usq.draw(bprog);
    blurfbo1.unbind();
    bprog.setUniform("tex",blurfbo1.texture);
    shadowbuffer.bind();
	if(use_blur)
	{
        bprog.setUniform("deltas",[0,1]);
	}
    else
	{
        bprog.setUniform("deltas",[0,0]);
	}
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	usq.draw(bprog);
	shadowbuffer.unbind();
	bprog.setUniform("tex",dummytex);
}

function drawShadowFirstPass(fpassprog,fpasscam)
{
	shadowbuffer.texture.setParameter(gl.TEXTURE_MIN_FILTER,gl.LINEAR);
	
	shadowbuffer.bind();
    gl.clearColor(1,1,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    fpassprog.use();
    fpassprog.setUniform("scale_factor",scale_factor);
	
	drawShadowedPages(fpassprog,fpasscam);
	drawShadowedBuildings(fpassprog,fpasscam);
    shadowbuffer.unbind();
	
	gl.clearColor(0.2,0.5,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	if(showShadowBuffer)
	{
        blurprog.use();
        blurprog.setUniform("scale_factor",1.0/scale_factor);
        blurprog.setUniform("tex",shadowbuffer.texture);
        blurprog.setUniform("deltas",[0,0]);
        usq.draw(blurprog);
        blurprog.setUniform("tex",dummytex);
        return;
    }
}

function drawShadowSecondPass(spassprog,spasscam)
{
	spassprog.use();
	spassprog.setUniform("magic_constant",15);
	spassprog.setUniform("scale_factor",scale_factor);
	spassprog.setUniform("lightPos",lightcamera.eye);
	spassprog.setUniform("eyePos",spasscam.eye);
	spassprog.setUniform("lightColor",lights.color);
	spassprog.setUniform("shadowbuffer",shadowbuffer.texture);
	spassprog.setUniform("light_hitheryon",
	[lightcamera.hither,lightcamera.yon,lightcamera.yon-
	lightcamera.hither]);
	spassprog.setUniform("light_viewMatrix",lightcamera.VM)
	spassprog.setUniform("light_projMatrix",lightcamera.projectionMatrix);
	drawShadowedPages(spassprog,spasscam);
	drawShadowedBuildings(spassprog,spasscam);
	spassprog.setUniform("shadowbuffer",dummytex);
}

function drawShadowedBuildings(progshadow,camshadow)
{
	camshadow.draw(progshadow);
	var worldM = tdl.identity();
	progshadow.setUniform("worldMatrix",worldM);
	tempground.draw(progshadow);
	myCabin.draw(progshadow);
	worldM = tdl.mul(tdl.scaling([10,5,5]),tdl.axisRotation([0,1,0],wallRotate),
	tdl.translation(brick_wall_loc));
	progshadow.setUniform("worldMatrix",worldM);
	plan.draw(progshadow);
	worldM = tdl.translation(statuePosition);
	progshadow.setUniform("worldMatrix",worldM);
	statue.draw(progshadow);
	worldM = tdl.mul(tdl.scaling([1,1,1]),tdl.translation(wellPosition));
	progshadow.setUniform("worldMatrix",worldM);
	well.draw(progshadow);
}

function drawShadowedPages(progshadowpages,camshadowpages)
{
	//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	camshadowpages.draw(progshadowpages);
	var worldM = tdl.identity();
	progshadowpages.setUniform("worldMatrix",worldM);
	
	if(pageonecollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([1,0,0],0.1),tdl.translation(pagepositions[0]));
		progshadowpages.setUniform("worldMatrix",worldM);
		pageone.draw(progshadowpages);
	}
	if(pagetwocollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([0,0,1],-1.5),tdl.axisRotation([1,0,0],1.5),tdl.translation(pagepositions[1]));
		progshadowpages.setUniform("worldMatrix",worldM);
		pagetwo.draw(progshadowpages);
	}
	if(pagethreecollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation(pagethreeAxisone,pagethreeRotation),
		tdl.axisRotation(pagethreeAxistwo,pagetrott),tdl.translation(pagepositions[2]));
		//worldM = tdl.identity();
		progshadowpages.setUniform("worldMatrix",worldM);
		//Draw the third page
		pagethree.draw(progshadowpages);
	}
	if(pagefourcollect === false)
	{
		worldM = tdl.mul(tdl.axisRotation([1,0,0],pagefourRotation),tdl.translation(pagepositions[3]));
		progshadowpages.setUniform("worldMatrix",worldM);
		pagefour.draw(progshadowpages);
	}
}

// Works Cited

//"Convert And Resize An Image." <i>Convert And Resize An Image</i>. Web. 12 Feb. 2015. &lt;
//http://www.garyshood.com/imageconvert/&gt;.

//"Javascript Char Codes (Key Codes)." 
//<i>Cambia Research</i>. Web. 22 Jan. 2015. &lt;
//http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes&gt;.

//"NormalMap-Online." <i>NormalMap-Online</i>. Web. 17 Mar. 2015. &lt;
//http://cpetry.github.io/NormalMap-Online/&gt;.

//"SoundBible.com." <i>Free Sound Clips</i>. Web. 12 Feb. 2015. &lt;
//http://soundbible.com/&gt;.

//Software Used

// Blender
// Audacity