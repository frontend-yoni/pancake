/**
 * Created by yoni_ on 3/18/2016.
 */
function UniversalCardSizeSection() {
    /***CONSTANTS***/
    var CELL_SIZE = 40;
    var PAD_BETWEEN_CARDS = 10;
    var TOTAL_HEIGHT = 100;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;

    /***Internally Set****/
    //Data
    var widthSelected;
    var heightSelected;
    //Util
    var usefulUtil = UsefulUIUtil.getInstance();

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
        externalDiv.style({
            height: TOTAL_HEIGHT + "px"
        });

        var leftPosition = 0;
        createButton(leftPosition, 1, 1, "Tiny");
        leftPosition += CELL_SIZE + PAD_BETWEEN_CARDS;

        createButton(leftPosition, 1, 2, "Tall");
        leftPosition += CELL_SIZE + PAD_BETWEEN_CARDS;

        createButton(leftPosition, 2, 2, "Square");
        leftPosition += 2 * CELL_SIZE + PAD_BETWEEN_CARDS;

        createButton(leftPosition, 3, 1, "Wide");
    }

    function createButton(left, width, height, text) {
        var tooltip = "Width: " + width + " Height: " + height;
        var button = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 20 + "px",
                width: CELL_SIZE * width + "px",
                height: CELL_SIZE * height + "px",
                "border-radius": 5 + "px",
                overflow: "hidden",
                left: left + "px"
            })
            .attr({
                "title": tooltip,
                "cardWidth": width,
                "cardHeight": height
            })
            .on("click", onCardClick)
            .classed("pancakeButton", true);

        var topBar = button.append("div")
            .style({
                position: "absolute",
                width: "100%",
                top: 0,
                height: 8 + "px",
                opacity: 0.8,
                background: "#aaa",
                background: "linear-gradient(#999, #aaa)"
            });

        // var text = width + " X " + height;
        var buttonP = button.append("p")
            .style({
                position: "absolute",
                margin: 0,
                width: "100%",
                top: 14 + "px",
                // "font-weight": "bold",
                "font-size": 12 + "px",
                "text-align": "center"
            })
            .text(text);
    }

    /**Draw*****/
    function redraw() {

    }

    /***Actions***/
    function performAction(){
        var funGrid = FunGrid.getInstance();
        funGrid.setUnifiedSize(widthSelected, heightSelected);
    }

    /**Event listener****/
    function onCardClick() {
        var target = d3.event.currentTarget;
        widthSelected = +target.getAttribute("cardWidth");
        heightSelected = +target.getAttribute("cardHeight");

        UniversalCardSizeSection.selectedWidth = widthSelected;
        UniversalCardSizeSection.selectedHeight = heightSelected;

        usefulUtil.enableBlockingDiv("default");
        papaComponent.hideCardActionPopup();
        requestAnimationFrame(performAction);
    }
}

UniversalCardSizeSection.selectedWidth = 2;
UniversalCardSizeSection.selectedHeight = 2;