
function printExtensions(gl) {
        var extArray = gl.getSupportedExtensions();
        for (var ext in extArray) {
            var extString = extArray[ext];
            console.log(extString);
        }

}

function getExtension(gl, name){
  var extArray = gl.getSupportedExtensions();
  for(var ext in extArray){
    if(extArray == extArray[ext]){
      return gl.getExtension(name);
    }
  }
  return null;
}



