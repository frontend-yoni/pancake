/**
 * Created by avitzur on 2/8/2016.
 */
function IndicatorMiniChart() {
    /**CONSTANTS***/
    var MACD_BAR_COLOR = "#87CEFA";
    var MACD_BAR_OPACITY = 1;
    /***Externally Set***/
    //Structure
    var seriesGroup;
    //Data
    var originalDataList;
    var extraChartDataObj;
    var xAxis;
    var yAxis;
    var range;
    var symbol;

    /**Internally Set****/
    //Structure
    var bgRect;
    //Layout
    var barWidth;
    //Utils
    var bars;

    /**Public Functions***/
    this.setPapaGroups = function (seriesGroupInput) {
        seriesGroup = seriesGroupInput;
    };

    this.setData = function (dataListInput, extraChartDataObjInput, xAxisInput, yAxisInput, rangeInput, symbolInput) {
        extraChartDataObj = extraChartDataObjInput;
        originalDataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
        range = rangeInput;
        symbol = symbolInput;
    };

    this.drawComponent = function () {
        drawBGRect();
        var type = extraChartDataObj.paramsData.type;
        switch (type) {
            case IndicatorsUtil.TYPES.MFI:
                drawSingleSeriesChart(extraChartDataObj.data);
                break;
            case IndicatorsUtil.TYPES.MACD:
                drawBars(extraChartDataObj.data[2], MACD_BAR_COLOR);
                drawSingleSeriesChart(extraChartDataObj.data[0]);
                drawSingleSeriesChart(extraChartDataObj.data[1], "#333333", true);
                break;
        }
    };

    this.getMainDataList = function () {
        var list;
        switch (extraChartDataObj.paramsData.type) {
            case IndicatorsUtil.TYPES.MFI:
                list = extraChartDataObj.data;
                break;
            case IndicatorsUtil.TYPES.MACD:
                list = extraChartDataObj.data[0];
                break;
        }

        return list;
    };

    this.getYAxis = function () {
        return yAxis;
    };

    this.getColor = function () {
        return extraChartDataObj.paramsData.color;
    };

    /**Draw****/
    function drawBGRect() {
        bgRect = seriesGroup.append("rect")
            .attr({
                x: xAxis.startPixel,
                y: yAxis.endPixel,
                height: yAxis.startPixel - yAxis.endPixel,
                width: xAxis.endPixel - xAxis.startPixel
            })
            .style({
                fill: "#f9f9f9"
            });
    }

    function drawSingleSeriesChart(dataList, color, isDotted) {
        if (color == undefined) {
            color = extraChartDataObj.paramsData.color;
        }

        var seriesDrawUtil = new LineDrawUtil();

        seriesDrawUtil.setParentGroups(seriesGroup, seriesGroup, seriesGroup);
        seriesDrawUtil.setData(dataList, xAxis, yAxis);

        var dataPointCount = dataList.length;
        if (range == RestAPIs.TIME_RANGE.D1) {
            dataPointCount = StockData.getNumberOfPointsInADay(symbol);
        }

        seriesDrawUtil.setLayoutParams(0, dataPointCount);

        var pathElement = seriesDrawUtil.createIndicatorPath(dataList, color);

        if (isDotted) {
            pathElement.attr({
                "stroke-dasharray": "5, 3",
                opacity: 0.8
            })
        }

    }

    function drawBars(dataList, color) {
        bars = [];
        barWidth = (xAxis.endPixel - xAxis.startPixel) / (xAxis.maxValue - xAxis.minValue + 1);
        if (barWidth > 0) {
            for (var i = 0; i < dataList.length; i++) {
                createBar(dataList, i, color);
            }
        }

    }

    function createBar(dataList, index, color) {
        var value = dataList[index];
        var bar;
        if (value != undefined) {
            var x = xAxis.scale(index) - barWidth / 2;
            var baseY = yAxis.scale(0);

            var y = yAxis.scale(value);
            var height;

            if (y <= baseY) {
                height = baseY - y;
            } else {
                height = y - baseY;
                y = baseY;
            }

            bar = seriesGroup.append("rect")
                .attr({
                    x: x,
                    y: y,
                    height: height,
                    width: barWidth
                })
                .style({
                    fill: color,
                    opacity: MACD_BAR_OPACITY
                });
        }

        bars.push(bar);
    }

}