//Cabin2
"use strict";
//var cabinmesh = "logs.OBJ.mesh";
var cabinTwoMesh = "house.OBJ.mesh";

function cabin2(pos)
{
	if(pos === undefined)
	{this.pos = [0,0,0,1];}
	this.pos=pos;
}

cabin2.loadmesh = function(loader)
{
	cabin2.mesh = new mesh(loader,cabinmesh,true);
}

cabin2.prototype.get_pos = function()
{
	return this.pos;
}

cabin2.prototype.draw = function(prog)
{	
	if(this.World === undefined)
	{this.World = tdl.identity();}
	
	this.World = tdl.mul(tdl.scaling([3,3,3]),tdl.translation(this.pos));
	prog.setUniform("worldMatrix",this.World);
	cabin.mesh.draw(prog);
}