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

}

SkeletalModel.prototype = new Model();
SkeletalModel.prototype.constructor = SkeletalModel;

function SkeletalModel(gl){
  Model.call(this, gl);

  this.basePath = "";
  this.materials = []; //Material
  this.materialsMap = [];//Material
  this.currentJoints = [];//Joint
  this.referencePose = [];//Joint
  this.rootsIndices = [];//int
  this.faces = [];
  this.referenceVertices = [];//Vertex
  this.currentVertices = [];
  this.jointWeightedVertices = [];//JointWeightedVertex
  this.animations = [];//map<string, array of joints>
  this.animationFrameCount = [];//int

  this.currentAnimationFrames = 0;
  this.currentFrame = 0;
  
  this.fCurrentAnimStartTime = 0.0;
  this.fCurrentAnimEndTime = 0.0;
  this.fTotalAnimationTime = 0.0;

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
  this.fFPS = 30.0;
  this.fFPSModifier = 1.0;
  this.bFPSMutable = false;

  this.mapAnimationConfigs = [];//Map<string, SkeletalAnimationConfig>
  this.szCurrAnimName = "";

  this.smdLoader = [];
  this.modelURL = "";
  this.animationURL = "";
  this.animationName = "";
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
}

SkeletalModel.prototype.doneLoadingModel = function(){
  console.debug("done loading model");
  var sm = this;
  var doneCB = function() { sm.doneLoadingAnimation();};
  this.smdLoader.loadAnimation(this.basePath, this.animationURL, this.animationName,  this, doneCB);
}

SkeletalModel.prototype.doneLoadingAnimation = function(){
  console.debug("done loading animation");

  this.updateAnimationMetaData();
  this.init();
  this.setAnimationBones();
}

SkeletalModel.prototype.updateAnimationMetaData = function() {
  //TODO: Implement this
  
}

SkeletalModel.prototype.init = function() {
 this.createMesh();//create triangles and/or indices

 this.currentJoints = this.referencePose;
 this.currentAnimationFrames = this.animationFrameCount["referencePose"];

 //TODO: finish implementing this function and all of the functions that it calls

}


SkeletalModel.prototype.createMesh = function() {
  //TODO: implement me!
}

SkeletalModel.prototype.setAnimationBones = function() {
  //TODO: implement me!
}

