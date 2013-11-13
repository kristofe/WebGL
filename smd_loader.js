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


function SMDLoader() {
  this.boneCount = 0;
  this.faceCount = 0;
  this.vertexCount = 0;
  
  this.referencePose = [];
  this.animations = [];
  this.triangles = [];
  this.materials = [];

  this.file = new TextFileReader();
}

SMDLoader.prototype.loadModel = function(url) {
  var smd = this;
  this.file.load(url, function() {smd.parseSMD();});
}

SMDLoader.prototype.parseSMD = function() {
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
}


SMDLoader.prototype.loadNodes = function() {
  var line = {text:""};
  while(this.file.getLine(line) != 0){
    if(line.text == "end") return;

    var pJoint = new HLJoint();
    this.boneCount++;
    line.text = line.text.replace(/"/g,"");
    var tokens = line.text.split(/\s+/g);//Split on whitespace
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

    line.text = line.text.replace(/"/g,"");
    var tokens = line.text.split(/\s+/g);//Split on whitespace

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

    line.text = line.text.replace(/"/g,"");
    var tokens = line.text.split(/\s+/g);//Split on whitespace

    var tri = new HLTriangle();
    this.triangles.push(tri);
    var material = new HLMaterial();

    var name = parseInt(tokens[0]);

    material.name = name;
    tri.materialName = name;

    this.materials[name] = material;

    this.faceCount++;
    for(var vertIdx = 0; vertIdx < 3; vertIdx++){
      this.file.getLine(line);
      line.text = line.text.replace(/"/g,"");
      var tokens = line.text.split(/\s+/g);//Split on whitespace

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

      if(boneWeightCount == 0 || totalWeight < 0.9989){
        var hlweight = new HLWeight();
        hlweight.id = v.joint;
        hlweight.weight = 1.0 - totalWeight;
        v.boneWeights.push(hlweight);
      }

      this.vertexCount++;


    }
  }
}







