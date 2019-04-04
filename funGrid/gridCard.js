/**
 * Created by avitzur on 9/17/2015.
 */
function GridCard() {
    var me = this;

    //Constants
    me.WRAPPER_COMPONENT_DIV_CLASS = "gridWrapperComponent";
    me.INNER_COMPONENT_DIV_CLASS = GridCard.INNER_DIV_CLASS;
    //Externally set constants
    me.PADDING_FROM_EDGES = 5;
    me.BORDER_WIDTH = 0;
    me.CELL_SIZE = 210;
    //Style
    me.NORMAL_SHADOW = /*"2px 2px 1px 0 rgba(0,0,0,0.3)"*/ "0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)"; //"0 1px 20px 0 rgba(0,0,0,0.15), inset 0 -1px 0 0 rgba(0,0,0,0.2), inset 0 1px 0 0 rgba(255,255,255,0.5), 0 0 0 1px rgba(0,0,0,0.16)";
    me.BIG_SHADOW = "3px 3px 3px 0 rgba(0,0,0,0.5)";
    me.BORDER_RADIUS = 0;
    //Animation
    me.RESIZE_ANIMATION_DURATION = 500;

    //Externally set
    me.data;
    //Structure
    me.canvasDiv;
    me.cardDiv;

    //State
    me.isFadeComplete;

    //Utils
    me.resizeService = ResizeService.getInstance();
    me.dragDropService = DragAndDropService.getInstance();
    me.removeCardService = RemoveCardService.getInstance();
    me.expandService = ExpandToDrillService.getInstance();
    me.animationUtil = AnimateCardUtil.getInstance();
}

//Getter setters
GridCard.prototype.setData = function (gridCardDataObject) {
    this.data = gridCardDataObject;
};

GridCard.prototype.getData = function () {
    return this.data;
};

GridCard.prototype.setCanvasDiv = function (d3Div) {
    this.canvasDiv = d3Div;
};

//UI constructor
GridCard.prototype.createCard = function () {
    var me = this;
    var padding = me.PADDING_FROM_EDGES - me.BORDER_WIDTH;
    var data = me.data;

    var wrapperDiv = me.canvasDiv.append("div")
        .style({
            position: "absolute"
        })
        .attr({
            name: "gridCardWrapperDiv",
            "draggable": "false"
        })
        .classed(me.WRAPPER_COMPONENT_DIV_CLASS, true)
        .datum(data);

    var innerComponentDiv = wrapperDiv.append("div")
        .style({
            position: "absolute",
            "background-color": "#FFFFFF",
            left: padding + "px",
            top: padding + "px",
            right: padding + "px",
            bottom: padding + "px",
            "border-radius": me.BORDER_RADIUS + "px",
            "box-shadow": me.NORMAL_SHADOW
        })
        .attr({
            "draggable": "false"
        })
        .classed(me.INNER_COMPONENT_DIV_CLASS, true)
        .datum(data);

    var contentDiv = innerComponentDiv.append("div")
        .style({
            "position": "absolute",
            "left": 0 + "px",
            "right": 0 + "px",
            "top": 0 + "px",
            "bottom": 0 + "px",
            "border-radius": me.BORDER_RADIUS + "px"
        })
        .attr({
            "name": "gridCardContentDiv"
        });

    var resizeBGBorderDiv = wrapperDiv.append("div")
        .style({
            position: "absolute",
            left: 0 + "px",
            top: 0 + "px",
            right: 0 + "px",
            bottom: 0 + "px",
            border: "2px dashed",
            "border-radius": 0 + "px",
            "box-sizing": "border-box",
            display: "none"
        });

    data.wrapperDiv = wrapperDiv;
    data.borderDiv = resizeBGBorderDiv;
    data.innerDiv = innerComponentDiv;
    data.contentDiv = contentDiv;
    data.cardElement = me;
    me.cardDiv = wrapperDiv;

    me.attachMouseEnterEvent();
    me.attachMouseLeaveEvent();
    me.attachRangeClickEvent();
    me.attachCompareClickEvent();
};


