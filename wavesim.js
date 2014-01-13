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

  //this.debugDraw(renderer);
};

WaveSim.prototype.debugDraw = function(renderer){
  this.rt0.debugDraw(renderer.currentCamera.projection.m, renderer.currTime);
  this.rt1.debugDraw(renderer.currentCamera.projection.m, renderer.currTime);
};


WaveSim.prototype.setupMaterial = function(gl){
  var fsSource= " precision mediump float;\n\
    uniform vec2 uViewportSize;\n\
    uniform vec2 uMouseLocation;\n\
    uniform float uMouseRadius;\n\
    varying vec2 vUV;\n\
\n\
    void main(void) {\n\
      vec4 orig_color = vec4(0, 0, 0, 1.0);\n\
      vec4 mouse_color = vec4(1, 1, 1, 1.0);\n\
\n\
      float dist = length(\n\
                          vec2(gl_FragCoord) - \n\
                          vec2(uMouseLocation.x - uMouseRadius,\n\
                               uMouseLocation.y + uMouseRadius\n\
                              )\n\
                         );\n\
      float t =  clamp(dist/uMouseRadius, 0.0, 1.0);\n\
\n\
      gl_FragColor = mix(mouse_color, orig_color, t);\n\
    } ";

  var vsSource= " precision mediump float;\n\
    attribute vec3 aPosition;\n\
    attribute vec3 aNormal;\n\
    attribute vec2 aUV;\n\
    attribute vec4 aColor;\n\
\n\
    uniform mat4 uMVMatrix;\n\
    uniform mat4 uInverse;\n\
    uniform mat4 uInverseTranspose;\n\
    uniform mat4 uPMatrix;\n\
    uniform float uTime;   \n \
    uniform sampler2D uTexture01;\n\
    uniform sampler2D uTexture02;\n\
    uniform vec2 uMouseLocation;\n\
    uniform float uMouseRadius;\n\
\n\
    varying vec2 vUV;\n\
    varying vec3 vNormal;\n\
    varying vec3 vTangent;\n\
    varying vec4 vVertColor;\n\
\n\
\n\
    void main(void) {\n\
\n\
        //gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);\n\
        gl_Position = vec4(aPosition, 1.0);\n\
        vVertColor = aColor;\n\
        \n\
        vUV = aUV.xy;\n\
        vec3 norm = mat3(uInverseTranspose) * normalize(aNormal);\n\
        vNormal = norm.xyz;\n\
    }\n\
   ";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 1.0;
  //this.material.setTexture(this.texture);

};
