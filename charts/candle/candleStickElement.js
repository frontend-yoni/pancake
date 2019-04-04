/**
 * Created by mizrasha on 01/12/2015.
 */
function CandleStickElement() {
    var me = this;
    /**CONSTANTS***/
    //Color
    var STRING_COLOR = "#333333";
    var STRING_COLOR_DARK = "#999999";
    var RECTANGLE_GREEN = "#00b061";
    var RECTANGLE_RED = "#f0162f";
    //Layout
    var MIN_CANDLE_HEIGHT = 1;
    var MIN_CANDLE_WIDTH = 2;
    var DEFAULT_WIDTH_OFFSET = 8;

    /***Externally set***/
    //Structure
    var bodyGroup;
    var stringGroup;

    //Layout
    var width;
    var highY;
    var lowY;
    var openY;
    var closeY;
    var x;
    var stringWidth;
    var externallySetWidthOffset;
    //Style
    var stringColor = STRING_COLOR;

    //Style
    var externallySetBodyColor;

    /***Internally set***/
    //Layout
    var widthOffset;
    var baseBodyTopY;
    var baseBodyBottomY;
    var baseBodyColor;


    //Data
    var dataPoint;

    /***Public function***/
    this.setExternalGroup = function (bodyGroupInput, stringGroupInput) {
        bodyGroup = bodyGroupInput;
        stringGroup = stringGroupInput;
    };

    this.setLayoutParams = function(widthInput, highYInput, lowYInput, openYInput, closeYInput, xInput){
        width = widthInput;
        highY = highYInput;
        lowY = lowYInput;
        openY = openYInput;
        closeY = closeYInput;
        x = xInput;
    };

    this.setIsDarkBackground = function(boolean){
        if (boolean){
            stringColor = STRING_COLOR_DARK;
        }else{
            stringColor = STRING_COLOR;
        }
    };

    this.setBodyColor = function(color){
        externallySetBodyColor = color;
    };

    this.setWidthOffser = function(num){
        externallySetWidthOffset = num;
    };

    this.createCandle = function() {
        drawComponent();
    };

    /**Construct***/

    function drawComponent() {
        initialMiddleRectangleXPoints();
        createRectangles();
    }

    function createRectangles() {
        createLongStrings();
        createBaseBody();
    }

    function createBaseBody(){
        var bodyHeight = baseBodyBottomY - baseBodyTopY;

        createRect(x, baseBodyTopY, bodyHeight, width, baseBodyColor, bodyGroup);
    }

    function createLongStrings(){
        var stringHeight = lowY - highY;

        createRect(x + width / 2 - (stringWidth/2), highY, stringHeight, stringWidth , stringColor, stringGroup);
    }

    function createRect(rectangleX, rectangleY, rectangleHeight, rectangleWidth, rectangleColor, papaGroup) {
        if(rectangleHeight < MIN_CANDLE_HEIGHT) {
            rectangleHeight = MIN_CANDLE_HEIGHT;
        }

        rectangleX = trimToTwoDecimalDigits(rectangleX);
        rectangleY = trimToTwoDecimalDigits(rectangleY);
        rectangleHeight = trimToTwoDecimalDigits(rectangleHeight);

        papaGroup.append("rect")
            .attr({
                x: rectangleX,
                y: rectangleY,
                height: rectangleHeight,
                width: rectangleWidth
            })
            .style({
                fill: rectangleColor
            });
    }

    /**Calculations***/
    function initialMiddleRectangleXPoints() {
        baseBodyTopY = iMath.min(openY, closeY);
        baseBodyBottomY = iMath.max(openY, closeY);

        var isGoingDown = (openY < closeY);
        if(isGoingDown) { //This means we're going down
            baseBodyColor = RECTANGLE_RED;
        }
        else { //This means we're going up
            baseBodyColor = RECTANGLE_GREEN;
        }

        if (externallySetBodyColor){
            baseBodyColor = externallySetBodyColor;
        }

        if(externallySetWidthOffset >= 0) {
            stringWidth = width - externallySetWidthOffset;
            stringWidth = trimToTwoDecimalDigits(stringWidth);
        }else{
            calculateWidthOffset();
        }
    }

    function calculateWidthOffset(){
        if (width <= MIN_CANDLE_WIDTH){
            stringWidth = 1;
        }else{
            stringWidth = iMath.floor(width / 3);
            stringWidth = iMath.min(stringWidth, 2);
            stringWidth = trimToTwoDecimalDigits(stringWidth);
        }
    }


}
