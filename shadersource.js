"use strict";


function ShaderSource(url){
  this.textFile = new TextFileReader();
  this.textFile.loadSynchronous(url);
  this.shaders = {};
  this.splitIntoShaders(this.textFile, true);
}

ShaderSource.prototype.splitIntoShaders = function(txtFile, addLineNums){
  var line = {text:""};
  var nameToken = "--";
  var currName = "DEFAULT";
  var lineNum = 1;
  while(txtFile.getLine(line) != 0){
    if(line.text.slice(0, nameToken.length) == nameToken){
      currName = line.text.slice(nameToken.length, line.text.length);       
      //currName = currName.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
      currName = currName.trim();
      this.shaders[currName] = "";
    }else{
       var lineNumPrefix = addLineNums?"/* " + lineNum + " */ ":"";
       this.shaders[currName] += lineNumPrefix + line.text + "\n";
    }
    lineNum++;
  } 
};

ShaderSource.prototype.get = function(name){
   return this.shaders[name];
};

