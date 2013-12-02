"use strict";

function CCD(gl){
  this.gl = gl;
  this.joints = [];
  this.mesh = new Mesh(gl);
  this.material = new Material(gl);
  this.transform = new Transform();
  this.setupMaterial();

  this.effectorPosition = new Vector3(0,0,0);
  this.targetPosition = new Vector3(0,0,0);
  this.targetAngle = 0.0;
  this.setupJoints();
  this.calculateMesh();
}

CCD.prototype.setupJoints = function() {
  var j1 = new Joint();
  var j2 = new Joint();
  var j3 = new Joint();
  var j4 = new Joint();

  this.joints.push(j1,j2,j3,j4);

  j1.id = 0;
  j1.children.push(j2);
  j1.childCount = 1;
  j1.refPoseTranslation.set(0.0,0.0,0.0);
  
  j2.id = 1;
  j2.parentID = 0;
  j2.children.push(j3);
  j2.childCount = 1;
  j2.refPoseTranslation.set(0,0,8);

  j3.id = 2;
  j3.parentID = 1;
  j3.children.push(j4);
  j3.childCount = 1;
  j3.refPoseTranslation.set(0,0,8);

  j4.id = 3;
  j4.parentID = 2;
  j4.refPoseTranslation.set(0,0,8);

//  for(var i = 0; i < this.joints.length; i++){
//    var joint = this.joints[i];
//    joint.animationWorldBases.push(new Matrix44());
//    joint.animationTranslations.push(joint.refPoseTranslation.clone());
//    joint.animationRotations.push(new Vector3(0,0,0));
//    joint.currentMatrices = joint.animationWorldBases;
//  }
//
//
//  for(var i = 0; i < this.joints.length; i++){
//    var joint = this.joints[i];
//    var rot = new Quaternion();
//    rot.fromEulerAngles(joint.animationRotations[0]);
//    this.calculateJoint(
//                        0,
//                        joint, 
//                        joint.animationTranslations[0], 
//                        rot
//                        );
//
//  }

  this.calculateJointsState(true);

};



CCD.prototype.calculateMesh = function() {
  var positions = [];
  this.mesh.clear();

  //calculate positions
  //positions.push(new Vector3(0,0,0));
  for(var i = 0; i < this.joints.length; i++){
    var joint = this.joints[i];
//    var mat0 = joint.animationWorldBases[0];
//    var p = new Vector3(mat0.m[12], mat0.m[13], mat0.m[14]);
    var p = joint.ikWorldPosition;
    positions.push(p);
  }

  
  for(var i = 0; i < positions.length-1; i++) {
    var p0 = positions[i];
    var p1 = positions[i+1];
    this.mesh.positions.push(p0);
    this.mesh.positions.push(p1);

    var rb = i/this.joints.length;
    //var c = new Vector4(rb * 0.5, 0.0, rb, 1.0);
    var c = new Vector4(0, rb, 0, 1.0);

    this.mesh.colors.push(c);
    this.mesh.colors.push(c);
  }

  //add target!
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(0,-1,0)));
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(0,1,0)));
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(0,0,-1)));
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(0,0,1)));
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(-1,0,0)));
  this.mesh.positions.push(this.targetPosition.clone().add(new Vector3(1,0,0)));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));
  this.mesh.colors.push(new Vector4(1.0, 0.0, 0.0, 1.0));

  //add effector!
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,-0.5,0)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,0.5,0)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,0,-0.5)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0,0,0.5)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(-0.5,0,0)));
  this.mesh.positions.push(this.effectorPosition.clone().add(new Vector3(0.5,0,0)));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));
  this.mesh.colors.push(new Vector4(0.0, 0.0, 1.0, 1.0));

  this.mesh.primitiveType = this.gl.LINES;


  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    this.mesh.updateBuffers();
  } else {
    this.mesh.constructBuffers();
  }

};

CCD.prototype.animateTarget = function(time){
  //this.targetPosition = new Vector3(0,15,8);
  this.targetPosition = new Vector3(0,10,0);
  var radius = 20.0;
  var horizOffset =  Math.sin(time);
  var vertOffset = Math.cos(time);
  var depthOffset = Math.cos(time);
  this.targetPosition.x += horizOffset * radius;
  //this.targetPosition.y += vertOffset * radius;
  //this.targetPosition.z += depthOffset * radius;
}

CCD.prototype.calculateJointsState = function(init){

  for( var i = 0; i < this.joints.length; i++ ) {
    var joint = this.joints[i];
    if(true == init){
      joint.ikRotation.identity();
      joint.ikTranslation = joint.refPoseTranslation;
    }

    
    var targetMatrix = joint.ikWorldTransform;
    targetMatrix.identity();
    if( joint.parentID != -1 ) {
      //This should use this.skeletalModel.joints when ported to ik_animator
      //this.joints[joint.parentID].animationWorldBases[0].copyInto(targetMatrix);
      this.joints[joint.parentID].ikWorldTransform.copyInto(targetMatrix);
    }

    //This will store the parent's position;
    joint.ikWorldOrigin.set(
                            targetMatrix.m[12], 
                            targetMatrix.m[13], 
                            targetMatrix.m[14]
                           );

    targetMatrix.translate(
                            joint.ikTranslation.x, 
                            joint.ikTranslation.y, 
                            joint.ikTranslation.z
                          );
    targetMatrix.rotate(joint.ikRotation);

    joint.ikInverseWorldTransform = targetMatrix.clone().invert();

    joint.ikWorldPosition.set(
                              targetMatrix.m[12], 
                              targetMatrix.m[13], 
                              targetMatrix.m[14]
                             );
    var dir = new Vector3(0,0,1);
    joint.ikWorldDir = joint.ikWorldPosition.clone().subtract(joint.ikWorldOrigin);
    if(joint.ikWorldDir.length() > 0.001){
      joint.ikWorldDir.normalize();
    }
    else{
      joint.ikWorldDir = dir.transformDirection(targetMatrix).normalize();
    }
    this.effectorPosition = joint.ikWorldPosition;
  }
}

