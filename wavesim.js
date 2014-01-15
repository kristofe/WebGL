"use strict";

//Inherit from Model
WaveSim.prototype = new Model();
WaveSim.prototype.constructor = WaveSim;

function WaveSim(gl){
  Model.call(this, gl);

  this.mesh.createScreenQuad(new Vector2(-1,-1), new Vector2(1,1));
  this.rt0 = new RenderTarget(gl, 512,512, gl.FLOAT);
  this.rt1 = new RenderTarget(gl, 512,512, gl.FLOAT);
  this.rt0.initDebugData(new Vector2(-1,-1), new Vector2(-0.5, -0.5));
  this.rt1.initDebugData(new Vector2(-0.5,-1), new Vector2(0.0, -0.5));

  this.rt0.viewportSync(512,512);
  this.rt1.viewportSync(512,512);
  this.setupMaterial(this.gl);
}

WaveSim.prototype.drawRenderer = function(renderer){
  this.gl.clearColor(0.0, 0.0, 1.0, 1.0);
  this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.rt0.bind();
  this.drawQuad();
  this.rt0.unbind();

  this.drawQuad();
  this.debugDraw(renderer);

  this.swapRenderTargets();
};

WaveSim.prototype.drawQuad = function() {
  this.material.bind(this.mesh);
  this.material.setModelUniforms(this);
  this.material.setRendererUniforms(renderer);
  this.gl.drawArrays(
                      this.mesh.primitiveType,
                      0, 
                      this.mesh.numItems
                    );
};

WaveSim.prototype.swapRenderTargets = function() {
  var tmp = this.rt1;
  this.rt1 = this.rt0;
  this.rt0  = tmp;
  this.material.setTextureWithSlot(this.rt0.texture, 0);
  this.material.setTextureWithSlot(this.rt1.texture, 1);
};

WaveSim.prototype.debugDraw = function(renderer){
  this.rt0.debugDraw(renderer.currentCamera.projection.m, renderer.currTime);
  this.rt1.debugDraw(renderer.currentCamera.projection.m, renderer.currTime);
};


WaveSim.prototype.setupMaterial = function(gl){
  var fsSource= " precision mediump float;\n\
    uniform vec2 uViewportSize;\n\
    uniform vec2 uMouseLocation;\n\
    uniform sampler2D uTexture01;\n\
    uniform sampler2D uTexture02;\n\
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
      vec2 offset = vec2(1.0/512.0,1.0/512.0);\n\
      //vec2 offset = 1.0/uViewportSize;\n\
      vec2 hoffset = vec2(offset.x, 0);\n\
      vec2 voffset = vec2(0,offset.y);\n\
      vec4 tex0 =  texture2D(uTexture02,vUV);\n\
      vec4 tex1 =  texture2D(uTexture01,vUV+hoffset);\n\
      vec4 tex2 =  texture2D(uTexture01,vUV-hoffset);\n\
      vec4 tex3 =  texture2D(uTexture01,vUV+voffset);\n\
      vec4 tex4 =  texture2D(uTexture01,vUV-voffset);\n\
      vec4 baseColor = (tex1+tex2+tex3+tex4)*0.5 - tex0;\n\
\n\
      float t =  clamp(dist/uMouseRadius, 0.0, 1.0);\n\
\n\
      gl_FragColor = mix(mouse_color, orig_color, t) + baseColor;\n\
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
    }\n\
   ";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 1.0;
  this.material.setTexture(this.rt0.texture);
  this.material.addTexture(this.rt1.texture);

};
