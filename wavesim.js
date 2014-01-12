"use strict";

//Inherit from Model
WaveSim.prototype = new Model();
WaveSim.prototype.constructor = WaveSim;

function WaveSim(gl){
  Model.call(this, gl);

  this.mesh.createScreenQuad(new Vector2(-1,-1), new Vector2(1,1));
  this.rt0 = new RenderTarget(gl, 256,256);
  this.rt1 = new RenderTarget(gl, 256,256);

  this.rt0.debugMesh.createScreenQuad(new Vector2(-1,-1), new Vector2(-0.5, -0.5));
  this.rt1.debugMesh.createScreenQuad(new Vector2(-0.5,-0.5), new Vector2(0.0, 0.0));

  this.setupMaterial(this.gl);
}

WaveSim.prototype.drawRenderer = function(renderer){
  this.material.bind(this.mesh);
  this.material.setModelUniforms(this);
  this.material.setRendererUniforms(renderer);
  this.gl.drawArrays(
                      this.mesh.primitiveType,
                      0, 
                      this.mesh.numItems
                    );
};

RenderTarget.prototype.debugDraw = function(projMat, time){
  this.rt0.debugDraw(projMat, time);
  this.rt1.debugDraw(projMat, time);
};




WaveSim.prototype.setupMaterial = function(gl){
  var fsSource= " precision mediump float;\
    uniform vec2 uViewportSize;\
    uniform vec2 uMouseLocation;\
    uniform float uMouseRadius;\
    varying vec2 vUV;\
\
    void main(void) {\
      vec4 orig_color = vec4(0, 0, 0, 1.0);\
      vec4 mouse_color = vec4(1, 1, 1, 1.0);\
\
      float dist = length(\
                          vec2(gl_FragCoord) - \
                          vec2(uMouseLocation.x - uMouseRadius,\
                               uMouseLocation.y + uMouseRadius\
                              )\
                         );\
      float t =  clamp(dist/uMouseRadius, 0.0, 1.0);\
\
      gl_FragColor = mix(mouse_color, orig_color, t);\
    } ";

  var vsSource= " precision mediump float;\
    attribute vec3 aPosition;\
    attribute vec3 aNormal;\
    attribute vec2 aUV;\
    attribute vec4 aColor;\
\
    uniform mat4 uMVMatrix;\
    uniform mat4 uInverse;\
    uniform mat4 uInverseTranspose;\
    uniform mat4 uPMatrix;\
    uniform float uTime;    \
    uniform sampler2D uTexture01;\
    uniform sampler2D uTexture02;\
    uniform vec2 uMouseLocation;\
    uniform float uMouseRadius;\
\
    varying vec2 vUV;\
    varying vec3 vNormal;\
    varying vec3 vTangent;\
    varying vec4 vVertColor;\
\
\
    void main(void) {\
\
        gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);\
        vVertColor = aColor;\
        \
        vUV = aUV.xy;\
        vec3 norm = mat3(uInverseTranspose) * normalize(aNormal);\
        vNormal = norm.xyz;\
    }\
   ";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 1.0;
  this.material.setTexture(this.texture);

};
