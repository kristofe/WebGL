"use strict";

function MatrixStack(){
  this.stack = [];
}

function Joint(){
  this.id = -1;
  this.name = "";
  this.parentID = -1;
  this.children = [];
  this.childCount = 0;

  this.refPoseTranslation = new Vector3(0,0,0);
  this.refPoseOrientation = new Vector3(0,0,0);
  this.referencePoseLocalBasis = new Matrix44();
	this.referencePoseWorldBasis = new Matrix44();
  this.animationRotations = [];
  this.animationTranslations = [];
  this.animationLocalBases = [];//array of Matrix44
  this.animationWorldBases = [];//array of Matrix44
  this.animationNormalBases = [];//array of Matrix44
  this.animationCombinedBases = [];//array of Matrix44

  this.modelCoordPosition = new Vector3(0,0,0);
  this.currOrientation = new Vector3(0,0,0);
}

function JointWeight(){
  this.id = -1;
  this.weight = 0.0;
}

function JointWeightedVertex(){
  this.vertIndex = -1;
  this.defaultJoint = -1;
  this.jointWeights = [];//Array of JointWeights
}

function Face(){
  this.materialID = -1;
  this.referencePositions = [-1,-1, -1];
}

function SkeletalVertex() {
  this.v = new Vector3(0,0,0);
  this.n = new Vector3(0,0,0);
  this.s = 0;
  this.t = 0;
  this.matID = 0;

}

SkeletalVertex.prototype.clone = function(){
  var r = new SkeletalVertex();
  r.v = this.v.clone();
  r.n = this.n.clone();
  r.s = this.s;
  r.t = this.t;
  r.matID = this.matID;
  return r;
};

SkeletalModel.prototype = new Model();
SkeletalModel.prototype.constructor = SkeletalModel;

function SkeletalModel(gl){
  Model.call(this, gl);
   
  this.basePath = "";
  this.meshes = [];
  this.materials = []; //Material
  this.materialsMap = [];//Material
  this.currentJoints = [];//Joint
  this.referencePose = [];//Joint
  this.faces = [];
  this.referenceVertices = [];//Vertex
  this.currentVertices = [];
  this.jointWeightedVertices = [];//JointWeightedVertex
  this.animations = [];//map<string, array of joints>
  this.animationFrameCount = [];//int

  this.currentAnimationFrames = 0;
  this.currentFrame = 0;
  
  this.fCurrentAnimStartTime = 40.0;
  this.fCurrentAnimEndTime = 215.0;
  this.fTotalAnimationTime = 215.0;

  this.frame0 = 0;
  this.frame1 = 0;
  this.frame0Weight = 0.0;
  this.frame1Weight = 0.0;

  this.inReferencePose = false;
  this.matrixStack = new MatrixStack();
  this.lastUpdateTime = -1.0;
  this.fCurrentAnimationTime = 0.0;

  //Config data
  this.iLoopCount = 0;
  this.bInifinteLooped = true;
  this.bCurrAnimationLooped = true;
  this.fFPS = 15.0;
  this.fFPSModifier = 1.0;
  this.bFPSMutable = false;

  this.mapAnimationConfigs = [];//Map<string, SkeletalAnimationConfig>
  this.szCurrAnimName = "all";

  this.smdLoader = [];
  this.modelURL = "";
  this.animationURL = "";
  this.animationName = "";

  this.ready = false;
}

SkeletalModel.prototype.loadSMD = function(basepath, modelURL, animURL, animationName){
  this.smdLoader = new SMDLoader(this.gl);
  this.basePath = basepath;
  this.modelURL = modelURL;
  this.animationURL = animURL;
  this.animationName = animationName;

  var sm = this;
  var doneCB = function() {sm.doneLoadingModel();};
  this.smdLoader.loadModel(this.basePath, this.modelURL, this, doneCB);
};

SkeletalModel.prototype.doneLoadingModel = function(){
  console.debug("done loading model");
  var sm = this;
  var doneCB = function() { sm.doneLoadingAnimation();};
  this.smdLoader.loadAnimation(this.basePath, this.animationURL, this.animationName,  this, doneCB);
};

