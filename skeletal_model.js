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
  this.vertIdx = -1;
  this.defaultJoint = -1;
  this.jointWeights = [];//Array of JointWeights
}

function Face(){
  this.materialID = -1;
  this.referencePositions = [-1,-1, -1];
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

}
