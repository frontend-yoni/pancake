/**
 * Created by yoni_ on 4/29/2016.
 */
/**
 * Created by yoni_ on 3/18/2016.
 */
function UniversalChartTypeSection() {
    /***CONSTANTS***/
    var BUTTON_WIDTH = 80;
    var BUTTON_HEIGHT = 24;
    var ICON_SIZE = 16;
    //Style
    var DEFAULT_CONETNT_FILL = "#666666";
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Structure
    var papaDiv;
    var volumeButton;
    //State
    var isCandle;
    var isShowVolume = UserDBData.isShowVolume;
    //Util
    var candleStickElement = new CandleStickElement();


    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentInput) {
        papaComponent = papaComponentInput;
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        papaDiv = externalDiv.append("div")
            .style({
                margin: "auto",
                "margin-top": 5 + "px"
            });
        constructButtons();
    }

    function constructButtons() {
        var candleIcon = createLineButton("Candle", true);
        var lineIcon = createLineButton("Line", false);
        createVolumeButton();

        drawCandleIcon(candleIcon);
        drawLineIcon(lineIcon);
    }

    /**Common***/
    function createLineButton(text, isCandle) {
        var button = papaDiv.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                height: BUTTON_HEIGHT + "px",
                width: BUTTON_WIDTH + "px",
                "border-radius": 5 + "px",
                "margin-right": 5 + "px",
                "text-align": "center"
            })
            .attr("title", text + " Chart")
            .datum(isCandle)
            .on("click", onTypeClick)
            .classed("pancakeButton", true);

        var iconDiv =  button.append("div")
            .style({
                position: "relative",
                display: "inline-block",
                bottom: 1 + "px",
                height: ICON_SIZE + "px",
                width: ICON_SIZE + "px",
                "margin-right": 5 + "px",
                "vertical-align": "middle",
                background: "none"
            });

        var buttonP = button.append("p")
            .style({
                display: "inline-block",
                margin: 0,
                position: "relative",
                bottom: 1 + "px",
                height: BUTTON_HEIGHT + "px",
                "line-height": BUTTON_HEIGHT + "px",
                "vertical-align": "middle",
                "font-size": 12 + "px"
            })
            .text(text);

        return iconDiv;
    }

    function createSVGAndG(button) {
        var svg = button.append("svg")
            .style({
                position: "absolute",
                width: ICON_SIZE + "px",
                height: ICON_SIZE + "px",
                fill: DEFAULT_CONETNT_FILL,
                left: 0
            });
        var group = svg.append("g");
        return group;
    }

    /**Candle***/
    function drawCandleIcon(candleIcon) {
        var group = createSVGAndG(candleIcon, 0);

        candleStickElement.setBodyColor(DEFAULT_CONETNT_FILL);
        candleStickElement.setExternalGroup(group, group);

        var candleWidth = ICON_SIZE / 2 - 1;
        candleStickElement.setWidthOffser(candleWidth - 1);

        candleStickElement.setLayoutParams(candleWidth, 0, ICON_SIZE, ICON_SIZE - 3, 2, 0);
        candleStickElement.createCandle();

        candleStickElement.setLayoutParams(candleWidth, 0, ICON_SIZE, ICON_SIZE - 8, ICON_SIZE - 2, candleWidth + 1);
        candleStickElement.createCandle();
    }

    /**Line****/
    function drawLineIcon(lineIcon) {
        var group = createSVGAndG(lineIcon, 1);
        var pathD3 = group.append("path");

        var xPositions = [];
        for (var i = 0; i < 6; i++) {
            xPositions.push(i * ICON_SIZE / 5);
        }
        xPositions[4] -= 1;

        var yPositions = [];
        yPositions.push(ICON_SIZE);
        yPositions.push(0.6 * ICON_SIZE);
        yPositions.push(0.7 * ICON_SIZE);
        yPositions.push(0.4 * ICON_SIZE);
        yPositions.push(0.6 * ICON_SIZE);
        yPositions.push(0);

        var pathStrArr = [];
        pathStrArr.push(moveToStr(xPositions[0], yPositions[0]));

        for (var j = 1; j < 6; j++) {
            pathStrArr.push(lineToStr(xPositions[j], yPositions[j]));
        }
        pathStrArr.push(lineToStr(ICON_SIZE, ICON_SIZE));

        pathStrArr.push("Z");

        var pathStr = pathStrArr.join(" ");

        pathD3.attr("d", pathStr);
    }


    /***Volume****/
    function createVolumeButton(){
        volumeButton = papaDiv.append("a")
            .style({
                position: "relative",
                top: 3 + "px",
                right: 1 + "px",
                display: "inline-block",
                color: "#3A4BAA",
                margin: 0,
                float: "right",
                cursor: "pointer"
            })
            .attr("title", "Those red/green bars in the bottom of the chart")
            .classed("linkButton", true)
            .on("click", onVolumeClick);

        updateVolumeButtonState();
    }

    function updateVolumeButtonState(){
        if (isShowVolume){
            volumeButton.text("Hide Volume");
        }else{
            volumeButton.text("Show Volume");
        }
    }

    /**Draw*****/
    function redraw() {

    }

    /**Action***/
    function performTypeAction() {
        var funGrid = FunGrid.getInstance();
        funGrid.applyUnifiedChartType(isCandle);
    }

    function performVolumeAction() {
        var funGrid = FunGrid.getInstance();
        funGrid.redrawChartByVolumeVisibility(isShowVolume);
    }

    /**Event Listener***/
    function onTypeClick() {
        var target = d3.event.currentTarget;
        isCandle = d3.select(target).datum();

        papaComponent.hideCardActionPopup();
        requestAnimationFrame(performTypeAction);
    }

    function onVolumeClick(){
        isShowVolume = !isShowVolume;
        updateVolumeButtonState();

        papaComponent.hideCardActionPopup();
        requestAnimationFrame(performVolumeAction);
    }
}