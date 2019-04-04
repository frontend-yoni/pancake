/**
 * Created by avitzur on 1/10/2016.
 */
function DropdownSelectionWindow() {
    var me = this;
    var clickNameSpace = "IndicatorSelectionWindow" + getUniqueIDGlobal();

    /**Constants**/
    var DROPDOWN_OPTION_CLASS = "DROPDOWN_OPTION_CLASS";

    //Constants Layout
    var MAX_SEARCH_BOX_HEIGHT = 440;
    var SYMBOL_FONT_SIZE = 14;
    var NAME_FONT_SIZE = 12;
    var PADDING_FROM_EDGE = 5;

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
    //State
    var selectedOptionData;
    var selectedEntryDiv;


    //Help manage clicks on body (checks if the click was made on an option)
    me.isOptionClicked;

    /**Public functions**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
        d3.select("body")
            .on("mousedown." + clickNameSpace, onBodyClick);
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.setFunctions = function (onOptionSelectedInput) { //It's function(DropdownOptionObj)
        onOptionSelected = onOptionSelectedInput;
    };

    this.fillDefaultOptionsList = function (showUnique) {
        performConstruct();
        fillDefaultOptionsList(showUnique);
    };

    this.setOptionList = function (optionListInput) { //List of DropdownOptionObj
        optionsList = optionListInput;
    };

    this.clearSelection = function(){
        clearSelection();
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
            display: ""
        });
        clearSlate(externalDiv);
    }

    function createAllEntries() {
        entryDivsList = [];
        var entryDiv;
        for (var i = 0; i < optionsList.length; i++) {
            entryDiv = createEntry(optionsList[i]);
            entryDivsList.push(entryDiv);
        }
    }

    function createEntry(dropdownOptionObj) {
        var entryDiv = externalDiv.append("div")
            .style({
                overflow: "hidden",
                padding: PADDING_FROM_EDGE + "px"
            })
            .attr("title", dropdownOptionObj.moreText)
            .datum(dropdownOptionObj)
            .on("click", onClick)
            .on("mousedown", onMouseDown)
            .classed(DROPDOWN_OPTION_CLASS, true);

        var mainP = entryDiv.append("p")
            .style({
                "font-size": SYMBOL_FONT_SIZE + "px",
                margin: 0
            })
            .text(dropdownOptionObj.text);

        var descrpitionP = entryDiv.append("p")
            .style({
                "font-size": NAME_FONT_SIZE + "px",
                overflow: "hidden",
                margin: 0,
                "text-overflow": "ellipsis",
                "white-space": "nowrap"
            })
            .text(dropdownOptionObj.moreText);

        return entryDiv;
    }


    /**UI Changes**/
    function hideList() {
        externalDiv.style({
            display: "none"
        })
    }

    function fillDefaultOptionsList() {
        createAllEntries();
    }

    function clearSelection(){
        externalDiv.selectAll("." + SELECTED_BUTTON_CLASS)
            .classed(SELECTED_BUTTON_CLASS, false);
    }

    /**UI Changes End.**/

    /**Event Listeners**/
    function onMouseDown(){
        me.isOptionClicked = true;
    }

    function onClick() {
        var d3Target = d3.select(d3.event.currentTarget);
        var optionData = d3Target.datum();

        if (selectedEntryDiv) {
            selectedEntryDiv.classed(SELECTED_BUTTON_CLASS, false);
        }
        selectedEntryDiv = d3Target;
        selectedEntryDiv.classed(SELECTED_BUTTON_CLASS, true);

        hideList();

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

