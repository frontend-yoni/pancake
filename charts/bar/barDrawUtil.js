/**
 * Created by yoni_ on 3/26/2016.
 */
/**
 * Created by avitzur on 12/1/2015.
 */
function BarDrawUtil() {
    var me = this;
    /****Constants****/
    var BAR_COLOR = /*"#4A87F8"*/"#178FB7";
    //Layout
    var MAX_BAR_WIDTH = 24;
    var NICE_BAR_WIDTH = 12;
    var MIN_BAR_WIDTH = 2;
    var BEST_PAD_BETWEEN_BARS = 1;

    /****Externally set****/
    //Data
    var dataList;
    //Utils
    var yAxis;
    var xAxis;
    //Structure
    var barGroup;
    var concealerGroup;
    //Layout
    var bottomExtraPadding;

    /**Internally Set**/
    //Data
    var barCount;
    //Layout
    var barWidth;


    /**Public Functions***/
    this.setLayoutParams = function (bottomExtraPaddingInput) {
        bottomExtraPadding = bottomExtraPaddingInput;
    };

    this.setData = function (dataListInput, xAxisInput, yAxisInput) {
        dataList = dataListInput;
        xAxis = xAxisInput;
        yAxis = yAxisInput;
    };

    this.setPapaGroups = function (barGroupInput, concealerGroupInput) {
        barGroup = barGroupInput;
        concealerGroup = concealerGroupInput;
    };

    this.drawComponent = function () {
        createAllBars();
    };

    /**Construct***/
    function createAllBars() {
        calculateBarWidth();
        for (var i = 0; i < dataList.length; i++) {
            createBar(i);
        }
    }

    function createBar(index) {
        var dataPoint = dataList[index];
        var value = dataPoint.close;
        var x = xAxis.scale(index) - barWidth / 2;
        var baseY = yAxis.scale(0);
        var y = yAxis.scale(value);
        var height;



        if (value > 0) {
            height = baseY - y;
        } else {
            height = y - baseY;
            y = baseY;
        }

        x = trimToTwoDecimalDigits(x);
        height = trimToTwoDecimalDigits(height);
        y = trimToTwoDecimalDigits(y);
        var bar = barGroup.append("rect")
            .attr({
                x: x,
                y: y,
                height: height,
                width: barWidth
            })
            .style({
                fill: BAR_COLOR
            });
    }

    /**Calculate***/
    function calculateBarWidth() {
        var barWithPadWidth = xAxis.scale(1) - xAxis.scale(0);
        barWidth = barWithPadWidth * 0.9;
        barCount = dataList.length;


        barWidth = trimToTwoDecimalDigits(barWidth);
    }
}
