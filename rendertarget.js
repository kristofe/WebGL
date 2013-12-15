"use strict";

function RenderTarget(gl, width, height){
  this.gl = gl;
  this.texture = new Texture(gl);
  this.width = width;
  this.height = height;
  this.texture.setupFBO(width, height, true);
  this.transform = new Transform();

  //Debug stuff
  this.debugMesh = new Mesh(gl);
  this.debugMaterial = new Material(gl);
  this.debugMesh.createScreenQuad(new Vector2(-1,-1), new Vector2(-0.5, -0.5));
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
  fsSource +="    varying vec3 vNormal;\n";
  fsSource +="    varying vec3 vTangent;\n";
  fsSource +="    varying vec3 vBitangent;\n";
  fsSource +="    varying vec4 vVertColor;\n";
  fsSource +="\n";
  fsSource +="    uniform sampler2D uTexture01;\n";
  fsSource +="    uniform sampler2D uTexture02;\n";
  fsSource +="    uniform float uTime;\n";
  fsSource +="    uniform mat4 uMVMatrix;\n";
  fsSource +="\n";
  fsSource +="    void main(void) {\n";
  //fsSource +="      float t= sin(gl_PointCoord.x * 0.01 + uTime);\n"
  //fsSource +="      vec3 color = vec3(t,t,t);\n"
  fsSource +="      vec3 color = texture2D(uTexture01, vUV * 2.0).rgb;\n"
  fsSource +="      gl_FragColor = vec4(color, 1.0);\n"
  fsSource +="    }\n";

  var vsSource="  precision mediump float;\n";
  vsSource +="    attribute vec3 aVertexPosition;\n";
  vsSource +="    attribute vec3 aVertexNormal;\n";
  vsSource +="    attribute vec2 aVertexUV;\n";
  vsSource +="    attribute vec4 aVertexTangent;\n";
  vsSource +="    attribute vec4 aVertexColor;\n";
  vsSource +="\n";
  vsSource +="    uniform mat4 uMVMatrix;\n";
  vsSource +="    uniform mat4 uInverse;\n";
  vsSource +="    uniform mat4 uInverseTranspose;\n";
  vsSource +="    uniform mat4 uPMatrix;\n";
  vsSource +="    uniform sampler2D uTexture01;\n";
  vsSource +="    uniform sampler2D uTexture02;\n";
  vsSource +="    uniform float uTime;\n";
  vsSource +="\n";
  vsSource +="    varying vec4 vPosition;\n";
  vsSource +="    varying vec2 vUV;\n";
  vsSource +="    varying vec3 vNormal;\n";
  vsSource +="    varying vec3 vTangent;\n";
  vsSource +="    varying vec3 vBitangent;\n";
  vsSource +="    varying vec4 vVertColor;\n";
  vsSource +="\n";
  vsSource +="    void main(void) {\n";
  vsSource +="        vPosition = vec4(aVertexPosition,1.0);\n";
  vsSource +="        vVertColor = aVertexColor;\n";
  vsSource +="        vUV = aVertexUV.xy;\n";
  vsSource +="        vNormal = aVertexNormal.xyz;\n";
  vsSource +="        vTangent = aVertexTangent.xyz;\n";
  vsSource +="        gl_PointSize = 4.0;\n";
  vsSource +="        vec4 pos = vec4(aVertexPosition, 1.0);\n";
  vsSource +="        gl_Position = vec4(pos.xy, 0.0, 1.0);\n";
  vsSource +="    }\n";

  this.debugMaterial.shader.initShaderWithSource(fsSource,vsSource);
  this.debugMaterial.zTest = false;
  this.debugMaterial.zWrite = false;
  this.debugMaterial.lineWidth = 1.0;

};

