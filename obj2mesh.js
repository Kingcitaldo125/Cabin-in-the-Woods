"use strict";

//Used for -Lab Six / Lab Seven- almost every lab

var fs = require("fs");
var infile = process.argv[2];
var objdata = fs.readFileSync(infile,{encoding:"utf8"});
//var newList = [];


objdata = objdata.split("\n");

function writer(fname)
{
	this.stream = fs.createWriteStream(fname);
	this.offset = 0;
}

function sub(v,w)
{
	return [v[0],-w[0],v[1]-w[1],v[2]-w[2]];
}

writer.prototype.write = function(x)
{
	this.stream.write(x);
	this.offset += x.length;
}

writer.prototype.end = function()
{
	this.stream.end();
}

writer.prototype.tell = function()
{
	return this.offset;
}

function main()
{
	var vertexdata = [];
	//var idata = [];
	var texturedata = [];
	var normaldata = [];
	var triangles = [];
	var centroid = {};
	var mdict = {};
	var objs = {};
	var currmtl;
	var currobj;
	
	for(var iii=0;iii<objdata.length;iii++)
	{		
		var L = objdata[iii].split(" ");		
		if(L[0] === "o")
		{
			currobj = L[1];
			objs[currobj] = {numv:0,sum:[0,0,0]};
		}
		else if(L[0] === "v")
		{
			//console.log(L);
			//Complete me: If we see a 'V' line, 
			//Add data to vertexdata array
			vertexdata.push([parseFloat(L[1]),parseFloat(L[2]),parseFloat(L[3])]);
			objs[currobj].numv++;
			for(var q=0;q<3;++q)
			{
				objs[currobj].sum[q] += vertexdata[vertexdata.length-1][q];
			}
		}
		else if(L[0] === "mtllib")
		{
			var ML = fs.readFileSync(L[1],{encoding:"utf8"});
			ML = ML.split("\n");
			var mname;
			for(var m=0;m<ML.length;++m)
			{
				var tmp = ML[m].split(" ");
				if(tmp[0] === "newmtl")
				{
					mname = tmp[1];
					mdict[mname]={};
				}
				else if(tmp[0] === "map_Kd")
				{
					mdict[mname].map_Kd = tmp[1];
				}
				else if(tmp[0] == "map_Bump")
				{
					mdict[mname].map_Bump = tmp[1];
				}
			}
		}
		else if(L[0] === "usemtl")
		{
			currmtl = L[1];
		}
		else if(L[0] === "vt")
		{
			texturedata.push([parseFloat(L[1]),parseFloat(L[2])]);
		}
		else if(L[0] === "vn")
		{
			normaldata.push([parseFloat(L[1]),parseFloat(L[2]),parseFloat(L[3])]);
		}
		else if (L[0] === "f")
		{
			if(L[4] != undefined)
			{
				throw new Error("Must have exactly 3 verticies!");
			}
			//Complete me  Do for L[1] - L[3]
			var t = [];
			for(var i=1;i<4;++i)
			{
				var tmp = L[i].split("/");
				//console.log(tmp);
				var vi = parseInt(tmp[0],10)-1;
				var ti = tmp[1];
				
				if( ti === undefined || ti.length === 0  )
				{
                    ti = 0;
				}
                else
				{
                    ti = parseInt(ti,10)-1;
				}
					
				var ni = parseInt(tmp[2],10)-1;
				
				//console.log(vi+"vi",ti+"ti",ni+"ni");
				t.push(vi,ti,ni);
			}
			triangles.push(t);
			//Completes through slide # 12.glTextures
		}
	}

	var vdata = [];
	var nv = 0;
	var num_floats = 8;//Used to be 5;
	var idata = [];
	var vmap = {};
	
	for(var ii=0;ii<triangles.length;ii++)
	{
		var T = triangles[ii];
		//console.log(T);
		for(var j=0;j<3;j++)
		{
			//console.log(T);
			var vii = T[j*3];
			//console.log(vi);
			var tii = T[j*3+1];
			//console.log(ti);
			var nii = T[j*3+2];
			//console.log(ni);
			var key = vii+","+tii+","+nii;
			if(vmap[key] === undefined)
			{
				vmap[key]=vdata.length/num_floats;
				vdata.push(
					vertexdata[vii][0],
					vertexdata[vii][1],
					vertexdata[vii][2],
					texturedata[tii][0],
					texturedata[tii][1],
					normaldata[nii][0],
					normaldata[nii][1],
					normaldata[nii][2],
					0,0,0);//Tangent Placeholder
				nv++;
			}
			idata.push(vmap[key]);
		}
	}
	
	for(var tii=0;tii<idata.length;tii+=3)
	{
		var qi = idata[tii];
		var ri = idata[tii+1];
		var si = idata[tii+2];
		
		var q = [vdata[qi*11], vdata[qi*11+1], vdata[qi*11+2]];
		var r = [vdata[ri*11], vdata[ri*11+1], vdata[ri*11+2]];
		var s = [vdata[si*11], vdata[si*11+1], vdata[si*11+2]];
		
		var qtex = [vdata[qi*11+3],vdata[qi*11+4]];
		var rtex = [vdata[ri*11+3],vdata[ri*11+4]];
		var stex = [vdata[si*11+3],vdata[si*11+4]];
		
		var r_ = sub(r,q); //r prime
		var s_ = sub(s,q); //S prime
		var r_tex = sub(rtex,qtex); // rprime of s
		var s_tex = sub(stex,qtex); // sprime o s
		// End of 31
		
		var tmp = 1.0/(r_tex[0]*s_tex[1]-s_tex[0]*r_tex[1]);
		var R00 = tmp*s_tex[1]; // entries of R^-10
		var R01 = tmp*-r_tex[1];
		var T = [
		    R00*r_[0]+R01*s_[0],
			R00*r_[1]+R01*s_[1],
			R00*r_[2]+R01*s_[2]];
		for(var tmp=0;tmp<3;++tmp)//Setup x,y,z
		{
			vdata[qi*11+8+tmp] += T[tmp];
			vdata[ri*11+8+tmp] += T[tmp];
			vdata[si*11+8+tmp] += T[tmp];
		}
	}
	
	//Normalize tangents
	for(var i=0;i<vdata.length;i+=11)
	{
		var x=vdata[i+8];
		var y=vdata[i+9];
		var z=vdata[i+10];
		var len = Math.sqrt(x*x+y*y+z*z);
		x /= len;
		y /= len;
		z /= len;
		vdata[i+8]=x;
		vdata[i+9]=y;
		vdata[i+10]=z;
	}
	
	var ofp = new writer(infile+".mesh");
	ofp.write("mesh_3\n");
	ofp.write("verticies "+vdata.length+"\n");
	ofp.write("indicies "+idata.length+"\n");
	
	for(var k in objs)
	{
		var tmp = objs[k].sum;
		tmp[0] /= objs[k].numv;
		tmp[1] /= objs[k].numv;
		tmp[2] /= objs[k].numv;
		ofp.write("centroid "+k+" "+tmp[0]+" "+tmp[1]+" "+tmp[2]+"\n");
	}
	if(mdict[currmtl].map_Kd !== undefined)
	{
		ofp.write("texture_file "+mdict[currmtl].map_Kd+"\n");
	}
	if(mdict[currmtl].map_Bump !== undefined)
	{
		ofp.write("bump_map"+mdict[currmtl].map_Bump+"\n");
	}
	
	//Write out the vertex_data indicator
	ofp.write("vertex_data");	
	//ofp.write("\nDATA_START");
	while( (ofp.tell()+1) % 4 !== 0 )
	{
		ofp.write(" ");
	}
	ofp.write("\n");
	
	var b = new Buffer(vdata.length*4);
	for(var bb=0;bb<vdata.length;bb++)
	{		
		//console.log(vdata[bb]);
		b.writeFloatLE(vdata[bb],bb*4);
	}
	//console.log(ofp.tell());
	ofp.write(b);
	
	// ##### @@@ ### //
	
	//Write out index_data indicator
	ofp.write("index_data");
	//ofp.write("\nDATA_START");
	while( (ofp.tell()+1) % 4 !== 0 )
	{
		ofp.write(" ");
	}
	ofp.write("\n");
	
	var c = new Buffer(idata.length*2);
	for(var xx = 0;xx<idata.length;xx++)
	{
		//console.log(idata[xx]);
		c.writeUInt16LE(idata[xx],xx*2);
	}
	//console.log(ofp.tell());
	ofp.write(c);
	console.log(vdata.length/num_floats,"VDATA Verticies");
	console.log(idata.length/3,"Triangles LENGTH");
	ofp.end();
}
main();