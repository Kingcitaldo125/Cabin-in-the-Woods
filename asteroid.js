"use strict";
//asteroid.js
var astfilename = "asteroid2.OBJ.mesh";

function ast(pos,vel)
{
	this.pos = pos;
	this.vel = vel;
	this.up = [0.0,1.0,0.0,0.0];
}

ast.loadmesh = function(loader)
{
	ast.mesh = new mesh(loader,astfilename);
	//this.ast.mesh2 = new Mesh(loader,filename);
}

ast.prototype.isActive = function()
{
	return true;
}

ast.prototype.draw = function(astprog,elapsed)
{
	var W = tdl.identity();
	this.ammt=0.01*elapsed;
	W = tdl.mul(tdl.axisRotation([0,0,1],this.ammt),tdl.translation(this.pos));
	astprog.setUniform("worldMatrix",W);
	ast.mesh.draw(astprog);
}

ast.prototype.update = function(elapsed)
{
	//console.log(this.pos[1]);
	if(this.pos[1] <= 0.0)
	{
		this.vel=tdl.mul([0,-1,0,0],this.vel);
		playsound(0);
	}
	//console.log(this.vel);
	this.vel=tdl.add([0,-0.001,0,0],this.vel);
	this.vel=tdl.add([-0.0001,0,0,0],this.vel);
	this.pos = tdl.add(this.pos,this.vel);
}