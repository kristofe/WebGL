function ShaderProgram(gl) {
  this.gl = gl;
  this.glProgram = -1;
  this.uniforms = {};
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
                          ["aVertexUV2", 3],
                          ["aVertexColor", 4]
                        ];
  this.uniformSlots = [];
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
  }
  console.debug("linked shader");

  gl.useProgram(this.glProgram);

  this.vertexPositionAttribute = 
                  gl.getAttribLocation(this.glProgram, "aVertexPosition");
  gl.enableVertexAttribArray(this.vertexPositionAttribute);

  this.vertexNormalAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexNormal");
  gl.enableVertexAttribArray(this.vertexNormalAttribute);

  this.vertexUVAttribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexUV");
  gl.enableVertexAttribArray(this.vertexUVAttribute);

  this.vertexUV2Attribute = 
                        gl.getAttribLocation(this.glProgram, "aVertexUV2");
  gl.enableVertexAttribArray(this.vertexUV2Attribute);

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
  this.mvInverseTransposeUniform =gl.getUniformLocation(this.glProgram, 
                                                       "uMVInverseTranspose");
  this.texture01 =gl.getUniformLocation(this.glProgram, 
                                                       "uTexture01");
  this.texture02 =gl.getUniformLocation(this.glProgram, 
                                                       "uTexture02");
  this.time =gl.getUniformLocation(this.glProgram, 
                                                       "uTime");
}


ShaderProgram.prototype.bind = function(mesh){
  var gl = this.gl;
  gl.useProgram(this.glProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
  gl.vertexAttribPointer(
                        this.vertexPositionAttribute,
                        mesh.vertexBuffer.positionElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.positionOffset
                        );
  gl.vertexAttribPointer(
                        this.vertexNormalAttribute, 
                        mesh.vertexBuffer.normalElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.normalOffset 
                        );
  gl.vertexAttribPointer(
                        this.vertexUVAttribute, 
                        mesh.vertexBuffer.uvElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.uvOffset 
                        );
  gl.vertexAttribPointer(
                        this.vertexUV2Attribute, 
                        mesh.vertexBuffer.uv2ElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.uv2Offset 
                        );
  gl.vertexAttribPointer(
                        this.vertexColorAttribute, 
                        mesh.vertexBuffer.colorElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.colorOffset 
                        );
}

ShaderProgram.prototype.setUniforms = function(mv, mvIT, p, pTime) {
  var gl = this.gl;
  gl.uniformMatrix4fv(this.pMatrixUniform, false, p);
  gl.uniformMatrix4fv(this.mvMatrixUniform, false, mv);
  gl.uniformMatrix4fv(this.mvInverseTransposeUniform, false, mvIT);
  gl.uniform1i(this.texture01, false, 0);
  gl.uniform1i(this.texture02, false, 1);
  gl.uniform1f(this.time, pTime);

}
