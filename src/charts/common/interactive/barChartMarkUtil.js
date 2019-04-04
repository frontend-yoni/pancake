/**
 * Created by yoni_ on 2/6/2016.
 */
function BarChartMarkUtil() {
    var me = this;
    //Constants
    var COVER_AREA_COLOR = "#ADD8E6";

    //Data
    //(Externally set)
    var dataList;

    //Utils
    //(Externally set)
    var yAxis;
    var xAxis;

    //Structure
    //(Cover Area)
    var coverAreaGroup; //(Externally set)
    var coverAreaRect;

    //Layout
    var paddingFromEdges;


    /**Public Functions***/
    this.setLayoutParams = function (paddingFromEdgesInput) {
        paddingFromEdges = paddingFromEdgesInput;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
        setAreaList();
    };

    this.setParentGroups = function (coverAreaGroupInput) {
        coverAreaGroup = coverAreaGroupInput;
    };

    this.drawComponent = function () {
        createCoverArea();
    };

    this.showCoverArea = function (startIndex, endIndex) {
        showCoverArea(startIndex, endIndex);
    };

    this.hideCoverArea = function () {
        hideCoverArea();
    };

    /**Construct***/
    function createCoverArea() {
        var height = yAxis.startPixel + paddingFromEdges;
        height = iMath.max(0, height);

        coverAreaRect  = coverAreaGroup.append("rect")
            .attr({
                height: height,
                y: 0
            })
            .style({
                fill: COVER_AREA_COLOR
            });
    }

    /**State Change***/
    function showCoverArea(startIndex, endIndex) {
        var startX = xAxis.scale(startIndex);
        var endX = xAxis.scale(endIndex);

        var width = iMath.abs(startX - endX);
        var x = iMath.min(endX, startX);
        coverAreaRect.attr({
            width: width,
            x: x
        });
    }

    function hideCoverArea() {
        if (coverAreaRect) {
            coverAreaRect.attr({
                width: 0
            });
        }
    }

    /**Calculations***/
    function setAreaList() {

    }
}