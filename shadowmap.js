"use strict";

function ShadowMap(gl, width, height){
  this.gl = gl;
  this.texture = new Texture(gl);
  this.texture.glTextureUnit = 2;
  this.width = width;
  this.height = height;
  this.texture.setupDepthFBO(width, height);
  this.texture.showDepth = true;
  this.transform = new Transform();

  //Debug stuff
  this.debugMesh = new Mesh(gl);
  this.debugMaterial = new Material(gl);
  this.debugMesh.createScreenQuad(new Vector2(-1,-1), new Vector2(-0.5, -0.5));
  this.setupMaterial();
}

ShadowMap.prototype.getTexture = function(){
  return this.texture;
};


ShadowMap.prototype.bind = function(){
  this.texture.bindFBO();
};

ShadowMap.prototype.unbind = function(){
  this.texture.unbindFBO();
};

///////////////////////////////////////////////////////////////////////////////
// Debug Drawing routines
///////////////////////////////////////////////////////////////////////////////

ShadowMap.prototype.debugDraw = function(projMat, time, renderer){
 
  this.debugMaterial.bind(this.debugMesh);
  this.debugMaterial.setModelUniforms(this);
  this.debugMaterial.setRendererUniforms(renderer);
  /*
  this.debugMaterial.setUniforms(
      this.transform.matrix.m,
      this.transform.inverse.m,
      this.transform.inverseTranspose.m,
      projMat.m, 
      time
      );
  */
  this.gl.drawArrays(this.debugMesh.primitiveType, 0, this.debugMesh.numItems);
};

ShadowMap.prototype.setupMaterial = function(gl){
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
  fsSource +="    uniform sampler2D uShadowMap;\n";
  fsSource +="    uniform float uTime;\n";
  fsSource +="    uniform mat4 uMVMatrix;\n";
  fsSource +="\n";
  fsSource +="    float LinearizeDepth(vec2 uv)\n";
  fsSource +="    {\n";
  fsSource +="      float n = 0.1; // camera z near\n";
  fsSource +="      float f = 20.0; // camera z far\n";
  fsSource +="      float z = texture2D(uShadowMap, uv).x;\n";
  fsSource +="      return (2.0 * n) / (f + n - z * (f - n));\n";	
  fsSource +="    }\n";
  fsSource +="    void main(void) {\n";
  //fsSource +="      float t= sin(gl_PointCoord.x * 0.01 + uTime);\n"
  //fsSource +="      vec3 color = vec3(t,t,t);\n"
  //fsSource +="      vec3 color = texture2D(uTexture01, vUV).rgb;\n"
  fsSource +="      vec3 color = vec3(LinearizeDepth(vUV));\n"
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
  vsSource +="    uniform sampler2D uShadowMap;\n";
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
  this.debugMaterial.setTexture(this.texture);

};

