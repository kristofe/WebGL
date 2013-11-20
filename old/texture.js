"use strict";

function Texture(gl) {
  this.gl = gl;
  this.glTexture = -1;
  this.glTextureUnit = 0;
  this.image = {};
  this.name = "";
  this.loaded = false;
}

Texture.prototype.load = function(name, unit) {
  console.debug("Starting loadTexture " + name + " " + this.gl);
  this.name = name;
  this.glTexture = gl.createTexture(); 
  this.glTextureUnit = unit;
  this.image = new Image();
  var tex = this;
  this.image.onload = function() {tex.loadTextureComplete();};
  this.image.src = name;
}

Texture.prototype.loadTextureComplete = function(){
  var gl = this.gl;
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0 + this.glTextureUnit);
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  this.loaded = true;
}

Texture.prototype.activate = function() {
  if(this.loaded){
    gl.activeTexture(gl.TEXTURE0 + this.glTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  }
}

