"use strict"

//Inherit from Model
WaveSim.prototype = new Model();
WaveSim.prototype.constructor = WaveSim;

function WaveSim(gl){
  Model.call(this, gl);

}
