"use strict";

function IKAnimator(gl){
  this.gl = gl;
  this.skeletalModel;
  this.rootJoint = null;
  this.endJoint = null;
  this.joints = [];
  this.ikOnlyJoints = [];
  this.mesh = new Mesh(gl);
  this.material = new Material(gl);
  this.setupMaterial();

  this.effectorPosition = new Vector3(0,33,30);
}

IKAnimator.prototype.setSkeletalModel = function(sm) {
  this.skeletalModel = sm;
  this.transform = sm.transform;//sharing transform with skeletal model.
  this.skeletalModel.hasIK = true;
};

IKAnimator.prototype.setRootJoint = function(name, useRefPose) {
  this.rootJoint = this.skeletalModel.getJoint(name, useRefPose);
};

IKAnimator.prototype.setEndJoint = function(name, useRefPose) {
  this.endJoint = this.skeletalModel.getJoint(name, useRefPose);
};

IKAnimator.prototype.calculateMesh = function() {
  var positions = [];
  this.mesh.clear();

  //calculate positions
  for(var i = 0; i < this.ikOnlyJoints.length; i++){
    var joint = this.ikOnlyJoints[i];

    var mat0 = joint.animationWorldBases[this.skeletalModel.frame0];
    var pos0 = new Vector3(mat0.m[12], mat0.m[13], mat0.m[14]);
    var mat1 = joint.animationWorldBases[this.skeletalModel.frame1];
    var pos1 = new Vector3(mat1.m[12], mat1.m[13], mat1.m[14]);

    var pos = Vector3.add(
                          pos0.scale(this.skeletalModel.frame0Weight),
                          pos1.scale(this.skeletalModel.frame1Weight)
                         );

    positions.push(pos);
  }

  
  for(var i = 0; i < positions.length-1; i++) {
    var p0 = positions[i];
    var p1 = positions[i+1];
    this.mesh.positions.push(p0);
    this.mesh.positions.push(p1);

    var rb = i/this.ikOnlyJoints.length;
    //var c = new Vector4(rb * 0.5, 0.0, rb, 1.0);
    var c = new Vector4(rb*0, rb, rb*0, 1.0);

    this.mesh.colors.push(c);
    this.mesh.colors.push(c);
  }

  //add effector!
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,-1,0)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,1,0)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,0,-1)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,0,1)));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  /*
    this.mesh.positions.push(new Vector3(-1.0, 0.0,-0.1));
    this.mesh.positions.push(new Vector3(1.0, 0.0, -0.1));

    var c = new Vector4(0.5, 0.0, 0.0, 1.0);

    this.mesh.colors.push(c);
    this.mesh.colors.push(c);
  */
  this.mesh.primitiveType = this.gl.LINES;


  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    this.mesh.updateBuffers();
  } else {
    this.mesh.constructBuffers();
  }

};

IKAnimator.prototype.animateEffector = function(time){
  this.effectorPosition = new Vector3(0,33,20);
  var radius = 10.0;
  var horizOffset =  0;//Math.sin(time);
  var vertOffset = Math.cos(time);
  this.effectorPosition.z += horizOffset * radius;
  this.effectorPosition.y += vertOffset * radius;
}

