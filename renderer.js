"use strict";

function Renderer(gl, canvas) {
  this.gl = gl;
  this.viewportWidth = canvas.width;
  this.viewportHeight = canvas.height;
  this.canvas = canvas;
  this.glExtensions = {};
  this.currentCamera = new Camera(gl);
  this.currentLight = new Light(gl);
  this.cameras = [this.currentCamera];
  this.lights = [this.currentLight];
  this.mousePos = new Vector2(0,0);
  this.mouseRadius = 10.0;
  this.renderFromLight = 0;
  this.currTime = 0;
}

Renderer.prototype.drawModel = function(model) {
  model.material.bind(model.mesh);
  model.material.setModelUniforms(model);
  model.material.setRendererUniforms(renderer);
  if(model.mesh.indexBuffer == -1){
    model.gl.drawArrays(
                  model.mesh.primitiveType,
                  0, 
                  model.mesh.numItems
                  );
  }
  else{
    model.gl.bindBuffer(gl.ARRAY_BUFFER,model.mesh.vertexBuffer);
    model.gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,model.mesh.indexBuffer);
    model.gl.drawElements(
                  model.mesh.primitiveType,
                  model.mesh.indices.length()/3, 
                  gl.UNSIGNED_SHORT,
                  0 
                  );
  }
};

Renderer.prototype.loadAllExtensions = function() {
  var extTFL = gl.getExtension("OES_texture_float_linear");
  if(undefined != extTFL) {
    console.log("OES_texture_float_linear found");
    this.glExtensions["OES_texture_foat_linear"] = extTFL;
  }

  var extTF = gl.getExtension("OES_texture_float");
  if(undefined != extTF){
    console.log("OES_texture_float found");
    this.glExtensions["OES_texture_float"] = extTF;
  }

  var extDT = gl.getExtension("WEBKIT_WEBGL_depth_texture");
  if(undefined != extDT){
    console.log("WEBKIT_WEBGL_depth_texture found");
    this.glExtensions["WEBKIT_WEBGL_depth_texture"] = extDT;
  }

  var extIA = gl.getExtension("ANGLE_instanced_arrays");
  if(undefined != extIA){
    console.log("ANGLE_instanced_arrays found");
    this.glExtensions["ANGLE_instanced_arrays"] = extIA;
  }

};

Renderer.prototype.loadDepthTextureExtension = function(){
  var success = false;
  var extDT = gl.getExtension("WEBKIT_WEBGL_depth_texture");
  if(undefined != extDT){
    console.log("WEBKIT_WEBGL_depth_texture found");
    this.glExtensions["WEBKIT_WEBGL_depth_texture"] = extDT;
    success = true;
  }
  return success;
};

Renderer.prototype.loadFloatingPointLinearTextureExtension = function() {
  var success = false;
  var extTFL = gl.getExtension("OES_texture_float_linear");
  if(undefined != extTFL) {
    console.log("OES_texture_float_linear found");
    this.glExtensions["OES_texture_foat_linear"] = extTFL;
    success = true;
  }

  return success;
};

Renderer.prototype.loadFloatingPointTextureExtension = function() {
  var success = false;

  var extTF = gl.getExtension("OES_texture_float");
  if(undefined != extTF){
    console.log("OES_texture_float found");
    this.glExtensions["OES_texture_float"] = extTF;
    success = true;
  }
  return success;
};

Renderer.prototype.loadInstancingExtension = function() {
  var success = false;
  var extIA = gl.getExtension("ANGLE_instanced_arrays");
  if(undefined != extIA){
    console.log("ANGLE_instanced_arrays found");
    this.glExtensions["ANGLE_instanced_arrays"] = extIA;
    success = true;
  }
  return success;

};
