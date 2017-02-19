//ground.js
"use strict";

var groundfilename = "ground.OBJ.mesh";

function Ground()
{
	this.up = [0.0,1.0,0.0,0.0];
}

Ground.loadmesh = function(loader)
{
	Ground.mesh = new mesh(loader,groundfilename,true);
}

Ground.prototype.draw = function(prog)
{
	var groundWorld = tdl.identity();
	groundWorld = tdl.scaling([200,200,200]);
	prog.setUniform("worldMatrix",groundWorld);
	Ground.mesh.draw(prog);
}