function Mesh() {
  this.useVertices = false;
  this.vertices = [];
  this.indices = [];
  this.vertexBuffer = -1;


}

Mesh.prototype.generateGridMesh = function(n, m, tileUVs){
  var numVerts = n * m;
  var vertices = [];

  var xpos = 0.0;
  var ypos = 0.0;
  var zpos = 0.0;
  var xinc = 1/n;
  var yinc = 1/m;
  for(var j = 0; j < m; ++j){
    for(var i = 0; i < n; ++i){
      var lx = xpos;
      var rx = xpos + xinc;
      var dy = ypos; 
      var uy = ypos + yinc;

      if(tileUVs == false){
        var uvl = lx;
        var uvr = rx;
        var uvd = dy;
        var uvu = uy;
      }
      else
      {
        var uvl = i;
        var uvr = i+1;
        var uvd = j+1;
        var uvu = j;
      }

      vertices.push(lx, dy, zpos, uvl, uvd);
      vertices.push(rx, dy, zpos, uvr, uvd);
      vertices.push(rx, uy, zpos, uvr, uvu);

      vertices.push(lx, dy, zpos, uvl, uvd);
      vertices.push(rx, uy, zpos, uvr, uvu);
      vertices.push(lx, uy, zpos, uvl, uvu);
      xpos += xinc;
    }
    ypos += yinc;
    xpos = 0.0;
  }
  console.log(vertices);
  console.log(n, m);

  return vertices;
}

Mesh.prototype.createVertexBuffer = function (vertArray, stride){
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
        vertexBuffer.uvElementCount = 2;
        vertexBuffer.uvOffset = 3*Float32Array.BYTES_PER_ELEMENT;
        vertexBuffer.numItems = vertArray.length/stride;

        return vertexBuffer;
    } 

}


