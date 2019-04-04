/**
 * Created by ReznikFamily on 16/01/2016.
 */
function InstructionCard() {
    var externalDiv;
    //Structure
    var containerDiv;
    var cardDiv;

    /**Public functions***/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.showMessage = function (externalDiv) {
        showMessage(externalDiv);
    };

    this.hideMessage = function () {
        hideMessage();
    };

    /***Construction***/
    function showMessage() {
        if (!containerDiv) {
            performConstruct();
        }
        containerDiv.style("display", "");
    }

    function hideMessage() {
        if (containerDiv) {
            containerDiv.remove();
            containerDiv = undefined;
        }
    }

    function performConstruct() {
        containerDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            });

        cardDiv = containerDiv.append("div")
            .style({
                position: "relative",
                display: "table",
                "font-weight": "bold",
                "font-size": 16 + "px",
                margin: "auto",
                top: 100 + "px",
                padding: 10 + "px",
                border: "2px solid #000000",
                background: "#FFFFFF",
                "border-radius": 5 + "px",
                "box-shadow": "rgba(0,0,0,0.25) 1px 1px 1px 1px"
            });

        var step1 = cardDiv.append("p")
            .style({
                margin: 0,
                "padding-bottom": 5 + "px"
            })
            .text("1. Search some stocks.");

        var step2 = cardDiv.append("p")
            .style({
                margin: 0,
                "padding-bottom": 5 + "px"
            })
            .text("2. Rearrange and resize by drag & drop.");

        var step3 = cardDiv.append("p")
            .style({
                margin: 0
            })
            .text("3. Fill in portfolio info by clicking the pencil icon.")
    }
}

InstructionCard.getInstance = function () {
    if (!InstructionCard.instance) {
        InstructionCard.instance = new InstructionCard();
    }

    return InstructionCard.instance;
};