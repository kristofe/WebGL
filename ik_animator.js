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

  /*
  seems to be that you update the animationMatrix then premultiply it by the 
  reference pose inverse matrix to get the final matrix.
  */

  //So update frame0 and frame1 animation matrix then premultiply the refPoseMatrix
  //Then update the mesh

  //This is a copy of the updateMesh() routine from skeletal model.  It allows
  //me to experiment with some joints.  
  //This is totally ineffecient and needs to be replaces.  It calculates the 
  //position of every vertex twice.  What should really happen is manipulating 
  //bones/joints and only update the mesh once.

  //Fix by adding an extra set of matrices to each bone that if is filled in
  //replaces/or blends with the current animation

  
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