GridCard.prototype.attachRangeClickEvent = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;

    wrapperDiv.on(TimeRangeSelector.BUTTON_CLICK_EVENT, function () {
        var range = d3.event.detail.data;
        me.isFadeComplete = true; //todo: why is it sometimes undefined???
        var cardData = me.data;

        cardData.setRange(range);
        informActionToSave();
        cardData.drawCount = 0;
        if (!cardData.indexToCompare) {
            me.fetchDataAndRedraw(range);
        } else {
            fetchStockAndIndexDataByRange(cardData.symbol, cardData.indexToCompare, range, cardData)
        }

    });
};

GridCard.prototype.attachCompareClickEvent = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;
    var cardData = me.data;

    wrapperDiv.on(LineChartContainer.COMPAE_CLICK_EVENT, function () {
        var eventData = d3.event.detail.data;
        var range = eventData.range;
        var indexSymbol = eventData.indexSymbol;
        var dataListMain = eventData.dataList;

        cardData.drawCount = 0;
        me.isFadeComplete = true; //todo: why is it sometimes undefined???
        me.fetchIndexDataToCompare(dataListMain, range, indexSymbol);
    });
};


GridCard.prototype.attachMouseLeaveEvent = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;

    wrapperDiv.on("mouseleave", function () {
        var toElement = d3.event.toElement || d3.event.relatedTarget;
        //Make sure the mouse actually left (sometimes we just introduced a blocking div)
        if (!UsefulUIUtil.blockingDiv || UsefulUIUtil.blockingDiv.node() != toElement) {
            me.resizeService.hide();
            me.dragDropService.hide();
            me.removeCardService.hide();
            me.expandService.hide();
            me.hideElementsToShowOnHover(GridCard.hoverdCardData);
        }
    });
};

GridCard.prototype.attachMouseEnterEvent = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;
    var data = me.data;

    wrapperDiv.on("mouseenter", onMouseEnter);

    function onMouseEnter() {
        if (GridCard.hoverdCardData) {
            me.hideElementsToShowOnHover(GridCard.hoverdCardData);
        }
        GridCard.hoverdCardData = data;
        me.showElementsToShowOnHover(data);

        me.promoteCardToTop();
        me.resizeService.attachToCard(data);
        me.dragDropService.attachToCard(data);
        me.removeCardService.attachToCard(data);
        me.expandService.attachToCard(data);
    }
};

GridCard.prototype.hideElementsToShowOnHover = function (cardDataObject) {
    cardDataObject.wrapperDiv.selectAll("." + GridCard.SHOW_WHEN_HOVER_CLASS)
        .style("display", "none");
};

GridCard.prototype.showElementsToShowOnHover = function (cardDataObject) {
    cardDataObject.wrapperDiv.selectAll("." + GridCard.SHOW_WHEN_HOVER_CLASS)
        .style("display", "");
};

GridCard.prototype.prepareToRemove = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;
    var data = me.data;

    wrapperDiv.style({
        "opacity": 0.7,
        "box-shadow": "none"
    });

    me.applyOverflowHidden();
    me.dragDropService.hide();
    me.resizeService.hide();
    me.removeCardService.hide();
    me.expandService.hide();
    me.demoteCardToBottom();
    wrapperDiv.on("mouseenter", null);
};

GridCard.prototype.applyOverflowHidden = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;
    wrapperDiv.style("overflow", "hidden");
};

GridCard.prototype.cancelOverflowHidden = function () {
    var me = this;
    var wrapperDiv = me.cardDiv;
    wrapperDiv.style("overflow", null);
};

GridCard.prototype.promoteCardToTop = function () {
    var me = this;
    var cardDiv = me.cardDiv;

    for (var i = 0; i < CardDataList.length; i++) {
        CardDataList[i].wrapperDiv.style("z-index", GridCard.REGULAR_Z_INDEX);
    }
    cardDiv.style("z-index", GridCard.TOP_Z_INDEX);
};

GridCard.prototype.demoteCardToBottom = function () {
    var me = this;
    var cardDiv = me.cardDiv;

    for (var i = 0; i < CardDataList.length; i++) {
        CardDataList[i].wrapperDiv.style("z-index", GridCard.REGULAR_Z_INDEX);
    }
    cardDiv.style("z-index", GridCard.BOTTOM_Z_INDEX);
};

