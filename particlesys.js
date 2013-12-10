"use strict";
function Particle(){
  this.position = new Vector3(0,0,0);
  this.velocity = new Vector3(0,0,0);
}

function ParticleSystem(gl){
  this.gl = gl;
  this.mesh = new Mesh(gl);
  this.meshLines = new Mesh(gl);
  this.material = new Material(gl);
  this.transform = new Transform();

  this.particleCount = 100.0;
  this.particles = [];

  var velScale = 1.0/Math.sqrt(2.0);
  for(var i = 0; i < this.particleCount; i++) {
    this.particles.push(new Particle());

    var x = 2.0*Math.random()-1.0;
    var y = 2.0*Math.random()-1.0;
    this.particles[i].position.set(x,y,0.01);

    x = 2.0*Math.random()-1.0;
    y = 2.0*Math.random()-1.0;
    this.particles[i].velocity.set(x*velScale,y*velScale,0.01);
  }

  this.lastUpdateTime = 0;

  this.setupMaterial();
  this.calculateMesh();
}

ParticleSystem.prototype.calculateMesh = function() {
  var positions = [];
  this.mesh.clear();

  //calculate positions
  for(var i = 0; i < this.particles.length; i++){
    var particle = this.particles[i];
    positions.push(particle.position);
  }

  
  for(var i = 0; i < positions.length; i++) {
    var p0 = positions[i];
    this.mesh.positions.push(p0);
    this.mesh.colors.push(new Vector4(1,1,1,1));
  }

  this.mesh.primitiveType = this.gl.POINTS;


  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    this.mesh.updateBuffers();
  } else {
    this.mesh.constructBuffers();
  }

};


ParticleSystem.prototype.simulate = function(time){
  var dt = time - this.lastUpdateTime;
  this.lastUpdateTime = time;
  for(var i = 0; i < this.particleCount; i++) {
    var particle = this.particles[i];
    var p = particle.position;
    var v = particle.velocity;
    var x = p.x + v.x*dt;
    var y = p.y + v.y*dt;


    x = x>1?x-2:x;
    x = x<-1?x+2:x;
    y = y>1?y-2:y;
    y = y<-1?y+2:y;
    particle.position.set(x,y,0);
  }
  this.calculateMesh();
};

ParticleSystem.prototype.draw = function(projMat, time){
 
  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    
    this.material.bind(this.mesh);
    this.material.setUniforms(
        this.transform.matrix.m,
        this.transform.inverse.m,
        this.transform.inverseTranspose.m,
        projMat.m, 
        time
        );
    this.gl.drawArrays(
        this.mesh.primitiveType,
        0, 
        this.mesh.numItems
        );
  }
}


ParticleSystem.prototype.setupMaterial = function(gl){
  var fsSource="  precision mediump float;\n";
  fsSource +="\n";
  fsSource +="    varying vec4 vPosition;\n";
  fsSource +="    varying vec2 vUV;\n";
  fsSource +="    varying vec3 vNormal;\n";
  fsSource +="    varying vec3 vTangent;\n";
  fsSource +="    varying vec3 vBitangent;\n";
  fsSource +="    varying vec4 vVertColor;\n";
  fsSource +="\n";
  fsSource +="    uniform float uTime;\n";
  fsSource +="    uniform mat4 uMVMatrix;\n";
  fsSource +="\n";
  fsSource +="    void main(void) {\n";
  //fsSource +="      vec3 texColor = texture2D(uTexture01, gl_PointCoord).rgb;\n"
  fsSource +="      vec3 texColor = vec3(1,1,1);\n"
  fsSource +="      gl_FragColor = vec4(texColor, 1.0) * vVertColor;\n"
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
  vsSource +="        vPosition = uMVMatrix * vec4(aVertexPosition,1.0);\n";
  vsSource +="        vVertColor = aVertexColor;\n";
  vsSource +="        vUV = aVertexUV.xy;\n";
  vsSource +="        vNormal = aVertexNormal.xyz;\n";
  vsSource +="        vTangent = aVertexTangent.xyz;\n";
  vsSource +="        gl_PointSize = 8.0;\n";
  //vsSource +="        vec4 pos = uPMatrix * vPosition;\n";
  vsSource +="        vec4 pos = vec4(aVertexPosition, 1.0);\n";
  vsSource +="        gl_Position = vec4(pos.xy, 0.0, 1.0);\n";
  vsSource +="    }\n";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 3.0;

};





