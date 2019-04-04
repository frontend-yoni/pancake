/**
 * Created by mizrasha on 14/02/2016.
 */
function MultiTooltipComponent() {
    var me = this;

    /**Constants**/
    var FONT_SIZE = 12;
    var P_MARGIN_RIGHT = 5;
    var TOOLTIP_MARGIN_TOP = 2;
    var TOOLTIP_MARGIN_BOTTOM = 2;
    var SVG_WIDTH = 10;
    var SVG_HEIGHT = 10;
    var POINT_X = 5;
    var POINT_Y = 5;
    var POINT_R = 3;
    var TOOLTIP_DIV_BORDER_STYLE = "1px solid black";
    var TOOLTIP_DIV_PADDING = 5;
    var TOOLTIP_DIV_BORDER_RADIUS = 5;
    var NAME_P_WIDTH = 64;

    /**Externally Set**/
    //Structure elements
    var externalDiv;
    //Data
    var indicatorParamList;
    //Functions


    /**Internally Set**/
    var tooltipDiv;
    var tooltipValuesPArray = [];


    /**Public functions**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (paramsList) {
        indicatorParamList = paramsList;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.updateData = function (updateData) {
        updateValue(updateData);
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        clearSlate(externalDiv);
        tooltipValuesPArray = [];

        tooltipDiv = externalDiv.append("div")
            .style({
                display: "inline-block",
                border: TOOLTIP_DIV_BORDER_STYLE,
                padding: TOOLTIP_DIV_PADDING + "px",
                "padding-top": TOOLTIP_DIV_PADDING - TOOLTIP_MARGIN_TOP + "px",
                "padding-bottom": TOOLTIP_DIV_PADDING - TOOLTIP_MARGIN_BOTTOM + "px",
                "border-radius": TOOLTIP_DIV_BORDER_RADIUS + "px",
                "font-size": FONT_SIZE + "px",
                background: "rgba(255,255,255,0.8)"
            })
            .attr({
                "name": "multiTooltipDiv"
            });

        var i;
        var tooltipRowData;
        var tooltipRowDiv;
        var tooltipRowSvg;
        var tooltipRowValue;
        for (i = 0; i < indicatorParamList.length; i++) {
            tooltipRowData = indicatorParamList[i];
            tooltipRowDiv = tooltipDiv.append("div")
                .style({
                    "margin-top": TOOLTIP_MARGIN_TOP + "px",
                    "margin-bottom": TOOLTIP_MARGIN_BOTTOM + "px"
                })
                .attr({
                    "name": "tooltipRow" + i
                });
            tooltipRowSvg = tooltipRowDiv.append("svg")
                .style({
                    display: "inline-block",
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "margin-right": P_MARGIN_RIGHT + "px",
                    width: SVG_WIDTH,
                    height: SVG_HEIGHT
                });
            tooltipRowSvg.append("circle")
                .attr({
                    cx: POINT_X,
                    cy: POINT_Y,
                    r: POINT_R,
                    fill: tooltipRowData.color
                });


            var type = tooltipRowData.type;
            var name = IndicatorsUtil.TYPES_TO_SHORT_TEXT[type];
            tooltipRowDiv.append("p")
                .text(name)
                .style({
                    display: "inline-block",
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "margin-right": P_MARGIN_RIGHT + "px",
                    width: NAME_P_WIDTH + "px"
                });

            tooltipRowValue = tooltipRowDiv.append("p")
                .style({
                    display: "inline-block",
                    "margin-top": 0,
                    "margin-bottom": 0,
                    "margin-right": P_MARGIN_RIGHT + "px",
                    "font-weight": "bold"
                });
            tooltipValuesPArray.push(tooltipRowValue);
        }
    }

    function updateValue(valueStrings) {
        var i;
        var rowP;
        var valueData;
        for (i = 0; i < indicatorParamList.length; i++) {
            rowP = tooltipValuesPArray[i];
            valueData = valueStrings[i];
            rowP.text(valueData);
        }
    }
}
