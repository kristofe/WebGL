function Material(gl){
  this.gl = gl;
  this.shader = new ShaderProgram(gl);
  this.texture = new Texture(gl);
  
}

Material.prototype.setShader = function(shader){
  this.shader = shader;
}

Material.prototype.setTexture = function(texture){
  this.texture = texture;
}

Material.prototype.bind = function(mesh){
  this.shader.bind(mesh);
}

Material.prototype.setUniforms = function(mv, mvIT, p){
  this.shader.setUniforms(mv, mvIT, p);
}


