/**
 * Created by avitzur on 2/7/2016.
 */
function MainMiniChart() {
    var me = this;
    var iMath = Math;

    //Layout
    var volumeSectionHeight;

    //Data
    var dataList;
    var indicatorsLists;
    var yAxis;
    var xAxis;
    var symbol;
    var range;

    //Externally set State
    var isDarkBackground;
    var isCandleChart;

    //Structure
    //(SVG Content)
    var lineAreaFillG;
    var candleStringGroup;
    var seriesGroup;
    var indicatorsG;

    //State
    var isPastPage; //It's a past page in a zoom state

    //Utils
    var seriesDrawUtil = new LineDrawUtil();

    /**Public functions**/
    this.setPapaGroups = function (lineAreaFillGInput, candleStringGroupInput, seriesGroupInput, indicatorsGInput) {
        lineAreaFillG = lineAreaFillGInput;
        candleStringGroup = candleStringGroupInput;
        seriesGroup = seriesGroupInput;
        indicatorsG = indicatorsGInput;
    };

    this.setChartType = function (isCandleChartInput) {
        isCandleChart = isCandleChartInput;
        if (isCandleChart) {
            seriesDrawUtil = new CandlesDrawUtil();
        } else {
            seriesDrawUtil = new LineDrawUtil();
        }
        seriesDrawUtil.setIsPastPage(isPastPage);
    };

    this.setLayoutParams = function(volumeSectionHeightInput){
        volumeSectionHeight = volumeSectionHeightInput;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput, symbolInput, rangeInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
        range = rangeInput;
        symbol = symbolInput;
    };

    this.drawComponent = function () {
        if (dataList && dataList.length > 0) {
            drawComponent();
        }
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
    };

    this.hideLinePath = function () {
        seriesDrawUtil.hideLinePath();
    };

    this.restoreLinePath = function () {
        seriesDrawUtil.restoreLinePath();
    };

    this.setIsPastPage = function (boolean) {
        isPastPage = boolean;
        seriesDrawUtil.setIsPastPage(isPastPage);
    };

    this.attachIndicators = function (indicatorsListsInput, colors, dottedOverlayList, dottedOverlayColor) {
        attachIndicators(indicatorsListsInput, colors, dottedOverlayList, dottedOverlayColor);
    };

    /*Structure component*/
    function drawComponent() {
        drawLineSeries();
    }

    /***Indicators****/
    function attachIndicators(indicatorsLists, colors, dottedOverlayList, dottedOverlayColor) {
        var dataList;
        for (var i = 0; i < indicatorsLists.length; i++) {
            dataList = indicatorsLists[i];
            seriesDrawUtil.createIndicatorPath(dataList, colors[i]);
        }

        if (dottedOverlayList && dottedOverlayList.length > 0){
            seriesDrawUtil.createDottedIndicatorPath(dottedOverlayList, dottedOverlayColor);
        }
    }

    //UI changes
    function drawLineSeries() {
        if (!isCandleChart) {
            seriesDrawUtil.setParentGroups(seriesGroup, lineAreaFillG, indicatorsG);
        } else {
            seriesDrawUtil.setParentGroups(seriesGroup, candleStringGroup, indicatorsG);
        }

        seriesDrawUtil.setData(dataList, xAxis, yAxis);
        seriesDrawUtil.setIsDarkBackground(isDarkBackground);

        var dataPointCount = dataList.length;
        if (range == RestAPIs.TIME_RANGE.D1) {
            dataPointCount = StockData.getNumberOfPointsInADay(symbol);
        }

        seriesDrawUtil.setLayoutParams(volumeSectionHeight, dataPointCount);
        seriesDrawUtil.drawComponent();
    }

}