test("IKAlignment: Test that quaternion.rotateTo works", function() {
   var ikTester = new IKTester();
   ok(true == ikTester.runAlignmentTest(), "IK Align Direction");
});


function IKTester(gl){
  this.effectorPosition = new Vector3(0,0,0);
}


IKTester.prototype.runAlignmentTest = function(){
  var time = 0;
  while(time < 2*Math.PI){
    var d = this.testAlignment(time);
    if(d < 0.9999){
      console.error("Failed alignment test at time " + time);
      return false;
    }
    time += 0.1;  
      
  }
  return true;
};

IKTester.prototype.animateEffector = function(time){
  this.effectorPosition = new Vector3(0,15,8);
  var radius = 20.0;
  var horizOffset =  Math.sin(time);
  var vertOffset = Math.cos(time);
  var depthOffset = Math.cos(time);
  this.effectorPosition.x += horizOffset * radius;
  this.effectorPosition.y += vertOffset * radius;
  this.effectorPosition.z += depthOffset * radius;
};


IKTester.prototype.testAlignment = function(time){
  this.animateEffector(time);

  //var dir = new Vector3(0,0,1);

  var dir = new Vector3(Math.random(),Math.random(),Math.random());
  dir.normalize();
  var rot = new Quaternion();

  var dirToEffector = this.effectorPosition.clone().normalize();
  rot.rotationTo(dir,dirToEffector);

  var mtx = new Matrix44();
  mtx.rotate(rot);
  dir.transformDirection(mtx);

  var d = dir.dot(dirToEffector);

  return d;

};
//-----------------------------------------------------------------------------
test("Antialiasing support", function() {
   var attr = gl.getContextAttributes();
   ok(true == attr.antialias, "Antialiasing Support");
});
