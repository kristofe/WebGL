"use strict";

function ShaderProgram(gl) {
  this.gl = gl;
  this.glProgram = -1;
  this.ready = false;
  this.uniforms = {};
  this.attributes = {};
  this.fragShaderName = "";
  this.vertShaderName = "";
  this.fragShaderSource = "";
  this.vertShaderSource = "";
  this.vertShaderID = -1;
  this.fragShaderID = -1;

  this.attributeSlots = [
                          ["aVertexPosition", 0 ],
                          ["aVertexNormal", 1],
                          ["aVertexUV", 2],
                          ["aVertexTangent", 3],
                          ["aVertexColor", 4]
                        ];
  this.uniformSlots = [];
  this.typeToString = {};
  this.typeToString[gl.FLOAT] = "FLOAT";
  this.typeToString[gl.FLOAT_VEC2] = "FLOAT_VEC2";
  this.typeToString[gl.FLOAT_VEC3] = "FLOAT_VEC3";
  this.typeToString[gl.FLOAT_VEC4] = "FLOAT_VEC4";
  this.typeToString[gl.INT] = "INT";
  this.typeToString[gl.INT_VEC2] = "INT_VEC2";
  this.typeToString[gl.INT_VEC3] = "INT_VEC3";
  this.typeToString[gl.INT_VEC4] = "INT_VEC4";
  this.typeToString[gl.BOOL] = "BOOL";
  this.typeToString[gl.BOOL_VEC2] = "BOOL_VEC2";
  this.typeToString[gl.BOOL_VEC3] = "BOOL_VEC3";
  this.typeToString[gl.BOOL_VEC4] = "BOOL_VEC4";
  this.typeToString[gl.FLOAT_MAT2] = "FLOAT_MAT2";
  this.typeToString[gl.FLOAT_MAT3] = "FLOAT_MAT3";
  this.typeToString[gl.FLOAT_MAT4] = "FLOAT_MAT4";
  this.typeToString[gl.SAMPLER_2D] = "SAMPLER_2D";
  this.typeToString[gl.SAMPLER_CUBE] = "SAMPLER_CUBE";

}

ShaderProgram.prototype.compileShaderType = function(str, type) {
  var gl = this.gl;
  var shader = gl.createShader(type);

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var err = gl.getShaderInfoLog(shader);
      console.error(err);
      alert(err);
      return null;
  }

  return shader;
}
 
ShaderProgram.prototype.getShader = function(id) {
  var gl = this.gl;
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
      var err = "couldn't find shader";
      console.error(err);
      alert(err);
      return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
      if (k.nodeType == 3) {
          str += k.textContent;
      }
      k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
      var err = "couldn't determine type of shader";
      console.error(err);
      alert(err);
      return null;
  }
  

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var err = gl.getShaderInfoLog(shader);
      console.error(err);
      alert(err);
      return null;
  }

  return shader;
}

ShaderProgram.prototype.cacheAttributeData = function() {
  var gl = this.gl;
  var total = gl.getProgramParameter(this.glProgram, gl.ACTIVE_ATTRIBUTES);
  for( var i = 0; i < total; ++i) {
    //WebGLActiveInfo = { GLint: size, GLenum: type, DOMString: name};
    var activeInfo = gl.getActiveAttrib(this.glProgram, i);
    var slot = gl.getAttribLocation(this.glProgram, activeInfo.name);

    this.attributes[activeInfo.name] = {
                                      "slot" : slot,
                                      "size" : activeInfo.size,
                                      "type" : this.typeToString[activeInfo.type],
                                      "name" : activeInfo.name
                                     };
    console.debug(this.attributes[activeInfo.name]);
  }

}

