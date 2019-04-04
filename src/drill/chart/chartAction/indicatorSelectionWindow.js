/**
 * Created by ReznikFamily on 18/01/2016.
 */
function IndicatorSelectionWindow() {
    var me = this;
    var clickNameSpace = "IndicatorSelectionWindow" + getUniqueIDGlobal();

    /**Constants**/
    var ENTER_KEY_CODE = 13;
    var DROPDOWN_OPTION_CLASS = "DROPDOWN_OPTION_CLASS";
    var IndicatorWindowSetIconClass = "IndicatorWindowSetIconClass";

    //Constants Layout
    var MAX_SEARCH_BOX_HEIGHT = 440;
    var SYMBOL_FONT_SIZE = 14;
    var NAME_FONT_SIZE = 12;
    var PADDING_FROM_EDGE = 5;
    var INPUT_WIDTH = 50;
    var INOUT_HEIGHT = 20;
    var SET_BUTTON_HEIGHT = 16;
    //Color
    var BOTTOM_BORDER_COLOR = "#999999";
    var BOX_SHADOW = "rgba(0,0,0,0.3) 1px 1px 1px 1px";

    /**Externally Set**/
    //Structure elements
    var externalDiv;
    //Data
    var optionsList;
    //Functions
    var onOptionSelected;

    /**Internally Set**/
    //Utils
    var entryDivsList;
    var indicatorTypeToEntry;
    var shapeUtil = ShapesUtil.getInstance();
    //State
    var selectedEntryDiv;


    //Help manage clicks on body (checks if the click was made on an option)
    me.isOptionClicked;

    /**Public functions**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;

    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setFunctions = function (onOptionSelectedInput) { //It's function(DropdownOptionObj)
        onOptionSelected = onOptionSelectedInput;
    };

    this.setOptionList = function (optionListInput) { //List of DropdownOptionObj
        optionsList = optionListInput;
    };

    this.clearSelection = function () {
        clearSelection();
    };

    this.showList = function () {
        showList();
        me.isOptionClicked = false;
    };

    this.hideList = function () {
        hideList();
    };

    this.setSelectedIndicator = function(indicatorParam){
        var entryDiv = indicatorTypeToEntry[indicatorParam.type];
        switchSelection(entryDiv);
        setTextBySelection();
    };

    this.getSelectedOptionData = function(){
        return selectedEntryDiv.datum();
    };

    /**Construction**/
    function drawComponent() {
        performConstruct();
        createAllEntries();
    }

    function performConstruct() {
        externalDiv.style({
            overflow: "auto",
            "max-height": MAX_SEARCH_BOX_HEIGHT + "px",
            display: "",
            "box-shadow": BOX_SHADOW
        });
        clearSlate(externalDiv);
    }

    function createAllEntries() {
        entryDivsList = [];
        indicatorTypeToEntry = {};
        var entryDiv;
        for (var i = 0; i < optionsList.length; i++) {
            entryDiv = createEntry(optionsList[i], i);
            entryDivsList.push(entryDiv);
        }
    }

    function createEntry(dropdownOptionObj, index) {
        var entryDiv = externalDiv.append("div")
            .style({
                overflow: "hidden",
                position: "relative",
                padding: PADDING_FROM_EDGE + 3 + "px"
            })
            .datum(dropdownOptionObj)
            .on("click", onClick)
            .on("mousedown", onMouseDown)
            .classed(DROPDOWN_OPTION_CLASS, true);

        var mainText = dropdownOptionObj.moreText + " (" + dropdownOptionObj.text + ")";
        var mainP = entryDiv.append("p")
            .style({
                "font-size": SYMBOL_FONT_SIZE + "px",
                margin: 0
            })
            .text(mainText);

        var inputSection = entryDiv.append("div")
            .style({
                "margin-top": PADDING_FROM_EDGE + "px"
            });

        var indicatorData = dropdownOptionObj.data;
        fillFieldAndInput(inputSection, indicatorData);

        if (index < optionsList.length - 1) {
            var bottomBorder = entryDiv.append("div")
                .style({
                    position: "absolute",
                    bottom: 0,
                    height: 1 + "px",
                    right: PADDING_FROM_EDGE + "px",
                    left: PADDING_FROM_EDGE + "px",
                    background: BOTTOM_BORDER_COLOR
                });
        }

        indicatorTypeToEntry[indicatorData.type] = entryDiv;
        return entryDiv;
    }

    function fillFieldAndInput(inputSection, indicatorData) {
        if (indicatorData.type != IndicatorsUtil.TYPES.MACD) {
            addFieldAndInput(inputSection, indicatorData, "Period", indicatorData.period, "period");
            if (indicatorData.type == IndicatorsUtil.TYPES.BB) {
                addFieldAndInput(inputSection, indicatorData, "Deviations", indicatorData.stdev, "stdev");
            }
        } else {
            addFieldAndInput(inputSection, indicatorData, "Slow", indicatorData.slow, "slow");
            addFieldAndInput(inputSection, indicatorData, "Fast", indicatorData.fast, "fast");
            addFieldAndInput(inputSection, indicatorData, "Signal", indicatorData.signal, "signal");
        }

        addSetIcon(inputSection);
    }

    function addSetIcon(inputSection) {
        var setButton = inputSection.append("p")
            .style({
                position: "relative",
                "vertical-align": "middle",
                cursor: "pointer",
                margin: 0,
                "padding": 2 + "px",
                "font-size": 12 + "px",
                "padding-right": 8 + "px",
                "padding-left": 8 + "px",
                "border-radius": 4 + "px"
            })
            .attr("title", "Set!")
            .text("Set!")
            .classed(IndicatorWindowSetIconClass, true)
            .classed("DRILL_FREQUENCY_BUTTON_CLASS", true);
    }

    function addFieldAndInput(inputSection, indicatorData, fieldName, inputValue, indicatorField) {
        var filedP = inputSection.append("p")
            .style({
                display: "inline-block",
                "font-size": NAME_FONT_SIZE + "px",
                margin: 0,
                "margin-right": PADDING_FROM_EDGE + "px",
                "font-weight": "bold",
                "vertical-align": "middle"
            })
            .text(fieldName);

        var input = inputSection.append("input")
            .style({
                display: "inline-block",
                width: INPUT_WIDTH + "px",
                height: INOUT_HEIGHT + "px",
                "margin-right": PADDING_FROM_EDGE * 2 + "px",
                "vertical-align": "middle",
                "font-size": 14 + "px"
            })
            .on("mousedown", onMouseDown)
            .on("click", onInputClick)
            .on("input", onInputChange)
            .on("keyup", onKeyUp)
            .attr({
                "type": "number",
                min: 0,
                value: inputValue,
                step: 5,
                "indicatorField": indicatorField
            })
            .datum(indicatorData);

        if (indicatorField == "stdev") {
            input.attr("step", 1);
        }
    }

    /**Actions***/


    /**UI Changes**/
    function hideList() {
        externalDiv.style({
            display: "none"
        });
        removeEventFromBody();
    }

    function showList() {
        externalDiv.style({
            display: ""
        });
        attachEventToBody();
    }

    function switchSelection(newEntryDiv) {
        if (selectedEntryDiv) {
            selectedEntryDiv.classed(SELECTED_BUTTON_CLASS, false);
        }
        selectedEntryDiv = newEntryDiv;
        selectedEntryDiv.classed(SELECTED_BUTTON_CLASS, true);
    }

    function clearSelection() {
        externalDiv.selectAll("." + SELECTED_BUTTON_CLASS)
            .classed(SELECTED_BUTTON_CLASS, false);
    }

    /**UI Changes End.**/
    function setTextBySelection() {
        var optionData = selectedEntryDiv.datum();
        var indicatorData = optionData.data;

        var fieldContent;
        fieldContent = indicatorData.period;
        if (indicatorData.type == IndicatorsUtil.TYPES.BB) {
            fieldContent = fieldContent + ", " + indicatorData.stdev;
        } else if (indicatorData.type == IndicatorsUtil.TYPES.MACD) {
            fieldContent = indicatorData.slow;
            fieldContent = fieldContent + ", " + indicatorData.fast;
            fieldContent = fieldContent + ", " + indicatorData.signal;
        }

        optionData.selectedText = optionData.text + "(" + fieldContent + ")";
    }

    /**Event Manager***/
    function attachEventToBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, onBodyClick);
    }

    function removeEventFromBody() {
        d3.select("body")
            .on("mousedown." + clickNameSpace, null);
    }

    /**Event Listeners**/
    function onMouseDown() {
        me.isOptionClicked = true;
    }

    function onInputClick() {
        d3.event.stopPropagation();
    }

    function onInputChange() {
        var d3Input = d3.select(d3.event.currentTarget);
        var indicatorData = d3Input.datum();
        var fieldType = d3Input.attr("indicatorField");
        var value = +d3Input.node().value;

        if (!(value >= 0)) {
            value = 5;
        }

        indicatorData[fieldType] = value;

        var entryDiv = indicatorTypeToEntry[indicatorData.type];
        switchSelection(entryDiv);
    }

    function onKeyUp() {
        if (d3.event.keyCode == ENTER_KEY_CODE) {
            var d3Input = d3.select(d3.event.currentTarget);
            var indicatorType = d3Input.datum().type;
            var entryDiv = indicatorTypeToEntry[indicatorType];

            switchSelection(entryDiv);
            hideList();
            setTextBySelection();
            onOptionSelected(entryDiv.datum());
        }
    }

    function onClick() {
        var d3Target = d3.select(d3.event.currentTarget);
        var optionData = d3Target.datum();

        switchSelection(d3Target);
        hideList();
        setTextBySelection();
        onOptionSelected(optionData);
    }

    function onBodyClick() {
        if (!me.isOptionClicked) {
            hideList();
        }
        me.isOptionClicked = false;
    }

    /**Event Listeners End.**/
}