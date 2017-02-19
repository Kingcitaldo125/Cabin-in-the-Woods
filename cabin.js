//Cabin
"use strict";
var cabinmesh = "logs.OBJ.mesh";
//var cabinmesh = "house.OBJ.mesh";
var tablelongmesh = "table.OBJ.mesh";

function cabin(pos)
{
	if(pos === undefined)
	{this.pos = [0,0,0,1];}
	this.pos=pos;
	this.file = "logs.obj.mesh";
}

cabin.loadmesh = function(loader)
{
	cabin.mesh = new mesh(loader,cabinmesh,true);
	cabin.tablemesh = new mesh(loader,tablelongmesh,true);
}

cabin.prototype.get_pos = function()
{
	return this.pos;
}

cabin.prototype.draw = function(prog)
{	
	if(this.World === undefined)
	{this.World = tdl.identity();}
	
	this.World = tdl.mul(tdl.scaling([3,3,3]),tdl.translation(this.pos));
	prog.setUniform("worldMatrix",this.World);
	cabin.mesh.draw(prog);
	this.World = tdl.mul(tdl.scaling([2,1,1]),tdl.translation([this.pos[0],this.pos[1]+1,this.pos[2]-1]));
	prog.setUniform("worldMatrix",this.World);
	cabin.tablemesh.draw(prog);
}