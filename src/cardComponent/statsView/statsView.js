/**
 * Created by yoni_ on 12/26/2015.
 */
function StatsView() {
    /***Constants***/
    var MIN_CHUNK_WIDTH = 190;
    var HORIZONTAL_PAD_BETWEEN_CHUNKS = 10;
    var MIN_ROW_HEIGHT = 20;
    var FONT_SIZE = 12;

    var ROW_HEIGHT = 21;
    var BIG_VALUE_FONT_SIZE = 14;
    var SMALL_VALUE_FONT_SIZE = 12;
    //Color
    var FIELD_COLOR = "#333";
    var VALUE_COLOR = "#000";

    /**Externally Set***/
    //Data
    var cardData;
    //Structure
    var externalDiv;

    /**Internally Set***/
    //Structure
    var parentDiv;
    var liveValueDiv;
    //Data
    var stockData;
    var statsData;
    var fieldIDs = Object.keys(statsFieldIDToName);
    //Layout
    var parentDivHeight;
    var parentDivWidth;
    var chunkWidth;
    var chunkHeight;
    //(Count layout)
    var rowsPerChunk;

    //Utils
    var chunksList;
    var fieldIDToPElement;

    /**Public Function**/
    this.setExternalDiv = function (divInputD3, papaWidth, papaHeight) {
        externalDiv = divInputD3;
        parentDivWidth = papaWidth;
        parentDivHeight = papaHeight;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
        stockData = cardData.data;
        statsData = cardData.getStatsData();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        clearSlate(externalDiv);

        parentDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                width: parentDivWidth + "px",
                height: parentDivHeight + "px",
                "font-size": 0
            })
            .attr("name", "statsViewPapa");

        if (!isEmptyObject(statsData)) {
            calculateChunkWidth();
            createAllChunks();
            fillAllChunksByData();
        } else if (noStatsGlobal) {
            showFail();
        }

    }

    function showFail() {
        parentDiv.append("p")
            .style({
                "text-align": "center",
                "font-size": 14 + "px",
                "margin-bottom": 10 + "px"
            })
            .text("Sorry, Stats are currently unavailable.");

        if (cardData.view != undefined){
            parentDiv.append("p")
                .style({
                    "text-align": "center",
                    "font-size": 14 + "px"
                })
                .text("Please try News and Wow!");
        }

    }


    function createAllChunks() {
        chunksList = [];
        fieldIDToPElement = {};
        var totalChunkCount = cardData.width * cardData.height;

        var chunk;
        for (var i = 0; i < cardData.height; i++) {
            for (var j = 0; j < cardData.width; j++) {
                chunk = createEmptyChunk(j);
                chunksList.push(chunk);
            }
        }
    }

    function createEmptyChunk(indexInrRow) {
        var chunkFrame = parentDiv.append("div")
            .style({
                display: "inline-block",
                position: "relative",
                width: chunkWidth + "px",
                height: chunkHeight + "px",
                "font-size": FONT_SIZE + "px"
            });

        if (indexInrRow < cardData.width - 1) {
            chunkFrame.style("margin-right", HORIZONTAL_PAD_BETWEEN_CHUNKS + "px");
        }

        var chunk = chunkFrame.append("div").style({
            position: "absolute",
            width: "100%",
            height: "100%"
        });

        return chunk;
    }

    function createSingleRow(papaChunk, fieldText, valueText, fieldID) {
        if (!valueText) {
            valueText = "N/A";
        }
        var rowDiv = papaChunk.append("div")
            .style({
                width: "100%",
                height: ROW_HEIGHT + "px",
                "box-sizing": "border-box",
                "border-bottom": "1px solid #dddddd"
            });

        var textHeight = ROW_HEIGHT - 1;
        var valueP = rowDiv.append("p")
            .style({
                float: "right",
                margin: 0,
                height: textHeight + "px",
                "line-height": textHeight + "px",
                "font-weight": "bold",
                "padding-left": 5 + "px",
                color: VALUE_COLOR
            })
            .text(valueText)
            .datum(fieldID);

        var filedTooltip = statsFieldToTooltip[fieldID];
        var fieldP = rowDiv.append("p")
            .style({
                margin: 0,
                height: textHeight + "px",
                "line-height": textHeight + "px",
                color: FIELD_COLOR,
                overflow: "hidden",
                "text-overflow": "ellipsis",
                "white-space": "nowrap",
                cursor: "default"
            })
            .attr("title", filedTooltip)
            .text(fieldText);

        fieldIDToPElement[fieldID] = valueP;
    }

    /***Fill Chunks**/
    function fillAllChunksByData() {
        fillFirstChunk();
        var startIndex = rowsPerChunk - 1;
        var chunkIndex = 1;
        var fieldID;
        for (var i = startIndex; i < fieldIDs.length && chunkIndex < chunksList.length; i++) {
            fieldID = fieldIDs[i];

            fillChunkByIndex(chunkIndex, fieldID);
            chunkIndex = iMath.floor((i - startIndex + 1) / rowsPerChunk) + 1;
        }
    }

    function fillChunkByIndex(chunkIndex, fieldID) {
        createSingleRow(chunksList[chunkIndex], statsFieldIDToName[fieldID], statsData[fieldID], fieldID);
    }

    function fillFirstChunk() {
        fillLiveValueSection();
        var fieldID;
        var firstChunkRowCount = rowsPerChunk - 1;
        var chunkToFill = chunksList[0];
        for (var i = 0; i < firstChunkRowCount; i++) {
            fieldID = fieldIDs[i];
            createSingleRow(chunkToFill, statsFieldIDToName[fieldID], statsData[fieldID], fieldID);
        }
    }

    function fillLiveValueSection() {
        var chunk = chunksList[0];
        liveValueDiv = chunk.append("div")
            .style({
                width: "100%",
                height: ROW_HEIGHT + "px",
                "text-align": "center",
                "padding-top": 3 + "px",
                "box-sizing": "border-box"
            });

        var valueText = formatNiceNumber(stockData.value, stockData.isCurrency);
        var changeText = concatChangeAndPercentage(stockData.getChange(), stockData.getChangePercentage(), stockData.isCurrency);
        var color = getValueTextColor(stockData.getChange(), 0);

        var valueP = liveValueDiv.append("p")
            .style({
                display: "inline-block",
                "font-size": BIG_VALUE_FONT_SIZE + "px",
                "font-weight": "bold",
                margin: 0,
                "padding-right": 8 + "px",
                color: "#000000"
            })
            .text(valueText);

        var changeP = liveValueDiv.append("p")
            .style({
                display: "inline-block",
                "font-size": SMALL_VALUE_FONT_SIZE + "px",
                "font-weight": "bold",
                margin: 0,
                color: color
            })
            .text(changeText);

        //setValueRefreshClassGlobal(changeP, stockData.getPrevChangePercentage(), stockData.getChangePercentage());
    }

    /**Layout Calculations**/
    function calculateChunkWidth() {
        chunkHeight = parentDivHeight / cardData.height;

        var totalHorizontalPad = (cardData.width - 1) * HORIZONTAL_PAD_BETWEEN_CHUNKS;
        chunkWidth = (parentDivWidth - totalHorizontalPad) / cardData.width;

        rowsPerChunk = iMath.floor(chunkHeight / ROW_HEIGHT);
    }


    //todo: kill
    /* function showEmptyMessage() {
     externalDiv.append("p")
     .style({
     width: "100%",
     "text-align": "center",
     "font-weight": "bold"
     })
     .text("Stats Coming Soon...")
     }*/
}