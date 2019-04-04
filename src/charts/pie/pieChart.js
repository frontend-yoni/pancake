/**
 * Created by yoni_ on 4/15/2016.
 */
function PieChart() {
    var me = this;
    /***CONSTANTS***/
    var FILL_COLOR = /*"#DDF2F5"*/ /*"#eeeeee"*/ "#F7F7F7";
    var INNER_PATH_COLOR = /*"#DDF2F5"*/ "#dddddd";
    var SLICE_BG_COLOR = "#cccccc";
    var BORDER_WIDTH = 2;
    var PIE_THICKNESS = 16;
    var INNER_PATH_THICKNESS = 2;

    /***Externally Set****/
    //Structure
    var externalDiv;
    //Util
    var papaComponent;
    //Layout
    var radius;
    //Data
    var arcDataList;

    /***Internally Set****/
    //Structure
    var innerTextDiv;
    var mainSVG;
    var pieBackgroundG;
    var mainG;
    var pieConcealerG;
    var arcElementsList;
    //Style
    var fontSize;
    //Util
    var calculationHelper = PieCalculationHelper.getInstance();
    var constructionUtil = PieConstructorUtil.getInstance();

    /***Public Functions****/
    this.setExternalDiv = function (divD3) {
        externalDiv = divD3;
    };

    this.setDataList = function(arcDataListI){
        arcDataList = arcDataListI;
    };

    this.setLayoutParams = function (radiusI) {
        radius = radiusI;
    };
    
    this.getFontSize = function(){
        return fontSize;
    };

    this.drawComponent = function () {
        drawComponent();
    };

    this.redraw = function () {
        redraw();
    };

    this.setPapaComponent = function (papaComponentI) {
        papaComponent = papaComponentI;
    };

    this.markAsHoverByIndex = function (index) {
        return markAsHoveredByIndex(index);
    };

    this.unmarkAllAsHovered = function () {
        return unmarkAllSlices();
    };

    this.getSliceData = function (index) {
        return arcElementsList[index].datum();
    };


    this.hideLinePath = function () {
        if (mainG) {
            mainG.style("display", "none");
        }
    };

    this.restoreLinePath = function () {
        if (mainG) {
            mainG.style("display", "");
        }
    };

    /**Construction*****/
    function drawComponent() {
        construct();
        redraw();
    }

    function construct() {
        calculationHelper.setLayoutParams(radius - BORDER_WIDTH);

        mainSVG = externalDiv.append("svg")
            .style({
                position: "absolute",
                top: 0 + "px",
                left: 0 + "px",
                width: radius * 2 + "px",
                height: radius * 2 + "px"
            });

        innerTextDiv = externalDiv.append("div")
            .style({
                position: "absolute",
                top: 0 + "px",
                left: 0 + "px",
                width: radius * 2 + "px",
                height: radius * 2 + "px",
                "text-align": "center",
                "pointer-events": "none",
                cursor: "default",
                overflow: "hidden"
            });

        fillInnerText();
        pieBackgroundG = createBackgroundG();
        mainG = createMainG();
        pieConcealerG = createConcealerG();


        constructionUtil.setExternalDivs(mainG);
        createAllSlices();
    }

    function fillInnerText() {
        var totalValue = UserDBData.summary.totalValue;
        fontSize = calculationHelper.getFontSize(totalValue);
        var valueText = formatNiceNumber(totalValue);

        var valueP = innerTextDiv.append("p")
            .style({
                margin: 0,
                "font-size": fontSize + "px",
                height: radius * 2 + "px",
                "font-weight": "bold",
                "line-height": radius * 2 + "px"
            })
            .text(valueText);

        var descTop = radius - fontSize - 7;
        var decFontSize = iMath.ceil(fontSize * 0.6);
        var decriptionP = innerTextDiv.append("p")
            .style({
                position: "absolute",
                top: descTop + "px",
                width: radius * 2 + "px",
                "text-align": "center",
                margin: 0,
                "font-size": decFontSize + "px",
                color: "#666666"
            })
            .text("Total Value");

        var unitsP = innerTextDiv.append("p")
            .style({
                position: "absolute",
                bottom: descTop + "px",
                width: radius * 2 + "px",
                "text-align": "center",
                margin: 0,
                "font-size": decFontSize + "px",
                color: "#666666"
            })
            .text("USD");
    }

    function createConcealerG() {
        var group = mainSVG.append("g");
        group.append("circle")
            .attr({
                cx: radius,
                cy: radius,
                r: radius - BORDER_WIDTH - PIE_THICKNESS
            })
            .style({
                "pointer-events": "none",
                fill: INNER_PATH_COLOR
            });

        group.append("circle")
            .attr({
                cx: radius,
                cy: radius,
                r: radius - BORDER_WIDTH - PIE_THICKNESS - INNER_PATH_THICKNESS
            })
            .style({
                "pointer-events": "none",
                fill: FILL_COLOR
            });
        return group;
    }

    function createBackgroundG(){
        var group = mainSVG.append("g");
        group.append("circle")
            .attr({
                cx: radius,
                cy: radius,
                r: radius - BORDER_WIDTH,
                name: "BackgroundG"
            })
            .style({
                "pointer-events": "none",
                fill: SLICE_BG_COLOR
            });
        return group;
    }

    function createMainG() {
        var transformText = "translate(" + radius + ", " + radius + " )";
        var group = mainSVG.append("g")
            .attr({
                transform: transformText
            });

        return group;
    }

    function createAllSlices() {
        arcElementsList = [];
        calculationHelper.applyDrawParamsToArcDataList(arcDataList);
        for (var i = 0; i < arcDataList.length; i++) {
            createSingleArcGroup(arcDataList[i], i);
        }

    }

    function createSingleArcGroup(arcData, index) {
        var arcG = constructionUtil.createArc(arcData, index);
        arcG.on("mouseenter", onMouseEnter);
        arcG.on("mouseleave", onMouseLeave);
        arcElementsList.push(arcG);
    }


    /**Draw*****/
    function redraw() {

    }

    /**UI State Change***/
    function markAsHoveredByIndex(index) {
        constructionUtil.markAsHovered(arcElementsList[index]);
    }

    function unmarkAllSlices() {
        for (var i = 0; i < arcElementsList.length; i++) {
            constructionUtil.unmarkAsHovered(arcElementsList[i]);
        }
    }

    /**Event Listeners*****/
    function onMouseEnter() {
        var arcGHTML = d3.event.currentTarget;
        var hoverIndex = +arcGHTML.getAttribute("index");

        papaComponent.respondToHover(hoverIndex);
    }

    function onMouseLeave() {
        papaComponent.respondToHover(null);
    }
}