SkeletalModel.prototype.doneLoadingAnimation = function(){
  console.debug("done loading animation");

  this.init();
  this.setAnimationBones("all");
  this.ready = true;
};

SkeletalModel.prototype.init = function() {
 this.createMeshes();//create triangles and/or indices

 this.currentJoints = this.referencePose;
 this.currentAnimationFrames = this.animationFrameCount.referencePose;

 //Populate Joints Children Lists
	for(var i = 0; i < this.currentJoints.length; i++){
    var pJoint = this.currentJoints[i];
		if(pJoint.parentID >= 0){
			var pParent = this.currentJoints[pJoint.parentID];
			pParent.children.push(pJoint);
			pParent.childCount++;
		}
		pJoint.currOrientation = pJoint.refPoseOrientation;
	}
	this.calculateRefPose();

	this.initAnimations();
	this.ulLastUpdateTime = 0;//currTime;
	this.szCurrAnimName = "idle";
};


SkeletalModel.prototype.calculateRefPose = function(){
	var currentRefPoseCumulativeBoneTransforms = [];
  for(var i = 0; i < this.currentJoints.length; i++) {
    currentRefPoseCumulativeBoneTransforms[i] = new Matrix44();
  }

	for(var j = 0; j < this.currentJoints.length; j++) {
		var joint = this.currentJoints[j];
		var mat = joint.referencePoseLocalBasis;

		// accumulate our current animation cumulative bone transform
		var refPose = currentRefPoseCumulativeBoneTransforms[j];
		if( joint.parentID != -1 ) {
			currentRefPoseCumulativeBoneTransforms[joint.parentID].copyInto( refPose);
		} else {
			refPose.identity();
		}

		var refTranslation = joint.refPoseTranslation;
		var refRotation = joint.refPoseOrientation;
		refPose.translate(refTranslation.x, refTranslation.y, refTranslation.z);
		refPose.rotateZ(refRotation.z);
		refPose.rotateY(refRotation.y);
		refPose.rotateX(refRotation.x);

		refPose.copyInto(mat);
		joint.referencePoseWorldBasis = mat.clone().invert();
	}
};

SkeletalModel.prototype.updateAllAnimationBones = function(){
	//This routine takes advantage of the fact that
	//Children bones always appear in the list after their parent
	//That property allows us to use a loop instead of recursion.

  var currentAnimPoseCumulativeBoneTransforms = [];
  for(var i = 0; i < this.currentJoints.length; i++) {
    currentAnimPoseCumulativeBoneTransforms[i] = new Matrix44();
  }

  for (var key in this.animations) {
    if (this.animations.hasOwnProperty(key)) {
  
      this.currentJoints = this.animations[key];
      this.currentAnimationFrames = this.animationFrameCount[key];
      for(var i = 0; i < this.currentAnimationFrames; i++){
        this.currentFrame = i;
        for(var j = 0; j < this.currentJoints.length; j++) {
          var joint = this.currentJoints[j];
          var mat = joint.animationCombinedBases[i];
          var normMat = joint.animationNormalBases[i];

          // accumulate our current animation cumulative bone transform
          var animPose = currentAnimPoseCumulativeBoneTransforms[j];
          if( joint.parentID != -1 ) {
            currentAnimPoseCumulativeBoneTransforms[joint.parentID].copyInto( animPose);
          } else {
            animPose.identity();
          }

          var animationTranslation = joint.animationTranslations[i];
          var animationRotation = joint.animationRotations[i];
          animPose.translate(animationTranslation.x, animationTranslation.y, animationTranslation.z);
          animPose.rotateZ(animationRotation.z);
          animPose.rotateY(animationRotation.y);
          animPose.rotateX(animationRotation.x);

          animPose.copyInto(mat);
          mat.preMultiply(this.referencePose[j].referencePoseWorldBasis.m);
          mat.clone().invert().transpose().copyInto(normMat);
        }
      }
    }
	}
};

