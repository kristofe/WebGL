"use strict";

function Camera(gl){
  this.gl = gl;
  this.transform = new Transform();
  this.projection = new Matrix44();
  this.perspective(
                   60.0,
                   gl.viewportWidth / gl.viewportHeight, 
                   0.1, 
                   20.0
                  );
}

Camera.prototype.perspective = function( fov, aspect, near, far){
  this.projection.perspective(fov * Math.PI/180.0, aspect, near, far);
};


