"use strict";

function IKAnimator(gl){
  this.skeletalModel;
  this.rootJoint = null;
  this.endJoint = null;
  this.joints = [];
}

IKAnimator.prototype.setSkeletalModel = function(sm) {
  this.skeletalModel = sm;
  sm.hasIK = true;
};

IKAnimator.prototype.setRootJoint = function(name, useRefPose) {
  this.rootJoint = this.skeletalModel.getJoint(name, useRefPose);
};

IKAnimator.prototype.setEndJoint = function(name, useRefPose) {
  this.endJoint = this.skeletalModel.getJoint(name, useRefPose);
};

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
    this.modifyJoint(this.skeletalModel.frame0, this.joints[i], a);
    this.modifyJoint(this.skeletalModel.frame1, this.joints[i], a);
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
  /*
  if(this.endJoint == null){
    this.joints.push(this.rootJoint);
    var currJoint = this.rootJoint;
    console.debug(currJoint.name);

    while(currJoint.children.length > 0) {
      currJoint = currJoint.children[0];//Only taking first child
      console.debug(currJoint.name);
      this.joints.push(currJoint);
    }

  }else{
    this.joints.push(this.endJoint);
    var currJoint = this.endJoint;
    console.debug(currJoint.name);

    while(currJoint.parentID > -1 && currJoint != this.rootJoint) {
      currJoint = this.skeletalModel.getJointByID(currJoint.parentID, false);
      console.debug(currJoint.name);
      this.joints.unshift(currJoint);
    }
  }
  */
  this.tagControlledJoints();

};

IKAnimator.prototype.tagControlledJoints = function() {
  var currJoint = this.endJoint;
  currJoint.hasIK = true;

  while(currJoint.parentID > -1 && currJoint != this.rootJoint) {
    currJoint = this.skeletalModel.getJointByID(currJoint.parentID, false);
    currJoint.hasIK = true;
  }

};