SkeletalModel.prototype.initAnimations = function(){
	//loop through all the animations and calculate all of the joints children
	//this makes it easier to traverse bone tree.
	//Then setup the bones matrix.

  for (var key in this.animations) {
    if (this.animations.hasOwnProperty(key)) {
  
      var maxFrames = 0;
      this.currentJoints = this.animations[key];

      //Populate Joints Children Lists
      for(var i = 0; i < this.currentJoints.length; i++){
        var pJoint = this.currentJoints[i];
        pJoint.currOrientation = pJoint.refPoseOrientation.clone();
        
        var numAnimationKeys = pJoint.animationRotations.length;

        for(var j = 0; j < numAnimationKeys; j++){
          pJoint.animationNormalBases.push(new Matrix44());
          pJoint.animationCombinedBases.push(new Matrix44());
        }
        if(pJoint.animationRotations.length > maxFrames){
          maxFrames = pJoint.animationRotations.length;
        }

      }
      this.animationFrameCount[key] = maxFrames;
      this.currentAnimationFrames = maxFrames;
    }
	}
	this.updateAllAnimationBones();
	
	this.currentFrame = 0;

};


SkeletalModel.prototype.createMeshes = function() {
  console.debug("SkeletalModel createMesh()");
  this.meshes = [];
  for(var i = 0; i < this.materials.length; i++){
    var mesh = new Mesh(this.gl);
    this.meshes.push(mesh);
    this.materials[i].shader = this.material.shader;
  }

  
  for(var i = 0; i < this.referenceVertices.length; i++){
    var svert = this.referenceVertices[i];
    var pos = svert.v;
    var norm = svert.n;
    var uv = new Vector2(svert.s, svert.t);
    var mesh = this.meshes[svert.matID];
    mesh.positions.push(pos);
    mesh.normals.push(norm);
    mesh.uvs.push(uv);
  }

  for(var i = 0; i < this.meshes.length; i++){
    this.meshes[i].constructBuffers();
  }

};

SkeletalModel.prototype.updateMeshes = function() {
  for(var i = 0; i < this.meshes.length; i++){
    this.meshes[i].clear();
  }

  for(var i = 0; i < this.currentVertices.length; i++){
    var svert = this.currentVertices[i];
    var pos = svert.v;
    var norm = svert.n;
    var uv = new Vector2(svert.s, svert.t);
    var mesh = this.meshes[svert.matID];
    mesh.positions.push(pos);
    mesh.normals.push(norm);
    mesh.uvs.push(uv);
  }
  
  for(var i = 0; i < this.meshes.length; i++){
    this.meshes[i].updateBuffers();
  }
};

SkeletalModel.prototype.draw = function(projMat, time){ 
   
  //TODO: put culling into material
  this.gl.disable(this.gl.CULL_FACE);
  for(var i = 0; i < this.meshes.length; i++){
    if(this.meshes[i].vertexBuffer != -1){
      var mesh = this.meshes[i];
      var material = this.materials[i];
      material.bind(mesh);
      //mesh.bind(material.shader);
      material.setUniforms(
          this.transform.matrix.m,
          this.transform.inverse.m,
          this.transform.inverseTranspose.m,
          projMat.m, 
          time
          );
        this.gl.drawArrays( mesh.primitiveType, 0, mesh.numItems);
    }
  }
  this.gl.enable(this.gl.CULL_FACE);
};

SkeletalModel.prototype.setAnimationBones = function(name) {
  if(this.ready === false) return;
  var anim = this.animations[name];
  if(anim !== undefined){
    this.currentJoints = anim;
    this.currentAnimationFrames = this.animationFrameCount[name];
  }
};