GridCard.prototype.fadeInCard = function (animationDuration) {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;
    var shiftAmount = cellSize * 1;
    var left = me.getCardLeft();
    var top = cardData.row * cellSize;
    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;

    var wrapperDiv = cardData.wrapperDiv;
    var startLeft;
    if (cardData.column + cardData.width / 2 <= cardData.currentColumnCount / 2) {
        startLeft = left - shiftAmount;
    } else {
        startLeft = left + shiftAmount;
    }

    wrapperDiv.style({
        width: width + "px",
        height: height + "px",
        top: top + "px"
    });

    var contentDivHTML = cardData.contentDiv.node();
    cardData.component.setExternalDiv(contentDivHTML);
    cardData.component.setSymbolAndDrawTitle(cardData.symbol);


    me.redrawIfReady(cardData.view);

    if (animationDuration > 0) {
        me.animationUtil.runCardFadeInAnimation(me, wrapperDiv, startLeft, left, animationDuration);
    } else {
        wrapperDiv.style("left", left + "px");
        me.isFadeComplete = true;
        me.redrawIfReady(cardData.view);
    }


};

GridCard.prototype.positionCardNoAnimation = function () {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;

    var left = me.getCardLeft();
    var top = cardData.row * cellSize;
    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;
    var wrapperDiv = cardData.wrapperDiv;

    wrapperDiv.style({
        width: width + "px",
        height: height + "px",
        top: top + "px",
        left: left + "px"
    });

    me.isFadeComplete = true;
    if (cardData.hasDataFetched || cardData.cardType == CardDataObject.CARD_TYPES.Aggregate) {
        me.drawContent();
    }
};

GridCard.prototype.redrawBySize = function () {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;

    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;

    cardData.wrapperDiv.style({
        width: width + "px",
        height: height + "px"
    });

    cardData.component.drawComponent();
    cardData.hasBeenSqueezed = false;
};

GridCard.prototype.introduceNewCardWithAnimation = function (onComplete) {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;
    var wrapperDiv = cardData.wrapperDiv;
    var left = me.getCardLeft();
    var top = cardData.row * cellSize;
    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;

    wrapperDiv.style({
        top: top + "px",
        left: left + "px",
        height: height + "px"
    });

    me.isFadeComplete = false;
    cardData.hasDataFetched = false;
    if (!cardData.getIsSummary()){
        me.fetchDataAndRedrawByView(cardData.userData.timeRange);
    }

    me.drawTitle();
    wrapperDiv.transition()
        .duration(me.RESIZE_ANIMATION_DURATION)
        .ease("cubic-out")
        .tween("new", function (d) {
                var widthInterpolation = d3.interpolate(0, width);
                var currentWidth;
                return function (t) {
                    currentWidth = widthInterpolation(t);
                    wrapperDiv.style({
                        width: currentWidth + "px"
                    });
                    if (t == 1) {
                        me.isFadeComplete = true;
                        me.redrawIfReady(cardData.view);
                        if (onComplete) {
                            onComplete();
                        }
                    }
                }
            }
        );

    cardData.isNewCard = false;
};

GridCard.prototype.removeCardWithAnimation = function () {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;
    var wrapperDiv = cardData.wrapperDiv;
    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;

    me.prepareToRemove();
    wrapperDiv.transition()
        .duration(me.RESIZE_ANIMATION_DURATION)
        .ease("cubic-out")
        .tween("new", function (d) {
                var widthInterpolation = d3.interpolate(width, 0);
                var heightInterpolation = d3.interpolate(height, 0);
                return function (t) {
                    wrapperDiv.style({
                        width: widthInterpolation(t) + "px",
                        height: heightInterpolation(t) + "px"
                    });
                    if (t == 1) {
                        wrapperDiv.remove();
                    }
                }
            }
        );

    cardData.isNewCard = false;
};

GridCard.prototype.moveCarWithAnimation = function (isLinear) {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;
    var wrapperDiv = cardData.wrapperDiv;

    var prevLeft = getStyleNumberValue(wrapperDiv, "left");
    var prevTop = getStyleNumberValue(wrapperDiv, "top");
    var left = me.getCardLeft();
    var top = cardData.row * cellSize;

    if (isLinear) {
        me.animationUtil.runRepositionLinear(wrapperDiv, prevLeft, prevTop, left, top, me.RESIZE_ANIMATION_DURATION);
    } else {
        me.animationUtil.runRepositionEaseOut(wrapperDiv, prevLeft, prevTop, left, top, me.RESIZE_ANIMATION_DURATION);
    }
};