CCD.prototype.animate = function(time){
  this.animateTarget(time);
  var iterationCount = 0;

  var currMatrix = new Matrix44();
  while(iterationCount < 20){
    for( var i = this.joints.length -1; i >= 0; i-- ) {
      var joint = this.joints[i];

      var localEffectorPos = this.effectorPosition.clone().transform(
                                                  joint.ikInverseWorldTransform
                                                  );
      if(localEffectorPos.length() < 0.001){
        break;
      }
      var localDirToEffector = localEffectorPos.clone().normalize();
      var localTargetPos = this.targetPosition.clone().transform(
                                                  joint.ikInverseWorldTransform
                                                  );

      if(localTargetPos.length() < 0.001){
        continue;
      }
      var localTargetDir = localTargetPos.clone().normalize();
                                                  

//      var posDiff = this.targetPosition.clone().subtract(this.effectorPosition);
//      if(posDiff.length() < 0.001){
//        break;
//      }
//      var dir = this.effectorPosition.clone().subtract(joint.ikWorldOrigin);
//      if(dir.length() < 0.001){
//        continue;
//      }
//      dir.normalize();
//
//      var diff = this.targetPosition.clone().subtract(joint.ikWorldOrigin); 
//      if(diff.length() < 0.001){
//        continue;
//      }
      
      joint.ikRotation.identity().rotationTo(localTargetDir, localDirToEffector);
      this.calculateJointsState(false);
    }
    iterationCount++;
  }
  this.calculateMesh();
};

//CCD.prototype.calculateJoint = function(frame, joint, translation, rotation){
//  var jointID = joint.id;
//  //var mat = joint.animationCombinedBases[frame];
//
//  var targetMatrix = joint.currentMatrices[frame];
//  var animPose = joint.animationWorldBases[frame];
//  animPose.identity();
//  if( joint.parentID != -1 ) {
//    this.joints[joint.parentID].animationWorldBases[frame].copyInto(animPose);
//  }
//
//  animPose.translate(translation.x, translation.y, translation.z);
//  animPose.rotate(rotation);
//
//  return animPose;
//};

CCD.prototype.drawDebug = function(projMat, time){
 
  if(this.mesh.vertexBuffer instanceof WebGLBuffer){
    
    this.material.bind(this.mesh);
    //this.mesh.bind(this.material.shader);
    this.material.setUniforms(
        this.transform.matrix.m,
        this.transform.inverse.m,
        this.transform.inverseTranspose.m,
        projMat.m, 
        time
        );
    this.gl.drawArrays(
        this.mesh.primitiveType,
        0, 
        this.mesh.numItems
        );
  }
}


CCD.prototype.setupMaterial = function(gl){
  var fsSource="  precision mediump float;\n";
  fsSource +="\n";
  fsSource +="    varying vec4 vPosition;\n";
  fsSource +="    varying vec2 vUV;\n";
  fsSource +="    varying vec3 vNormal;\n";
  fsSource +="    varying vec3 vTangent;\n";
  fsSource +="    varying vec3 vBitangent;\n";
  fsSource +="    varying vec4 vVertColor;\n";
  fsSource +="\n";
  fsSource +="    uniform float uTime;\n";
  fsSource +="    uniform mat4 uMVMatrix;\n";
  fsSource +="\n";
  fsSource +="    void main(void) {\n";
  fsSource +="      gl_FragColor = vVertColor;\n";
  fsSource +="    }\n";

  var vsSource="  precision mediump float;\n";
  vsSource +="    attribute vec3 aVertexPosition;\n";
  vsSource +="    attribute vec3 aVertexNormal;\n";
  vsSource +="    attribute vec2 aVertexUV;\n";
  vsSource +="    attribute vec4 aVertexTangent;\n";
  vsSource +="    attribute vec4 aVertexColor;\n";
  vsSource +="\n";
  vsSource +="    uniform mat4 uMVMatrix;\n";
  vsSource +="    uniform mat4 uInverse;\n";
  vsSource +="    uniform mat4 uInverseTranspose;\n";
  vsSource +="    uniform mat4 uPMatrix;\n";
  vsSource +="    uniform float uTime;\n";
  vsSource +="\n";
  vsSource +="    varying vec4 vPosition;\n";
  vsSource +="    varying vec2 vUV;\n";
  vsSource +="    varying vec3 vNormal;\n";
  vsSource +="    varying vec3 vTangent;\n";
  vsSource +="    varying vec3 vBitangent;\n";
  vsSource +="    varying vec4 vVertColor;\n";
  vsSource +="\n";
  vsSource +="    void main(void) {\n";
  vsSource +="        vPosition = uMVMatrix * vec4(aVertexPosition,1.0);\n";
  //vsSource +="        vPosition = vec4(aVertexPosition,1.0);\n";
  vsSource +="        vVertColor = aVertexColor;\n";
  vsSource +="        vUV = aVertexUV.xy;\n";
  vsSource +="        vNormal = aVertexNormal.xyz;\n";
  vsSource +="        vTangent = aVertexTangent.xyz;\n";
  vsSource +="        gl_Position = uPMatrix * vPosition;\n";
  vsSource +="    }\n";

  this.material.shader.initShaderWithSource(fsSource,vsSource);
  this.material.zTest = false;
  this.material.zWrite = false;
  this.material.lineWidth = 3.0;

};




