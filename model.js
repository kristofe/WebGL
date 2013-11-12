function Model(gl){
  this.gl = gl;
  this.material = new Material(gl);
  this.mesh = new Mesh(gl);
  this.transform = new Transform();
  
}

Model.prototype.draw = function(projMat, time){
 
  this.material.bind(this.mesh);
  this.material.setUniforms(
      this.transform.matrix.m,
      this.transform.inverse.m,
      this.transform.inverseTranspose.m,
      projMat.m, 
      time
      );
  if(this.mesh.indexBuffer == -1){
    this.gl.drawArrays(
                  this.mesh.primitiveType,
                  0, 
                  this.mesh.vertexBuffer.numItems
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


