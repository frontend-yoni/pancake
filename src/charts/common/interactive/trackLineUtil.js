/**
 * Created by yoni_ on 2/5/2016.
 */
function TrackLineUtil() {
    /***CONSTANTS***/
    var EXTRA_TRACK_LINE_STRETCH = 5;
    var HIT_AREA_WIDTH = 8;
    var TRACK_LINE_COLOR = "rgb(65, 132, 243)";
    var HIT_AREA_BG_COLOR = "rgba(65, 132, 243, 0.1)";

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Style
    var trackLineColor = TRACK_LINE_COLOR;

    //Data
    var xAxis;

    /***Internally Set****/
    //Structure
    var trackLine1;
    var trackLine2;
    //Utils
    var pointObjects = [];
    var pointElements;

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setTrackLineColor = function(color){
        trackLineColor = color;
    };

    this.setData = function (xAxisInput) {
        xAxis = xAxisInput;
    };

    this.initPoints = function () {
        pointObjects = [];
    };

    this.addPointObject = function (yAxis, dataList,  radius, color) {
        addPointObject(yAxis, dataList,  radius, color);
    };

    this.positionTrackLine = function (index) {
        positionTrackLine(index);
    };

    this.positionBothTrackLines = function (index1, index2) {
        positionBothTrackLines(index1, index2);
    };

    this.hideAll = function () {
        hideAll();
    };

    this.freeze = function () {
        freeze();
    };

    this.unFreeze = function () {
        unFreeze();
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        trackLine1 = createTrackLine();
        trackLine2 = createTrackLine();
        createAllPointElements();
        hideAll();
    }

    function createTrackLine() {
        var trackLine = externalDiv.append("div")
            .style({
                position: "absolute",
                top: -EXTRA_TRACK_LINE_STRETCH + "px",
                bottom: -EXTRA_TRACK_LINE_STRETCH + "px",
                width: HIT_AREA_WIDTH + "px"
            })
            .attr("name", "trackLine");

        var stroke = trackLine.append("div")
            .style({
                position: "absolute",
                top: 0,
                bottom: 0,
                left: (HIT_AREA_WIDTH - 1) / 2 + "px",
                width: 1 + "px",
                "pointer-events": "none",
                background: trackLineColor
            })
            .attr("name", "trackLine");

        return trackLine;
    }

    function createAllPointElements() {
        pointElements = [];
        var pointElement;
        var pointElementSecond;
        for (var i = 0; i < pointObjects.length; i++) {
            pointElement = createPointElement(pointObjects[i]);
            pointElements.push(pointElement);

            pointElementSecond = createPointElement(pointObjects[i], true);
            pointElements.push(pointElementSecond);
        }
    }

    function createPointElement(pointObj, isSecondary) {
        var papaDiv;
        if (!isSecondary) {
            papaDiv = trackLine1;
        } else {
            papaDiv = trackLine2;
        }

        var left = (HIT_AREA_WIDTH) / 2  - pointObj.radius;
        var pointElement = papaDiv.append("div")
            .style({
                position: "absolute",
                "border-radius": "50%",
                border: "1px solid #FFFFFF",
                background: pointObj.color,
                "box-sizing": "border-box",
                left: left + "px",
                width: pointObj.radius * 2 + "px",
                height: pointObj.radius * 2 + "px",
                "pointer-events": "none"
            })
            .attr("name", "trackLine")
            .datum(pointObj);

        if (!isSecondary) {
            pointObj.pointElement = pointElement;
        } else {
            pointObj.pointElementSecond = pointElement;
        }

        return pointElement;
    }

    /**Points***/
    function addPointObject(yAxis, dataList, radius, color) {
        var pointObj = new TrackLinePointObject(yAxis, dataList, radius, color);
        pointObjects.push(pointObj);
    }

    /**Draw*****/
    function redraw() {

    }

    /**Interaction***/
    function freeze() {
        freezeHelper(trackLine1);
        freezeHelper(trackLine2);
    }

    function unFreeze() {
        unfreezeHelper(trackLine1);
        unfreezeHelper(trackLine2);
    }

    function positionTrackLine(index) {
        trackLine2.style("display", "none");
        positionTrackLineHelper(trackLine1, index);
        positionPoints(index);
    }

    function positionBothTrackLines(index1, index2) {
        positionTrackLineHelper(trackLine1, index1);
        positionTrackLineHelper(trackLine2, index2);

        positionPoints(index1, false);
        positionPoints(index2, true);
    }

    function positionPoints(index, isSecondary) {
        for (var i = 0; i < pointObjects.length; i++) {
            positionPoint(pointObjects[i], index, isSecondary);
        }
    }

    function hideAll() {
        if (trackLine1) {
            trackLine1.style("display", "none");
            trackLine2.style("display", "none");
        }
    }

    //Helpers
    function positionPoint(pointObj, index, isSecondary) {
        var pointElement;
        if (!isSecondary){
            pointElement = pointObj.pointElement;
        }else{
            pointElement = pointObj.pointElementSecond;
        }

        if (pointObj.getIsDefined(index)){
            var top = pointObj.getTopPosition(index) + EXTRA_TRACK_LINE_STRETCH;
            pointElement.style({
                top: top + "px",
                opacity: 1
            });
        }else{
            pointElement.style({
                opacity: 0
            });
        }

    }

    function positionTrackLineHelper(trackLine, index) {
        var left = xAxis.scale(index) - HIT_AREA_WIDTH / 2;
        trackLine.style({
                left: left + "px",
                display: ""
            })
            .attr("index", index);
    }

    function freezeHelper(trackLine) {
        trackLine.style({
            background: HIT_AREA_BG_COLOR,
            cursor: "col-resize"
        });
    }

    function unfreezeHelper(trackLine) {
        trackLine.style({
            background: null,
            cursor: null
        });
    }
}

function TrackLinePointObject(yAxis, dataList, radius, color) {
    var me = this;
    this.yAxis = yAxis;
    this.dataList = dataList;
    this.color = color || "rgb(65, 132, 243)";
    this.radius = radius;
    this.pointElement; //Externally set
    this.pointElementSecond; //Externally set

    this.lastDrawnPoint;

    var lastItem = dataList[dataList.length - 1];
    if (lastItem.clone){ //For compare data, it's just a number not an HistoryDataPoint
        this.lastDrawnPoint = lastItem.clone();
    }else{
        this.lastDrawnPoint = lastItem;
    }



    this.getTopPosition = function (index) {
        var dataPointsList = me.dataList;
        var dataPoint = dataPointsList[index];

        if (index == dataPointsList.length - 1){
            dataPoint = this.lastDrawnPoint;
        }

        var value = dataPoint.close;
        if (value === undefined){
            value = dataPoint;
        }

        var y = me.yAxis.scale(value);
        y -= me.radius;
        return y;
    };

    this.getIsDefined = function (index) {
        var dataPoint = me.dataList[index];

        return (dataPoint != undefined && (!dataPoint.hasOwnProperty("close") || dataPoint.close != undefined));
    };
}