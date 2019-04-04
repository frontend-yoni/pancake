/**
 * Created by ReznikFamily on 17/12/2015.
 */
function ComparableTopTip() {
    /**CONSTANTS***/
    var COLUMN_WIDTH = 115;
    var TIP_HEIGHT = 40;
    var NAME_SECTION_WIDTH = 55;
    var PADDING_FROM_EDGES = 3;

    var BORDER_COLOR = "#999999";
    /***Externally set**/
    //Structure
    var topAreaDiv;

    /***Internally set**/
    //Structure
    var tipDiv;

    var valuePList = [];
    //Layout
    var topAreaWidth;
    var topAreaHeight;
    var tipWidth;
    var tipHeight;

    /***Public functions**/
    this.createTopTip = function (topAreaDivInput, symbolList, colors) {
        createTopTip(topAreaDivInput, symbolList, colors);
    };

    this.hideTip = function () {
        hideTip();
    };

    this.positionTip = function (pointX, valueList, showColor) {
        positionTip(pointX, valueList, showColor);
    };

    /**Construction****/
    function createTopTip(topAreaDivInput, symbolList, colors) {
        topAreaDiv = topAreaDivInput;

        topAreaWidth = topAreaDiv.node().clientWidth;
        topAreaHeight = topAreaDiv.node().clientHeight;

        tipWidth = COLUMN_WIDTH;
        tipHeight = TIP_HEIGHT;
        if (symbolList.length > 2) {
            tipWidth += COLUMN_WIDTH;
        }
        if (symbolList.length == 1){
            tipHeight = TIP_HEIGHT / 2;
        }


        tipDiv = topAreaDiv.append("div")
            .style({
                position: "absolute",
                top: 1 + "px",
                "font-size": 11 + "px",
                height: tipHeight + "px",
                width: tipWidth + "px",
                border: "1px solid " + BORDER_COLOR,
                background: "#f1f1f1",
                "box-sizing": "border-box",
                "pointer-events": "none",
                "box-shadow": "rgba(0,0,0,0.5) 1px 1px 1px 1px",
                "z-index": ChartButtonsComponent.Z_INDEX
            });
        hideTip();

        createNames(symbolList, colors);
        createValuePs(symbolList);
    }

    function createValuePs(symbolList) {
        valuePList = [];
        createValueP(NAME_SECTION_WIDTH, PADDING_FROM_EDGES - 2);
        createValueP(NAME_SECTION_WIDTH, undefined, PADDING_FROM_EDGES, 2);
        if (symbolList.length > 2) {
            createValueP(COLUMN_WIDTH + NAME_SECTION_WIDTH - PADDING_FROM_EDGES, PADDING_FROM_EDGES - 2);
        }
        if (symbolList.length > 3) {
            createValueP(COLUMN_WIDTH + NAME_SECTION_WIDTH - PADDING_FROM_EDGES, undefined, PADDING_FROM_EDGES, 2);
        }
    }

    function createValueP(left, top, bottom, bottomPad) {
        var valueP = createLabel(left, top, bottom);
        valueP.style("font-weight", "bold");
        if (bottomPad) {
            valueP.style("padding-bottom", bottomPad + "px");
        }

        valuePList.push(valueP);
    }

    function createNames(symbolList, colors) {
        createNameP(symbolList[0], colors[0], PADDING_FROM_EDGES, PADDING_FROM_EDGES - 2);
        createNameP(symbolList[1], colors[1], PADDING_FROM_EDGES, undefined, PADDING_FROM_EDGES);
        if (symbolList.length > 2) {
            createNameP(symbolList[2], colors[2], COLUMN_WIDTH + PADDING_FROM_EDGES, PADDING_FROM_EDGES - 2);
        }
        if (symbolList.length > 3) {
            createNameP(symbolList[3], colors[3], COLUMN_WIDTH + PADDING_FROM_EDGES, undefined, PADDING_FROM_EDGES);
        }
    }

    function createNameP(symbol, color, left, top, bottom) {
        var nameP = createLabel(left, top, bottom);
        nameP.style("border-bottom", "2px solid " + color)
            .text(symbol);
    }

    function createLabel(left, top, bottom) {
        var labelElement = tipDiv.append("p")
            .style({
                position: "absolute",
                left: left + "px",
                margin: 0
            });

        if (bottom == undefined) {
            labelElement.style("top", top + "px");
        } else {
            labelElement.style("bottom", bottom + "px");
        }
        return labelElement;
    }

    /**UI Changes***/
    function positionTip(pointX, valueList, showColor) {
        var left = pointX - tipWidth / 2;
        left = iMath.max(left, 0);
        left = iMath.min(left, topAreaWidth - tipWidth);
        tipDiv.style({
            left: left + "px",
            display: ""
        });

        for (var i = 0; i < valueList.length; i++) {
            setValuePText(valuePList[i], valueList[i], showColor)
        }
    }

    function setValuePText(valueP, value, showColor) {
        var valueText;

        if (value != undefined) {
            valueText = formatNiceNumber(value) + "%";
        } else {
            valueText = "";
        }

        if (value > 0) {
            valueText = "+" + valueText;
        }

        valueP.text(valueText);

        if (showColor) {
            var color = getValueTextColor(value, 0);
            valueP.style("color", color);
        } else {
            valueP.style("color", null);
        }
    }

    function hideTip() {
        if (tipDiv) {
            tipDiv.style("display", "none");
        }
    }
}