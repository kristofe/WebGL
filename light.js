"use strict";

function Light(gl){
  this.gl = gl;
  this.transform = new Transform();
  this.projection = new Matrix44();
  
  this.projection.perspective(90 * Math.PI/180.0, 1.0, 0.1, 20.0);
}