GridCard.prototype.resizeAndMoveCarWithAnimation = function (onComplete) {
    var me = this;
    var cellSize = me.CELL_SIZE;
    var cardData = me.data;
    var wrapperDiv = cardData.wrapperDiv;

    var prevLeft = getStyleNumberValue(wrapperDiv, "left");
    var prevTop = getStyleNumberValue(wrapperDiv, "top");
    var prevWidth = getStyleNumberValue(wrapperDiv, "width");
    var prevHeight = getStyleNumberValue(wrapperDiv, "height");
    var left = me.getCardLeft();
    var top = cardData.row * cellSize;
    var width = cardData.width * cellSize;
    var height = cardData.height * cellSize;

    me.animationUtil.runRepositionAndResizeAnimation(wrapperDiv, prevLeft, prevTop, prevWidth, prevHeight, left, top, width, height, me, onComplete);
};

GridCard.prototype.drawContent = function () {
    var me = this;
    var cardData = me.data;
    var component = cardData.component;
    var contentDivHTML = cardData.contentDiv.node();

    component.setExternalDiv(contentDivHTML);
    component.setData(cardData);


    if (cardData.drawCount == 0) {
        cardData.drawCount++;
        component.drawComponent(true);
    } else {
        cardData.drawCount++;
        component.redrawByNewData(true);
    }

};

GridCard.prototype.drawTitle = function () {
    var me = this;
    var cardData = me.data;
    var contentDivHTML = cardData.contentDiv.node();
    cardData.component.setExternalDiv(contentDivHTML);
    cardData.component.setSymbolAndDrawTitle(cardData.symbol);
};

/**Sate changes***/
GridCard.prototype.restoreNormalState = function () {
    var me = this;
    var dataObject = me.data;
    var innerDiv = dataObject.innerDiv;
    var borderDiv = dataObject.borderDiv;

    innerDiv.style({
        opacity: 1,
        "box-shadow": me.NORMAL_SHADOW
    });
    borderDiv.style({
        display: "none"
    });

    dataObject.isResizeState = false;
    dataObject.component.restoreLinePath();
};

GridCard.prototype.restoreFromBGState = function () {
    var me = this;
    var dataObject = me.data;
    var innerDiv = dataObject.innerDiv;

    innerDiv.style({
        "opacity": 1,
        "box-shadow": me.NORMAL_SHADOW
    });
    dataObject.isBGState = false;
    dataObject.component.restoreLinePath();
};

GridCard.prototype.hideLinePathForHeavyCharts = function () {
    var me = this;
    var dataObject = me.data;
    
    if(!dataObject.getIsSummary()){
        dataObject.component.hideLinePathForHeavyCharts();
    }    
};


GridCard.prototype.applyBGState = function () {
    var me = this;
    var dataObject = me.data;
    dataObject.isBGState = true;
    dataObject.component.hideLinePath();
    dataObject.innerDiv.style({
        "opacity": 0.8,
        "box-shadow": "none"
    });
};

GridCard.prototype.setResizeState = function () {
    var me = this;
    var dataObject = me.data;
    var innerDiv = dataObject.innerDiv;
    innerDiv.style({
        opacity: 0.5,
        "box-shadow": "none"
    });

    dataObject.isResizeState = true;
    me.setFullBorder();
    me.dragDropService.hide();
    me.removeCardService.hide();
    me.expandService.hide();
};

GridCard.prototype.setFullBorder = function () {
    this.data.borderDiv.style({
        display: ""
    });
};

GridCard.prototype.removeFullBorder = function () {
    this.data.borderDiv.style({
        display: "none"
    });
};

GridCard.prototype.setDropTargetState = function () {
    var me = this;
    var innerDiv = me.data.innerDiv;
    var borderDiv = me.data.borderDiv;

    borderDiv.style({
        display: ""
    });
    innerDiv.style({
        opacity: 0,
        "box-shadow": "none"
    });
    me.demoteCardToBottom();
};

GridCard.prototype.setBigShadow = function () {
    var me = this;
    var innerDiv = me.data.innerDiv;

    innerDiv.style("box-shadow", me.BIG_SHADOW);
};

