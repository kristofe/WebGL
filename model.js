function Model(gl){
  this.gl = gl;
  this.material = new Material(gl);
  this.mesh = new Mesh(gl);
  this.transform = new Transform();
  
}


Model.prototype.draw = function(projMat){
 
  this.material.bind(this.mesh);
  this.material.setUniforms(this.transform.matrix.m,this.transform.inverse.m, projMat.m);
  this.gl.drawArrays(
                this.mesh.primitiveType,
                0, 
                this.mesh.vertexBuffer.numItems
                );
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


