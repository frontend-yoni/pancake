/**
 * Created by yoni_ on 4/15/2016.
 */
function PieCalculationHelper() {
    /**CONSTANTS*****/
    var DOUBLE_PIE = 2 * Math.PI;
    var BEST_FONT_SIZE = 21;
    var MID_FONT_SIZE = 18;
    var SMALL_FONT_SIZE = 16;
    var TINY_FONT_SIZE = 12;

    /**Externally Set***/
    //Layout
    var radius;
    /**Internally Set**/
    //Layout
    var innerRadius;
    //Util
    var angleScale = createAngleScale();

    /***Public Functions****/
    this.setLayoutParams = function (radiusI) {
        radius = radiusI;
    };

    this.createArcData = function (value, percentValue, symbol, color, startAngle) {
        return createArcData(value, percentValue, symbol, color, startAngle);
    };

    this.getFontSize = function (value) {
        return getValueFontSize(value);
    };

    this.applyDrawParamsToArcDataList = function (arcDataList) {
        return applyDrawParamsToArcDataList(arcDataList);
    };

    /**Layout Util***/
    function getValueFontSize(value) {
        var fontSize;
        if (radius > 90) {
            fontSize = BEST_FONT_SIZE;
        } else if (value < 100000) {
            fontSize = BEST_FONT_SIZE;
        } else if (value < 10000000) {
            fontSize = MID_FONT_SIZE;
        } else if (value < 1000000000) {
            fontSize = SMALL_FONT_SIZE;
        } else {
            fontSize = TINY_FONT_SIZE;
        }

        return fontSize;
    }

    /**Draw Util***/
    function createArcData(value, percentValue, symbol, color, startAngle) {
        var endAngle = startAngle + angleScale(percentValue);
        var arcData = new ArcData(symbol, value, percentValue, color, startAngle, endAngle);
        arcData.pathStr = createArcPathStr(startAngle, endAngle);
        arcData.pathStrHover = createArcPathStr(startAngle, endAngle, true);
        return arcData;
    }

    function createArcPathStr(startAngle, endAngle, isHovered) {
        var outerR = radius;

        if (isHovered) {
            outerR += 2;
        }

        var pathStr = d3.svg.arc()
            .startAngle(startAngle)
            .endAngle(endAngle)
            .innerRadius(0)
            .outerRadius(outerR);

        return pathStr;
    }

    function applyDrawParamsToArcDataList(arcDataList) {
        var arcData;
        var startAngle = 0;
        for (var i = 0; i < arcDataList.length; i++) {
            arcData = arcDataList[i];
            applyDrawParamsToArcData(arcData, startAngle);
            startAngle = arcData.endAngle;
        }
    }

    function applyDrawParamsToArcData(arcData, startAngle) {
        var endAngle = startAngle + angleScale(arcData.percent);
        if (arcData.percent == 0){
            endAngle = DOUBLE_PIE;
        }

        arcData.startAngle = startAngle;
        arcData.endAngle = endAngle;
        arcData.pathStr = createArcPathStr(startAngle, endAngle);
        arcData.pathStrHover = createArcPathStr(startAngle, endAngle, true);
        return arcData;
    }

    /***Initialization***/
    function createAngleScale() {
        return d3.scale.linear()
            .domain([0, 100])
            .range([0, DOUBLE_PIE]);
    }


    /**Data Processing****/

}

PieCalculationHelper.getInstance = function () {
    if (!PieCalculationHelper.instance) {
        PieCalculationHelper.instance = new PieCalculationHelper();
    }
    return PieCalculationHelper.instance;
};

/**Global Object****/
function ArcData(symbol, value, percent, color, startAngle, endAngle) {
    this.symbol = symbol;
    this.value = value;
    this.percent = percent;
    this.color = color;
    this.startAngle = startAngle;
    this.endAngle = endAngle;

    this.pathStr;
    this.pathStrHover;
}