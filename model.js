"use strict";

function Model(gl){
  if(gl == undefined)
    return;

  this.gl = gl;
  this.material = new Material(gl);
  this.mesh = new Mesh(gl);
  this.transform = new Transform();
  
}

Model.prototype.drawRenderer = function(renderer){
  this.draw(renderer.currentCamera.projection, renderer.currTime, renderer);
};

Model.prototype.draw = function(projMat, time, renderer){
 
  this.material.bind(this.mesh);
  //this.mesh.bind(this.material.shader);
  this.material.setUniforms(
      this.transform.matrix.m,
      this.transform.inverse.m,
      this.transform.inverseTranspose.m,
      projMat.m, 
      time
      );
  if(renderer != null){
    this.material.setRendererUniforms(renderer);
  }
  if(this.mesh.indexBuffer == -1){
    this.gl.drawArrays(
                  this.mesh.primitiveType,
                  0, 
                  this.mesh.numItems
                  );
  }
  else{
    this.gl.bindBuffer(gl.ARRAY_BUFFER,this.mesh.vertexBuffer);
    this.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.mesh.indexBuffer);
    this.gl.drawElements(
                  this.mesh.primitiveType,
                  this.mesh.indices.length()/3, 
                  gl.UNSIGNED_SHORT,
                  0 
                  );
  }
}

Model.prototype.bindMaterial = function(){
        this.material.shader.bind(this.mesh);
}
                

Model.prototype.setMaterial = function(material){
  this.shader = shader;
}

Model.prototype.setMesh = function(mesh){
  this.mesh = mesh;
}

Model.prototype.setTransform = function(transform){
  this.transform = transform;
}