ShaderProgram.prototype.cacheUniformData = function() {
  var gl = this.gl;
  var total = gl.getProgramParameter(this.glProgram, gl.ACTIVE_UNIFORMS);
  for( var i = 0; i < total; ++i) {
    //WebGLActiveInfo = { GLint: size, GLenum: type, DOMString: name};
    var activeInfo = gl.getActiveUniform(this.glProgram, i);
    var slot = gl.getUniformLocation(this.glProgram, activeInfo.name);

    this.uniforms[activeInfo.name] = {
                                      "slot" : slot,
                                      "size" : activeInfo.size,
                                      "type" : this.typeToString[activeInfo.type],
                                      "name" : activeInfo.name
                                     };
    console.debug(this.uniforms[activeInfo.name]);
  }

}
ShaderProgram.prototype.initShaderWithSource = function(fsSource, vsSource) {
  var gl = this.gl;
  this.fragShaderID = this.compileShaderType(fsSource, gl.FRAGMENT_SHADER);
  this.vertShaderID = this.compileShaderType(vsSource, gl.VERTEX_SHADER);

  //var shaderProgram = gl.createProgram();
  this.glProgram = gl.createProgram();
  gl.attachShader(this.glProgram, this.vertShaderID);
  gl.attachShader(this.glProgram, this.fragShaderID);
  gl.linkProgram(this.glProgram);

  if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
      throw ("program failed to link:" + gl.getProgramInfoLog (this.glProgram));
  }
  console.debug("linked shader");
  this.setupAttributesAndUniforms();
  this.ready = true;
};

ShaderProgram.prototype.initShader = function(fragment_shadername, vertex_shadername) {
  var gl = this.gl;
  this.fragShaderID = this.getShader(fragment_shadername);
  this.vertShaderID = this.getShader(vertex_shadername);

  //var shaderProgram = gl.createProgram();
  this.glProgram = gl.createProgram();
  gl.attachShader(this.glProgram, this.vertShaderID);
  gl.attachShader(this.glProgram, this.fragShaderID);
  gl.linkProgram(this.glProgram);

  if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
      throw ("program failed to link:" + gl.getProgramInfoLog (this.glProgram));
  }
  console.debug("linked shader");
  this.setupAttributesAndUniforms();
  this.ready = true;
};

ShaderProgram.prototype.setupAttributesAndUniforms = function(){
  gl.useProgram(this.glProgram);

  this.cacheUniformData();
  this.cacheAttributeData();
  

  //DEPRECATED:
  //TODO: remove the following way of storing attributes

  this.vertexPositionAttribute = 
                  gl.getAttribLocation(this.glProgram, "aVertexPosition");
  gl.enableVertexAttribArray(this.vertexPositionAttribute);

  this.vertexNormalAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexNormal");
  gl.enableVertexAttribArray(this.vertexNormalAttribute);

  this.vertexUVAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexUV");
  gl.enableVertexAttribArray(this.vertexUVAttribute);

  this.vertexTangentAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexTangent");
  gl.enableVertexAttribArray(this.vertexTangentAttribute);

  this.vertexColorAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexColor");
  gl.enableVertexAttribArray(this.vertexColorAttribute);

  //---------------------------------------------------------------------------
  // Uniforms
  //---------------------------------------------------------------------------

  this.pMatrixUniform =gl.getUniformLocation(this.glProgram, 
                                                      "uPMatrix");
  this.mvMatrixUniform =gl.getUniformLocation(this.glProgram, 
                                                       "uMVMatrix");
  this.mInverse =gl.getUniformLocation(this.glProgram, 
                                                       "uInverse");
  this.mInverseTranspose =gl.getUniformLocation(this.glProgram, 
                                                       "uInverseTranspose");
  this.texture01 =gl.getUniformLocation(this.glProgram, 
                                                       "uTexture01");
  this.texture02 =gl.getUniformLocation(this.glProgram, 
                                                       "uTexture02");
  this.time =gl.getUniformLocation(this.glProgram, 
                                                       "uTime");

};


