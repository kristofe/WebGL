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
                          ["aVertexUV", 1]
                        ];
  this.uniformSlots = [];
}


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
  /*
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
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
  */

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
      alert(gl.getShaderInfoLog(shader));
      return null;
  }

  return shader;
}
 


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




