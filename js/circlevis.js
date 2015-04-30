/**
	CircleVis object
**/


CircleVis = function(_parentElement, _data, _data2){
	this.parentElement = _parentElement;
    this.data = _data;

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 1100 
    this.height = 600
    this.year = 1960

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CircleVis.prototype.initVis = function(){

    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
      .attr("id", "map")
      .attr("height", this.height)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

}




/**
 * Drawing Method
 */
CircleVis.prototype.updateVis = function(){
    

    

}


/**
 * Gets called by event handler and should create new aggregated data
 */
CircleVis.prototype.onSelectionChange= function (selectionStart, selectionEnd){


}

/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */

