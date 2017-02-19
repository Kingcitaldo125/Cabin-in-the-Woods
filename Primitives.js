//X is the output of one of the tdl.primitive create functions
function Primitive(X,opts){
    var tmp={}
    tmp.position=X.position;
    tmp.texCoord=X.texCoord;
    tmp.normal=X.normal;
    var TB = tdl.primitives.createTangentsAndBinormals(X.position,X.normal,X.texCoord,X.indices);
    tmp.tangent=TB.tangent;
    tmp.indices=X.indices;
    
    var tmp2 = this.combineBuffers(tmp);
    var vdata = tmp2.vdata;
    var idata = tmp2.idata;
    
    
    if(opts===undefined)
        opts={};
    
    opts.vdata=vdata;
    opts.idata=idata;
    this.m = new SubMesh(undefined,undefined,opts);
}

Primitive.prototype.setup = function(){
    this.m.setup();
}

Primitive.prototype.draw = function(prog){
    this.m.draw(prog);
}

Primitive.prototype.vertex = function(idx){
    return this.m.vertex(idx);
}

//X will be the output of one of the tdl create functions.
Primitive.prototype.combineBuffers = function(X){
    
    var ne = X.position.numElements;
    var A=new Float32Array( ne * 16 );
    var idx=0;
    for(var i=0;i<ne;++i){
        var p = X.position.getElement(i);
        A[idx++] = p[0];
        A[idx++] = p[1];
        A[idx++] = p[2];
        A[idx++] = 1.0;
        p = X.texCoord.getElement(i);
        A[idx++] = p[0];
        A[idx++] = p[1];
        A[idx++] = 0;
        A[idx++] = 0;
        p = X.normal.getElement(i);
        A[idx++] = p[0];
        A[idx++] = p[1];
        A[idx++] = p[2];
        A[idx++] = 0;
        p = X.tangent.getElement(i);
        A[idx++] = p[0];
        A[idx++] = p[1];
        A[idx++] = p[2];
        A[idx++] = 0;
    }
    ne = X.indices.numElements;
    var I = new Uint16Array(ne*3);
    idx=0;
    for(var i=0;i<ne;++i){
        var p = X.indices.getElement(i);
        I[idx++] = p[0];
        I[idx++] = p[1];
        I[idx++] = p[2];
    }
    return { vdata: A, idata: I };
}
