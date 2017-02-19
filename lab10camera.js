"use strict"
//camera = new Camera( {
//	eye : [0,10,20];
//});
function Camera(opts)
{
	var cw = 500;
	var ch = 500;
	this.aspectRatio = cw/ch;
	
	if(opts === undefined)
	{
		//var opts;
		//opts = {"coi":[0.0,2.0,-10.0,0.0],"up":[0.0,1.0,0.0,0.0],"fov":70.0};
		this.coi = [0.0,2.0,-10.0,0.0];
		this.up = [0.0,1.0,0.0,0.0];
		this.fov = 70.0;
	}
	if(opts.coi === undefined)
	{
		this.coi = [0.0,2.0,-10.0,0.0];
	}
	else
	{
		this.coi = opts.coi;
	}
	if(opts.fov === undefined)
	{
		this.fov = 70.0;
	}
	else
	{
		this.fov = opts.fov;
	}
	if(opts.hither === undefined)
	{
		this.hither = 0.1;
	}
	else
	{
		this.hither = opts.hither;
	}
	//this.hither = 0.1;
	
	if(opts.yon === undefined)
	{
		this.yon = 1000;
	}
	else
	{
		this.yon = opts.yon;
	}
	this.eye = (opts.eye !== undefined) ? opts.eye : [0.0,2.0,0.0,1.0];
	this.coi = opts.coi;
	//this.coi1 = opts.coi;
	this.up1 = opts.up;
	this.Vhat = [0.0,1.0,0.0,0.0];
	this.make_proj_matx(this.hither,this.yon,this.fov);
	this.computeVM(this.eye,this.coi,this.up);
}

Camera.prototype.make_proj_matx = function(h,y,fov)
{
	//var fov = 45;
	//var h = 0.1;
	//var y = 1000;
	//var canvas = document.getElementById("cvs");	
	
	var av = this.fov * (Math.PI / 270);
	var cam_width = cvs.width;
	var cam_height = cvs.height;
	var ah = (cam_width/cam_height)*av;
	var T = h*Math.tan(av);
	var B = -h*Math.tan(av);
	var R = h*Math.tan(ah);
	var L = -h*Math.tan(ah);
	var S = (0.0,0.0,-1.0);
	var t = (0.0,0.0,-1.0);
	var a = Math.random()*(10-2)+2;//angle to rotate by;
	var c = Math.cos(a);
	var s = Math.sin(a);
	
	//S is the axis of rotation, unit length.
	this.projectionMatrix =
	[2*h/(R-L),0,0,0,
	0,2*h/(T-B),0,0,
	1+(2*L/(R-L)),1+((2*B)/(T-B)),y/(h-y),-1,
	0,0,h*y/(h-y),0];
}

Camera.prototype.computeVM = function()
{
	//Located in the Notes.
	//this.W = tdl.normalize(tdl.sub(e,coi));
	var W,V,U;
	W = tdl.sub(this.eye,this.coi);
	U = tdl.cross(this.Vhat,W);
	V = tdl.cross(W,U);
	this.W = tdl.normalize(W);
	this.U = tdl.normalize(U);
	this.V = tdl.normalize(V);
	this.right = this.U;
	this.up = this.V;
	this.antilook = this.W;
	//this.up = tdl.normalize(tdl.cross(this.W,this.right));
	var vm1 = [1,0,0,0,
			   0,1,0,0,
			   0,0,1,0,
			   -this.eye[0],-this.eye[1],-this.eye[2],1];
	var vm2 =[this.U[0],this.V[0],this.W[0],0,
			  this.U[1],this.V[1],this.W[1],0,
			  this.U[2],this.V[2],this.W[2],0,
			  0,0,0,1];
	this.VM = tdl.mul(vm1,vm2);
	this.viewProjMatrix = tdl.mul(this.VM,this.projectionMatrix);
}

Camera.prototype.set = function(eye,coi,up)
{
	this.eye = eye;
	this.coi = coi;
	this.up = up;
	this.computeVM();
}

Camera.prototype.strafe = function(h,v,d)
{
	//debugger;
	try
	{
	//h * this.right + v* this.up + -d * this.antilook
	var tmp = tdl.add(tdl.mul(h,this.right),tdl.mul(v,this.up));
	tmp = [tmp[0],tmp[1],tmp[2],0.0];
	//console.log(this.W,"DOUBLE U");
	tmp = tdl.add(tmp,tdl.mul(-d,this.W));
	var M = tdl.translation(tmp);
	this.eye = tdl.mul(this.eye,M);
	this.coi = tdl.mul(this.coi,M);
	
	//console.log(this.eye);
	this.computeVM();
	}
	catch(e)
	{debugger;}
}

Camera.prototype.turn = function(a)
{
	var m2 = tdl.mul(tdl.translation(tdl.mul(-1,this.eye)),tdl.axisRotation(this.up,a),tdl.translation(this.eye));
	this.coi = tdl.mul(this.coi,m2);
	//this.coi = tdl.normalize(this.coi);
	//console.log(this.coi);
	this.computeVM();
}

Camera.prototype.tilt = function(a)
{
	//console.log(this.up,"UP");
	var m3 = tdl.mul(
	tdl.translation(tdl.mul(-1,this.eye)),
	tdl.axisRotation(this.right,a),
	tdl.translation(this.eye));
	this.coi = tdl.mul(this.coi,m3);
	this.up = tdl.mul(this.up1,m3);
	this.computeVM();
}

Camera.prototype.draw = function(prog)
{
	var world = tdl.identity();
	if(prog === undefined)
	{throw new Error("Prog is undefined???");}
	
	
	if(this.pos === undefined)
	{this.pos = [0.0,0.0,0.0];}
	
	if(this.VM === undefined)
	{this.computeVM();}
	
	if(this.viewProjMatrix === undefined)
	{this.viewProjMatrix = tdl.mul(this.VM,this.projectionMatrix);}
	
	prog.setUniform("projectionMatrix",this.projectionMatrix);
	prog.setUniform("viewProjMatrix",this.viewProjMatrix);
	prog.setUniform("viewMatrix",this.VM);
	prog.setUniform("eyePos",this.eye);
	prog.setUniform("cameraU",this.U);
	prog.setUniform("cameraV",this.V);
	prog.setUniform("cameraW",this.W);
	prog.setUniform("hitheryon",[this.hither,this.yon,this.yon-this.hither]);
}