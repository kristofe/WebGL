"use strict";

function HLMaterial() {
  this.id = 0;
  this.name = "";
}

function HLWeight() {
  this.id = 0;
  this.weight = 0;
}

function HLVertex() {
  this.v = new Vector3(0,0,0);
  this.n = new Vector3(0,0,0);
  this.s = 0;
  this.t = 0;
  this.joint = 0;
  this.boneWeights = []; //HLWeight
}

HLVertex.prototype.copyToVertex = function(vert) {
  vert.addVec3Data(this.v);
  vert.addVec3Data(this.n);
  var uv = new Vector2(this.s, this.t);
  vert.addVec2Data(uv);
  vert.addVec4Data();//Blank tangent
  vert.addVec4Data();//Blank color
}

function HLJoint() {
  this.id = 0;
  this.name = "";
  this.parent = 0;
  this.referenceTranslation = new Vector3(0,0,0);
  this.referenceRotation = new Vector3(0,0,0);
  this.animationTranslations = []; //Vector3
  this.animationRotations = []; //Vector3
}

function HLTriangle(){
  this.jointID;
  this.materialName;
  this.materialID;
  this.referencePositions = [];//HLVertex
  this.referenceNormals = [];//Vector3
  this.textureCoordinates = [];//Vector3

  for(var i = 0; i < 3; i++){
    this.referencePositions.push(new HLVertex());
    this.referenceNormals.push(new Vector3());
    this.textureCoordinates.push(new Vector3());
  }
}


function SMDLoader(gl) {
  this.gl = gl;
  this.boneCount = 0;
  this.faceCount = 0;
  this.vertexCount = 0;
  
  this.referencePose = [];
  this.animations = [];
  this.triangles = [];
  this.materials = [];

  this.file = new TextFileReader();
  this.basePath = "";
  this.url = "";
}

SMDLoader.prototype.splitLine = function(line) {
  line.text = line.text.replace(/"/g,"");
  return line.text.split(/\s+/g);//
}

SMDLoader.prototype.loadModel = function(basepath,url, skeletalModel, doneCallback) {
  var smd = this;
  this.url = url;
  this.basePath = basepath;

  this.file.load(basepath + url, function() {smd.parseSMD(skeletalModel); doneCallback();});
}

SMDLoader.prototype.loadAnimation = function(basepath,url,name, skeletalModel, doneCallback) {
  var smd = this;
  this.url = url;
  this.basePath = basepath;
  this.busyWait = true;
  this.file.load(basepath + url, function() {smd.parseAnimation(name, skeletalModel); doneCallback();});
}


SMDLoader.prototype.parseSMD = function(skeletalModel) {
  //console.debug(this.file.allText);

  //Load data into intermediate format
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "nodes"){
      console.debug("Found nodes start");
      this.loadNodes();
    }else if(line.text == "skeleton") {
      console.debug("Found skeleton start");
      this.loadSkeleton();
    }else if(line.text == "triangles") {
      console.debug("Found triangles start");
      this.loadTriangles();
    }
  }


  //Convert the parsed format into the engine format
  //Check materials
  var matID = 0;
  for (var key in this.materials) {
    if (this.materials.hasOwnProperty(key)) {
      var hlmat = this.materials[key];
      var mat = new Material(this.gl);
      mat.name = key;
      mat.id = matID++;

      var tex = new Texture(this.gl);
      tex.load(this.basePath + hlmat.name, 0);
      mat.setTexture(tex);
      skeletalModel.materials.push(mat);
      skeletalModel.materialsMap[mat.name] = mat;
    }
  }

  for(var i = 0; i < this.referencePose.length; i++){
    var hlJoint = this.referencePose[i];
    var joint = new Joint();
    joint.id = hlJoint.id;
    joint.name = hlJoint.name;
    joint.parentID = hlJoint.parent;
    joint.refPoseTranslation = hlJoint.referenceTranslation;
    joint.refPoseOrientation = hlJoint.referenceRotation;
    joint.animationRotations = hlJoint.animationRotations;
    joint.animationTranslations = hlJoint.animationTranslations;

    skeletalModel.referencePose.push(joint);
  }


  //Now load triangles
  var currVertex = 0;
  var currNormal = 0;
  var currTexCood = 0;

  for(var tidx = 0; tidx < this.triangles.length; tidx++) {
    var hlTri = this.triangles[tidx];
    var face = new Face();
    skeletalModel.faces.push(face);

    var key = hlTri.materialName;
    var mat = skeletalModel.materialsMap[key];
    face.materialID = mat.id;

    var hlv;
    for(var i = 0; i < 3; i++){
      var jwv = new JointWeightedVertex();
      var svert = new SkeletalVertex();
      hlv = hlTri.referencePositions[i];
      svert.v = hlv.v.clone();
      svert.n = hlv.n.clone();
      svert.s = hlv.s;
      svert.t = hlv.t;
      svert.matID = mat.id;

      jwv.defaultJoint = hlv.joint;
      jwv.jointWeights = hlv.boneWeights;
      skeletalModel.referenceVertices.push(svert.clone());
      skeletalModel.currentVertices.push(svert.clone());
      jwv.vertIndex = skeletalModel.referenceVertices.length - 1;
      skeletalModel.jointWeightedVertices.push(jwv);
      face.referencePositions[i] = currVertex++;
    }
  }
}

