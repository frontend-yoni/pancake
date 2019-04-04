/**
 * Created by yoni_ on 4/23/2016.
 */
function PieTooltipUtil() {
    var iMath = Math;
    /***CONSTANTS****/
    var TOOLTIP_WIDTH = 120;
    var TOOLTIP_HEIGHT = 38;
    var POINT_SIZE = 4;

    var BORDER_WIDTH = 2;
    var PIE_THICKNESS = 16;
    var INNER_PATH_THICKNESS = 0;
    var TIP_WIDTH = 10;

    var BUBBLE_COLOR = "#ffffff";

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Layout
    var canvasWidth;
    var canvasHeight;
    var radius;
    //Style
    var fontSize = 14;

    /**Internally Set***/
    //Structure
    var tooltipDiv;
    var tooltipCircle;
    var tipDiv;
    var symbolP;
    var percentP;
    var valueP;
    //Layout
    var tooltipRadius;
    var topAndLeftPosition;

    /***Public Functions***/
    this.setExternalDiv = function (externalDivI, width, height, radiusI, fontSizeI) {
        externalDiv = externalDivI;
        radius = radiusI;
        canvasWidth = width;
        canvasHeight = height;
        fontSize = fontSizeI;
    };

    this.construct = function () {
        construct();
    };

    this.positionTip = function (sliceData) {
        positionTip(sliceData)
    };

    this.hideTip = function () {
        hideTip();
    };

    /***Construction***/
    function construct() {
        tooltipRadius = (radius - INNER_PATH_THICKNESS - PIE_THICKNESS - BORDER_WIDTH);

        tooltipDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                height: canvasHeight + "px",
                width: canvasWidth + "px",
                display: "none",
                "pointer-events": "none"
            });


        topAndLeftPosition = radius - tooltipRadius;


        var tipLeft = topAndLeftPosition + tooltipRadius - TIP_WIDTH / 2;
        var tipBottom = topAndLeftPosition + tooltipRadius;

        tooltipCircle = tooltipDiv.append("div")
            .style({
                position: "absolute",
                top: topAndLeftPosition + "px",
                left: topAndLeftPosition + "px",
                background: BUBBLE_COLOR,
                width: tooltipRadius * 2 + "px",
                height: tooltipRadius * 2 + "px",
                "text-align": "center",
                cursor: "default",
                "box-shadow": "inset 0 -1px 1px 0 rgba(0,0,0,0.1), 0px 0px 3px 5px rgba(0,0,0,0.1)",
                "border-radius": "50%"
            });

        tipDiv = tooltipDiv.append("div")
            .style({
                position: "absolute",
                bottom: tipBottom + "px",
                left: tipLeft + "px",
                width: TIP_WIDTH + "px",
                "transform-origin": "50% 100%",
                height: tooltipRadius + TIP_WIDTH + "px"
            });

        var tipContainer = tipDiv.append("div")
            .style({
                position: "absolute",
                top: 1 + "px",
                left: -TIP_WIDTH / 2 - 3 + "px",
                width: TIP_WIDTH * 2 + 6 + "px",
                height: 13 + "px",
                overflow: "hidden"
            });

        var tipTriangle = tipContainer.append("div")
            .style({
                position: "absolute",
                top: 6 + "px",
                left: 3 + "px",
                background: BUBBLE_COLOR,
                width: TIP_WIDTH * 2 + "px",
                height: TIP_WIDTH * 2 + "px",
                transform: "rotate(" + 45 + "deg)",
                "box-shadow": "0px 0px 3px 1px rgba(0,0,0,0.1)",
                "transform-origin": "50% 50%"
            });

        constructTexts();
    }

    function constructTexts() {
        valueP = tooltipDiv.append("p")
            .style({
                position: "absolute",
                width:  tooltipRadius * 2 + "px",
                top: topAndLeftPosition + "px",
                left: topAndLeftPosition + "px",
                margin: 0,
                "font-size": fontSize + "px",
                height: tooltipRadius * 2 + "px",
                "font-weight": "bold",
                "line-height": tooltipRadius * 2 + "px",
                "text-align": "center"
            });

        var descTop = topAndLeftPosition + tooltipRadius - fontSize - 7;
        var decFontSize = iMath.ceil(fontSize * 0.6);

        symbolP = tooltipDiv.append("p")
            .style({
                position: "absolute",
                left: topAndLeftPosition + "px",
                top: descTop + "px",
                width: tooltipRadius * 2 + "px",
                "text-align": "center",
                margin: 0,
                "font-size": decFontSize + "px",
                color: "#666666"
            });

        percentP = tooltipDiv.append("p")
            .style({
                position: "absolute",
                bottom: descTop + "px",
                left: topAndLeftPosition + "px",
                width: tooltipRadius * 2 + "px",
                "text-align": "center",
                margin: 0,
                "font-size": decFontSize + "px",
                color: "#666666"
            });
    }

    /***Position***/
    function positionTip(sliceData) {
        positionTooltipByData(sliceData);
        setProperText(sliceData);
    }

    function hideTip() {
        tooltipDiv.style("display", "none");
    }

    /**Calculations****/
    function positionTooltipByData(sliceData) {
        tooltipDiv.style("display", "");

        var rotateAngleRadian = (sliceData.endAngle + sliceData.startAngle) / 2;
        var rotateAngle = (rotateAngleRadian / (iMath.PI)) * 180;
        tipDiv.style({
            transform: "rotate(" + rotateAngle + "deg)"
        });
    }

    function setProperText(sliceData) {
        var symbolText = sliceData.symbol;
        var percentText = formatNiceNumber(sliceData.percent) + "%";
        var valueText = formatNiceNumber(sliceData.value);

        symbolP.text(symbolText);
        percentP.text(percentText);
        valueP.text(valueText);
    }
}