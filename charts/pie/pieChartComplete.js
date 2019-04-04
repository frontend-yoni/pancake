/**
 * Created by yoni_ on 4/15/2016.
 */
function PieChartComplete() {
    var me = this;
    /***CONSTANTS***/
    var PAD_FROM_EDGES = 2;
    /***Externally Set****/
    //Structure
    var externalDiv;
    //Layout
    var width;
    var height;
    //Util
    var papaComponent;
    //Data
    var arcDataList;

    /***Internally Set****/
    //Structure
    var pieDiv;
    var legendDiv;
    //Layout
    var pieRadius;
    var isLegendOnBottom;
    //State
    var hoverIndex = -1;
    //Util
    var pieComponent = new PieChart();
    var legendComponent = new PieLegend();
    var tooltipComponent = new PieTooltipUtil();

    /***Public Functions****/
    this.setExternalDiv = function (divD3, widthI, heightI) {
        externalDiv = divD3;
        width = widthI;
        height = heightI;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setDataList = function (arcDataListI) {
        arcDataList = arcDataListI;
        legendComponent.setDataList(arcDataList);
        pieComponent.setDataList(arcDataList);
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.hideLinePath = function () {
        pieComponent.hideLinePath();
    };

    this.restoreLinePath = function () {
        pieComponent.restoreLinePath();
    };

    /**Inner Public Functions***/
    this.respondToHover = function (index) {
        if (index != null) {
            showAllHoverContent(index);
        } else {
            hideHoverContent();
        }
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        pieRadius = iMath.min(width, height) / 2 - PAD_FROM_EDGES;

        var pieTop = PAD_FROM_EDGES;
        var pieLeft = width - pieRadius * 2;

        if (height > width) {
            pieLeft = (width - pieRadius * 2) / 2;
        }


        var legendTop = 0;
        var legendLeft = 0;
        var legendWidth = width - pieRadius * 2;
        var legendHeight = height;

        isLegendOnBottom = (height > width);
        if (isLegendOnBottom) {
            legendTop = pieTop + pieRadius * 2;
            legendWidth = width;
            legendHeight = height - pieTop - pieRadius * 2;
        } else { //legend on left
            var optimalLegendWidth = legendComponent.getRequiredWidth(legendHeight);
            legendWidth = iMath.min(legendWidth, optimalLegendWidth);

            legendLeft = (width - (legendWidth + pieRadius * 2)) / 2;
            pieLeft = legendLeft + legendWidth;
        }


        pieDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: pieTop + "px",
                left: pieLeft + "px",
                width: pieRadius * 2 + "px",
                height: pieRadius * 2 + "px"
            });
        pieComponent.setPapaComponent(me);
        pieComponent.setExternalDiv(pieDiv);
        pieComponent.setLayoutParams(pieRadius);
        pieComponent.drawComponent();

        legendDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: legendTop + "px",
                left: legendLeft + "px",
                width: legendWidth + "px",
                height: legendHeight + "px"
            });


        legendComponent.setPapaComponent(me);
        legendComponent.setExternalDiv(legendDiv, legendWidth, legendHeight);
        legendComponent.setLayout(isLegendOnBottom);
        legendComponent.drawComponent();

        tooltipComponent.setExternalDiv(pieDiv, pieRadius * 2, pieRadius * 2, pieRadius, pieComponent.getFontSize());
        tooltipComponent.construct();
    }

    /**Draw*****/
    function redraw() {
        if (hoverIndex >= 0) {
            showAllHoverContent(hoverIndex);
        }
    }

    /***UI State change**/
    function hideHoverContent() {
        hoverIndex = -1;

        pieComponent.unmarkAllAsHovered();
        legendComponent.unmarkAllAsHovered();
        tooltipComponent.hideTip();
    }

    function showAllHoverContent(index) {
        hoverIndex = index;

        var sliceData = pieComponent.getSliceData(index);

        pieComponent.markAsHoverByIndex(index);
        legendComponent.markAsHoverByIndex(index);
        tooltipComponent.positionTip(sliceData);
    }
}