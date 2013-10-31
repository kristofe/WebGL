function Mesh() {
  this.useVertices = false;
  this.vertices = [];
  this.indices = [];
  this.vertexBuffer = -1;
  this.indexBuffer = -1;


}

Mesh.prototype.createSphereMesh = function(gl, slices, stacks){
  this.vertexBuffer = this.createVertexBuffer(
                            gl,
                            this.createSphereMeshData(slices,stacks),
                            8
      );
  return this.vertexBuffer;
}


Mesh.prototype.createSphereMeshDataWithIndices = function(slices, stacks){
  vertices = [];
  for (var stack = 0; stack < stacks; stack++) {
    var theta = stack * Math.PI / stacks;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var slice = 0; slice < slices; slice++) {
      var phi = slice * 2 * Math.PI / slices;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z= sinPhi * sinTheta;

      var u = 1 - (slice / slices);
      var v = 1 - (stack / stacks);

      vertices.push(x,y,z, x,y,z, u,v);
    }
  }

  indices = [];
  for (var slice = 0; slice < slices; slice++) {
    for (var stack = 0; stack < stacks; stack++) {
      var first = (slice * (stacks + 1)) + stack;
      var second = first + stacks + 1;
      indices.push(first);
      indices.push(second);
      indices.push(first + 1);

      indices.push(second);
      indices.push(second + 1);
      indices.push(first + 1);
    }
  }
  return vertices;
}

Mesh.prototype.createSphereMeshData = function(slices, stacks){
  vertices = [];
  for (var stack = 0; stack < stacks; stack++) {
    var theta = stack * Math.PI / stacks;
    var thetaNext = (stack + 1) * Math.PI / stacks;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinThetaNext = Math.sin(thetaNext);
    var cosThetaNext = Math.cos(thetaNext);


    for (var slice = 0; slice < slices; slice++) {
      var phi = slice * 2 * Math.PI / slices;
      var phiNext = (slice + 1) * 2 * Math.PI / slices;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var sinPhiNext = Math.sin(phiNext);
      var cosPhiNext = Math.cos(phiNext);

      var xTop = cosPhi * sinTheta;
      var xTopNext = cosPhiNext * sinTheta;
      var xBottom = cosPhi * sinThetaNext;
      var xBottomNext = cosPhiNext * sinThetaNext;

      var yTop = cosTheta;
      var yBottom = cosThetaNext;

      var zTop = sinPhi * sinTheta;
      var zTopNext = sinPhiNext * sinTheta;
      var zBottom = sinPhi * sinThetaNext;
      var zBottomNext = sinPhiNext * sinThetaNext;


      var u = 1 - (slice / slices);
      var uNext = 1 - ((slice + 1)/ slices);
      var v = 1 - (stack / stacks);
      var vNext = 1 - ((stack + 1) / stacks);

      //First Triangle
      vertices.push(xTop, yTop, zTop, xTop,yTop,zTop, u, v);
      vertices.push(xBottom, yBottom, zBottom, xBottom,yBottom,zBottom, u, vNext);
      vertices.push(xTopNext, yTop, zTopNext, xTopNext,yTop,zTopNext, uNext, v);

      //Second Triangle
      vertices.push(xTopNext, yTop, zTopNext, xTopNext,yTop,zTopNext, uNext, v);
      vertices.push(xBottomNext, yBottom, zBottomNext, xBottomNext,yBottom,zBottomNext, uNext, vNext);
      vertices.push(xBottom, yBottom, zBottom, xBottom,yBottom,zBottom, u, vNext);
    }
  }
  console.log(vertices);
  console.log(slices, stacks);

  return vertices;
}

Mesh.prototype.createGridMesh = function(gl, n, m, tileUVs){
  this.vertexBuffer = this.createVertexBuffer(
                            gl,
                            this.createGridMeshData(n,m),
                            8
      );
  return this.vertexBuffer;
}

Mesh.prototype.createGridMeshData = function(n, m, tileUVs){
  var numVerts = n * m;
  var vertices = [];

  var xpos = 0.0;
  var ypos = 0.0;
  var zpos = 0.0;
  var xinc = 1/n;
  var yinc = 1/m;
  for(var j = 0; j < m; ++j){
    for(var i = 0; i < n; ++i){
      var lx = 0.5-xpos;
      var rx = 0.5-xpos + xinc;
      var dy = 0.5-ypos; 
      var uy = 0.5-ypos + yinc;

      if(tileUVs == false){
        var uv1 = xpos;
        var uvr = xpos + xinc;
        var uvd = ypos; 
        var uvu = ypos + yinc;
      }
      else
      {
        var uvl = i;
        var uvr = i+1;
        var uvd = j+1;
        var uvu = j;
      }

      vertices.push(lx, dy, zpos, 0.0, 0.0, 1.0, uvl, uvd);
      vertices.push(rx, dy, zpos, 0.0, 0.0, 1.0, uvr, uvd);
      vertices.push(rx, uy, zpos, 0.0, 0.0, 1.0, uvr, uvu);

      vertices.push(lx, dy, zpos, 0.0, 0, 1.0, uvl, uvd);
      vertices.push(rx, uy, zpos, 0.0, 0, 1.0, uvr, uvu);
      vertices.push(lx, uy, zpos, 0.0, 0, 1.0, uvl, uvu);
      xpos += xinc;
    }
    ypos += yinc;
    xpos = 0.0;
  }
  console.log(vertices);
  console.log(n, m);

  return vertices;
}

Mesh.prototype.createVertexBuffer = function (gl, vertArray, stride){
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(
               gl.ARRAY_BUFFER, 
               new Float32Array(vertArray), 
               gl.STATIC_DRAW
               );
  vertexBuffer.stride = stride*Float32Array.BYTES_PER_ELEMENT;
  vertexBuffer.positionElementCount = 3;
  vertexBuffer.positionOffset = 0;
  vertexBuffer.normalElementCount = 3;
  vertexBuffer.normalOffset = 3*Float32Array.BYTES_PER_ELEMENT;
  vertexBuffer.uvElementCount = 2;
  vertexBuffer.uvOffset = 6*Float32Array.BYTES_PER_ELEMENT;
  vertexBuffer.numItems = vertArray.length/stride;

  return vertexBuffer;
} 




