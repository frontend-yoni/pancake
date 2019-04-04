/**
 * Created by yoni_ on 2/6/2016.
 */
function ChartMarkUtil() {
    var me = this;
    //Constants
    var COVER_AREA_COLOR = "lightblue";
    var COVER_AREA_COLOR_DARK_BG = "steelblue";

    //Data
    //(Externally set)
    var dataList;
    var dataLists;

    //Utils
    //(Externally set)
    var yAxis;
    var xAxis;

    //Structure
    var defsTag; //(Externally set)
    //(Cover Area)
    var coverAreaGroup; //(Externally set)
    var coverClipPathRect;
    var coverAreaPath;

    //Layout
    var paddingFromEdges;
    var areaDataList;

    //Style
    var coverAreaColor = COVER_AREA_COLOR;

    //State
    var isDarkBackground;


    /**Public Functions***/
    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
        if (isDarkBackground) {
            coverAreaColor = COVER_AREA_COLOR_DARK_BG;
        }
    };

    this.setLayoutParams = function (paddingFromEdgesInput) {
        paddingFromEdges = paddingFromEdgesInput;
    };

    this.setAreaColor = function (color) {
        coverAreaColor = color;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput, dataListsInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
        dataLists = dataListsInput;
        setAreaList();
    };

    this.setParentGroups = function (coverAreaGroupInput, defsTagInput) {
        coverAreaGroup = coverAreaGroupInput;
        defsTag = defsTagInput;
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
        var clipPathID = "clipPathID" + LineChartCore.uniqueIDIndex++;
        var clipPathAttrURL = "url(#" + clipPathID + ")";

        var height = yAxis.startPixel + paddingFromEdges;
        height = iMath.max(0, height);

        coverClipPathRect = defsTag.append("clipPath")
            .attr("id", clipPathID)
            .append("rect")
            .attr({
                x: 0,
                y: 0,
                width: 0,
                height: height
            });


        var coverAreaPathStr = getLineAeaFillPath(areaDataList, xAxis, yAxis, paddingFromEdges);
        coverAreaPath = coverAreaGroup.append("path")
            .attr({
                d: coverAreaPathStr,
                "clip-path": clipPathAttrURL,
                "clipPathID": clipPathID
            })
            .style({
                fill: coverAreaColor
            });
    }

    /**State Change***/
    function showCoverArea(startIndex, endIndex) {
        var startX = xAxis.scale(startIndex);
        var endX = xAxis.scale(endIndex);

        var width = iMath.abs(startX - endX);
        var x = iMath.min(endX, startX);
        coverClipPathRect.attr({
            width: width,
            x: x
        });
    }

    function hideCoverArea() {
        if (coverClipPathRect) {
            coverClipPathRect.attr({
                width: 0
            });
        }
    }

    /**Calculations***/
    function setAreaList() {
        if (!dataLists) {
            areaDataList = dataList;
        } else {
            areaDataList = [];
            var topPoint;
            for (var i = 0; i < dataList.length; i++) {
                topPoint = getTopPointByIndex(i);
                areaDataList.push(topPoint)
            }
        }
    }


    function getTopPointByIndex(index) {
        var points = [];
        var list;
        for (var i = 0; i < dataLists.length; i++) {
            list = dataLists[i];
            points.push(list[index]);
        }
        var topPoint = getTopPoint(points);
        return topPoint;
    }

    function getTopPoint(dataPoints) {
        var topPoint = dataPoints[0];

        for (var i = 0; i < dataPoints.length; i++) {
            if (dataPoints[i].close > topPoint.close) {
                topPoint = dataPoints[i];
            }
        }

        return topPoint;
    }
}