SMDLoader.prototype.parseAnimation = function(name, skeletalModel) {
  //Load data into intermediate format
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "time") continue;
    if(line.text == "nodes"){
      console.debug("Found animation nodes start");
      this.loadAnimationNodes(name);
    }else if(line.text == "skeleton") {
      console.debug("Found animation skeleton start");
      this.loadAnimationSkeleton(name);
    }
  }

  this.copyAnimationData(skeletalModel);
}

SMDLoader.prototype.loadNodes = function() {
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end") return;

    var pJoint = new HLJoint();
    this.boneCount++;
    var tokens = this.splitLine(line);
    var i = 0;
    pJoint.id = parseInt(tokens[i++]);
    pJoint.name = tokens[i++];
    pJoint.parent = parseInt(tokens[i++]);

    this.referencePose.push(pJoint);
  }
}

SMDLoader.prototype.loadSkeleton = function() {
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end") return;

    var tokens = this.splitLine(line);

    if(tokens[0] == "time") continue;

    var i = 0;

    var id = parseInt(tokens[i++]);
    var pJoint = this.referencePose[id];
    var p = new Vector3(0,0,0);
    var r = new Vector3(0,0,0);

    p.x = parseFloat(tokens[i++]);
    p.y = parseFloat(tokens[i++]);
    p.z = parseFloat(tokens[i++]);

    r.x = parseFloat(tokens[i++]);
    r.y = parseFloat(tokens[i++]);
    r.z = parseFloat(tokens[i++]);

    pJoint.referenceTranslation = p;
    pJoint.referenceRotation = r;
    pJoint.animationTranslations.push(p);
    pJoint.animationRotations.push(r);
  }
}

