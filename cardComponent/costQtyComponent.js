/**
 * Created by Jonathan on 10/4/2015.
 */
function CostQtyComponent() {
    //Constants
    var OPTIMAL_WIDTH = 190;
    var COST_FIELD_WIDTH = 32;
    var QTY_FIELD_WIDTH = 25;
    var TRIMMED_FIELD_WIDTH = 12;
    var BUTTON_WIDTH = 16;
    var PAD_FROM_ICON = 5;
    //Constants (Event)
    var EDIT_COMPLETE_EVENT = "costQtyEditCompleteEvent";
    //ASCII
    var ENTER_KEY_CODE = 13;
    //Class
    var RELEVANT_INPUT = "relevantInput";
    //Text
    var COST_DESCRIPTION = "Price payed for each one";
    var QTY_DESCRIPTION = "Amount you own";

    //Externally set state
    var isDarkBackground;

    //Structure
    var externalDiv;
    var costValueP;
    var qtyValueP;
    var costEditInput;
    var qtyEditInput;
    var editButtonDiv;
    var saveButtonDiv;

    //Layout
    var width;
    var height;
    var inputWidth;
    var isTooShort;
    var costFieldWidth;
    var qtyFieldWidth;
    //Data
    var userStockData;
    var cardData;
    var isCurrency;

    //Shape util
    var shapeUtil = ShapesUtil.getInstance();

    //Sate
    var isMiddleOfEdit = false;

    /**Public properties**/
    this.EDIT_COMPLETE_EVENT = EDIT_COMPLETE_EVENT;

    /**Public functions**/
    this.setExternalDiv = function (divInput, widthInput, heightInput) {
        externalDiv = d3.select(divInput);
        width = widthInput;
        height = heightInput;
        isTooShort = (width < OPTIMAL_WIDTH);
    };

    this.setData = function (userStockDataInput) {
        userStockData = userStockDataInput;
        isCurrency = getIsStrongCurrency(userStockData.symbol);
    };


    this.setCardData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setIsDarkBackground = function (boolean) {
        isDarkBackground = boolean;
    };

    this.updateTextByData = function () {
        updateTextByData();
    };

    this.getIsMiddleOfEdit = function(){
        return isMiddleOfEdit;
    };

    /**Inner functions**/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {

        if (isTooShort){
            costFieldWidth = TRIMMED_FIELD_WIDTH;
            qtyFieldWidth = TRIMMED_FIELD_WIDTH;
        }else{
            costFieldWidth = COST_FIELD_WIDTH;
            qtyFieldWidth = QTY_FIELD_WIDTH;
        }

        inputWidth = width / 2 - costFieldWidth - PAD_FROM_ICON - BUTTON_WIDTH;

        var costFiled = externalDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: 0,
                cursor: "default"
            })
            .attr("title", COST_DESCRIPTION)
            .text("Cost ");

        var qtyField = externalDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: width / 2 + "px",
                cursor: "default"
            })
            .attr("title", QTY_DESCRIPTION)
            .text("Qty ");

        if (isTooShort){
            costFiled.text("C ");
            qtyField.text("Q ");
        }

        costValueP = externalDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: costFieldWidth + "px",
                cursor: "default"
            })
            .attr("title", COST_DESCRIPTION);
        costValueP.text(formatNiceNumber(userStockData.cost, isCurrency));


        qtyValueP = externalDiv.append("p")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: width / 2 + qtyFieldWidth + "px",
                cursor: "default"
            })
            .attr("title", QTY_DESCRIPTION);
        qtyValueP.text(userStockData.qty);

        var inputHeight = height * 0.6;

        costEditInput = externalDiv.append("input")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: costFieldWidth + "px",
                width: inputWidth + "px",
                height: inputHeight + "px",
                "box-sizing": "initial"
            })
            .attr({
                type: "text"
            })
            .on("keyup", onKeyUp);
        setInputValues(costEditInput, userStockData.cost);

        qtyEditInput = externalDiv.append("input")
            .style({
                position: "absolute",
                bottom: 0,
                margin: 0,
                left: width / 2 + qtyFieldWidth + "px",
                width: inputWidth + "px",
                height: inputHeight + "px",
                "box-sizing": "initial"
            })
            .attr({
                type: "text"
            })
            .on("keyup", onKeyUp);
        setInputValues(qtyEditInput, userStockData.qty);
        if (isTooShort){
            qtyEditInput.style("width", inputWidth - 5 + "px");
        }


        saveButtonDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                right: 0,
                width: BUTTON_WIDTH + "px",
                height: BUTTON_WIDTH + "px",
                bottom: 0,
                cursor: "pointer"
            })
            .on("click", completeEdit);

        shapeUtil.createCheckIcon(saveButtonDiv, BUTTON_WIDTH, isDarkBackground);

        editButtonDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                right: 0,
                width: BUTTON_WIDTH + "px",
                height: BUTTON_WIDTH + "px",
                bottom: 0,
                cursor: "pointer"
            })
            .on("click", activateEditMode);

        shapeUtil.createPenIcon(editButtonDiv, BUTTON_WIDTH, isDarkBackground);

        restoreNonEditMode();
    }

    function setInputValues(inputElement, value) {
        var inputText = value;
        if (inputText == 0) {
            inputText = "";
        }
        inputElement.attr("value", inputText);
    }

    /**Interactions***/
    function activateEditMode() {
        qtyEditInput.style({
            display: ""
        });
        costEditInput.style({
            display: ""
        });


        editButtonDiv.style({
            display: "none"
        });
        saveButtonDiv.style({
            display: ""
        });

        costEditInput.node().focus();

        isMiddleOfEdit = true;
        if (cardData) {
            cardData.isMiddleOfEdit = isMiddleOfEdit;
        }
    }

    function restoreNonEditMode() {
        qtyEditInput.style({
            display: "none"
        });
        costEditInput.style({
            display: "none"
        });
        editButtonDiv.style({
            display: ""
        });
        saveButtonDiv.style({
            display: "none"
        });

        updateUserDataByInput();
        updateTextByData();
    }

    function updateUserDataByInput() {
        userStockData.cost = +costEditInput.node().value;
        userStockData.qty = +qtyEditInput.node().value;
    }

    function updateTextByData() {
        if (userStockData && qtyValueP) {
            qtyValueP.text(userStockData.qty);
            costValueP.text(formatNiceNumber(userStockData.cost, isCurrency));
        }
    }

    function completeEdit() {
        restoreNonEditMode();
        dispatchEventByNameAndData(externalDiv, EDIT_COMPLETE_EVENT, userStockData);
        updatePortfolioDataGlobal(userStockData.symbol);

        isMiddleOfEdit = false;
        if (cardData) {
            cardData.isMiddleOfEdit = isMiddleOfEdit;
        }

        informActionToSave();
    }

    /**Attach events**/

    /**Event Listener***/
    function onKeyUp() {
        if (d3.event.keyCode == ENTER_KEY_CODE) {
            if (costEditInput.node().value == "") {
                costEditInput.node().focus();
            } else if (qtyEditInput.node().value == "") {
                qtyEditInput.node().focus();
            } else {
                completeEdit();
            }
        }
    }
}