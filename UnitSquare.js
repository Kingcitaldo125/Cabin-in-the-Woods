"use strict";

function UnitSquare(d)
{
    if( d === undefined) d=0;
    var vdata;
    vdata=new Float32Array(
	[-1,1,d,   0,1,   0,0,1,
	 -1,-1,d,  0,0,   0,0,1,
	 1,1,d,    1,1,   0,0,1,
     1,-1,d,   1,0,   0,0,1]);
	/*
          [ -1, 1,d,1,   0,1,0,0,    0,0,1,0,
            -1,-1,d,1,   0,0,0,0,    0,0,1,0,
             1, 1,d,1,   1,1,0,0,    0,0,1,0,
             1,-1,d,1,   1,0,0,0,    0,0,1,0] ); */
    var vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vb);
    gl.bufferData(gl.ARRAY_BUFFER,vdata,gl.STATIC_DRAW);
    this.vbuff=vb;
}

UnitSquare.prototype.draw = function(prog)
{
    gl.bindBuffer(gl.ARRAY_BUFFER,this.vbuff);
    prog.setVertexFormat
	(
	"position",3,gl.FLOAT,
	"texcoord",2,gl.FLOAT,
	"normal",3,gl.FLOAT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
}