SMDLoader.prototype.loadTriangles = function() {
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end") return;

    var tokens = this.splitLine(line);

    var tri = new HLTriangle();
    this.triangles.push(tri);
    var material = new HLMaterial();

    var name = tokens[0];

    material.name = name;
    tri.materialName = name;

    this.materials[name] = material;

    this.faceCount++;
    for(var vertIdx = 0; vertIdx < 3; vertIdx++){
      this.file.getLine(line);
      var tokens = this.splitLine(line);

      var v = tri.referencePositions[vertIdx];
      var vn = tri.referenceNormals[vertIdx];
      var vt = tri.textureCoordinates[vertIdx];

      var i = 0;

      v.joint = parseInt(tokens[i++]);
      v.v.x = parseFloat(tokens[i++]);
      v.v.y = parseFloat(tokens[i++]);
      v.v.z = parseFloat(tokens[i++]);

      v.n.x = parseFloat(tokens[i++]);
      v.n.y = parseFloat(tokens[i++]);
      v.n.z = parseFloat(tokens[i++]);

      v.s = parseFloat(tokens[i++]);
      v.t = parseFloat(tokens[i++]);

      var boneWeightCount = parseInt(tokens[i++]);
      var totalWeight = 0.0;
      for(var boneIt = 0; boneIt < boneWeightCount; boneIt++) {

        var boneId = parseInt(tokens[i++]);
        var boneWeight = parseFloat(tokens[i++]);
        var hlweight = new HLWeight();
        hlweight.id = boneId;
        hlweight.weight = boneWeight;

        v.boneWeights.push(hlweight);
        totalWeight += boneWeight;
      }

      //This is not necessary for now..
      if(boneWeightCount == 0){
        var hlweight = new HLWeight();
        hlweight.id = v.joint;
        hlweight.weight = 1.0 - totalWeight;
        v.boneWeights.push(hlweight);
        totalWeight = 1.0;
      }
      if(totalWeight < 0.9989){
        var hlweight = new HLWeight();
        hlweight.id = v.joint;
        hlweight.weight = 1.0 - totalWeight;
        v.boneWeights.push(hlweight);
      }

      this.vertexCount++;


    }
  }
}

SMDLoader.prototype.loadAnimationNodes = function(name) {
  console.assert(name != undefined);

  var animation = []; //array of joints

  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end"){
      this.animations[name] = animation; 
      return;
    }

    var pJoint = new HLJoint();
    var tokens = this.splitLine(line);

    var i = 0;
    pJoint.id = parseInt(tokens[i++]);
    pJoint.name = tokens[i++];
    pJoint.parent = parseInt(tokens[i++]);

    animation.push(pJoint);
  }

}

SMDLoader.prototype.loadAnimationSkeleton = function(name) {
  console.assert(name != undefined);

  var animation = this.animations[name];

  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end") return;

    var tokens = this.splitLine(line);

    if(tokens[0] == "time") continue;

    var i = 0;

    var p = new Vector3(0,0,0);
    var r = new Vector3(0,0,0);
    var id = parseInt(tokens[i++]);

    p.x = parseFloat(tokens[i++]);
    p.y = parseFloat(tokens[i++]);
    p.z = parseFloat(tokens[i++]);

    r.x = parseFloat(tokens[i++]);
    r.y = parseFloat(tokens[i++]);
    r.z = parseFloat(tokens[i++]);

    var pJoint = animation[id];
    pJoint.animationTranslations.push(p);
    pJoint.animationRotations.push(r);
  }
}


SMDLoader.prototype.copyAnimationData = function(skeleton){
  for (var animName in this.animations) {
    if (this.animations.hasOwnProperty(animName) == false) continue;

    var hlAnimation = this.animations[animName];
    var animation = [];
    for(var jointIdx = 0; jointIdx < hlAnimation.length; jointIdx++){
      var hlJoint = hlAnimation[jointIdx];
      var pJoint = new Joint();
      pJoint.id = hlJoint.id;
      pJoint.name = hlJoint.name;
      pJoint.parentID = hlJoint.parent;
      if(pJoint.parentID > -1){
        animation[pJoint.parentID].children.push(pJoint);
      }

      pJoint.refPoseTranslation = hlJoint.referenceTranslation;
      pJoint.refPoseOrientation = hlJoint.referenceRotation;

      pJoint.animationRotations = hlJoint.animationRotations;
      pJoint.animationTranslations = hlJoint.animationTranslations;

      animation.push(pJoint);
    }
    skeleton.animations[animName] = animation;
    skeleton.currentJoints = animation;
    skeleton.szCurrAnimName = animName;
  }
}
