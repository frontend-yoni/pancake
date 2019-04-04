/**
 * Created by avitzur on 9/30/2015.
 */
function ShapesUtil() {
    var DIRECTION = {
        TOP: 0,
        RIGHT: 1,
        BOTTOM: 2,
        LEFT: 3
    };

    this.DIRECTION = DIRECTION;

    var allExpandIcons = [];
    var isExpandTextCleared;

    /****Public functions*/
    this.createTriangle = function (containerDiv, width, height, direction, bgColor, borderColor, borderWidth) {
        if (!borderColor) {
            borderColor = bgColor;
        }
        if (!borderWidth) {
            borderWidth = 0;
        }
        return createTriangle(containerDiv, width, height, direction, bgColor, borderColor, borderWidth);
    };

    this.createPenIcon = function (containerDiv, height, isDarkBackground) {
        createPenIcon(containerDiv, height, isDarkBackground)
    };

    this.createCheckIcon = function (containerDiv, height, isDarkBackground) {
        createCheckIcon(containerDiv, height, isDarkBackground)
    };

    this.createListIcon = function (containerDiv, height, bgColor) {
        createListIcon(containerDiv, height, bgColor);
    };

    this.createGarbageCan = function (containerDiv, width, height, fill) {
        createGarbageCan(containerDiv, width, height, fill);
    };

    this.createPlusSign = function (containerDiv, width, height, fill, radius) {
        createPlusSign(containerDiv, width, height, fill, radius);
    };

    this.createBackArrow = function (containerDiv, width, height, fill) {
        createBackArrow(containerDiv, width, height, fill);
    };

    this.createForwardArrow = function (containerDiv, width, height, fill) {
        createForwardArrow(containerDiv, width, height, fill);
    };

    this.createExpandIcon = function (containerDiv, width, height, fill) {
        createExpandIcon(containerDiv, width, height, fill);
    };

    this.clearAllExpandIconsText = function () {
        isExpandTextCleared = true;
        for (var i = 0; i < allExpandIcons.length; i++) {
            allExpandIcons[i].remove();
        }
    };

    this.createCardActionsDropDownIcon = function (papaDiv) {
        createCardActionsDropDownIcon(papaDiv);
    };

    /***Inner functions*/
    function createListIcon(containerDiv, height, bgColor) {
        var strokeHeight = iMath.floor(height / 5);
        var strokeDiv;
        for (var i = 0; i < 3; i++) {
            strokeDiv = containerDiv.append("div")
                .style({
                    background: bgColor,
                    height: strokeHeight + "px",
                    width: "100%"
                });

            if (i != 2) {
                strokeDiv.style("margin-bottom", strokeHeight + "px");
            }
        }
    }

    function createTriangle(containerDiv, width, height, direction, bgColor, borderColor, borderWidth) {
        var svgCanvas = containerDiv.append("svg")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                width: width + "px",
                height: height + "px"
            });

        var startPoint = getTriangleStartPoint(width, height, direction);
        var middlePoint = getTriangleMiddlePoint(width, height, direction);
        var endPoint = getTriangleEndPoint(width, height, direction);
        var pointsStr = [startPoint.join(","), middlePoint.join(","), endPoint.join(",")].join(" ");
        var polygon = svgCanvas.append("polygon")
            .style({
                fill: bgColor,
                stroke: borderColor,
                "stroke-width": borderWidth + "px"
            })
            .attr({
                points: pointsStr,
                name: "ShapeUtilTriangle"
            });

        if (borderWidth) {
            var borderConcealerLine = svgCanvas.append("line")
                .style({
                    stroke: bgColor,
                    "stroke-width": borderWidth + 1 + "px"
                })
                .attr({
                    x1: startPoint[0],
                    y1: startPoint[1],
                    x2: endPoint[0],
                    y2: endPoint[1]
                });
        }
    }


    function getTriangleStartPoint(width, height, direction) {
        var x;
        var y;
        switch (direction) {
            case DIRECTION.TOP:
                x = 0;
                y = height;
                break;
            case DIRECTION.RIGHT:
                x = 0;
                y = 0;
                break;
            case DIRECTION.BOTTOM:
                x = 0;
                y = 0;
                break;
            case DIRECTION.LEFT:
                x = width;
                y = 0;
                break;
        }
        return [x, y];
    }

    function getTriangleMiddlePoint(width, height, direction) {
        var x;
        var y;
        switch (direction) {
            case DIRECTION.TOP:
                x = width / 2;
                y = 0;
                break;
            case DIRECTION.RIGHT:
                x = width;
                y = height / 2;
                break;
            case DIRECTION.BOTTOM:
                x = width / 2;
                y = height;
                break;
            case DIRECTION.LEFT:
                x = 0;
                y = height / 2;
                break;
        }
        return [x, y];
    }

    function getTriangleEndPoint(width, height, direction) {
        var x;
        var y;
        switch (direction) {
            case DIRECTION.TOP:
                x = width;
                y = height;
                break;
            case DIRECTION.RIGHT:
                x = 0;
                y = height;
                break;
            case DIRECTION.BOTTOM:
                x = width;
                y = 0;
                break;
            case DIRECTION.LEFT:
                x = width;
                y = height;
                break;
        }
        return [x, y];
    }

    function createPenIcon(containerDiv, height, isDarkBackground) {
        var svgCanvas = containerDiv.append("svg")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                width: height + "px",
                height: height + "px",
                transform: "rotate(220deg)",
                "transform-origin": height / 2 + "," + height / 2
            });

        var penWidth = height / 4;
        var tipHeight = height / 4 + 2;
        var eracerHeight = height / 16;

        var midX = height / 2;
        var startX = midX - penWidth / 2;
        var endX = midX + penWidth / 2;
        var pathStr = [
            moveToStr(startX, tipHeight),
            lineToStr(midX, 0),
            lineToStr(endX, tipHeight),
            lineToStr(endX, height - eracerHeight),
            curveToStr(midX, height + eracerHeight, startX, height - eracerHeight),
            lineToStr(startX, tipHeight)
        ].join(" ");

        var mainColor = "black";
        var innerStrokeColor = "white";
        if (isDarkBackground) {
            mainColor = "white";
            innerStrokeColor = "#333333";
        }

        var pathElement = svgCanvas.append("path")
            .attr({
                d: pathStr
            })
            .style({
                fill: mainColor
            });

        var whitePathStr = [
            moveToStr(startX, height - eracerHeight - 2),
            lineToStr(endX, height - eracerHeight - 2),
            moveToStr(midX, height - eracerHeight - 2),
            lineToStr(midX, tipHeight)
        ].join(" ");

        var whitePathElement = svgCanvas.append("path")
            .style({
                stroke: innerStrokeColor,
                "stroke-width": "1px",
                fill: "none"
            })
            .attr({
                d: whitePathStr
            });
    }

    function createCheckIcon(containerDiv, height, isDarkBackground) {
        var svgCanvas = containerDiv.append("svg")
            .style({
                position: "absolute",
                left: 0,
                top: 0,
                width: height + "px",
                height: height + "px"
            });

        var strokeWidth = height / 8;

        var midX = height / 3;
        var midY = height / 2;
        var pathStr = [
            moveToStr(0, midY),
            lineToStr(midX, height - 3),
            lineToStr(height - 1, 1)
        ].join(" ");

        var color = "#000000";
        if (isDarkBackground) {
            color = "#FFFFFF";
        }

        var pathElement = svgCanvas.append("path")
            .style({
                fill: "none",
                stroke: color,
                "stroke-width": strokeWidth + "px"
            }).attr({
                "stroke-linejoin": "round",
                d: pathStr
            })
    }

    function createPlusSign(containerDiv, width, height, fill, radius) {
        if (fill == undefined) {
            fill = "#cccccc";
        }
        if (radius == undefined) {
            radius = 2;
        }

        var svgCanvas = containerDiv.append("svg")
            .style({
                width: width + "px",
                height: height + "px",
                fill: fill
            });

        var signThickness = iMath.min(width, height) / 4;
        var verticalLine = svgCanvas.append("rect")
            .attr({
                x: (width - signThickness) / 2,
                y: 0,
                width: signThickness,
                height: height,
                rx: radius,
                ry: radius
            });

        var horizontalLine = svgCanvas.append("rect")
            .attr({
                x: 0,
                y: (height - signThickness) / 2,
                width: width,
                height: signThickness,
                rx: radius,
                ry: radius
            });

    }

    function createForwardArrow(containerDiv, width, height, fill) {
        var backArrowSVG = createBackArrow(containerDiv, width, height, fill);
        backArrowSVG.style({
            transform: "rotate(180deg)"
        })
    }

    function createBackArrow(containerDiv, width, height, fill) {
        if (fill == undefined) {
            fill = "#cccccc";
        }
        var svgCanvas = containerDiv.append("svg")
            .style({
                width: width + "px",
                height: height + "px",
                fill: fill
            });

        var signThickness = iMath.min(width, height) / 4;


        var horizontalLine = svgCanvas.append("rect")
            .attr({
                x: 0,
                y: (height - signThickness) / 2,
                width: width,
                height: signThickness,
                rx: 2,
                ry: 2
            });

        var tipX = signThickness / 2;
        var topRotateText = "rotate(" + -45 + " " + tipX + " " + height / 2 + ")";
        var tipWidth = width * 4 / 7;

        var tipTop = svgCanvas.append("rect")
            .attr({
                x: tipX,
                y: (height - signThickness) / 2,
                width: tipWidth,
                height: signThickness,
                transform: topRotateText
            });

        var bottomRotateText = "rotate(" + 45 + " " + tipX + " " + height / 2 + ")";
        var tipBottom = svgCanvas.append("rect")
            .attr({
                x: tipX,
                y: (height - signThickness) / 2,
                width: tipWidth,
                height: signThickness,
                transform: bottomRotateText
            });

        return svgCanvas;

    }

    function createExpandIcon(containerDiv, width, height, fill) {
        if (fill == undefined) {
            fill = "#444444";
        }
        var svgCanvas = containerDiv.append("svg")
            .style({
                width: width + "px",
                height: height + "px",
                fill: fill,
                overflow: "visible"
            })
            .classed("DRILL_ICON_SVG", true);

        var signThickness = iMath.min(width, height) / 4;

        var fullRotateText = "rotate(" + -45 + " " + width / 2 + " " + height / 2 + ")";
        var contentG = svgCanvas.append("g")
            .attr({
                transform: fullRotateText
            });

        var tipWidth = width * 2 / 7;


        if (!UserID && !isExpandTextCleared) {
            var textElement = contentG.append("text")
                .attr({
                    x: 0,
                    y: 0,
                    "font-family": "Arial",
                    "font-weight": "bold",
                    "font-size": 9
                })
                .classed("DRILL_ICON_TEXT", true)
                .text("POP!");
            allExpandIcons.push(textElement);
        }

        var horizontalLine = contentG.append("rect")
            .attr({
                x: tipWidth - 1,
                y: (height - signThickness) / 2,
                width: width - 2 * tipWidth + 2,
                height: signThickness
            });


        var midY = height / 2;
        var topY = midY - tipWidth;
        var bottomY = midY + tipWidth;

        var startPoint = [0, midY];
        var middlePoint = [tipWidth, topY];
        var endPoint = [tipWidth, bottomY];
        var pointsStr = [startPoint.join(","), middlePoint.join(","), endPoint.join(",")].join(" ");
        var leftTriangle = contentG.append("polygon")
            .attr({
                points: pointsStr
            });

        var startPoint = [width, midY];
        var middlePoint = [width - tipWidth, topY];
        var endPoint = [width - tipWidth, bottomY];
        var pointsStr = [startPoint.join(","), middlePoint.join(","), endPoint.join(",")].join(" ");
        var rightTriangle = contentG.append("polygon")
            .attr({
                points: pointsStr
            });

    }

    function createGarbageCan(containerDiv, width, height, fill) {
        if (fill == undefined) {
            fill = "#444444";
        }
        var svgCanvas = containerDiv.append("svg")
            .style({
                width: width + "px",
                height: height + "px",
                fill: fill
            });

        var topHandleWidth = width / 4;
        var topHandleHeight = height / 8;
        var handle = svgCanvas.append("rect")
            .attr({
                x: (width - topHandleWidth) / 2,
                y: 0,
                width: topHandleWidth,
                height: topHandleHeight
            });

        var cover = svgCanvas.append("rect")
            .attr({
                x: 0,
                y: topHandleHeight,
                width: width,
                height: topHandleHeight
            });

        var bodyWidth = width * 0.85;
        var bodyTop = topHandleHeight * 3 - 1;

        var bodyHeight = height - bodyTop;
        var body = svgCanvas.append("rect")
            .attr({
                x: (width - bodyWidth) / 2,
                y: bodyTop,
                width: bodyWidth,
                height: bodyHeight - 2
            });

        var bodyBottomSection = svgCanvas.append("rect")
            .attr({
                x: (width - bodyWidth) / 2,
                y: bodyTop + bodyHeight - 4,
                width: bodyWidth,
                height: 4,
                "rx": 2,
                "ry": 2
            });
    }

    function createCardActionsDropDownIcon(papaDiv) {
        var height = 3;
        var width = 14;
        var pad = 2;

        createRect(0, 0);
        createRect(height + pad);
        createRect(height + pad + height + pad);



        var triangleDiv = papaDiv.append("div")
            .style({
                position: "absolute",
                left: 17 + "px",
                top: 5 + "px",
                width: 0,
                height: 0,
                background: "none",
                "border-left": 4 + "px solid transparent",
                "border-right": 4 + "px solid transparent",
                "border-top-width": 4 + "px",
                "border-top-style": "solid"
            });

        /**Inner functions***/
        function createRect(top) {
            var rect = papaDiv.append("div")
                .style({
                    position: "absolute",
                    width: width + "px",
                    height: height + "px",
                    left: 0 + "px",
                    top: top + "px",
                    "border-radius": "1px"
                });

            return rect;
        }
    }
}

ShapesUtil.getInstance = function () {
    if (!ShapesUtil.instance) {
        ShapesUtil.instance = new ShapesUtil();
    }
    return ShapesUtil.instance;
};