"use strict";

var Camera = function(opts){
    if( opts === undefined )
        opts={};
        
    var fov=opts.fov;
    var eye=opts.eye;
    var coi=opts.coi;
    var up = opts.up;
    var hither=opts.hither;
    var yon=opts.yon;
    fov = fov || 70.0;
    eye = eye || [0,0,0,1];
    coi = coi || [0,0,-1,1];
    up = up || [0,1,0,0];
    hither = hither || 0.1;
    yon = yon || 500.0;
    
    this.fov=fov;
    this.viewMatrix=tdl.identity();
    this.projMatrix=tdl.identity();
    this.hither = hither;
    this.yon = yon;
    this.make_proj_matrix();
    this.set_eye_coi(eye,coi,up);
}

Camera.prototype.set_eye_coi= function(eye,coi,up){
    up = up || [0,1,0,0];
    this.eye=[eye[0],eye[1],eye[2],1.0];
    this.coi=coi;
    var U,V,W;
    W = tdl.sub(eye,coi);
    U = tdl.cross(up,W);
    V = tdl.cross(W,U);
    this.W = tdl.normalize(W);
    this.U = tdl.normalize(U);
    this.V = tdl.normalize(V);
    this.make_view_matrix();
};

Camera.prototype.walk= function(amt){
    this.eye = tdl.addPV(this.eye,tdl.mul(amt,this.W));
    this.make_view_matrix();
},

Camera.prototype.shift= function(sx,sy){
    for(var i=0;i<3;++i){
        this.eye[i] += sx*this.U[i] + sy*this.V[i];
        this.coi[i] += sx*this.U[i] + sy*this.V[i];
    }
    this.make_view_matrix();
},

Camera.prototype.draw = function(prog){
    if( prog === undefined )
        throw new Error("Camera.draw expects program");
    if( this.ViewMatrix === undefined )
        this.make_view_matrix();
        
    prog.setUniform("viewMatrix",this.viewMatrix,true);
    prog.setUniform("projMatrix",this.projMatrix,true);
    prog.setUniform("viewProjMatrix",this.viewProjMatrix,true);
    prog.setUniform("hitheryon",[this.hither,this.yon,this.yon-this.hither],true);
    prog.setUniform("eyePos",this.eye);
},

Camera.prototype.make_view_matrix = function(){
    this.viewMatrix = tdl.mul(
        [1,0,0,0, 0,1,0,0, 0,0,1,0, -this.eye[0],-this.eye[1],-this.eye[2],1],
        [this.U[0],this.V[0],this.W[0],0,
         this.U[1],this.V[1],this.W[1],0,
         this.U[2],this.V[2],this.W[2],0,
         0,0,0,1]);
    
    this.viewProjMatrix = tdl.mul(this.viewMatrix,this.projMatrix);
},

Camera.prototype.make_proj_matrix = function(){
    var av = this.fov;
    var av=0.5*this.fov;
    var aspect_ratio = 1.0;
    var ah = av * aspect_ratio;
    var tanh = Math.tan(ah/180.0*Math.PI);
    var tanv = Math.tan(av/180.0*Math.PI);
    var hither = this.hither;
    var yon = this.yon;
    var L = -hither * tanh;
    var R = hither * tanh;
    var B = -hither * tanv;
    var T = hither * tanv;
    var M = [2*hither/(R-L),     0,                  0,                              0,
         0,                  2*hither/(T-B),     0,                              0,
         1+2*L/(R-L),       1+2*B/(T-B),       (hither+yon)/(hither-yon),         (-1),
        0,                  0,                  (2*hither*yon)/(hither-yon),    0
    ];
    this.projMatrix = M;
    this.viewProjMatrix = tdl.mul(this.viewMatrix,this.projMatrix);
}
