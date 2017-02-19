"use strict";
var prog;
var idx;
var tex;

function mesh(loader,url)
{
	var that = this;
	loader.loadArrayBuffer(url,function(abuffer){
	that.setup(abuffer,loader);
	});
}

mesh.prototype.setup = function(abuffer,loader)
{		
		//this.num_indicies;
		//mesh.num_verticies;
		idx = 0;
		var dv = new DataView(abuffer);
		this.centroid = [];
		
		function readLine()
		{
			var s = "";
			while(idx < dv.byteLength)
			{
				var c = dv.getUint8(idx++);
				c = String.fromCharCode(c);
				if(c == '\n')
				{
					break;
				}
				else if (c == '\r')
				{
					;
				}
				else
				{	
					s += c;
				}
			}
			return s;
		}
		var line;
		var lst;
		line = readLine();
		//console.log(line);
		if(line !== "mesh_3")
		{
			throw new Error("Bad Header");
		}
		//debugger;
		while(1)
		{
			//var lst;            
			line = readLine();
			if(line === "")
			{
				break;
			}
			lst = line.split(" ");
			
			if (lst[0] === "vertices")
			{
				this.num_verticies = parseInt(lst[1],10); //Added ,10
			}
			
			if (lst[0] === "indices")
			{	
				this.num_indicies = parseInt(lst[1],10); //Added ,10
				//console.log("Num INDICIES "+this.num_indicies);
			}
			
			if(lst[0] === "centroid" && lst[1] === "muzzle1")
			{
				this.centroid["muzzle1"] = [parseInt(lst[2]),parseInt(lst[3]),parseInt(lst[4])];
			}
			
			if(lst[0] === "centroid" && lst[1] === "muzzle2")
			{
				this.centroid["muzzle2"] = [parseInt(lst[2]),parseInt(lst[3]),parseInt(lst[4])];
			}
			
			if(lst[0] === "texture_file")
			{
				this.texture = new tdl.Texture2D(loader,lst[1]);
			}
			
			if(lst[0] === "bumpmap_file")
			{
				this.normalmap = new tdl.Texture2D(loader,lst[1]);
			}
			
			if(lst[0] === "vertex_data")
			{
				//console.log(abuffer+" buffer\n");
				var vdata = new Float32Array(abuffer,idx,this.num_verticies);
				idx += vdata.byteLength;
		    }
			if(lst[0] === "index_data")
			{
				//console.log("INDEX_DATA");
				//console.log(idx);
				var idata = new Uint16Array(abuffer,idx,this.num_indicies);				
				idx += idata.byteLength;
			}
		}
		
		//Create buffers and bind data
		if(this.texture === undefined)
		{
			this.texture = new tdl.SolidTexture([0,255,0,255]);
		}
		if(this.scolor === undefined)
		{
			this.scolor = [0.0,0.0,0.0,1.0];
		}
		if(this.normalmap === undefined)
		{
			this.normalmap = new tdl.SolidTexture([128,128,255,255]);
		}
		
		this.vbuff = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuff);
		gl.bufferData(gl.ARRAY_BUFFER,vdata,gl.STATIC_DRAW);
	
		this.ibuff = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuff);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idata,gl.STATIC_DRAW);
		//console.log(centroid);
};

mesh.prototype.draw = function(prog)
{
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuff);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.ibuff);
	//prog.disableAllAttribs();
	prog.setVertexFormat(
	"position",3,gl.FLOAT,
	"texcoord",2,gl.FLOAT,
	"normal",3,gl.FLOAT,
	"tangent",3,gl.FLOAT);
	prog.setUniform("basetexture",this.texture);
	prog.setUniform("btexturetemp",this.texture);
	prog.setUniform("specmtl",this.scolor);
	prog.setUniform("normalmap",this.normalmap);
    gl.drawElements(gl.TRIANGLES,this.num_indicies,gl.UNSIGNED_SHORT,0);
};