"use strict";

function IKAnimator(gl){
  this.skeletalModel;
  this.rootJoint = null;
  this.endJoint = null;
  this.joints = [];
}

IKAnimator.prototype.setSkeletalModel = function(sm) {
  this.skeletalModel = sm;
};

IKAnimator.prototype.setRootJoint = function(name, useRefPose) {
  this.rootJoint = this.skeletalModel.getJoint(name, useRefPose);
};

IKAnimator.prototype.setEndJoint = function(name, useRefPose) {
  this.endJoint = this.skeletalModel.getJoint(name, useRefPose);
};

IKAnimator.prototype.animate = function(time){
  if(this.skeletalModel.ready == false){
    return;
  }
  var angle = Math.sin(time);
  //This willl eventually have to interpolate between
  //TODO: FINISH THIS FUNCTION

  /*
  seems to be that you update the animationMatrix then premultiply it by the 
  reference pose inverse matrix to get the final matrix.
  */

  for( var i = 0; i < this.joints.length; i++ ) {
    var frame = this.skeletalModel.frame0;
    var joint = this.joints[i];
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



    ///////////////////////////////////////////////////////////////////////////
    frame = this.skeletalModel.frame1;
    mat = joint.animationCombinedBases[frame];
    normMat = joint.animationNormalBases[frame];
    animPose = joint.animationWorldBases[frame];
    if( joint.parentID != -1 ) {
      this.skeletalModel.currentJoints[joint.parentID].animationWorldBases[frame].copyInto(animPose);
    } else {
      animPose.identity();
    }
    animationTranslation = joint.animationTranslations[frame];
    animationRotation = joint.animationRotations[frame];
    animPose.translate(animationTranslation.x, animationTranslation.y, animationTranslation.z);
    animPose.rotateZ(animationRotation.z);
    animPose.rotateY(animationRotation.y);
    animPose.rotateX(animationRotation.x + angle);

    animPose.copyInto(mat);
    mat.preMultiply(this.skeletalModel.referencePose[jointID].referencePoseWorldToLocal.m);
    mat.clone().invert().transpose().copyInto(normMat);

    joint.currentMatrices[frame] = mat.clone();
    joint.currentNormalMatrices[frame] = normMat.clone();
    angle *= 0.5;
  }
  //this.skeletalModel.updateMesh();

  
}

IKAnimator.prototype.calculateJointArray = function() {
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

};


