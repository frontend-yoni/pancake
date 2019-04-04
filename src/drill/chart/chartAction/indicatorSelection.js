/**
 * Created by avitzur on 1/10/2016.
 */
function IndicatorSelection(promptText, color) {
    var me = this;
    /**CONSTANTS***/
    var TYPES = IndicatorsUtil.TYPES;
    //Class

    //Layout
    var TOP_AREA_HEIGHT = 20;
    var WINDOW_WIDTH = 341;
    var DROPDOWN_WIDTH = 140;
    var FIELD_NAME_WIDTH = 65;
    var isAlignLeft;

    /**Externally Set***/
    //Structure
    var externalDiv;
    var selectedStrip;
    //Papa
    var papaIndicatorSection;
    var chartComponent;
    //State
    var isInsideCard;
    var selectedIndicator;

    /**Internally Set***/
    //Structure

    //Layout
    //Data
    var optionList;
    var selectedOptionData;
    //Util
    var dropDown = new PancakeDropdown(promptText);
    var dropdownOptionWindow = new IndicatorSelectionWindow();

    /**Public Function**/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setIsAlignLeft = function(boolean){
        isAlignLeft = boolean;
    };

    this.setIsInsideCard = function(boolean){
        isInsideCard = boolean;
        if (isInsideCard){
            dropDown.setSelectedTextColor(color);
        }
    };

    this.setSelectedIndicator = function(indicatorData){
        selectedIndicator = indicatorData;
    };

    this.drawComponent = function () {
        performConstruct();
    };

    this.setPapaComponent = function (papaComponentInput) {
        papaIndicatorSection = papaComponentInput;
    };

    this.clearSelection = function () {
        selectedOptionData = undefined;
        dropDown.clearSelection();
        selectedStrip.style("display", "none");
    };

    this.getSelectedOptionData = function () {
        return selectedOptionData;
    };

    /***Construct***/
    function performConstruct() {
        clearSlate(externalDiv);

        createAllOptions();
        dropdownOptionWindow.setOptionList(optionList);

        dropDown.setOuterComponents(dropdownOptionWindow);
        dropDown.setFunctions(onOptionSelected);
        dropDown.setLayout(DROPDOWN_WIDTH, TOP_AREA_HEIGHT, WINDOW_WIDTH, isAlignLeft);
        dropDown.setExternalDiv(externalDiv);
        dropDown.drawComponent();

        if (selectedIndicator){
            dropdownOptionWindow.setSelectedIndicator(selectedIndicator);
            selectedOptionData = dropdownOptionWindow.getSelectedOptionData();
            dropDown.setSelectedOption(selectedOptionData);
        }

        createSelectionStrip();
    }

    function createSelectionStrip(){
        selectedStrip = externalDiv.append("div")
            .style({
                position: "absolute",
                top: -4 + "px",
                width: DROPDOWN_WIDTH + "px",
                height: 2 + "px",
                display: "none",
                background: color
            })
    }

    /**Data***/
    function createAllOptions() {
        optionList = [];

        createSMA();
        createEMA();
        createBB();
        createMFI();
        createMACD()



    }

    function createSMA(){
        var period = 20;
        if (selectedIndicator && selectedIndicator.type == TYPES.SMA){
            period = selectedIndicator.period;
        }
        createAndPushOption("SMA", "Simple Moving Average", new IndicatorsData(TYPES.SMA, period, undefined, color));
    }

    function createEMA(){
        var period = 12;
        if (selectedIndicator && selectedIndicator.type == TYPES.EMA){
            period = selectedIndicator.period;
        }
        createAndPushOption("EMA", "Exponential Moving Average", new IndicatorsData(TYPES.EMA, period, undefined, color));
    }

    function createBB(){
        var period = 20;
        var stdev = 2;
        if (selectedIndicator && selectedIndicator.type == TYPES.BB){
            period = selectedIndicator.period;
            stdev =  selectedIndicator.stdev;
        }
        createAndPushOption("BBANDS", "Bollinger Bands", new IndicatorsData(TYPES.BB, period, stdev, color));
    }

    function createMFI(){
        var period = 14;
        if (selectedIndicator && selectedIndicator.type == TYPES.MFI){
            period = selectedIndicator.period;
        }
        createAndPushOption("MFI", "Money Flow Index", new IndicatorsData(TYPES.MFI, period, undefined, color));
    }

    function createMACD(){
        var slow = 26;
        var fast = 12;
        var signal = 9;
        if (selectedIndicator && selectedIndicator.type == TYPES.MACD){
            slow = selectedIndicator.slow;
            fast =  selectedIndicator.fast;
            signal = selectedIndicator.signal;
        }
        createAndPushOption("MACD", "Moving Average Convergence Divergence", new IndicatorsData(TYPES.MACD, slow, fast, color, signal));
    }

    function createAndPushOption(text, moreText, data) {
        var optionObj = new DropdownOptionObj(text, moreText, data);
        optionList.push(optionObj);
    }

    /**UI State**/

    /**Event Listener***/
    function onOptionSelected(optionObj) {
        selectedOptionData = optionObj;
        papaIndicatorSection.onOptionSelected(me, optionObj);

        if (optionObj && !isInsideCard){
            selectedStrip.style("display", "");
        }else{
            selectedStrip.style("display", "none");
        }
    }
}

function DropdownOptionObj(text, moreText, data) {
    this.text = text;
    this.moreText = moreText;
    this.data = data;

    this.selectedText = text;
}