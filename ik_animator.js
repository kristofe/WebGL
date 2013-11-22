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
	var pJoint;
	var pFace;
	var pJointWeightedVert;
	var pRefVertex, pCurrVertex;
	var pMatrix;

	for(var i = 0; i < this.skeletalModel.faces.length; i++){
		pFace = this.skeletalModel.faces[i];
		for(var j = 0; j < 3; j++){
			pJointWeightedVert = this.skeletalModel.jointWeightedVertices[pFace.referencePositions[j]];
			pRefVertex = this.skeletalModel.referenceVertices[pJointWeightedVert.vertIndex].clone();
			pCurrVertex = this.skeletalModel.currentVertices[pJointWeightedVert.vertIndex];
			var currVert = new Vector3(0,0,0);
			var currNorm = new Vector3(0,0,0);

			for(var k = 0; k < pJointWeightedVert.jointWeights.length; k++){
				pJoint = this.skeletalModel.currentJoints[pJointWeightedVert.jointWeights[k].id];
				
				//Only using the first frame
				var frame = this.skeletalModel.frame0;
				if(frame >= pJoint.animationCombinedBases.length)
					frame = pJoint.animationCombinedBases.length- 1;

				var currVertTemp = new Vector3(pRefVertex.v.x,pRefVertex.v.y,pRefVertex.v.z);
				var normTemp = new Vector3(pRefVertex.n.x,pRefVertex.n.y,pRefVertex.n.z);

				pMatrix = pJoint.animationCombinedBases[frame];
				currVertTemp.transform(pMatrix);

				currVert.add(
            currVertTemp.scale(
              pJointWeightedVert.jointWeights[k].weight * this.skeletalModel.frame0Weight
              )
            );

				normTemp.transform(pJoint.animationNormalBases[frame]);

				currNorm = Vector3.add(
                    currNorm,
                    normTemp.scale(this.skeletalModel.frame0Weight)
                   );
				

			}	

			pCurrVertex.v.x = currVert.x;
      pCurrVertex.v.y = currVert.y;
      pCurrVertex.v.z = currVert.z;

			pCurrVertex.n.x = currNorm.x;
      pCurrVertex.n.y = currNorm.y;
      pCurrVertex.n.z = currNorm.z;
		}
	}
  this.skeletalModel.updateMeshes();
};

  
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