SkeletalModel.prototype.setTime = function(t){
  if(this.ready === false) return;

	var elapsedTimeInSeconds = t - this.lastUpdateTime;
	if(elapsedTimeInSeconds < 0.033)//Update the mesh every 33ms or 30 times a second
		return;

	this.lastUpdateTime = t;

	this.fCurrentAnimationTime += elapsedTimeInSeconds * this.fFPS *
                                      this.fFPSModifier;

	if(this.fCurrentAnimationTime > this.fCurrentAnimEndTime){
			this.fCurrentAnimationTime = this.fCurrentAnimStartTime + 
              this.fCurrentAnimationTime % this.fCurrentAnimEndTime;

			if(this.bCurrAnimationLooped === false){
        //Animation Ended
				this.fCurrentAnimationTime = this.fCurrentAnimEndTime;

			}else if(!this.bInfiniteLooped){
				if(this.iLoopCount > 0){
          //Animation looped
					this.iLoopCount--;
				}else{
          //Animation Ended
					this.fCurrentAnimationTime = this.fCurrentAnimEndTime;
				}
			}else{
        //Animation Looped
			}
	}else if(this.fCurrentAnimationTime < this.fCurrentAnimStartTime){
    //Animation Started
		this.fCurrentAnimationTime = this.fCurrentAnimStartTime;
	}

	this.frame0	=	Math.floor(this.fCurrentAnimationTime);
	this.frame0Weight = 1.0 - (this.fCurrentAnimationTime - this.frame0);
	this.frame1Weight = 1.0 - this.frame0Weight;
	this.frame1	=	this.frame0 + 1;
	if(this.frame1 > this.fCurrentAnimEndTime ){
			this.frame1 = Math.floor(this.fCurrentAnimStartTime);

	}
	if(this.fTotalAnimationTime < 0.01){
		this.frame1 = this.frame0;
		this.frame0Weight = 1.0;
		this.frame1Weight = 0.0;
	}
	this.updateMesh();
};


SkeletalModel.prototype.updateMesh = function(){
	var pJoint;
	var pFace;
	var pJointWeightedVert;
	var pRefVertex, pCurrVertex;
	var pMatrix;

	for(var i = 0; i < this.faces.length; i++){
		pFace = this.faces[i];
		for(var j = 0; j < 3; j++){
			pJointWeightedVert = this.jointWeightedVertices[pFace.referencePositions[j]];
			pRefVertex = this.referenceVertices[pJointWeightedVert.vertIndex].clone();
			pCurrVertex = this.currentVertices[pJointWeightedVert.vertIndex];
			var currVert = new Vector3(0,0,0);
			var currNorm = new Vector3(0,0,0);

			for(var k = 0; k < pJointWeightedVert.jointWeights.length; k++){
				pJoint = this.currentJoints[pJointWeightedVert.jointWeights[k].id];
				
				//Frame0
				var frame = this.frame0;
				if(frame >= pJoint.animationCombinedBases.length)
					frame = pJoint.animationCombinedBases.length- 1;

				var currVertTemp = new Vector3(pRefVertex.v.x,pRefVertex.v.y,pRefVertex.v.z);
				var normTemp = new Vector3(pRefVertex.n.x,pRefVertex.n.y,pRefVertex.n.z);

				pMatrix = pJoint.animationCombinedBases[frame];
				currVertTemp.transform(pMatrix);

				currVert.add(
            currVertTemp.scale(
              pJointWeightedVert.jointWeights[k].weight * this.frame0Weight
              )
            );
				
				normTemp.transform(pJoint.animationNormalBases[frame]);

				currNorm = Vector3.add(
                    currNorm,
                    normTemp.scale(this.frame0Weight)
                   );
				
				//Frame1
				frame = this.frame1;
				if(frame >= pJoint.animationCombinedBases.length)
					frame = pJoint.animationCombinedBases.length - 1;

				currVertTemp.set(pRefVertex.v.x,pRefVertex.v.y,pRefVertex.v.z);
				normTemp.set(pRefVertex.n.x,pRefVertex.n.y,pRefVertex.n.z);

				pMatrix = pJoint.animationCombinedBases[frame];
				currVertTemp.transform(pMatrix);

				currVert.add(
            currVertTemp.scale(
              pJointWeightedVert.jointWeights[k].weight * this.frame1Weight
              )
            );

				normTemp.transform(pJoint.animationNormalBases[frame]);
        currNorm = Vector3.add(
                  currNorm,
                  normTemp.scale(this.frame0Weight)
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
  this.updateMeshes();
};


