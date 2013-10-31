function ShaderProgram() {
  this.programID = -1;
  this.uniforms = {};
  this.fragShaderName = "";
  this.vertShaderName = "";
  this.fragShaderSource = "";
  this.vertShaderSource = "";
  this.vertShaderID = -1;
  this.fragShaderID = -1;

  this.attributeSlots = [
                          ["aVertexPosition", 0 ],
                          ["aVertexNormal", 1]
                          ["aVertexUV", 2]
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
ShaderProgram.prototype.loadShaderFromDocument = function (gl, id) {
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
 
ShaderProgram.prototype.getShader = function(gl, id) {
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
  function(gl, fragment_shadername, vertex_shadername) 
{
  this.fragShaderName = fragment_shadername;
  this.vertShaderName = vertex_shadername;

  this.fragShaderID = this.loadShaderFromShader(gl, fragment_shadername);
  this.vertShaderID = this.loadShaderFromShader(gl, vertex_shadername);

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
*/

ShaderProgram.prototype.initShader = function(gl,fragment_shadername, vertex_shadername) {
  this.fragShaderID = this.getShader(gl, fragment_shadername);
  this.vertShaderID = this.getShader(gl, vertex_shadername);

  var shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, this.vertShaderID);
  gl.attachShader(shaderProgram, this.fragShaderID);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }
  console.debug("linked shader");

  gl.useProgram(shaderProgram);

<<<<<<< HEAD
  shaderProgram.vertexPositionAttribute = 
                  gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
=======
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



>>>>>>> 50cfbfd3b73075ba8b0bcdaeb165f40520d18b6c

  shaderProgram.vertexNormalAttribute = 
                        gl.getAttribLocation(shaderProgram, "aVertexNormal");
  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

  shaderProgram.vertexUVAttribute = 
                        gl.getAttribLocation(shaderProgram, "aVertexUV");
  gl.enableVertexAttribArray(shaderProgram.vertexUVAttribute);

  //---------------------------------------------------------------------------

  shaderProgram.pMatrixUniform =gl.getUniformLocation(shaderProgram, 
                                                      "uPMatrix");
  shaderProgram.mvMatrixUniform =gl.getUniformLocation(shaderProgram, 
                                                       "uMVMatrix");
  shaderProgram.mvInverseTransposeUniform =gl.getUniformLocation(shaderProgram, 
                                                       "uMVInverseTranspose");
  this.programID = shaderProgram;
}


ShaderProgram.prototype.bindShader = function(gl,mesh){
  gl.useProgram(this.programID);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vertexBuffer);
  gl.vertexAttribPointer(
                        this.programID.vertexPositionAttribute,
                        mesh.vertexBuffer.positionElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.positionOffset
                        );
  gl.vertexAttribPointer(
                        this.programID.vertexNormalAttribute, 
                        mesh.vertexBuffer.normalElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.normalOffset 
                        );
  gl.vertexAttribPointer(
                        this.programID.vertexUVAttribute, 
                        mesh.vertexBuffer.uvElementCount, 
                        gl.FLOAT, 
                        false, 
                        mesh.vertexBuffer.stride, 
                        mesh.vertexBuffer.uvOffset 
                        );
}

ShaderProgram.prototype.setUniforms = function(gl, mv, mvIT, p) {
  gl.uniformMatrix4fv(this.programID.pMatrixUniform, false, p);
  gl.uniformMatrix4fv(this.programID.mvMatrixUniform, false, mv);
  gl.uniformMatrix4fv(this.programID.mvInverseTransposeUniform, false, mvIT);

}