IKAnimator.prototype.animate = function(time){
  if(this.skeletalModel.ready == false){
    return;
  }

  this.animateEffector(time);

  var angle = (Math.sin(time) * 0.25) + 0.25*Math.PI;

  for( var i = 0; i < this.joints.length; i++ ) {
    var a = angle;
    if(this.joints[i].hasIK == false){
      a = 0.0;
    }else{
      angle *= 0.9;
    }
    var joint = this.joints[i];
    var parentJoint = this.skeletalModel.currentJoints[joint.parentID];
    var trans = joint.animationTranslations[this.skeletalModel.frame0].clone();
    var rot = joint.animationRotations[this.skeletalModel.frame0].clone();
    //rot.x += a;

    //if(true || this.joints[i].hasIK){
    if(this.joints[i].hasIK){
      if(i == 0){
        var mat0 = parentJoint.animationWorldBases[this.skeletalModel.frame0];
        var pos0 = new Vector3(mat0.m[12], mat0.m[13], mat0.m[14]);
        var dir = new Vector3(mat0.m[8], mat0.m[9], mat0.m[10]).normalize();
        //var dir = new Vector3(0,0,1);

        var localEffPos = this.effectorPosition.clone();//.transform(mat0.clone().invert());
        var dirToEffector = localEffPos.clone().subtract(pos0).normalize();
        var axisAngle = dir.getRotationToAlign(dirToEffector);
        var q = new Quaternion();
        q.setAxisAngle(new Vector3(axisAngle.x, axisAngle.y, axisAngle.z), axisAngle.w);
        var eulerAngles = q.toEulerAngles();
        
        trans.set(0,0,10);
        rot.set(eulerAngles.x,eulerAngles.y,eulerAngles.z);
        //rot.add(eulerAngles);
      } else{
        trans.set(0,0,10);
        rot.set(0,0,0);
      }
    }

    this.skeletalModel.calculateJoint(
                                      this.skeletalModel.frame0,
                                      joint,
                                      trans,
                                      rot
                                      );

    trans = joint.animationTranslations[this.skeletalModel.frame1].clone();
    rot = joint.animationRotations[this.skeletalModel.frame1].clone();
    //rot.x += a;

    //if(true || this.joints[i].hasIK){
    if(this.joints[i].hasIK){
      if(i == 0){
        var mat1 = parentJoint.animationWorldBases[this.skeletalModel.frame1];
        var pos1 = new Vector3(mat1.m[12], mat1.m[13], mat1.m[14]);
        var dir = new Vector3(mat1.m[8], mat1.m[9], mat1.m[10]).normalize();
        //var dir = new Vector3(0,0,1);

        var localEffPos = this.effectorPosition.clone();//.transform(mat1.clone().invert());
        var dirToEffector = localEffPos.clone().subtract(pos1).normalize();
        var axisAngle = dir.getRotationToAlign(dirToEffector);
        var q = new Quaternion();
        q.setAxisAngle(new Vector3(axisAngle.x, axisAngle.y, axisAngle.z), axisAngle.w);
        var eulerAngles = q.toEulerAngles();
        
        trans.set(0,0,10);
        rot.set(eulerAngles.x,eulerAngles.y,eulerAngles.z);
        //rot.add(eulerAngles);

      } else{
        trans.set(0,0,10);
        rot.set(0,0,0);
      }
    }

    this.skeletalModel.calculateJoint(
                                      this.skeletalModel.frame1,
                                      joint,
                                      trans,
                                      rot
                                      );
  }
  this.skeletalModel.updateMesh();
  this.calculateMesh();

  
}

IKAnimator.prototype.walkJoints = function(currJoint) {
  this.joints.push(currJoint);
  for(var i = 0; i < currJoint.children.length; i++){
    this.walkJoints(currJoint.children[i]);
  }
}

IKAnimator.prototype.calculateJointArray = function() {
  this.walkJoints(this.rootJoint);
  this.tagControlledJoints();
};

IKAnimator.prototype.tagControlledJoints = function() {
  var currJoint = this.endJoint;
  currJoint.hasIK = true;
  this.ikOnlyJoints.push(currJoint);

  while(currJoint.parentID > -1 && currJoint != this.rootJoint) {
    currJoint = this.skeletalModel.getJointByID(currJoint.parentID, false);
    currJoint.hasIK = true;
    this.ikOnlyJoints.push(currJoint);
  }

  this.calculateMesh();

};

IKAnimator.prototype.drawDebug = function(projMat, time){
 
  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    
    this.material.bind(this.mesh);
    //this.mesh.bind(this.material.shader);
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


IKAnimator.prototype.setupMaterial = function(gl){
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
  fsSource +="      gl_FragColor = vVertColor;\n";
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
  //vsSource +="        vPosition = vec4(aVertexPosition,1.0);\n";
  vsSource +="        vVertColor = aVertexColor;\n";
  vsSource +="        vUV = aVertexUV.xy;\n";
  vsSource +="        vNormal = aVertexNormal.xyz;\n";
  vsSource +="        vTangent = aVertexTangent.xyz;\n";
  vsSource +="        gl_Position = uPMatrix * vPosition;\n";
  vsSource +="    }\n";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 3.0;

};