ShaderProgram.prototype.bind = function(mesh){
  if(this.ready == false) return;
  var gl = this.gl;
  gl.useProgram(this.glProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
  gl.vertexAttribPointer(
                        this.vertexPositionAttribute,
                        mesh.positionElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.strideBytes, 
                        mesh.positionOffset
                        );
  gl.vertexAttribPointer(
                        this.vertexNormalAttribute, 
                        mesh.normalElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.strideBytes, 
                        mesh.normalOffset 
                        );
  gl.vertexAttribPointer(
                        this.vertexUVAttribute, 
                        mesh.uvElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.strideBytes, 
                        mesh.uvOffset 
                        );
  gl.vertexAttribPointer(
                        this.vertexTangentAttribute, 
                        mesh.tangentElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.strideBytes, 
                        mesh.tangentOffset 
                        );
  gl.vertexAttribPointer(
                        this.vertexColorAttribute, 
                        mesh.colorElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.strideBytes, 
                        mesh.colorOffset 
                        );
                        
};


//DEPRECATED: uniforms are now split between model and renderer
//TODO: CHANGE HARD CODED UNIFORM NAMES TO AN ARRAY OF NAMES PASSED IN.
//Need to add the type so the correct uniform call is made

ShaderProgram.prototype.setUniforms = function(mv, mInverse, mInverseTranspose, p, pTime) {
  var gl = this.gl;
  var uniformInfo;

  uniformInfo = this.uniforms["uPMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, p);
  }
  uniformInfo = this.uniforms["uMVMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, mv);
  }

  uniformInfo = this.uniforms["uInverse"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, mInverse);
  }

  uniformInfo = this.uniforms["uInverseTranspose"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, mInverseTranspose);
  }

  uniformInfo = this.uniforms["uTexture01"];
  if(uniformInfo != null){
    gl.uniform1i(uniformInfo.slot, 0);
  }

  uniformInfo = this.uniforms["uTexture02"];
  if(uniformInfo != null){
    gl.uniform1i(uniformInfo.slot, 1);
  }

  uniformInfo = this.uniforms["uTime"];
  if(uniformInfo != null){
    gl.uniform1f(uniformInfo.slot, pTime);
  }

};

//TODO: CHANGE HARD CODED UNIFORM NAMES TO AN ARRAY OF NAMES PASSED IN.
//Need to add the type so the correct uniform call is made
ShaderProgram.prototype.setRendererUniforms = function(renderer) {
  var gl = this.gl;
  var uniformInfo;

  uniformInfo = this.uniforms["uCameraMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentCamera.transform.matrix.m);
  }
  uniformInfo = this.uniforms["uViewMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentCamera.transform.inverse.m);
  }

  
  uniformInfo = this.uniforms["uLightMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentLight.transform.matrix.m);
  }
  uniformInfo = this.uniforms["uLightViewMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentLight.transform.inverse.m);
  }
  uniformInfo = this.uniforms["uLightProjectionMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentLight.projection.m);
  }
  uniformInfo = this.uniforms["uLightPosition"];
  if(uniformInfo != null){
    gl.uniform3f(
        uniformInfo.slot, 
        renderer.currentLight.transform.position.x,
        renderer.currentLight.transform.position.y,
        renderer.currentLight.transform.position.z
        );
  }

  uniformInfo = this.uniforms["uRenderFromLight"];
  if(uniformInfo != null){
    gl.uniform1f(uniformInfo.slot, renderer.renderFromLight);
  }

  uniformInfo = this.uniforms["uPMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, renderer.currentCamera.projection.m);
  }

  uniformInfo = this.uniforms["uTime"];
  if(uniformInfo != null){
    gl.uniform1f(uniformInfo.slot, renderer.currTime);
  }
  
  uniformInfo = this.uniforms["uShadowMap"];
  if(uniformInfo != null){
    gl.uniform1i(uniformInfo.slot, 2);
  }
};


//TODO: CHANGE HARD CODED UNIFORM NAMES TO AN ARRAY OF NAMES PASSED IN.
//Need to add the type so the correct uniform call is made
ShaderProgram.prototype.setModelUniforms = function(model) {
  var gl = this.gl;
  var uniformInfo;

  uniformInfo = this.uniforms["uMVMatrix"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, model.transform.matrix.m);
  }

  uniformInfo = this.uniforms["uInverse"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, model.transform.inverse.m);
  }

  uniformInfo = this.uniforms["uInverseTranspose"];
  if(uniformInfo != null){
    gl.uniformMatrix4fv(uniformInfo.slot, false, model.transform.inverseTranspose.m);
  }

  uniformInfo = this.uniforms["uTexture01"];
  if(uniformInfo != null){
    gl.uniform1i(uniformInfo.slot, 0);
  }

  uniformInfo = this.uniforms["uTexture02"];
  if(uniformInfo != null){
    gl.uniform1i(uniformInfo.slot, 1);
  }
};
