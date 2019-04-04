/**
 * Created by avitzur on 1/10/2016.
 */
/**
 * Created by avitzur on 1/4/2016.
 */
function PancakeDropdown(promptText) {
    /**CONSTANTS***/
    //Keys
    //Style
    var BG_COLOR = "#FFFFFF";
    var BORDER_COLOR = "#c9cbcd";
    var BG_COLOR_SELECTED = "#f2f5f8";
    var BORDER_COLOR_SELECTED = "#B4B6B8";
    var FONT_COLOR = "#B1A9AE";
    var FONT_COLOR_SELECTED = "#68696b";
    //Layout
    var DEFAULT_HEIGHT = 20;
    //Class
    var DROPDOWN_SELECT_TEXT_CLASS = "DROPDOWN_SELECT_TEXT_CLASS";

    /**Externally Set***/
    //Structure
    var externalDiv;
    //Util
    var papaIndicatorSelection;
    var optionWindowComponent;
    //Layout
    var windowWidth;
    var width;
    var height = DEFAULT_HEIGHT;
    var isAlignLeft;
    //Functions
    var externalOnOptionSelected;

    /**Internally Set***/
    //Structure
    var selectedP;
    var dropButton;
    var closeButton;
    var optionsWindowDiv;
    //State
    var selectedText;
    var selectedTextColor;
    //Utils
    var shapeUtil = ShapesUtil.getInstance();
    //State
    var selectedOptionData;
    var isShowFullList;

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setSelectedTextColor = function(color){
        selectedTextColor = color;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setOuterComponents = function (optionWindowComponentInput) {
        optionWindowComponent = optionWindowComponentInput;
    };

    this.setLayout = function (widthInput, heightInput, windowWidthInput, isAlignLeftInput) {
        width = widthInput;
        height = heightInput;
        windowWidth = windowWidthInput;
        isAlignLeft = isAlignLeftInput;
        if (!windowWidth){
            windowWidth = width;
        }
    };

    this.setSelectedOption = function(optionData){
        selectedOptionData = optionData;
        markAsSelected();
    };

    this.setFunctions = function(onOptionSelectedInput){
        externalOnOptionSelected = onOptionSelectedInput;
    };

    this.clearSelection = function () {
        clearSelection();
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        selectedP = externalDiv.append("p")
            .style({
                position: "absolute",
                margin: 0,
                "font-size": 13 + "px",
                top: 0 + "px",
                right: 0 + "px",
                width: width + "px",
                height: height + "px",
                border: "1px solid",
                "line-height": height + "px",
                "padding-left": 5 + "px",
                "padding-right": 20 + "px",
                "border-radius": 2 + "px",
                "box-sizing": "border-box",
                cursor: "pointer"
            })
            .classed(DROPDOWN_SELECT_TEXT_CLASS, true)
            .on("click", onDropClick)
            .on("mousedown", onDropMouseDown);

        dropButton = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                right: 0 + "px",
                width: 20 + "px",
                height: 20 + "px",
                cursor: "pointer",
                "pointer-events": "none"
            });

        var dropIcon = dropButton.append("div")
            .style({
                position: "absolute",
                top: 6 + "px",
                right: 6 + "px",
                width: 8 + "px",
                height: 8 + "px"
            });
        shapeUtil.createTriangle(dropIcon, 8, 8, shapeUtil.DIRECTION.BOTTOM, "#555555");

        closeButton = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                right: 0 + "px",
                width: 20 + "px",
                height: 20 + "px",
                display: "none",
                cursor: "pointer",
                background: BORDER_COLOR_SELECTED
            })
            .on("click", onCancelClick)
            .on("mousedown", onCancelMouseDown);

        var closeP = closeButton.append("p")
            .style({
                margin: 0,
                "font-family": "sans-serif",
                "font-size": 14 + "px",
                "text-align": "center",
                height: 20 + "px",
                "line-height": 20 + "px"
            })
            .text("X");

        optionsWindowDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: height + 5 + "px",
                width: windowWidth + "px",
                border: "1px solid #999999",
                background: "white",
                display: "none",
                "z-index": 2
            });

        if (!isAlignLeft){
            optionsWindowDiv.style("left", 0);
        }else{
            optionsWindowDiv.style("right", 0);
        }

        optionWindowComponent.setFunctions(onOptionSelected);
        optionWindowComponent.setExternalDiv(optionsWindowDiv);
        optionWindowComponent.drawComponent();

        optionWindowComponent.hideList();
        unmarkAsSelected();
    }


    function switchToCloseButton() {
        closeButton.style("display", "");
        dropButton.style("display", "none");
    }

    function switchToDropButton() {
        closeButton.style("display", "none");
        dropButton.style("display", "");
    }

    /**Actions!**/
    function showList() {
        optionWindowComponent.showList();
    }

    function clearSelection() {
        selectedOptionData = undefined;
        unmarkAsSelected();
        optionWindowComponent.clearSelection();
    }

    function unmarkAsSelected() {
        if (!promptText){
            promptText = "Select";
        }

        selectedP.style({
            color: FONT_COLOR,
            "border-color": BORDER_COLOR,
            background: BG_COLOR,
            "font-weight": "normal"
        }).text(promptText);

        switchToDropButton();
    }

    function markAsSelected() {
        selectedP.style({
            color: FONT_COLOR_SELECTED,
            "border-color": BORDER_COLOR_SELECTED,
            background: BG_COLOR_SELECTED,
            "font-weight": 700
        }).text(selectedOptionData.selectedText);

        if (selectedTextColor){
            selectedP.style("color", selectedTextColor);
        }

        switchToCloseButton();
    }

    /**Event Listener***/
    function onOptionSelected(optionData) {
        selectedOptionData = optionData;
        markAsSelected();
        if (externalOnOptionSelected) {
            externalOnOptionSelected(selectedOptionData);
        }
    }

    function onDropMouseDown(){
        optionWindowComponent.isOptionClicked = true;
    }

    function onDropClick() {
        isShowFullList = true;
        if (optionsWindowDiv.style("display") == "none") {
            showList();
        } else {
            optionWindowComponent.hideList();
        }
    }

    function onCancelClick() {
        clearSelection();
        if (externalOnOptionSelected) {
            externalOnOptionSelected(undefined);
        }
        optionWindowComponent.hideList();
    }

    function onCancelMouseDown(){
        optionWindowComponent.isOptionClicked = true;
    }

}