"use strict";


function ShaderFileSource(url){
  this.textFile = new TextFileReader();
  this.textFile.loadFileSynchronous(url);
  this.shaders = {};
  console.debug(this.textFile.allText);
}

ShaderFileSource.prototype.splitIntoShaders = function(txtFile, addLineNums){
  var line = {text:""};
  var nameToken = "--";
  var currName = none;
  var lineNum = 1;
  while(txtFile.getLine(line) != 0){
    if(line.text.slice(0, nameToken.length) == nameToken){
      currName = line.text.slice(nameToken.length, line.text.length);       
      this.shaders[currName] = "";
    }else{
       var lineNumPrefix = addLineNums?"/* " + lineNum + " */ ":"";
       this.shaders[currName] += lineNumPrefix + line.text + "\n";
    }
    lineNum++;
  } 
};


