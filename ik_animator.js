"use strict";

function IKAnimator(gl){
  this.skeletalModel;
  this.rootJoint = null;
  this.endJoint = null;
  this.joints = [];
  this.ikOnlyJoints = [];
  this.mesh = new Mesh(gl);
  this.material = new Material(gl);
  this.setupMaterial();
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

/*
   //THIS CAPABILITY IS NOW IN SKELETAL MODEL
IKAnimator.prototype.modifyJoint = function( frame, joint, angle){

    var jointID = joint.id;
    var mat = joint.animationCombinedBases[frame];
    var normMat = joint.animationNormalBases[frame];

    var animPose = joint.animationWorldBases[frame];
    if( joint.parentID != -1 ) {
      this.skeletalModel.currentJoints[joint.parentID].animationWorldBases[frame].copyInto(animPose);
    } else {
      animPose.identity();
    }

    
    var animationTranslation = joint.animationTranslations[frame];
    var animationRotation = joint.animationRotations[frame];
    animPose.translate(animationTranslation.x, animationTranslation.y, animationTranslation.z);
    animPose.rotateZ(animationRotation.z);
    animPose.rotateY(animationRotation.y);
    animPose.rotateX(animationRotation.x + angle);

    animPose.copyInto(mat);
    mat.preMultiply(this.skeletalModel.referencePose[jointID].referencePoseWorldToLocal.m);
    mat.clone().invert().transpose().copyInto(normMat);

    joint.currentMatrices[frame] = mat.clone();
    joint.currentNormalMatrices[frame] = normMat.clone();
}
*/

IKAnimator.prototype.animate = function(time){
  if(this.skeletalModel.ready == false){
    return;
  }
  var angle = (Math.sin(time) * 0.5) + 0.125*Math.PI;

  for( var i = 0; i < this.joints.length; i++ ) {
    var a = angle;
    if(this.joints[i].hasIK == false){
      a = 0.0;
    }else{
      angle *= 0.9;
    }
    var joint = this.joints[i];
    var trans = joint.animationTranslations[this.skeletalModel.frame0].clone();
    var rot = joint.animationRotations[this.skeletalModel.frame0].clone();
    rot.x += a;

    this.skeletalModel.calculateJoint(
                                      this.skeletalModel.frame0,
                                      joint,
                                      trans,
                                      rot
                                      );

    trans = joint.animationTranslations[this.skeletalModel.frame1].clone();
    rot = joint.animationRotations[this.skeletalModel.frame1].clone();
    rot.x += a;

    this.skeletalModel.calculateJoint(
                                      this.skeletalModel.frame1,
                                      joint,
                                      trans,
                                      rot
                                      );
  }
  this.skeletalModel.updateMesh();

  
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

};

IKAnimator.prototype.drawDebug = function(projMat, time){
 
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
      this.mesh.vertexBuffer.numItems
      );
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
  vsSource +="        vVertColor = aVertexColor;\n";
  vsSource +="        gl_Position = uPMatrix * vPosition;\n";
  vsSource +="    }\n";

  this.material.shader.initShaderWithSource(fsSource,vsSource);

};



