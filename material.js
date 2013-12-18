"use strict";

function Material(gl){
  this.gl = gl;
  this.shader = new ShaderProgram(gl);
  this.texture = new Texture(gl);
  this.textures = [this.texture];
  this.name = "";
  this.id = -1;
  this.zTest = true;
  this.zWrite = true;
  this.culling = true;
  this.lineWidth = 1.0;
  this.pointSize = 2.0;
  
}

Material.prototype.setShader = function(shader){
  this.shader = shader;
}

Material.prototype.setTexture = function(texture){
  this.texture = texture;
  this.textures[0] = texture;
}

Material.prototype.addTexture = function(texture){
  if(this.textures.length == 0){
    this.setTexture(texture);
  }
  else{
    this.textures.push(texture);
  }

  for(var i = 0; i < this.textures.length; i++){
    console.debug(this.textures[i]);
  }
}

Material.prototype.bind = function(mesh){
  for(var i = 0; i < this.textures.length; i++){
    this.textures[i].activate();
  }
  this.shader.bind(mesh);
  if(this.culling){
    this.gl.enable(this.gl.CULL_FACE);
  }else{
    this.gl.disable(this.gl.CULL_FACE);
  }
  if(this.zTest){
    this.gl.enable(this.gl.DEPTH_TEST);
  }else{
    this.gl.disable(this.gl.DEPTH_TEST);
  }
  /*
  if(this.zWrite){
    this.gl.depthMask(this.gl.TRUE);
  }else{
    this.gl.depthMask(this.gl.FALSE);
  }
  */
  this.gl.depthMask(this.zWrite);
  this.gl.lineWidth(this.lineWidth);


  //this.gl.enable(this.gl.VERTEX_PROGRAM_POINT_SIZE);
  //this.gl.enable(this.gl.POINT_SMOOTH);


}

//DEPRECATED
//TODO: REMOVE THIS FUNCTION
Material.prototype.setUniforms = function(mv, mInverse, mInverseTranspose, p, time){
  this.shader.setUniforms(mv, mInverse, mInverseTranspose, p, time);
}
Material.prototype.setModelUniforms = function(model){
  this.shader.setModelUniforms(model);
};

Material.prototype.setRendererUniforms = function(renderer){
  this.shader.setRendererUniforms(renderer);
}