/***Layout calculation****/
GridCard.prototype.getCardLeft = function () {
    var me = this;
    var left = me.data.column * me.CELL_SIZE + GridCard.paddingLeft;
    return left;
};


/**Data updates****/
GridCard.prototype.fetchDataAndRedrawByView = function (range) {
    var me = this;
    var cardData = me.data;
    var view = cardData.view;
    switch (view) {
        case SimpleView.VIEWS.LIVE:
            me.fetchDataAndRedraw(range);
            break;
        case SimpleView.VIEWS.STATS:
            fetchStatsForCard(cardData);
            break;
        case SimpleView.VIEWS.NEWS:
            fetchNewsForCard(cardData);
            break;
    }
};

GridCard.prototype.fetchDataAndRedraw = function (range) {
    var me = this;
    var cardData = me.data;
    var stockSymbol = cardData.symbol;
    cardData.hasDataFetched = false;
    fetchDataForNewCard(stockSymbol, range, cardData);

    //Todo! find a better solution!
    setTimeout(function () {
        fetchDataForNewCard(stockSymbol, range, cardData);
    }, 0);
};

GridCard.prototype.fetchIndexDataToCompare = function (mainDataList, range, indexSymbol) {
    var me = this;
    var cardData = me.data;
    fetchIndexDataToCompare(indexSymbol, range, mainDataList, cardData);

    //Todo! find a better solution!
    setTimeout(function () {
        fetchIndexDataToCompare(indexSymbol, range, mainDataList, cardData);
    }, 0);
};

GridCard.prototype.redrawIfReady = function (viewToRedraw) {
    var me = this;
    var cardData = me.data;

    if (viewToRedraw == undefined) {
        viewToRedraw = cardData.view;
    }


    var isProperView = (cardData.view == viewToRedraw);
    var isSummary = cardData.cardType == CardDataObject.CARD_TYPES.Aggregate;
    var isInMiddleOfShuffle = (cardData.drawCount > 0 && getIsMiddleOfCardActionGlobal()); //Don't draw while drag&drop or resize
    if (!isInMiddleOfShuffle && isProperView && me.isFadeComplete && (cardData.hasDataFetched || viewToRedraw == SimpleView.VIEWS.STUDY || isSummary)) {
        me.drawContent();
        var dataObj = cardData;
        if (dataObj.isBGState) {
            dataObj.component.hideLinePath();
        }
    }
};

/**Data updates End.****/

/***Unify Actions****/
GridCard.prototype.applyUnifiedRange = function (range) {
    var me = this;
    var cardData = me.data;
    var stockSymbol = cardData.symbol;
    var stockData = getStockDataBySymbolGlobal(stockSymbol);
    var dataAlreadyFetched = getHasProperData(stockData, range);


    cardData.view = SimpleView.VIEWS.LIVE;
    cardData.setRange(range);
    cardData.setIndexToCompare("");

    cardData.drawCount = 0;
    if (!dataAlreadyFetched){
        me.fetchDataAndRedraw(range);
    }else{
        cardData.hasDataFetched = true;
        redrawForLiveAndStats(cardData);
    }
};

GridCard.prototype.applyUnifiedChartType = function (isCandle) {
    var me = this;
    var cardData = me.data;
    cardData.setIsCandleChart(isCandle);

    if (!cardData.getIsSummary()){
        var simpleView = cardData.component;
        simpleView.resetChartTypeAndRedraw(isCandle);
    }
};

GridCard.prototype.redrawChartByVolumeVisibility = function () {
    var me = this;
    var cardData = me.data;

    if (!cardData.getIsSummary()){
        var simpleView = cardData.component;
        simpleView.redrawChartByVolumeVisibility();
    }
};


/**Global Static Params****/
GridCard.paddingLeft = 0; //this one is set from outside
GridCard.SHOW_WHEN_HOVER_CLASS = "onlyShowOnCardHover";
GridCard.hoverdCardData; //this one is set from outside

GridCard.TOP_Z_INDEX = 2;
GridCard.REGULAR_Z_INDEX = 1;
GridCard.BOTTOM_Z_INDEX = 0;

GridCard.INNER_DIV_CLASS = "gridInnerComponent";