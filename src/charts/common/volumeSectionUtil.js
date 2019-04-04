/**
 * Created by ReznikFamily on 19/01/2016.
 */
function VolumeSectionUtil() {
    /**Constants****/
    var OPACITY = 0.5;
    var MAX_WIDTH = 10;

    /***Externally set***/
    //Data
    var dataList;
    //Structure
    var papaG;
    //Layout
    var yAxisBottomPixel;
    var yAxisTopPixel;
    //Util
    var xAxis;

    /**Internally set***/
    //Util
    var yAxis;
    //Layout
    var barWidth;

    /***Public function***/
    this.setGroup = function (group) {
        papaG = group;
    };

    this.setParams = function (dataListInput, xAxisInput, topPixel, bottomPixel) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxisTopPixel = topPixel;
        yAxisBottomPixel = bottomPixel;
    };

    this.drawComponent = function () {
        drawComponent();
    };


    /**Inner Functions***/
    function drawComponent() {
        setYAxis();
        barWidth = (xAxis.endPixel - xAxis.startPixel) / (xAxis.maxValue - xAxis.minValue + 1);
        barWidth = iMath.min(MAX_WIDTH, barWidth);

        barWidth = trimToTwoDecimalDigits(barWidth);
        if (barWidth > 0){
            for (var i = 0; i < dataList.length; i++) {
                createBar(i);
            }
        }

    }

    function createBar(index) {
        var dataPoint = dataList[index];
        var volume = dataPoint.volume;
        var x = xAxis.scale(index) - barWidth / 2;
        var y = yAxis.scale(volume);
        var height = yAxisBottomPixel - y;

        var color;
        if (dataPoint.close >= dataPoint.open) {
            color = GOOD_COLOR;
        } else {
            color = BAD_COLOR;
        }

        x = trimToTwoDecimalDigits(x);
        height = trimToTwoDecimalDigits(height);
        y = trimToTwoDecimalDigits(y);
        var bar = papaG.append("rect")
            .attr({
                x: x,
                y: y,
                height: height,
                width: barWidth
            })
            .style({
                fill: color,
                opacity: OPACITY
            });
    }

    function setYAxis() {
        var minValue = 0;
        var maxValue = minValue;

        var volume;
        for (var i = 0; i < dataList.length; i++) {
            volume = dataList[i].volume;
            maxValue = iMath.max(volume, maxValue);
        }
        yAxis = new AxisObject(minValue, maxValue, yAxisBottomPixel, yAxisTopPixel);
    }
}