/**
 * Created by yoni_ on 12/25/2015.
 */
function CurrentDataSection() {
    /**Constants***/
    var SECTION_HEIGHT = 60;
    var SMALL_DATA_FONT_SIZE = 12;
    var DEFAULT_SECTION_WIDTH = 190;
    var WIDER_SECTION_WIDTH = 195;
    var BIG_VALUE_AREA_HEIGHT = 42;

    /**Externally Set***/
    //Data
    var cardData;
    //Structure
    var externalDiv;
    //Layout
    var width;
    var height;
    var isVerticalAlign;


    /**Internally set**/
    //Structure
    var generalInfoDiv;
    var bigValueDiv;
    var openAndRangeSectionDiv;
    var portfolioDiv;
    var costQtyArea;
    //(Portfolio section)
    var totalValueP;
    var totalGainP;
    //Layout
    var sectionWidth;
    //Data
    var userStockData;
    var stockData;
    //Util
    var costQtyComponent = new CostQtyComponent();
    var presentationUtil = ValuePresentationUtil.getInstance();
    //State
    var isCurrency;


    /**Public functions**/
    this.setExternalDiv = function (divInputD3, widthInput, heightInput, iseVerticalAlignInput) {
        externalDiv = divInputD3;
        width = widthInput;
        height = heightInput;
        isVerticalAlign = iseVerticalAlignInput;
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;
        stockData = cardData.data;
        userStockData = getUserDataBySymbolGlobal(stockData.symbol);
        isCurrency = getIsCurrency(stockData.symbol);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.updatePersonalData = function () {
        updatePersonalData();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        clearSlate(externalDiv);

        if (isVerticalAlign) {
            sectionWidth = DEFAULT_SECTION_WIDTH;
        } else {
            sectionWidth = WIDER_SECTION_WIDTH;
        }
        createPortfolioSection();
        createGeneralSection();
    }

    function createGeneralSection() {
        generalInfoDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: SECTION_HEIGHT + "px",
                width: sectionWidth + "px",
                background: "white" //todo: Maybe reconsider this
            })
            .attr("name", "generalInfoDiv");

        bigValueDiv = generalInfoDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                top: 0 + "px",
                height: BIG_VALUE_AREA_HEIGHT + "px",
                width: sectionWidth + "px",
                "font-weight": "bold"
            });
        var isRefreshable = (cardData.drawCount > 2);
        presentationUtil.setSymbol(cardData.symbol);
        presentationUtil.createBigFontValue(stockData.value, stockData.getChange(), stockData.getChangePercentage(),
            bigValueDiv, BIG_VALUE_AREA_HEIGHT, isRefreshable, stockData.getPrevChangePercentage());

        openAndRangeSectionDiv = generalInfoDiv.append("div")
            .style({
                position: "absolute",
                left: 0 + "px",
                bottom: 0 + "px",
                width: sectionWidth + "px",
                height: SECTION_HEIGHT - BIG_VALUE_AREA_HEIGHT + "px",
                "font-size": SMALL_DATA_FONT_SIZE + "px",
                color: "#878787",
                cursor: "default"
            })
            .attr("name", "openAndRangeSectionDiv");

        fillOpenLHSection();
    }

    function createPortfolioSection() {
        var portfolioTop = SECTION_HEIGHT;
        var portfolioLeft = 0;
        var portfolioRight = undefined;
        if (!isVerticalAlign) {
            portfolioTop = 0;
            portfolioLeft = undefined;
            portfolioRight = 0;
        }
        portfolioDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: portfolioLeft + "px",
                right: portfolioRight + "px",
                top: portfolioTop + "px",
                height: SECTION_HEIGHT + "px",
                width: sectionWidth + "px",
                "font-size": SMALL_DATA_FONT_SIZE + "px",
                cursor: "default"
            })
            .attr("name", "portfolioDiv");
        fillPortfolioSection();
    }


    /**Open L/H**/
    function fillOpenLHSection() {
        var openP = openAndRangeSectionDiv.append("p")
            .style({
                position: "absolute",
                left: 0,
                bottom: 0,
                margin: 0
            })
            .text("Open " + formatNiceNumber(stockData.open, isCurrency));

        var rangeTextStr = "[" + formatNiceNumber(stockData.low, isCurrency) + " - " + formatNiceNumber(stockData.high, isCurrency) + "]";
        var rangeP = openAndRangeSectionDiv.append("p")
            .style({
                position: "absolute",
                right: 0,
                bottom: 0,
                margin: 0
            })
            .attr("title", "Today's range. " + rangeTextStr)
            .text(rangeTextStr);
    }


    /**Portfolio***/
    function fillPortfolioSection() {
        var rowHeight = SECTION_HEIGHT / 3;
        var totalGainField = portfolioDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: 0
            })
            .text("Total Gain ");

        totalGainP = portfolioDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: 64 + "px",
                "font-weight": "bold"
            });

        var totalValueField = portfolioDiv.append("p")
            .style({
                position: "absolute",
                bottom: rowHeight + "px",
                margin: 0,
                left: 0
            })
            .text("Total Value ");

        totalValueP = portfolioDiv.append("p")
            .style({
                position: "absolute",
                bottom: rowHeight + "px",
                margin: 0,
                left: 71 + "px"
            });


        updatePersonalData();
        createCostQtyArea(rowHeight * 2, rowHeight);
    }

    function createCostQtyArea(bottom, height) {
        costQtyArea = portfolioDiv.append("div")
            .style({
                position: "absolute",
                bottom: bottom + "px",
                height: height + "px",
                width: sectionWidth + "px",
                margin: 0,
                left: 0
            });

        costQtyComponent.setData(userStockData);
        costQtyComponent.setCardData(cardData);
        costQtyComponent.setExternalDiv(costQtyArea.node(), sectionWidth, height);
        costQtyComponent.drawComponent();
    }

    /**Data Processing***/
    function updatePersonalData() {
        if (stockData){
            var totalGainText = concatChangeAndPercentage(stockData.getTotalGain(), stockData.getTotalGainPercentage(), isCurrency);
            var totalValueText = formatNiceNumber(stockData.getTotalValue());

            totalValueP.text(totalValueText);
            totalGainP.text(totalGainText);

            var totalGailColor = getValueTextColor(stockData.getTotalGain(), 0);
            totalGainP.style("color", totalGailColor);

            costQtyComponent.updateTextByData();
        }
    }
}