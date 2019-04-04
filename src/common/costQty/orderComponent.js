/**
 * Created by mizrasha on 21/04/2016.
 */
function OrderComponent() {
    var me = this;

    //CONSTANTS
    var STOCK_SYMBOL_TEXT = "Stock Symbol";
    var TRANSACTION_TEXT = "Transaction";
    var QUANTITY_TEXT = "Quantity";
    var PRICE_TEXT = "Price";
    var DURATION_TEXT = "Duration";

    var TRANSACTION_OPTIONS = [
        {text: "Buy"/*, toShow: function() {return true;}*/},
        {
            text: "Sell", toShow: function () {
            return toShowSell()
        }
        }
    ];
    var PRICE_OPTIONS = [{text: "Marker"}, {text: "Limit", extraInput: true}, {
        text: "Stop",
        extraInput: true
    }, {text: "Trailing Stop"}];
    var DURATION_OPTIONS = [
        {text: "Good Till Cancelled"/*, toShow: function() {return true;}*/},
        {text: "Good ?!?!?!"/*, toShow: function() {return true;}*/}
    ];
    var QUANTITY_VALIDATION = quantityValidation;


    var CONTAINER_DIV_PADDING = 10;
    var ROW_BOTTOM_PADDING = 10;
    var ROW_TEXT_WIDTH = 120;
    var ROW_INPUT_WIDTH = 80;
    var SAVE_BUTTON_WIDTH = 40;

    /****External set****/
    //Structure
    var externalDiv;
    var containerDiv;
    var priceRadioButtons = [];
    var transactionSelectorHTML;
    var quantityTag;
    //Data
    var stockData;
    //Util
    var papaComponent;

    /**Public Functions**/
    this.setExternalDiv = function (externalDivInput) {
        externalDiv = externalDivInput;
    };

    this.setStockData = function (stockDataInput) {
        stockData = stockDataInput;
    };
    
    this.setPapaComponent = function(orderWindowUtil){
        papaComponent = orderWindowUtil;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    function drawComponent() {
        clearSlate(externalDiv);

        containerDiv = externalDiv.append("div")
            .style({
                padding: CONTAINER_DIV_PADDING + "px"
            });

        var stockSymbolRowDiv = createRow();
        createRowLabel(stockSymbolRowDiv, STOCK_SYMBOL_TEXT);
        createRowInput(stockSymbolRowDiv, "p", stockData.symbol);

        var transactionRowDiv = createRow();
        createRowLabel(transactionRowDiv, TRANSACTION_TEXT);
        transactionSelectorHTML = createLineSelector(transactionRowDiv, TRANSACTION_OPTIONS);

        var quantityRowDiv = createRow();
        createRowLabel(quantityRowDiv, QUANTITY_TEXT);
        quantityTag = createRowInput(quantityRowDiv, "input", "", QUANTITY_VALIDATION);

        d3.select(transactionSelectorHTML).on("change", quantityValidation(quantityTag));

        var priceRowDiv = createRow();
        createPriceRadioButtons(priceRowDiv);

        var durationRowDiv = createRow();
        createRowLabel(durationRowDiv, DURATION_TEXT);
        createLineSelector(durationRowDiv, DURATION_OPTIONS);

        var saveButtonRowDiv = createRow();
        createSaveButton(saveButtonRowDiv);

        saveButtonRowDiv.style({
            "padding-bottom": 0
        });


    }

    function createRow() {
        var rowDiv = containerDiv.append("div")
            .style({
                position: "relative",
                width: "100%",
                "padding-bottom": ROW_BOTTOM_PADDING + "px"
            });
        return rowDiv;
    }

    function createRowLabel(containerDiv, label) {
        var rowLabel = containerDiv.append("p")
            .style({
                position: "relative",
                margin: 0,
                display: "inline-block",
                width: ROW_TEXT_WIDTH + "px"
            })
            .text(label);
        return rowLabel;
    }

    function createRowInput(containerDiv, tag, inputText, validation) {
        var tag = containerDiv.append(tag)
            .style({
                position: "relative",
                margin: 0,
                display: "inline-block",
                width: ROW_INPUT_WIDTH + "px",
                "box-sizing": "border-box"
            })
            .attr({
                type: "number"
            })
            .text(inputText);
        if (validation) {
            tag.on("keyup", validation(tag.node()))
        }
        return tag.node();

    }

    function createLineSelector(containerDiv, selectorOptions) {
        var selector = containerDiv.append("select")
            .style({
                position: "relative",
                "min-width": ROW_INPUT_WIDTH + "px"
            });
        var selectorOption;
        for (var i = 0; i < selectorOptions.length; i++) {
            selectorOption = selectorOptions[i];
            if ((!selectorOption.toShow) || (selectorOption.toShow && selectorOption.toShow())) {
                selector.append("option")
                    .attr({
                        value: selectorOption.text
                    })
                    .text(selectorOption.text);
            }
        }
        return selector.node();
    }

    function createPriceRadioButtons(containerDiv) {
        var priceLabel = createRowLabel(containerDiv, PRICE_TEXT);
        priceLabel.style({
            "vertical-align": "top"
        });
        var priceRadioButtonsContainer = containerDiv.append("form")
            .style({
                position: "relative",
                display: "inline-block"
            });
        var priceOption;
        var priceOptionDiv;
        var priceOptionText;
        var priceOptionLabel;
        for (var i = 0; i < PRICE_OPTIONS.length; i++) {
            priceOption = PRICE_OPTIONS[i];
            priceOptionDiv = priceRadioButtonsContainer.append("div");
            if (i < PRICE_OPTIONS.length - 1) {
                priceOptionDiv.style({
                    "padding-bottom": ROW_BOTTOM_PADDING + "px"
                })
            }
            priceOptionLabel = priceOptionDiv.append("input")
                .attr({
                    type: "radio",
                    value: priceOption.text,
                    name: "priceOption"
                })
                .style({
                    display: "inline-block",
                    "margin-left": 0
                });
            priceOptionText = priceOptionDiv.append("p")
                .style({
                    display: "inline-block",
                    margin: 0,
                    cursor: "pointer"
                })
                .text(priceOption.text)
                .on("click", onRadioButtonTextClick(priceOptionLabel));
            priceRadioButtons.push(priceOptionLabel.node());
            if (priceOption.extraInput) {
                priceOptionText.style({
                    width: 42 + "px"
                });
                priceOptionDiv.append("input")
                    .style({
                        display: "inline-block",
                        width: ROW_INPUT_WIDTH + "px"
                    })
                    .on("click", onRadioButtonTextClick(priceOptionLabel));
            }
        }
    }

    function onRadioButtonTextClick(radioButton) {
        return function () {
            var priceRadioButton;
            for (var i = 0; i < priceRadioButtons.length; i++) {
                priceRadioButton = priceRadioButtons[i];
                if (priceRadioButton !== radioButton.node()) {
                    priceRadioButton.checked = false;
                }
            }
            radioButton.node().checked = true;
        }
    }

    function createSaveButton(saveButtonRowDiv) {
        saveButtonRowDiv.append("div")
            .style({
                border: "1px solid black",
                "text-align": "center",
                width: SAVE_BUTTON_WIDTH + "px",
                "margin-left": "auto",
                "margin-right": 3 + "px",
                cursor: "pointer"
            })
            .text("Save")
            .on("click", onSaveClick);

    }

    function toShowSell() {
        return ((stockData.qty) && (stockData.qty > 0));
    }

    function quantityValidation(tagHTML) {
        return function () {
            if (transactionSelectorHTML && transactionSelectorHTML.selectedIndex === 1) {
                while (tagHTML.value > stockData.qty) {
                    /*                    d3.select(tagHTML).style({
                     border: "red solid 1px"
                     });*/
                    tagHTML.value = Math.floor(+tagHTML.value / 10);
                }
            }
        }
    }
    
    /**Event Listener***/
    function onSaveClick(){
        papaComponent.executeOrder(20, 20);
    }

}
