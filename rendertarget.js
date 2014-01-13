"use strict";

function RenderTarget(gl, width, height){
  this.gl = gl;
  this.texture = new Texture(gl);
  this.width = width;
  this.height = height;
  this.texture.setupFBO(width, height, true);
  this.transform = new Transform();

}

RenderTarget.prototype.initDebugData = function(min, max){
  //Debug stuff
  this.debugMesh = new Mesh(gl);
  this.debugMaterial = new Material(gl);
  this.debugMesh.createScreenQuad(min, max);
  this.setupMaterial();
}

RenderTarget.prototype.getTexture = function(){
  return this.texture;
};

RenderTarget.prototype.viewportSync = function(width, height){
  if(this.width != width || this.height  != height){
    this.width = width;
    this.height = height;
    this.texture.setupFBO(width, height, false);
  }
};

RenderTarget.prototype.bind = function(){
  this.texture.bindFBO();
};

RenderTarget.prototype.unbind = function(){
  this.texture.unbindFBO();
};




///////////////////////////////////////////////////////////////////////////////
// Debug Drawing routines
///////////////////////////////////////////////////////////////////////////////

RenderTarget.prototype.debugDraw = function(projMat, time){
 
  this.debugMaterial.bind(this.debugMesh);
  this.debugMaterial.setUniforms(
      this.transform.matrix.m,
      this.transform.inverse.m,
      this.transform.inverseTranspose.m,
      projMat.m, 
      time
      );
  this.gl.drawArrays(this.debugMesh.primitiveType, 0, this.debugMesh.numItems);
};

RenderTarget.prototype.setupMaterial = function(gl){
  var fsSource="  precision mediump float;\n";
  fsSource +="\n";
  fsSource +="    varying vec4 vPosition;\n";
  fsSource +="    varying vec2 vUV;\n";
  fsSource +="    varying vec4 vColor;\n";
  fsSource +="\n";
  fsSource +="    uniform sampler2D uTexture01;\n";
  fsSource +="\n";
  fsSource +="    void main(void) {\n";
  //fsSource +="      float t= sin(gl_PointCoord.x * 0.01 + uTime);\n"
  //fsSource +="      vec3 color = vec3(t,t,t);\n"
  fsSource +="      vec3 color = texture2D(uTexture01, vUV).rgb;\n"
  fsSource +="      gl_FragColor = vec4(color, 1.0);\n"
  fsSource +="    }\n";

  var vsSource="  precision mediump float;\n";
  vsSource +="    attribute vec3 aPosition;\n";
  vsSource +="    attribute vec2 aUV;\n";
  vsSource +="\n";
  vsSource +="    uniform sampler2D uTexture01;\n";
  vsSource +="\n";
  vsSource +="    varying vec4 vPosition;\n";
  vsSource +="    varying vec2 vUV;\n";
  vsSource +="\n";
  vsSource +="    void main(void) {\n";
  vsSource +="        vUV = aUV.xy;\n";
  vsSource +="        gl_Position = vec4(aPosition,1.0);\n";
  vsSource +="    }\n";

  this.debugMaterial.shader.initShaderWithSource(fsSource,vsSource);
  this.debugMaterial.zTest = false;
  this.debugMaterial.zWrite = false;
  this.debugMaterial.lineWidth = 1.0;
  this.debugMaterial.setTexture(this.texture);

};

