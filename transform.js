"use strict";

function Transform(){
  this.matrix = new Matrix44();
  this.inverse = new Matrix44();
  this.inverseTranspose = new Matrix44();
  this.position = new Vector3(0.0, 0.0, 0.0);
  this.scale = new Vector3(1.0,1.0,1.0);
  this.rotation = new Quaternion();
  
}

Transform.prototype.update = function(){
  this.matrix.identity();  
  //rts
  this.matrix.translate(this.position.x,this.position.y,this.position.z);
  this.matrix.rotate(this.rotation);
  this.matrix.scale(this.scale.x,this.scale.y,this.scale.z);

  this.inverse = this.matrix.clone().invert();
  this.inverseTranspose = this.inverse.clone().transpose();
}

Transform.prototype.setPosition = function(p){
  this.position = p;
  this.update();
}

Transform.prototype.setScale = function(s){
  this.scale = s;
  this.update();
}

Transform.prototype.setRotation = function(r){
  this.rotation = r;
  this.update();
}

Transform.prototype.rotateEulerAngles = function(r){

  this.rotation.fromEulerAngles(r);
  //this.rotation.rotateX(r.x);
  //this.rotation.rotateY(r.y);
  //this.rotation.rotateZ(r.z);
  this.update();
}

Transform.prototype.lookAt = function(target, up){
  this.matrix.lookAt(this.position, target, up);
  this.inverse = this.matrix.clone().invert();
  this.inverseTranspose = this.inverse.clone().transpose();
};


