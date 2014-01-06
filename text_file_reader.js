"use strict";

function TextFileReader() {
  this.allText = "";
  this.lines = [];
  this.txtFile = [];

  this.currLine = 0;
  this.lineCount = 0;
}

TextFileReader.prototype.loadSynchronous = function(url) {
  console.debug("loading: " + url + " sychrnously");
  this.txtFile = new XMLHttpRequest();
  var f = this;
  this.url = url;
  this.txtFile.open("GET", url, false);
  this.txtFile.send(null);

  this.allText = this.txtFile.responseText; 
  this.lines = this.txtFile.responseText.split("\n"); // Will separate each line into an array
  this.lineCount = this.lines.length;
  this.currLine = 0;
  console.debug("File: " + this.url + " retrieved");
}

TextFileReader.prototype.load = function(url, completeCallback) {
  console.debug("loading: " + url + " with callback " + completeCallback);
  this.txtFile = new XMLHttpRequest();
  var f = this;
  this.completeCallback = completeCallback;
  this.url = url;
  this.txtFile.open("GET", url, true);
  this.txtFile.onreadystatechange = function(){f.loadFileComplete();};
  this.txtFile.send(null);
}


TextFileReader.prototype.loadFileComplete = function() {
  if (this.txtFile.readyState === 4) {  // Makes sure the document is ready to parse.
    if (this.txtFile.status === 200) {  // Makes sure it's found the file.
      this.allText = this.txtFile.responseText; 
      this.lines = this.txtFile.responseText.split("\n"); // Will separate each line into an array
      this.lineCount = this.lines.length;
      this.currLine = 0;
      console.debug("File: " + this.url + " retrieved");
      this.completeCallback();
    }
  }
}

TextFileReader.prototype.gotoLine = function(line) {
  this.currLine = line;
}

TextFileReader.prototype.getLine = function(buffer) {
  if(this.currLine >= this.lineCount){
    return 0;
  }
  buffer.text = this.lines[this.currLine++];
  return 1;
}

