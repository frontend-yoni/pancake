/**
 * Created by yoni_ on 4/15/2016.
 */
function PieConstructorUtil() {
    /**CONSTANTS***/
    var MAIN_ARC_PATH_CLASS = "MAIN_ARC_PATH_CLASS";
    /**Externally Set***/
    //Structure
    var mainG;

    /**Internally Set***/
    //Util

    /**Public Functions***/
    this.setExternalDivs = function (mainGI) {
        mainG = mainGI;
    };

    this.createArc = function(arcData, index){
        return createArc(arcData, index);
    };

    this.markAsHovered = function(arcG){
        markAsHovered(arcG);
    };

    this.unmarkAsHovered = function(arcG){
        unmarkAsHovered(arcG);
    };

    /**Construction**/
    function createArc(arcData, index) {
        var arcG = mainG.append("g")
            .attr("index", index)
            .datum(arcData);

        var arcPath = arcG.append("path")
            .attr({
                fill: arcData.color,
                d: arcData.pathStr,
                "stroke-width": 1 + "px",
                stroke: "white",
                index: index
            })
            .classed(MAIN_ARC_PATH_CLASS, true)
            .datum(arcData);

        return arcG;
    }

    /**UI State***/
    function markAsHovered(arcG){
        var pathStr = arcG.datum().pathStrHover;
        arcG.select("." + MAIN_ARC_PATH_CLASS)
            .attr("d", pathStr);
    }

    function unmarkAsHovered(arcG){
        var pathStr = arcG.datum().pathStr;
        arcG.select("." + MAIN_ARC_PATH_CLASS)
            .attr("d", pathStr);
    }
}

PieConstructorUtil.getInstance = function () {
    if (!PieConstructorUtil.instance) {
        PieConstructorUtil.instance = new PieConstructorUtil();
    }
    return PieConstructorUtil.instance;
};