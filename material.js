function Material(gl){
  this.gl = gl;
  this.shader = new ShaderProgram(gl);
  this.texture = new Texture(gl);
  this.textures = [this.texture];
  
}

Material.prototype.setShader = function(shader){
  this.shader = shader;
}

Material.prototype.setTexture = function(texture){
  this.texture = texture;
  this.textures[0] = texture;
}

Material.prototype.addTexture = function(texture){
  this.textures[this.textures.length] = texture;

  for(var i = 0; i < this.textures.length; i++){
    console.debug(this.textures[i]);
  }
}

Material.prototype.bind = function(mesh){
  for(var i = 0; i < this.textures.length; i++){
    this.textures[i].activate();
  }
  this.shader.bind(mesh);
}

Material.prototype.setUniforms = function(mv, mvIT, p, time){
  this.shader.setUniforms(mv, mvIT, p, time);
}


