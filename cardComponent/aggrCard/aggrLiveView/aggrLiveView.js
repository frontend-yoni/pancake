/**
 * Created by yoni_ on 4/15/2016.
 */
function AggrLiveView() {
    /**CONSTANTS****/
    //TYPE
    var CHANGE_POSITION = {
        NO: 0,
        TOP: 1,
        LEFT: 2
    };

    //TIME

    //Layout constants
    var CHANGE_SECTION_LEFT_WIDTH = 180;
    var CHANGE_SECTION_HEIGHT = 84;
    var CHANGE_SECTION_ONE_ROW_HEIGHT = 47;
    //Class

    //Data
    var cardData;


    //Structure Elements
    var externalDiv;
    var changeSectionDiv;
    var chartSectionDiv;

    //Layout params
    var parentDivHeight;
    var parentDivWidth;
    var chartTop = 0;
    var chartLeft = 0;
    var changeSectionWidth;
    var changeSectionHeight;
    //State
    var changePosition;

    //State

    //Utils
    var pieChart = new PieChartComplete();
    var changeSection = new AggrChangeSection();
    var dataUtil = AggrDataManager.getInstance();

    /***Public functions***/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setData = function (cardDataInput) {
        cardData = cardDataInput;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.restoreLinePath = function () {
        pieChart.restoreLinePath();
    };

    this.hideLinePath = function () {
        pieChart.hideLinePath();
    };

    this.updatePersonalData = function () {
        pieChart.updatePersonalData();
    };

    /**Construct***/
    function drawComponent() {
        performConstruct();
    }

    function performConstruct() {
        var externalDivDOM = externalDiv.node();
        clearSlate(externalDiv);

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;
        calculateChangePosition();

        createPieChartSection();
        if (changePosition != CHANGE_POSITION.NO) {
            createChangeSection();
        }
    }

    function createChangeSection() {
        changeSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                left: 0 + "px",
                width: changeSectionWidth + "px",
                height: changeSectionHeight
            });

        var isOneRow = (changeSectionHeight == CHANGE_SECTION_ONE_ROW_HEIGHT);
        changeSection.setLayout(isOneRow);
        changeSection.setExternalDiv(changeSectionDiv);
        changeSection.drawComponent();
    }

    function createPieChartSection() {
        var chartDivHeight = parentDivHeight - chartTop;
        var chartDivWidth = parentDivWidth - chartLeft;
        chartSectionDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                left: chartLeft + "px",
                top: chartTop + "px",
                height: chartDivHeight + "px",
                width: chartDivWidth + "px"
            });

        var arcDataList = dataUtil.calculatePieData();

        pieChart.setDataList(arcDataList);
        pieChart.setExternalDiv(chartSectionDiv, chartDivWidth, chartDivHeight);
        pieChart.drawComponent();
    }

    /***Draw***/
    function redrawByNewData() {

    }

    /**Calculation****/
    function calculateChangePosition() {
        changePosition = CHANGE_POSITION.NO;
        chartTop = 0;
        chartLeft = 0;
        changeSectionHeight = CHANGE_SECTION_HEIGHT;

        if (cardData.height > 1) {
            changePosition = CHANGE_POSITION.TOP;
            changeSectionWidth = parentDivWidth;
            chartTop = changeSectionHeight;
        } else if (cardData.width > 1) {
            changePosition = CHANGE_POSITION.LEFT;
            changeSectionWidth = CHANGE_SECTION_LEFT_WIDTH;
            chartLeft = changeSectionWidth;
        }

        if (cardData.height > 1 && cardData.width > 1) {
            changeSectionHeight = CHANGE_SECTION_ONE_ROW_HEIGHT;
            chartTop = changeSectionHeight;
        }
    }

}