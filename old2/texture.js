"use strict";

function Texture(gl) {
  this.gl = gl;
  this.glTexture = -1;
  this.glTextureUnit = 0;
  this.image = {};
  this.name = "";
  this.loaded = false;
  this.renderbuffer = -1;
  this.framebuffer = -1;
  this.fbo = false;
  this.depthBuffer = false;
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

Texture.prototype.deactivate = function() {
  if(this.loaded){
    gl.activeTexture(gl.TEXTURE0 + this.glTextureUnit);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}


Texture.prototype.bindFBO = function() {
  gl.bindTexture( gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
};

Texture.prototype.unbindFBO = function() {
  gl.bindFramebuffer( gl.FRAMEBUFFER, null); 
};

Texture.prototype.setupFBO = function(width, height, create){
  this.fbo = true;
  this.loaded = true;
  // 1. Init Color Texture 
  if(create){
    this.glTexture = gl.createTexture(); 
  }
  gl.bindTexture( gl.TEXTURE_2D, this.glTexture);
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); 
  gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, 
                 gl.UNSIGNED_BYTE, null);

  // 2. Init Render Buffer 
  if(create){
    this.renderbuffer = gl.createRenderbuffer();
  }
  gl.bindRenderbuffer( gl.RENDERBUFFER, this.renderbuffer); 
  gl.renderbufferStorage( gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

  // 3. Init Frame Buffer
  if(create){
    this.framebuffer = gl.createFramebuffer();
  }
  gl.bindFramebuffer( gl.FRAMEBUFFER, this.framebuffer); 
  gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
                           this.glTexture, 0);
  gl.framebufferRenderbuffer( gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, 
                              gl.RENDERBUFFER, this.renderbuffer);

  var stat = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if(stat != gl.FRAMEBUFFER_COMPLETE){
    throw("FBO Not Complete");
  }


  // 4. Cleanup
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer( gl.FRAMEBUFFER, null); 

};

/*
var colorTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, colorTexture);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

// Create the depth buffer
var depthBuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);

// Create the framebuffer
var framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
*/
Texture.prototype.setupDepthFBO = function(width, height){
  this.fbo = true;
  this.loaded = true;
  this.depthBuffer = true;
  //this.glTextureUnit = 0;
  // Create a color texture
  var tmpTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tmpTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, 
                gl.UNSIGNED_BYTE, null);

  // Create the depth texture
  this.glTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0, 
                gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, 
                          tmpTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, 
                          this.glTexture, 0);

  if(!gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
            console.error("Framebuffer incomplete!");
        }
        
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
