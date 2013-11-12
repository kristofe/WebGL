function Vector2(x,y){
  this.x = x; 
  this.y = y; 
}

Vector2.prototype.set = function(x,y){
  this.x = x;
  this.y = y;
}

Vector2.prototype.clone = function() {
  var out = new Vector2(0.0, 0.0);
  out.x = this.x;
  out.y = this.y;

  return out;
}

Vector2.dot = function(a,b) {
  return a.x * b.x + a.y * b.y;
}

Vector2.prototype.normalize = function() {
  var len = this.dot(this);
  len = Math.sqrt(len);
  if(len > 0.0) {
    this.x /= len; 
    this.y /= len; 
  }
  return this;
}

Vector2.prototype.dot = function(other) {
  return Vector2.dot(this, other);
}

function Vector3(x,y,z){
  this.x = x; 
  this.y = y; 
  this.z = z; 
}

Vector3.prototype.toVec4 = function() {
  var v = new Vector4(this.x,this.y, this.z, 0.0);
  return v;
}

Vector3.prototype.set = function(x,y,z){
  this.x = x;
  this.y = y;
  this.z = z;
}

Vector3.prototype.clone = function() {
  var out = new Vector3(0.0, 0.0, 0.0);
  out.x = this.x;
  out.y = this.y;
  out.z = this.z;

  return out;
}

Vector3.prototype.cross = function(b) {
  var out = new Vector3(0,0,0);
  var ax = this.x, ay = this.y, az = this.z,
      bx = b.x, by = b.y, bz = b.z;

  out.x = ay * bz - az * by;
  out.y = az * bx - ax * bz;
  out.z = ax * by - ay * bx;

  return out;
}

