for(var ti=0;ti<idata.length;ti+=3)
{
    var qi = idata[ti];
    var ri = idata[ti+1];
    var si = idata[ti+2];
    var q = [vdata[qi*11], vdata[qi*11+1], vdata[qi*11+2]];
    var r = [vdata[ri*11], vdata[ri*11+1], vdata[ri*11+2]];
    var s = [vdata[si*11], vdata[si*11+1], vdata[si*11+2]];
    var qtex = [vdata[qi*11+3],vdata[qi*11+4]]; //qs and qt
    var rtex = [vdata[ri*11+3],vdata[ri*11+4]]; //rs and rt
    var stex = [vdata[si*11+3],vdata[si*11+4]]; //ss and st
    var r_ = sub(r,q);  //r'
    var s_ = sub(s,q);  //s'
    var r_tex = sub(rtex,qtex); //r's and r't
    var s_tex = sub(stex,qtex); //s's and s't
	var tmp = 1.0/(r_tex[0]*s_tex[1]-s_tex[0]*r_tex[1]);
    var R00 = tmp*s_tex[1]; //entries of R-1
    var R01 = tmp*-r_tex[1];
    var T = [                   //tangent
        R00*r_[0]+R01*s_[0],
        R00*r_[1]+R01*s_[1],
        R00*r_[2]+R01*s_[2]
    ];
    for(var tmp=0;tmp<3;++tmp)
	{	//set x,y,z
        vdata[qi*11+8+tmp] += T[tmp];
        vdata[ri*11+8+tmp] += T[tmp];
        vdata[si*11+8+tmp] += T[tmp];
    }
}

//Normalize Tangents
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