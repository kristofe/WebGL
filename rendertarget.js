"use strict";

function RenderTarget(gl){
  this.gl = gl;
  this.mesh = new Mesh(gl);
  this.material = new Material(gl);
}

RenderTarget.prototype.draw = function(projMat, time){
 
  this.material.bind(this.mesh);
  this.material.setUniforms(
      this.transform.matrix.m,
      this.transform.inverse.m,
      this.transform.inverseTranspose.m,
      projMat.m, 
      time
      );
  this.gl.drawArrays(this.mesh.primitiveType, 0, this.mesh.numItems);
}

