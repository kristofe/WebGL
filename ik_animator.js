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
  var angle = Math.sin(time);
  //TODO: FINISH THIS FUNCTION


  //at the end recalculate refPose
  this.skeletalModel.calculateRefPose();
  this.skeletalModel.updateMesh();
  
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
    this.joints.push(this.rootJoint);
    var currJoint = this.rootJoint;
    console.debug(currJoint.name);

    while(currJoint.children.length > 0 && currJoint != this.endJoint) {
      currJoint = currJoint.children[0];//Only taking first child
      console.debug(currJoint.name);
      this.joints.push(currJoint);
    }
  }

};