Vector3.dot = function(a,b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vector3.prototype.add = function(a){
  var r = Vector3.add(this,a);
  this.set(r.x, r.y, r.z);
  return this;
}

Vector3.prototype.subtract = function(a){
  var r = Vector3.subtract(this,a);
  this.set(r.x, r.y, r.z);
  return this;
}

Vector3.prototype.multiply = function(a){
  var r = Vector3.multiply(this,a);
  this.set(r.x, r.y, r.z);
  return this;
}

Vector3.add = function(a,b) {
  var o = new Vector3(0,0,0);
  o.x = a.x + b.x;
  o.y = a.y + b.y;
  o.z = a.z + b.z;
  return o;
}

Vector3.subtract = function(a,b) {
  var o = new Vector3(0,0,0);
  o.x = a.x - b.x;
  o.y = a.y - b.y;
  o.z = a.z - b.z;
  return o;
}

Vector3.multiply = function(a,b) {
  var o = new Vector3(0,0,0);
  o.x = a.x * b.x;
  o.y = a.y * b.y;
  o.z = a.z * b.z;
  return o;
}


Vector3.prototype.getTangent = function() {
  //start with up vector
  var other = new Vector3(0.0, 1.0, 0.0);
  var dir = this.clone();
  dir = dir.normalize();

  /*
  var d = Vector3.dot(dir,other);
  if(Math.abs(d) > 0.9) {
    other.set(1.0, 0.0, 0.0);
  }
  */

  var tan = Vector3.cross(dir,other);

  return other;

}

Vector3.prototype.normalize = function() {
  var len = this.dot(this);
  len = Math.sqrt(len);
  if(len > 0.0) {
    this.x /= len; 
    this.y /= len; 
    this.z /= len; 
  }
  else{
    console.debug("Vec3 is zero length");
  }
  return this;
}

Vector3.prototype.dot = function(other) {
  return Vector3.dot(this, other);
}

/*
Vector3.prototype.cross = function(other) {
    return Vector3.cross(this,other);
}
*/

function Vector4(x,y,z,w){
  this.x = x; 
  this.y = y; 
  this.z = z; 
  this.w = w; 
}

function Matrix44(){
  this.m = new Float32Array(16);
  this.identity();
}

Matrix44.prototype.clone = function(){
  var o = new Matrix44();
  o.m[0] = this.m[0];
  o.m[1] = this.m[1];
  o.m[2] = this.m[2];
  o.m[3] = this.m[3];
  o.m[4] = this.m[4];
  o.m[5] = this.m[5];
  o.m[6] = this.m[6];
  o.m[7] = this.m[7];
  o.m[8] = this.m[8];
  o.m[9] = this.m[9];
  o.m[10] = this.m[10];
  o.m[11] = this.m[11];
  o.m[12] = this.m[12];
  o.m[13] = this.m[13];
  o.m[14] = this.m[14];
  o.m[15] = this.m[15];

  return o;
}
   

Matrix44.prototype.identity = function(){
  this.m =
  [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
     0,  0,  0,  1
  ];

  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.ortho = function(left, right, bottom, top, near, far) {
  var dest = new Float32Array(16);
  var rl = (right - left);
  var tb = (top - bottom);
  var fn = (far - near);
  dest[0] = (near*2) / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = (near*2) / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = (right + left) / rl;
  dest[9] = (top + bottom) / tb;
  dest[10] = -(far + near) / fn;
  dest[11] = -1;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = -(far*near*2) / fn;
  dest[15] = 0;
  this.m = dest;

  return this;
}

Matrix44.prototype.perspective = function(fieldOfViewInRadians, aspect, near, far) {
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
  var rangeInv = 1.0 / (near - far);

  this.m = [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * rangeInv, -1,
    0, 0, near * far * rangeInv * 2, 0
  ];
  return this;
};

Matrix44.prototype.translate = function(tx, ty, tz) {
  var m = [
     1,  0,  0,  0,
     0,  1,  0,  0,
     0,  0,  1,  0,
    tx, ty, tz,  1
  ];
  this.preMultiply(m);
  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.transpose = function() {
  var a01 = this.m[1], a02 = this.m[2], a03 = this.m[3],
      a12 = this.m[6], a13 = this.m[7],
      a23 = this.m[11];

  this.m[1] = this.m[4];
  this.m[2] = this.m[8];
  this.m[3] = this.m[12];
  this.m[4] = a01;
  this.m[6] = this.m[9];
  this.m[7] = this.m[13];
  this.m[8] = a02;
  this.m[9] = a12;
  this.m[11] = this.m[14];
  this.m[12] = a03;
  this.m[13] = a13;
  this.m[14] = a23;

  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.invert = function() {
  var a00 = this.m[0], a01 = this.m[1], a02 = this.m[2], a03 = this.m[3],
      a10 = this.m[4], a11 = this.m[5], a12 = this.m[6], a13 = this.m[7],
      a20 = this.m[8], a21 = this.m[9], a22 = this.m[10], a23 = this.m[11],
      a30 = this.m[12], a31 = this.m[13], a32 = this.m[14], a33 = this.m[15],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32,

      // Calculate the determinant
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det) { 
      return this; 
  }
  det = 1.0 / det;

  this.m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  this.m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  this.m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  this.m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  this.m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  this.m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  this.m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  this.m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  this.m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  this.m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  this.m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  this.m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  this.m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  this.m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  this.m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  this.m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.fromQuat = function (q) {
  var x = q.x, y = q.y, z = q.z, w = q.w,
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2;

  this.m[0] = 1 - (yy + zz);
  this.m[1] = xy + wz;
  this.m[2] = xz - wy;
  this.m[3] = 0;

  this.m[4] = xy - wz;
  this.m[5] = 1 - (xx + zz);
  this.m[6] = yz + wx;
  this.m[7] = 0;

  this.m[8] = xz + wy;
  this.m[9] = yz - wx;
  this.m[10] = 1 - (xx + yy);
  this.m[11] = 0;

  this.m[12] = 0;
  this.m[13] = 0;
  this.m[14] = 0;
  this.m[15] = 1;
  return this;

}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.rotate = function(q) {
  var x = q.x, y = q.y, z = q.z, w = q.w,
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2;

  var m =  new Float32Array(16);
  m[0] = 1 - (yy + zz);
  m[1] = xy + wz;
  m[2] = xz - wy;
  m[3] = 0;

  m[4] = xy - wz;
  m[5] = 1 - (xx + zz);
  m[6] = yz + wx;
  m[7] = 0;

  m[8] = xz + wy;
  m[9] = yz - wx;
  m[10] = 1 - (xx + yy);
  m[11] = 0;

  m[12] = 0;
  m[13] = 0;
  m[14] = 0;
  m[15] = 1;

  this.preMultiply(m);
  return this;
}



Matrix44.prototype.rotateX = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  var m = [
    1, 0, 0, 0,
    0, c, s, 0,
    0, -s, c, 0,
    0, 0, 0, 1
  ];
  this.preMultiply(m);
  return this;
};

Matrix44.prototype.rotateY = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);

  var m = [
    c, 0, -s, 0,
    0, 1, 0, 0,
    s, 0, c, 0,
    0, 0, 0, 1
  ];
  this.preMultiply(m)
  return this;
};

Matrix44.prototype.rotateZ = function(angleInRadians) {
  var c = Math.cos(angleInRadians);
  var s = Math.sin(angleInRadians);
  var m = [
     c, s, 0, 0,
    -s, c, 0, 0,
     0, 0, 1, 0,
     0, 0, 0, 1,
  ];
  this.preMultiply(m);
  return this;
}

Matrix44.prototype.scale = function(sx, sy, sz) {
  var m = [
    sx, 0,  0,  0,
    0, sy,  0,  0,
    0,  0, sz,  0,
    0,  0,  0,  1,
  ];
  this.preMultiply(m);
  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.postMultiply = function(b) {
  var a00 = this.m[0*4+0];
  var a01 = this.m[0*4+1];
  var a02 = this.m[0*4+2];
  var a03 = this.m[0*4+3];
  var a10 = this.m[1*4+0];
  var a11 = this.m[1*4+1];
  var a12 = this.m[1*4+2];
  var a13 = this.m[1*4+3];
  var a20 = this.m[2*4+0];
  var a21 = this.m[2*4+1];
  var a22 = this.m[2*4+2];
  var a23 = this.m[2*4+3];
  var a30 = this.m[3*4+0];
  var a31 = this.m[3*4+1];
  var a32 = this.m[3*4+2];
  var a33 = this.m[3*4+3];
  var b00 = b[0*4+0];
  var b01 = b[0*4+1];
  var b02 = b[0*4+2];
  var b03 = b[0*4+3];
  var b10 = b[1*4+0];
  var b11 = b[1*4+1];
  var b12 = b[1*4+2];
  var b13 = b[1*4+3];
  var b20 = b[2*4+0];
  var b21 = b[2*4+1];
  var b22 = b[2*4+2];
  var b23 = b[2*4+3];
  var b30 = b[3*4+0];
  var b31 = b[3*4+1];
  var b32 = b[3*4+2];
  var b33 = b[3*4+3];
  this.m = 
         [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
          a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
          a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
          a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
          a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
          a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
          a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
          a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
          a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
          a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
          a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
          a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
          a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
          a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
          a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
          a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
  return this;
}

//adapted from https://github.com/toji/gl-matrix
Matrix44.prototype.preMultiply = function(a) {
  var a00 = a[0*4+0];
  var a01 = a[0*4+1];
  var a02 = a[0*4+2];
  var a03 = a[0*4+3];
  var a10 = a[1*4+0];
  var a11 = a[1*4+1];
  var a12 = a[1*4+2];
  var a13 = a[1*4+3];
  var a20 = a[2*4+0];
  var a21 = a[2*4+1];
  var a22 = a[2*4+2];
  var a23 = a[2*4+3];
  var a30 = a[3*4+0];
  var a31 = a[3*4+1];
  var a32 = a[3*4+2];
  var a33 = a[3*4+3];
  var b00 = this.m[0*4+0];
  var b01 = this.m[0*4+1];
  var b02 = this.m[0*4+2];
  var b03 = this.m[0*4+3];
  var b10 = this.m[1*4+0];
  var b11 = this.m[1*4+1];
  var b12 = this.m[1*4+2];
  var b13 = this.m[1*4+3];
  var b20 = this.m[2*4+0];
  var b21 = this.m[2*4+1];
  var b22 = this.m[2*4+2];
  var b23 = this.m[2*4+3];
  var b30 = this.m[3*4+0];
  var b31 = this.m[3*4+1];
  var b32 = this.m[3*4+2];
  var b33 = this.m[3*4+3];
  this.m =
         [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
          a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
          a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
          a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
          a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
          a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
          a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
          a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
          a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
          a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
          a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
          a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
          a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
          a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
          a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
          a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];
  return this;
}


//Entire quaternion class is adapted from 
//https://raw.github.com/toji/gl-matrix/master/src/gl-matrix/quat.js
function Quaternion() {
  this.x = 0.0;
  this.y = 0.0;
  this.z = 0.0;
  this.w = 1.0;
}

Quaternion.prototype.clone = function() {
  var q = new Quaternion();
  q.x = this.x;
  q.y = this.y;
  q.z = this.z;
  q.w = this.w;
  return q;
}

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.identity = function() {
  this.x = 0.0;
  this.y = 0.0;
  this.z = 0.0;
  this.w = 1.0;
  return this;
}


//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.setAxisAngle = function(axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    this.x = s * axis.x;
    this.y = s * axis.y;
    this.z = s * axis.z;
    this.w = Math.cos(rad);
  return this;
};


//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.multiply = function( b) {
    var ax = this.x, ay = this.y, az = this.z, aw = this.w,
        bx = b.x, by = b.y, bz = b.z, bw = b.w;

    this.x = ax * bw + aw * bx + ay * bz - az * by;
    this.y = ay * bw + aw * by + az * bx - ax * bz;
    this.z = az * bw + aw * bz + ax * by - ay * bx;
    this.w = aw * bw - ax * bx - ay * by - az * bz;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.rotateX = function (rad) {
    rad *= 0.5; 

    var ax = this.x, ay = this.y, az = this.z, aw = this.w,
        bx = Math.sin(rad), bw = Math.cos(rad);

    this.x = ax * bw + aw * bx;
    this.y = ay * bw + az * bx;
    this.z = az * bw - ay * bx;
    this.w = aw * bw - ax * bx;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.rotateY = function (rad) {
    rad *= 0.5; 

    var ax = this.x, ay = this.y, az = this.z, aw = this.w,
        by = Math.sin(rad), bw = Math.cos(rad);

    this.x = ax * bw - az * by;
    this.y = ay * bw + aw * by;
    this.z = az * bw + ax * by;
    this.w = aw * bw - ay * by;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.rotateZ = function (rad) {
    rad *= 0.5; 

    var ax = this.x, ay = this.y, az = this.z, aw = this.w,
        bz = Math.sin(rad), bw = Math.cos(rad);

    this.x = ax * bw + ay * bz;
    this.y = ay * bw - ax * bz;
    this.z = az * bw + aw * bz;
    this.w = aw * bw - az * bz;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.calculateW = function (a) {
    var x = this.x, y = this.y, z = this.z;

    this.x = x;
    this.y = y;
    this.z = z;
    this.w = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.slerp = function (b, t) {
    var ax = this.x, ay = this.y, az = this.z, aw = this.w,
        bx = b.x, by = b.y, bz = b.z, bw = b.w;

    var        omega, cosom, sinom, scale0, scale1;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if ( cosom < 0.0 ) {
        cosom = -cosom;
        bx = - bx;
        by = - by;
        bz = - bz;
        bw = - bw;
    }
    // calculate coefficients
    if ( (1.0 - cosom) > 0.000001 ) {
        // standard case (slerp)
        omega  = Math.acos(cosom);
        sinom  = Math.sin(omega);
        scale0 = Math.sin((1.0 - t) * omega) / sinom;
        scale1 = Math.sin(t * omega) / sinom;
    } else {        
        // "from" and "to" quaternions are very close 
        //  ... so we can do a linear interpolation
        scale0 = 1.0 - t;
        scale1 = t;
    }
    // calculate final values
    this.x = scale0 * ax + scale1 * bx;
    this.y = scale0 * ay + scale1 * by;
    this.z = scale0 * az + scale1 * bz;
    this.w = scale0 * aw + scale1 * bw;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.invert = function() {
    var a0 = this.x, a1 = this.y, a2 = this.z, a3 = this.w,
        dot = a0*a0 + a1*a1 + a2*a2 + a3*a3,
        invDot = dot ? 1.0/dot : 0;
    
    // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

    this.x = -a0*invDot;
    this.y = -a1*invDot;
    this.z = -a2*invDot;
    this.w = a3*invDot;
  return this;
};

//adapted from github.com/toji/gl-matrix/blob/master/src/gl-matrix/quat.js
Quaternion.prototype.conjugate = function () {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = this.w;
  return this;
};


///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function Matrix33() {
  this.m = new Float32Array(9);
  this.m[0] = 1;
  this.m[1] = 0;
  this.m[2] = 0;
  this.m[3] = 0;
  this.m[4] = 1;
  this.m[5] = 0;
  this.m[6] = 0;
  this.m[7] = 0;
  this.m[8] = 1;
};

Matrix33.prototype.fromMatrix44 = function(p) {
  var a = p.m;
    this.m[0] = a[0];
    this.m[1] = a[1];
    this.m[2] = a[2];
    this.m[3] = a[4];
    this.m[4] = a[5];
    this.m[5] = a[6];
    this.m[6] = a[8];
    this.m[7] = a[9];
    this.m[8] = a[10];
    return this;
};

Matrix33.prototype.clone = function() {
    var out = new Float32Array(9);
    out[0] = this.m[0];
    out[1] = this.m[1];
    out[2] = this.m[2];
    out[3] = this.m[3];
    out[4] = this.m[4];
    out[5] = this.m[5];
    out[6] = this.m[6];
    out[7] = this.m[7];
    out[8] = this.m[8];
    return out;
};

Matrix33.prototype.copy = function(p) {
  var a = p.m;
    this.m[0] = a[0];
    this.m[1] = a[1];
    this.m[2] = a[2];
    this.m[3] = a[3];
    this.m[4] = a[4];
    this.m[5] = a[5];
    this.m[6] = a[6];
    this.m[7] = a[7];
    this.m[8] = a[8];
    return this;
};

Matrix33.prototype.identity = function() {
    this.m[0] = 1;
    this.m[1] = 0;
    this.m[2] = 0;
    this.m[3] = 0;
    this.m[4] = 1;
    this.m[5] = 0;
    this.m[6] = 0;
    this.m[7] = 0;
    this.m[8] = 1;
    return this;
};

Matrix33.prototype.transpose = function() {
    var a01 = this.m[1], a02 = this.m[2], a12 = this.m[5];
    this.m[1] = this.m[3];
    this.m[2] = this.m[6];
    this.m[3] = a01;
    this.m[5] = this.m[7];
    this.m[6] = a02;
    this.m[7] = a12;

    return this;
};

Matrix33.prototype.invert = function() {
    var a00 = this.m[0], a01 = this.m[1], a02 = this.m[2],
        a10 = this.m[3], a11 = this.m[4], a12 = this.m[5],
        a20 = this.m[6], a21 = this.m[7], a22 = this.m[8],

        b01 = a22 * a11 - a12 * a21,
        b11 = -a22 * a10 + a12 * a20,
        b21 = a21 * a10 - a11 * a20,

        // Calculate the determinant
        det = a00 * b01 + a01 * b11 + a02 * b21;

    if (!det) { 
        return null; 
    }
    det = 1.0 / det;

    this.m[0] = b01 * det;
    this.m[1] = (-a22 * a01 + a02 * a21) * det;
    this.m[2] = (a12 * a01 - a02 * a11) * det;
    this.m[3] = b11 * det;
    this.m[4] = (a22 * a00 - a02 * a20) * det;
    this.m[5] = (-a12 * a00 + a02 * a10) * det;
    this.m[6] = b21 * det;
    this.m[7] = (-a21 * a00 + a01 * a20) * det;
    this.m[8] = (a11 * a00 - a01 * a10) * det;
    return this;
};

/*
mat3.adjoint = function(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    out[0] = (a11 * a22 - a12 * a21);
    out[1] = (a02 * a21 - a01 * a22);
    out[2] = (a01 * a12 - a02 * a11);
    out[3] = (a12 * a20 - a10 * a22);
    out[4] = (a00 * a22 - a02 * a20);
    out[5] = (a02 * a10 - a00 * a12);
    out[6] = (a10 * a21 - a11 * a20);
    out[7] = (a01 * a20 - a00 * a21);
    out[8] = (a00 * a11 - a01 * a10);
    return out;
};

mat3.determinant = function (a) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8];

    return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
};

mat3.multiply = function (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        b00 = b[0], b01 = b[1], b02 = b[2],
        b10 = b[3], b11 = b[4], b12 = b[5],
        b20 = b[6], b21 = b[7], b22 = b[8];

    out[0] = b00 * a00 + b01 * a10 + b02 * a20;
    out[1] = b00 * a01 + b01 * a11 + b02 * a21;
    out[2] = b00 * a02 + b01 * a12 + b02 * a22;

    out[3] = b10 * a00 + b11 * a10 + b12 * a20;
    out[4] = b10 * a01 + b11 * a11 + b12 * a21;
    out[5] = b10 * a02 + b11 * a12 + b12 * a22;

    out[6] = b20 * a00 + b21 * a10 + b22 * a20;
    out[7] = b20 * a01 + b21 * a11 + b22 * a21;
    out[8] = b20 * a02 + b21 * a12 + b22 * a22;
    return out;
};


mat3.translate = function(out, a, v) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],
        x = v[0], y = v[1];

    out[0] = a00;
    out[1] = a01;
    out[2] = a02;

    out[3] = a10;
    out[4] = a11;
    out[5] = a12;

    out[6] = x * a00 + y * a10 + a20;
    out[7] = x * a01 + y * a11 + a21;
    out[8] = x * a02 + y * a12 + a22;
    return out;
};
mat3.rotate = function (out, a, rad) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[3], a11 = a[4], a12 = a[5],
        a20 = a[6], a21 = a[7], a22 = a[8],

        s = Math.sin(rad),
        c = Math.cos(rad);

    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;

    out[3] = c * a10 - s * a00;
    out[4] = c * a11 - s * a01;
    out[5] = c * a12 - s * a02;

    out[6] = a20;
    out[7] = a21;
    out[8] = a22;
    return out;
};

mat3.scale = function(out, a, v) {
    var x = v[0], y = v[1];

    out[0] = x * a[0];
    out[1] = x * a[1];
    out[2] = x * a[2];

    out[3] = y * a[3];
    out[4] = y * a[4];
    out[5] = y * a[5];

    out[6] = a[6];
    out[7] = a[7];
    out[8] = a[8];
    return out;
};

mat3.fromMat2d = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = 0;

    out[3] = a[2];
    out[4] = a[3];
    out[5] = 0;

    out[6] = a[4];
    out[7] = a[5];
    out[8] = 1;
    return out;
};

mat3.fromQuat = function (out, q) {
    var x = q[0], y = q[1], z = q[2], w = q[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    out[0] = 1 - (yy + zz);
    out[3] = xy + wz;
    out[6] = xz - wy;

    out[1] = xy - wz;
    out[4] = 1 - (xx + zz);
    out[7] = yz + wx;

    out[2] = xz + wy;
    out[5] = yz - wx;
    out[8] = 1 - (xx + yy);

    return out;
};
*/

Matrix33.prototype.normalFromMatrix44 = function (p) {
    var a = p.m;
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) { 
        return this; 
    }
    det = 1.0 / det;

    this.m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    this.m[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    this.m[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;

    this.m[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    this.m[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    this.m[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;

    this.m[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    this.m[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    this.m[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;

    return this;
};
