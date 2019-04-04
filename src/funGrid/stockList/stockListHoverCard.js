/**
 * Created by avitzur on 11/4/2015.
 */
function StockListHoverCard() {
    //Constants
    //Layout
    var TITLE_HEIGHT = 30;
    var MID_PADDING = 5;
    var COST_QTY_AREA_HEIGHT = 20;
    var LITTLE_FONT_SIZE = 12;
    var PORTFOLIO_FONT_SIZE = 12;
    var TOTAL_VALUE_FONT_SIZE = 14;
    var HIDE_BUTTON_WIDTH = 16;
    var HIDE_BUTTON_ARROW_WIDTH = 10;

    //Structure
    var externalDiv;
    var titleDiv;
    var hideArrow;
    var contentDiv;
    var valueArea;
    var dayStatusArea;
    var costQtyArea;
    var totalValueArea;
    var chartArea;

    var totalValueP;
    var totalGainP;

    //Layout params
    var parentHeight;
    var parentWidth;
    var chartAreaHeight = 200;

    //Data
    var stockData;
    var userStockData;
    var defaultRange = RestAPIs.TIME_RANGE.M3;
    var range = defaultRange;
    var restAPIs = RestAPIs.getInstance();

    //Components
    var lineChart = new LineChartContainer();
    var costQtyComponent = new CostQtyComponent();
    var shapeUtil = ShapesUtil.getInstance();
    //Externally set
    var containerPapa;

    /**Public functions**/
    this.setExternalDiv = function (divHTML) {
        externalDiv = d3.select(divHTML);
    };

    this.drawComponent = function () {
        if (!costQtyComponent.getIsMiddleOfEdit()){
            drawComponent();
        }
    };

    this.setData = function (dataInput) {
        stockData = dataInput;
        // range = defaultRange;
        userStockData = getUserDataBySymbolGlobal(stockData.symbol);
    };

    this.setContainerPapa = function (papaComponent) {
        containerPapa = papaComponent;
    };

    this.clearContent = function () {
        externalDiv.selectAll("div").remove(); //Clear slate
    };

    this.updatePortfolioSection = function () {
        costQtyComponent.updateTextByData();
        updateTotalValueSection();
    };

    this.resetChartTypeAndRedraw = function(isCandleInput){
        lineChart.resetChartTypeAndRedraw(isCandleInput);
    };

    this.redrawChartByVolumeVisibility = function(){
        lineChart.redrawChartByVolumeVisibility();
    };

    /**Construction***/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        externalDiv.selectAll("div").remove(); //Clear slate

        parentHeight = externalDivDOM.clientHeight;
        parentWidth = externalDivDOM.clientWidth;

        titleDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                right: -5 + "px",
                left: -5 + "px",
                height: TITLE_HEIGHT + "px",
                "border-bottom": "1px solid" + "#FFFFFF",
                "box-sizing": "border-box",
                color: "#FFFFFF"
            })
            .attr("name", "hoverCardTitle");

        contentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: TITLE_HEIGHT + "px",
                right: 0 + "px",
                left: 0 + "px",
                bottom: 0 + "px"
            })
            .attr("name", "hoverCardContent");

        valueArea = contentDiv.append("div")
            .style({
                position: "relative",
                "margin-top": MID_PADDING + "px",
                width: "100%",
                overflow: "hidden",
                "text-align": "center"
            });

        dayStatusArea = contentDiv.append("div")
            .style({
                position: "relative",
                "margin-top": MID_PADDING + "px",
                width: "100%",
                overflow: "hidden",
                "font-size": LITTLE_FONT_SIZE + "px",
                color: "#888888",
                cursor: "default"
            });

        costQtyArea = contentDiv.append("div")
            .style({
                position: "relative",
                height: COST_QTY_AREA_HEIGHT * 0.5 + "px",
                "margin-top": MID_PADDING * 2 + "px",
                width: "100%",
                "font-size": PORTFOLIO_FONT_SIZE + "px",
                color: "white"
            });

        totalValueArea = contentDiv.append("div")
            .style({
                position: "relative",
                width: "100%",
                "font-size": TOTAL_VALUE_FONT_SIZE + "px",
                "text-align": "center",
                "margin-top": MID_PADDING * 2 + "px",
                color: "white"
            });

        chartArea = contentDiv.append("div")
            .style({
                position: "absolute",
                bottom: 0,
                right: 0 + "px",
                left: 0 + "px",
                height: chartAreaHeight + "px"
            });

        fillTile();
        fillValueArea();
        fillDayStatusArea();
        fillCostQtyArea();
        fillTotalValueArea();
        fillChartArea();

        chartArea.on(TimeRangeSelector.BUTTON_CLICK_EVENT, onRangeClick);
    }

    function fillTotalValueArea() {
        var fieldP = totalValueArea.append("p")
            .style({
                display: "inline-block",
                "padding-right": MID_PADDING + "px",
                margin: 0
            })
            .text("Total Value ");

        totalValueP = totalValueArea.append("p")
            .style({
                display: "inline-block",
                "font-weight": "bold",
                "padding-right": MID_PADDING + "px",
                margin: 0
            });

        totalGainP = totalValueArea.append("p")
            .style({
                display: "inline-block",
                "font-weight": "bold",
                margin: 0
            });

        updateTotalValueSection();
    }

    function fillCostQtyArea() {
        costQtyComponent.setIsDarkBackground(true);
        costQtyComponent.setData(userStockData);
        costQtyComponent.setExternalDiv(costQtyArea.node(), parentWidth, COST_QTY_AREA_HEIGHT);
        costQtyComponent.drawComponent();
    }

    function fillDayStatusArea() {
        var openP = dayStatusArea.append("p")
            .style({
                float: "left",
                margin: 0
            })
            .text("Open " + formatNiceNumber(stockData.open, stockData.isCurrency));

        var rangeTextStr = "[" + formatNiceNumber(stockData.low, stockData.isCurrency) + " - " + formatNiceNumber(stockData.high, stockData.isCurrency) + "]";

        var rangeP = dayStatusArea.append("p")
            .style({
                float: "right",
                width: "50%",
                margin: 0
            })
            .attr("title", "Today's range: " + rangeTextStr)
            .text(rangeTextStr);
    }

    function fillValueArea() {
        var valueText = formatNiceNumber(stockData.value, stockData.isCurrency);
        var changeText = concatChangeAndPercentage(stockData.getChange(), stockData.getChangePercentage(), stockData.isCurrency);
        var color = getValueTextColor(stockData.getChange(), 0);

        var valueP = valueArea.append("p")
            .style({
                display: "inline-block",
                "font-size": 16 + "px",
                "font-weight": "bold",
                margin: 0,
                "padding-right": MID_PADDING + "px",
                color: "#FFFFFF"
            })
            .text(valueText);

        var changeP = valueArea.append("p")
            .style({
                display: "inline-block",
                "font-size": 14 + "px",
                "font-weight": "bold",
                margin: 0,
                color: color
            })
            .text(changeText);

        setValueRefreshClassGlobal(changeP, stockData.getPrevChangePercentage(), stockData.getChangePercentage());
    }

    function fillChartArea() {
        lineChart.setIsShowVolume(UserDBData.isShowVolume);
        // lineChart.presetChartType(UserDBData.isCandleChart);
        lineChart.setExternalDiv(chartArea.node());
        restAPIs.updateStockDataWithProperMock(range, stockData.symbol);
        lineChart.setData(stockData, range);
        lineChart.setIsDarkBackground(true);
        lineChart.drawComponent();
    }

    function fillTile() {
        var symbol = stockData.symbol;
        var fullName = getNameFromSymbol(symbol);

        var fullText = symbol + " - " + fullName;
        var nameP = titleDiv.append("p")
            .style({
                margin: 0,
                position: "absolute",
                top: 3 + "px",
                right: 5 + "px",
                left: 5 + "px",
                overflow: "hidden",
                "padding-right": HIDE_BUTTON_WIDTH + MID_PADDING * 2 + "px",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                "text-align": "center"
            }).text(fullText);

        hideArrow = titleDiv.append("div")
            .style({
                position: "absolute",
                top: 6 + "px",
                right: 0 + "px",
                width: HIDE_BUTTON_WIDTH + "px",
                height: HIDE_BUTTON_WIDTH + "px",
                cursor: "pointer"
            }).on("click", onHideClick);

        shapeUtil.createTriangle(hideArrow, HIDE_BUTTON_ARROW_WIDTH, HIDE_BUTTON_ARROW_WIDTH, shapeUtil.DIRECTION.LEFT, "#cccccc");
    }

    /**Data Processing***/
    function updateTotalValueSection() {
        if (stockData){
            var totalGailText = concatChangeAndPercentage(stockData.getTotalGain(), stockData.getTotalGainPercentage(), stockData.isCurrency);
            var totalValueText = formatNiceNumber(stockData.getTotalValue(), stockData.isCurrency);

            totalValueP.text(totalValueText);
            totalGainP.text(totalGailText);

            var totalGailColor = "#FFFFFF";
            if (stockData.getTotalGain() < 0) {
                totalGailColor = BAD_COLOR;
            } else if (stockData.getTotalGain() > 0) {
                totalGailColor = GOOD_COLOR;
            }
            totalGainP.style("color", totalGailColor);
        }
    }

    /***Event Listeners**/
    function onHideClick() {
        containerPapa.hideHoverCard();
    }

    function onRangeClick() {
        range = d3.event.detail.data;
        fetchDataByRange();
    }

    function fetchDataByRange(){
        fetchStockListHoverCardForNewCard(stockData.symbol, range, onSuccess);
    }

    function onSuccess(stockDataInput) {
        stockData = stockDataInput;
        fillChartArea();
    }
}