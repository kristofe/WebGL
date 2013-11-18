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


/*
ShaderProgram.prototype.getTextOfScriptElement = function(id) {
  var scriptElement = document.getElementById(id);
  if (!scriptElement) {
      return null;
  }

  var str = "";
  var k = scriptElement.firstChild;
  while (k) {
      if (k.nodeType == 3) {
          str += k.textContent;
      }
      k = k.nextSibling;
  }

  return str;

}
ShaderProgram.prototype.loadShaderFromDocument = function (id) {
  var str = this.getTextOfScriptElement(id);
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
      this.fragShaderSource = str;
  } else if (shaderScript.type == "x-shader/x-vertex") {
      shader = gl.createShader(gl.VERTEX_SHADER);
      this.vertShaderSource = str;
  } else {
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
*/
 
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

/*
ShaderProgram.prototype.initShaders = 
  function(fragment_shadername, vertex_shadername) 
{
  this.fragShaderName = fragment_shadername;
  this.vertShaderName = vertex_shadername;

  this.fragShaderID = this.loadShaderFromShader(fragment_shadername);
  this.vertShaderID = this.loadShaderFromShader(vertex_shadername);

  var shaderProgram = gl.createProgram();
  gl.attachShader(this.shaderProgramID, this.vertShaderID);
  gl.attachShader(this.shaderProgramID, this.fragShaderID);

  //This is where you can set the vertex attribute locations
  for(var i = 0; i < this.attributeSlots.length; ++i) {
    var attributeName = this.attributeSlots[i][0];
    var attributeSlot = this.attributeSlots[i][1];
    gl.bindAttribLocation(this.shaderProgramID, attributeSlot, attributeName);
  }
  gl.linkProgram(this.shaderProgramID);

  if (!gl.getProgramParameter(this.shaderProgramID, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  this.cacheUniformData(gl);

  return this.shaderProgramID;
}

ShaderProgram.prototype.cacheUniformData = function( gl ) {
  var total = gl.getProgramParameter(this.shaderProgramID, gl.ACTIVE_UNIFORMS);
  for( var i = 0; i < total; ++i) {
    //WebGLActiveInfo = { GLint: size, GLenum: type, DOMString: name};
    var activeInfo = gl.getActiveUniform(this.shaderProgramID, i);
    var slot = gl.getUniformLocation(this.shaderProgramID, activeInfo.name);

    this.uniforms[activeInfo.name] = {
                                      "slot" : slot,
                                      "size" : activeInfo.size,
                                      "type" : activeInfo.type,
                                      "name" : activeInfo.name
                                     };
  }

}
    /* Uniform Types */
/*
gl.FLOAT
gl.FLOAT_VEC2
gl.FLOAT_VEC3
gl.FLOAT_VEC4
gl.INT
gl.INT_VEC2
gl.INT_VEC3
gl.INT_VEC4
gl.BOOL
gl.BOOL_VEC2
gl.BOOL_VEC3
gl.BOOL_VEC4
gl.FLOAT_MAT2
gl.FLOAT_MAT3
gl.FLOAT_MAT4
gl.SAMPLER_2D
gl.SAMPLER_CUBE
*/

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

  gl.useProgram(this.glProgram);

  this.cacheUniformData();
  this.cacheAttributeData();

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

  this.ready = true;
}


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
                        
}

ShaderProgram.prototype.setUniforms = function(mv, mInverse, mInverseTranspose, p, pTime) {
  var gl = this.gl;
  gl.uniformMatrix4fv(this.pMatrixUniform, false, p);
  gl.uniformMatrix4fv(this.mvMatrixUniform, false, mv);
  gl.uniformMatrix4fv(this.mInverse, false, mInverse);
  gl.uniformMatrix4fv(this.mInverseTranspose, false, mInverseTranspose);
  gl.uniform1i(this.texture01,0);
  gl.uniform1i(this.texture02,1);
  gl.uniform1f(this.time, pTime);

}
