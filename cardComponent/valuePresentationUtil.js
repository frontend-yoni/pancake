/**
 * Created by avitzur on 9/30/2015.
 */
function ValuePresentationUtil() {
    var MAIN_TITLE_FONT = 14;
    var SECONDARY_TITLE_FONT = 12;
    var CURRENT_DATA_SECTIONS_HEIGHT = 60;
    var REFRESHING_VALUE_CLASS = "refreshingValueClass";

    var isCurrency;
    var symbol;

    /*Public functions*/
    this.createBigFontValue = function (value, change, changePercentage, containerDiv, height, isRefreshable, prevChangePercentage) {
        createBigFontValue(value, change, changePercentage, containerDiv, height, isRefreshable, prevChangePercentage);
    };

    this.createTitleText = function (mainText, secondaryName, titleDiv) {
        createTitleText(mainText, secondaryName, titleDiv);
    };

    this.setSymbol = function (symbolInput) {
        symbol = symbolInput;
        isCurrency = getIsCurrency(symbol);
    };

    /*inner functions*/
    function createTitleText(mainText, secondaryName, titleDiv) {
        var mainP = titleDiv.append("p")
            .style({
                position: "relative",
                bottom: 1 + "px",
                margin: 0,
                "text-align": "center",
                "font-size": MAIN_TITLE_FONT + "px",
                "font-weight": "bold"
            })
            .text(mainText);

        var secondaryP = titleDiv.append("p")
            .style({
                position: "relative",
                bottom: 3 + "px",
                margin: 0,
                "text-align": "center",
                "font-size": SECONDARY_TITLE_FONT + "px",
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            })
            .attr("title", secondaryName)
            .text(secondaryName);
    }

    function createBigFontValue(value, change, changePercentage, containerDiv, height, isRefreshable, prevChangePercentage) {
        var bigFontSize = height / 2;
        var smallFontSize = bigFontSize * 0.8;
        var valueText = formatNiceNumber(value, isCurrency);
        var valueP = containerDiv.append("p")
            .style({
                margin: 0,
                "font-size": bigFontSize + "px",
                "text-align": "center",
                cursor: "default"
            })
            .text(valueText);


        //Set tooltip for currency
        if (isCurrency) {
            var currencyName = getCurrencyName(symbol);
            var oppositeValue = formatNiceNumber(1 / value, true);
            var line1 = "$" + valueText + " = 1 " + currencyName;
            var line2 = oppositeValue + " " + currencyName + " = " + "$1";
            var tooltip = line1 + "\n" + line2;
            valueP.attr("title", tooltip);
        }


        var changeText = concatChangeAndPercentage(change, changePercentage, isCurrency);
        var changeColor;
        if (changePercentage >= 0) {
            changeColor = GOOD_COLOR;
        } else {
            changeColor = BAD_COLOR;
        }

        var changeDiv = containerDiv.append("div");
        var changeP = changeDiv.append("p")
            .style({
                margin: "auto",
                "font-size": smallFontSize + "px",
                "text-align": "center",
                color: changeColor
            })
            .text(changeText);

        if (isRefreshable) {
            setValueRefreshClassGlobal(changeP, prevChangePercentage, changePercentage);
        }
    }

    function createFieldValueCouple(fieldName, valueText, fieldWidth, containerDiv, topPosition, leftPosition) {
        var fieldP = containerDiv.append("p")
            .style({
                position: "absolute",
                left: leftPosition + "px",
                top: topPosition + "px",
                width: fieldWidth + "px",
                margin: 0
            })
            .text(fieldName + ":");

        var valueP = containerDiv.append("p")
            .style({
                position: "absolute",
                top: topPosition + "px",
                left: fieldWidth + leftPosition + "px",
                margin: 0
            })
            .text(valueText);
    }

    function fillExtraDataSection(extraDataDiv) {
        createFieldValueCouple("open", 20.23, 35, extraDataDiv, 0, 15);
        createFieldValueCouple("low/high", "15.23-28.23", 50, extraDataDiv, 0, 85);
        //createFieldValueCouple("low", 15.23, 35, extraDataDiv, 15, 15);
        createFieldValueCouple("previous close", 21.54, 92, extraDataDiv, 30, 15);
    }
}

ValuePresentationUtil.getInstance = function () {
    if (!ValuePresentationUtil.instance) {
        ValuePresentationUtil.instance = new ValuePresentationUtil();
    }
    return ValuePresentationUtil.instance;
};