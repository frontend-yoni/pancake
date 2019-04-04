/**
 * Created with IntelliJ IDEA.
 * User: avitzur
 * Date: 17/12/14
 * Time: 17:42
 * To change this template use File | Settings | File Templates.
 */

function FunGrid() {
    var me = this;
    var iMath = Math;
    var scrollManager = new DragAndDropScrollManager();

    //Constants
    //Layout Constants
    var SCROLL_TIMEOUT_TIME = 250;
    var SCROLL_BAR_WIDTH = 25;
    var PAD_BETWEEN_CELLS = 5;
    var CELL_SIZE = 200;
    var EXTRA_BOTTOM_PADDING = 40;
    //Color constants

    //Animation
    var FADE_IN_ANIMATION_DURATION = 1000;

    //Structure elements
    //(Externally set)
    var externalDiv;
    var parentDiv;
    var regularBGDiv;
    var contentPapa;
    var dashboardContentDiv;
    var contentBGHitAreaDiv;
    var topBGDiv;

    //Data objects
    var cardDataList;

    //Layout params
    //(Externally set)
    var extraPaddingOnTop = 0;
    var nextCardWidth = 2;
    var nextCardHeight = 2;
    //(Internally set)
    var cellSize = CELL_SIZE + PAD_BETWEEN_CELLS * 2;
    var parentDivHeight;
    var parentDivWidth;
    var dashboardDivWidth;
    var dashboardDivLeft;
    var actualGridAreaWidth;

    //State
    //Position state
    var gridCellsMatrix; //list of columns (each entry of the array is a column)
    var prevMatrix;
    //Layout state
    var columnCount;
    var contentHeight;
    var extraLeftPadding = 0; //Externally set!
    var totalLeftPadding = 0;
    var hasScroll;
    //Lifecycle state
    var hasDrawnForData;
    //Action state
    var isResizing;
    var isDragging;
    var resizeCardData;
    var dragCardData;
    var isMiddleOfShuffle;
    var removedCardData;
    var removedCardIndex;
    var removedCardDataArray;
    var removedCardIndexArray;
    //Mouse position
    var dragMouseX;
    var dragMouseY;

    //Utils
    //Functions
    var positionUtil = CardPositionUtil.getInstance();
    var resizeService = ResizeService.getInstance();
    var dragDropService = DragAndDropService.getInstance();
    var removeCardService = RemoveCardService.getInstance();
    var expandService = ExpandToDrillService.getInstance();
    var revertActionService = RevertActionService.getInstance();
    var animationUtil = AnimateCardUtil.getInstance();
    var instructionCard = InstructionCard.getInstance();
    var fillGridVoidService = FillGridVoidService.getInstance();
    var usefulUtil = UsefulUIUtil.getInstance();
    var twitterUtil = TwitterUtil.getInstance();
    //(Externally set)
    var papaMainView;

    //Public functions
    this.setExternalDiv = function (externalDivInput) {
        externalDiv = d3.select(externalDivInput);
    };

    this.setPapaComponent = function (papaComponent) {
        papaMainView = papaComponent;
    };

    this.drawComponent = function () {
        if (!hasDrawnForData) {
            drawComponent(true);
            hasDrawnForData = true;
        } else {
            drawComponent(false);
        }
    };

    this.addNewCard = function (cardData, index) {
        addNewCard(cardData, index);
    };

    this.setCardObjectsList = function (listInput) {
        cardDataList = listInput;
        hasDrawnForData = false;
    };

    this.setExtraPaddingOnTop = function (pixelInput) {
        extraPaddingOnTop = pixelInput;
    };

    this.performLeftPaddingShift = function (padWidth) {
        extraLeftPadding = padWidth;
        calculateTotalLeftPadding();
        performLeftPaddingShift();
    };

    //Just set, for initial loading with left padding
    this.setLeftPaneWidth = function (paneWidth) {
        extraLeftPadding = paneWidth;
    };

    this.cancelLeftPadding = function () {
        extraLeftPadding = 0;
        calculateTotalLeftPadding();
        performLeftPaddingShift();
    };

    this.setUnifiedSize = function (width, height) {
        readjustByNextCardSizeChange();
        setUnifiedSize(width, height);
    };

    this.sortCards = function (sortType, sortDirection) {
        sortCards(sortType, sortDirection);
    };

    this.removeCardsBySymbol = function (removeSymbol) {
        removeCardsBySymbol(removeSymbol);
    };

    this.reviveAllRemovedCards = function () {
        reviveAllRemovedCards();
    };

    this.startFresh = function () {
        startFresh();
    };

    this.revertStartFresh = function () {
        revertStartFresh();
    };

    this.hideScroll = function () {
        parentDiv.style('overflow-y', 'hidden');
    };

    this.showScroll = function () {
        parentDiv.style('overflow-y', 'auto');
    };

    this.checkIfFreshState = function () {
        checkIfFreshState();
    };

    this.respondToDefaultSizeChange = function () {
        readjustByNextCardSizeChange();
    };

    this.respondToAddNewCard = function (symbol, width, height, index) {
        papaMainView.addNewCardByIndex(symbol, width, height, index);
    };

    this.applyUnifiedRange = function (range) {
        applyUnifiedRange(range);
    };

    this.applyUnifiedChartType = function (isCandle) {
        applyUnifiedChartType(isCandle);
    };

    this.redrawChartByVolumeVisibility = function (isShowVolume) {
        redrawChartByVolumeVisibility(isShowVolume);
    };

    /**Inner Public Function****/
    this.onDragMove = function (handleX, handleY) {
        onDragMove(handleX, handleY);
    };

    this.pushOutScroll = function () {
        parentDiv.style('width', parentDivWidth + SCROLL_BAR_WIDTH + 'px');
    };

    this.pullBackScroll = function () {
        parentDiv.style('width', parentDivWidth + 'px');
    };

    /**Structure functions**/
    function drawComponent(hasAnimation) {
        contentHeight = 0; //Every time we draw, we need to determine ourselves the height

        performConstruct();
        createAllCardElements();
        adjustAllPositions();
        if (hasAnimation) {
            positionAllComponentDivsWithAnimation();
        } else {
            positionAllComponentDivsNoAnimation();
            regularBGDiv.style('opacity', 1);
        }

        checkIfFreshState();
    }

    function performConstruct() {
        externalDiv.selectAll('div').remove(); //Clear slate
        calculateMainLayoutParams();

        regularBGDiv = externalDiv.append('div')
            .style({
                position: 'absolute',
                left: 0 + 'px',
                top: extraPaddingOnTop + 'px',
                bottom: 0 + 'px',
                right: 0 + 'px',
                opacity: 0
            })
            .classed('pancake-bg', true);

        instructionCard.setExternalDiv(regularBGDiv);


        topBGDiv = externalDiv.append('div')
            .style({
                position: 'absolute',
                left: 0 + 'px',
                top: 0 + 'px',
                height: extraPaddingOnTop + 'px',
                right: 0 + 'px',
                background: MAIN_VIEW_TITLE_COLOR
            });

        parentDiv = externalDiv.append('div')
            .style({
                position: 'absolute',
                'overflow-y': 'auto',
                'overflow-x': 'hidden',
                left: 0 + 'px',
                top: 0 + 'px',
                right: 0 + 'px'
            })
            .attr({
                'name': 'FunGridParent'
            })
            .on('scroll', onScroll);
        scrollManager.setScrollContainer(parentDiv.node(), 55);

        //Just make sure the cards don't get drag out to infinity. (overflow: hidden is the key)
        contentPapa = parentDiv.append('div')
            .style({
                position: 'absolute',
                overflow: 'hidden',
                left: 0 + 'px',
                top: 0 + 'px',
                right: 0 + 'px',
                bottom: 0 + 'px'
            })
            .attr({
                'name': 'contentPapa'
            });

        dashboardContentDiv = contentPapa.append('div')
            .style({
                position: 'absolute',
                left: dashboardDivLeft + 'px',
                top: PAD_BETWEEN_CELLS + extraPaddingOnTop + 'px',
                '-moz-user-select': 'none',
                '-webkit-user-select': 'none',
                '-ms-user-select': 'none',
                right: 0 + 'px',
                bottom: 0 + 'px'
            })
            .attr({
                'name': 'dashboardContentDiv'
            });

        contentBGHitAreaDiv = dashboardContentDiv.append('div')
            .style({
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                right: 0
            }).attr({
                'name': 'contentBGHitAreaDiv '
            })
            .on('mouseenter', onMouseEnterBG);

        resizeService.setCanvasDiv(dashboardContentDiv.node());
        resizeService.createElements();

        dashboardContentDiv.on(resizeService.RESIZE_STAR_EVENT, onResizeStart);
        dashboardContentDiv.on(resizeService.RESIZE_MOVE_EVENT, onResizeMove);
        dashboardContentDiv.on(resizeService.RESIZE_END_EVENT, onResizeEnd);
        dashboardContentDiv.on(resizeService.RESIZE_ANIMATION_END_EVENT, onResizeAnimationComplete);

        dragDropService.setCanvasDiv(dashboardContentDiv.node());
        dragDropService.setPapaFunGrid(me);
        dragDropService.setScrollDiv(parentDiv);
        dragDropService.createElements();

        dashboardContentDiv.on(dragDropService.DRAG_STAR_EVENT, onDragStart);
        // dashboardContentDiv.on(dragDropService.DRAG_MOVE_EVENT, onDragMove);
        dashboardContentDiv.on(dragDropService.DROP_EVENT, onDrop);
        dashboardContentDiv.on(dragDropService.DROP_ANIMATION_END, oDropAnimationEnd);

        revertActionService.setFrameDiv(externalDiv.node());

        removeCardService.setCanvasDiv(dashboardContentDiv.node(), externalDiv.node());
        removeCardService.createElements();
        removeCardService.setOnRemoveFunction(onRemoveButtonClicked);
        removeCardService.setOnRevertFunction(onReviveButtonClicked);

        expandService.setCanvasDiv(dashboardContentDiv.node(), externalDiv.node());
        expandService.createElements();

        adjustElementsSizes();
        adjustCardSizeByColumnCount();

        dashboardContentDiv.on(animationUtil.REPOSITION_COMPLETE_EVENT, reactToShuffleAnimationEnd);

        prepFillVoidUtil();
        updateContentBGSize();
    }

    function adjustElementsSizes() {
        parentDiv.style({
            height: parentDivHeight + 'px',
            width: parentDivWidth + 'px'
        });

        dashboardContentDiv.style({
            width: dashboardDivWidth + 'px'
        });
    }

    function createAllCardElements() {
        var cardData;
        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardData = cardDataList[i];
            createCardElement(cardData);
        }
    }

    function createCardElement(cardData) {
        var cardElement = new GridCard();
        cardData.drawCount = 0;
        cardElement.setCanvasDiv(dashboardContentDiv);
        cardElement.setData(cardData);
        cardElement.createCard();
    }

    function prepFillVoidUtil() {
        fillGridVoidService.setUtils(positionUtil, me);
        fillGridVoidService.setExternalDivs(dashboardContentDiv);
        fillGridVoidService.createLastAddDiv();
    }

    function updateContentBGSize() {
        var contentWidth = columnCount * cellSize;
        var horizontalPad = PAD_BETWEEN_CELLS;
        var left = totalLeftPadding + horizontalPad;
        var right = (dashboardDivWidth - totalLeftPadding) - contentWidth + horizontalPad;
        contentBGHitAreaDiv.style({
            left: left + 'px',
            right: right + 'px'
        })
    }

    /***Action!**/
    function startFresh() {
        removedCardDataArray = [];
        removedCardIndexArray = [];
        var cardData;
        for (var i = cardDataList.length - 1; i >= 0; i--) {
            cardData = cardDataList[i];
            removedCardDataArray.push(cardData);
            removedCardIndexArray.push(i);
            cardData.setAsRemovedCard(true);
            cardDataList.splice(i, 1);
        }
        removedCardDataArray.reverse();
        removedCardIndexArray.reverse();

        animateRemoval(removedCardDataArray);

        checkIfFreshState();
    }

    function revertStartFresh() {
        reviveAllRemovedCards();
        isMiddleOfShuffle = false; //todo: Why is this true after startFresh animation???
        checkIfFreshState();
    }

    function checkIfFreshState() {
        if (getIsFreshStateGlobal()) {
            instructionCard.showMessage();
        } else {
            instructionCard.hideMessage();
        }
    }

    function sortCards(sortType, sortDirection) {
        if (!sortDirection) {
            sortDirection = SORT_BY_DIRECTION.ASCENDING;
        }
        cardDataList.sort(compareFunction);
        adjustAllPositions();
        positionAllComponentDivWithAnimation();

        //Inner function
        function compareFunction(card1, card2) {
            return CardDataObject.sortHelper(card1, card2, sortType, sortDirection);
        }
    }

    function removeCardsBySymbol(removeSymbol) {
        removedCardDataArray = [];
        removedCardIndexArray = [];
        var cardData;
        for (var i = cardDataList.length - 1; i >= 0; i--) {
            cardData = cardDataList[i];
            if (cardData.symbol == removeSymbol) {
                removedCardDataArray.push(cardData);
                removedCardIndexArray.push(i);
                cardData.setAsRemovedCard(true);
                cardDataList.splice(i, 1);
            }
        }
        removedCardDataArray.reverse();
        removedCardIndexArray.reverse();
        animateRemoval(removedCardDataArray);
    }

    function reviveAllRemovedCards() {
        var cardData;
        var removeIndex;
        for (var i = 0; i < removedCardDataArray.length; i++) {
            cardData = removedCardDataArray[i];
            removeIndex = removedCardIndexArray[i];
            createCardToRevive(cardData);
            cardDataList.splice(removeIndex, 0, cardData);
        }

        adjustAllPositions();
        positionAllComponentDivWithAnimation();
    }

    function removeCard(cardData) {
        removedCardData = cardData;
        removedCardData.setAsRemovedCard(true);
        removedCardIndex = removeCardDataFromList();
        animateRemoval([removedCardData]);
    }

    function animateRemoval(cardDataArray) {
        var cardElement;
        for (var i = 0; i < cardDataArray.length; i++) {
            cardElement = cardDataArray[i].cardElement;
            cardElement.removeCardWithAnimation();
        }
        adjustAllPositions();
        positionAllComponentDivWithAnimation();
    }

    function reviveCard() {
        createCardToRevive(removedCardData);

        cardDataList.splice(removedCardIndex, 0, removedCardData);
        adjustAllPositions();
        positionAllComponentDivWithAnimation();
    }

    function createCardToRevive(cardData) {
        cardData.setAsNewCard();
        cardData.setCurrentColumnCount(columnCount);
        createCardElement(cardData);
    }

    function addNewCard(cardData, index) {
        cardData.setCurrentColumnCount(columnCount);
        hideAddCardDiv();
        cardData.setAsNewCard();
        cardData.setCurrentColumnCount(columnCount);
        createCardElement(cardData);

        if (!index) {
            index = 0;
        }

        addToArrayByIndex(cardDataList, cardData, index);
        adjustAllPositions();
        positionAllComponentDivWithAnimation();

        informActionToSave();
    }

    function performLeftPaddingShift() {
        calculateGridCanvasLayoutParams();
        adjustElementsSizes();
        adjustCardSizeByColumnCount();
        adjustAllPositions();
        positionAllComponentDivWithAnimation(true);
        updateContentBGSize();
    }

    function setUnifiedSize(width, height) {
        var cardObject;
        for (var i = 0; i < cardDataList.length; i++) {
            cardObject = cardDataList[i];
            cardObject.setWidth(width);
            cardObject.setHeight(height);
        }
        adjustAllPositions();
        positionForUnifySizeWithAnimation();

        revertActionService.showMessage('Unified Sizes', revertUnifiedSizes);
    }

    function revertUnifiedSizes() {
        var cardObject;
        for (var i = 0; i < cardDataList.length; i++) {
            cardObject = cardDataList[i];
            cardObject.setWidth(cardObject.prevWidth);
            cardObject.setHeight(cardObject.prevHeight);
        }
        adjustAllPositions();
        positionForUnifySizeWithAnimation();
    }

    function applyUnifiedRange(range) {
        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardElement = cardDataList[i].cardElement;
            if (!cardElement.data.getIsSummary()) {
                cardElement.applyUnifiedRange(range);
            }
        }
        informActionToSave();
    }

    function applyUnifiedChartType(isCandle) {
        UserDBData.isCandleChart = isCandle;

        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardElement = cardDataList[i].cardElement;
            if (!cardElement.data.getIsSummary()) {
                cardElement.applyUnifiedChartType(isCandle);
            }
        }
        StockListContainer.getInstance().resetChartTypeAndRedraw(isCandle);
        informActionToSave();
    }

    function redrawChartByVolumeVisibility(isShowVolume) {
        UserDBData.isShowVolume = isShowVolume;

        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardElement = cardDataList[i].cardElement;
            if (!cardElement.data.getIsSummary()) {
                cardElement.redrawChartByVolumeVisibility();
            }
        }
        StockListContainer.getInstance().redrawChartByVolumeVisibility();
        informActionToSave();
    }

    /***Action! End.**/

    /****Layout calculations*/
    function calculateMainLayoutParams() {
        var externalDivDOM = externalDiv.node();

        parentDivHeight = externalDivDOM.clientHeight;
        parentDivWidth = externalDivDOM.clientWidth;
        dashboardDivWidth = parentDivWidth - 2 * PAD_BETWEEN_CELLS - SCROLL_BAR_WIDTH;
        dashboardDivLeft = PAD_BETWEEN_CELLS;

        calculateGridCanvasLayoutParams();
    }

    function calculateGridCanvasLayoutParams() {
        actualGridAreaWidth = dashboardDivWidth - extraLeftPadding;
        columnCount = iMath.floor(actualGridAreaWidth / cellSize);
        columnCount = iMath.max(1, columnCount); //Must be at least 1. otherwise shit hits the fan after resizing window to super tiny.
        positionUtil.setColumnCount(columnCount);
        positionUtil.setCellWidth(cellSize);
        positionUtil.setNextCardSize(nextCardWidth, nextCardHeight);
        calculateTotalLeftPadding();
    }

    function adjustCardSizeByColumnCount() {
        for (var i = 0; i < cardDataList.length; i++) {
            var cardObject = cardDataList[i];
            cardObject.setCurrentColumnCount(columnCount);
        }
    }

    function setDraggedComponentCoordinates(handleX, handleY) {
        dragMouseX = iMath.max(handleX, 0) - totalLeftPadding;
        dragMouseY = iMath.max(handleY, 1);
    }

    function calculateTotalLeftPadding() {
        totalLeftPadding = extraLeftPadding;
        if (extraLeftPadding == 0) { //Just in case the left pane is closed, centralize the grid
            var deadArea = actualGridAreaWidth - columnCount * cellSize;
            var leftPadToCentralize = deadArea / 2;
            totalLeftPadding += leftPadToCentralize;
        }
        GridCard.paddingLeft = totalLeftPadding;
    }

    /****End.*/

    /****Card position*/
    //Here we calculate the position of each card, not yet place them. (just update the gridComponentObjects)
    function adjustAllPositions() {
        gridCellsMatrix = positionUtil.createEmptyMatrix();
        var card;
        var prevCard;

        for (var i = 0; i < cardDataList.length; i++) {
            card = cardDataList[i];
            positionUtil.positionCardObject(card, prevCard, gridCellsMatrix);
            prevCard = card;
        }

        prevMatrix = positionUtil.copyMatrix(gridCellsMatrix);
    }

    function removeCardDataFromList() {
        var index = cardDataList.indexOf(removedCardData);
        if (index > -1) {
            cardDataList.splice(index, 1);
        }
        return index;
    }

    function positionAllComponentDivsWithAnimation() {
        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardElement = cardDataList[i].cardElement;
            cardElement.fadeInCard(FADE_IN_ANIMATION_DURATION); //todo: restore
        }
        adjustContainerHeight();
        fadeInBG();
    }

    function positionAllComponentDivsNoAnimation() {
        var cardElement;
        for (var i = 0; i < cardDataList.length; i++) {
            cardElement = cardDataList[i].cardElement;
            cardElement.positionCardNoAnimation();
        }
        adjustContainerHeight();
    }

    function positionAllComponentDivWithAnimation(isLinear) {
        var cardElement;
        var cardData;
        isMiddleOfShuffle = true;
        for (var i = 0; i < cardDataList.length; i++) {
            cardData = cardDataList[i];
            cardElement = cardData.cardElement;

            if (cardData == resizeCardData) {
                cardElement.redrawBySize();
                cardElement.setResizeState();
                resizeService.updateClone(cardData);
                cardElement.hideLinePathForHeavyCharts();
            }


            if (cardData.hasBeenSqueezed) {
                cardElement.redrawBySize();
            }

            if (cardData.isNewCard) {
                cardElement.introduceNewCardWithAnimation(showAddCardDiv);
            } else {
                cardElement.moveCarWithAnimation(isLinear);
            }
        }
        adjustContainerHeight();
    }

    function positionForUnifySizeWithAnimation() {
        var cardElement;
        var cardData;
        for (var i = 0; i < cardDataList.length; i++) {
            cardData = cardDataList[i];
            cardElement = cardData.cardElement;
            if (i == cardDataList.length - 1) {
                cardElement.resizeAndMoveCarWithAnimation(usefulUtil.disableBlockingDiv);
            } else {
                cardElement.resizeAndMoveCarWithAnimation();
            }
        }

        if (cardDataList.length == 0) {
            usefulUtil.disableBlockingDiv();
        }

        adjustContainerHeight();
    }

    function adjustContainerHeight() {
        var actualHeight = getActualHeight();
        var initialHeight = parentDivHeight - extraPaddingOnTop - PAD_BETWEEN_CELLS;
        var suggestedHeight = iMath.max(actualHeight, initialHeight);

        hasScroll = (suggestedHeight > initialHeight);

        if (suggestedHeight != contentHeight) {
            contentHeight = suggestedHeight;
            contentPapa.style({
                'height': contentHeight + extraPaddingOnTop + PAD_BETWEEN_CELLS + 'px'
            });
        }

        twitterUtil.updatePosition(hasScroll);
        positionAddCardDiv();
    }

    function getActualHeight() {
        return positionUtil.getActualHeight(gridCellsMatrix, PAD_BETWEEN_CELLS, EXTRA_BOTTOM_PADDING);
    }

    function readjustByNextCardSizeChange() {
        var widthAndHeight = getDefaultCardSizeGlobal();
        nextCardWidth = widthAndHeight[0];
        nextCardHeight = widthAndHeight[1];
        positionUtil.setNextCardSize(nextCardWidth, nextCardHeight);

        adjustContainerHeight();
    }

    function positionAddCardDiv() {
        var rowAndColumn = positionUtil.getNextCardRowAndColumn();
        var row = rowAndColumn[0];
        var column = rowAndColumn[1];

        var left = column * cellSize + totalLeftPadding;
        var top = row * cellSize;

        fillGridVoidService.positionLastAddDiv(top, left);
    }

    function hideAddCardDiv() {
        fillGridVoidService.hideAddDiv();
    }

    function showAddCardDiv() {
        fillGridVoidService.showAddDiv();
    }

    //When resizing, readjust the positions, and also place them.
    function addWidthAndHeight(cardData, widthCount, heightCount) {
        var widthSddSuccess = cardData.addWidth(widthCount);
        var heightSddSuccess = cardData.addHeight(heightCount);

        if (heightSddSuccess || widthSddSuccess) {
            cardData.drawCount = 0; //Don't blink on every resize
            adjustAllPositions();
            positionAllComponentDivWithAnimation(true);
        }
    }

    function updateResizeServiceShiftCoordinates() {
        var shiftX = resizeCardData.column * cellSize + totalLeftPadding;
        var shiftY = resizeCardData.row * cellSize;
        var shiftWidth = resizeCardData.width * cellSize;
        var shiftHeight = resizeCardData.height * cellSize;
        resizeService.setShiftCoordinatesAndSize([shiftX, shiftY], [shiftWidth, shiftHeight]);
    }

    /****End*/

    /**Reaction to change**/
    function reactToDrag(handleX, handleY) {
        setDraggedComponentCoordinates(handleX, handleY);
        reShuffleCardsByDrag();

        var dropX = dragCardData.column * cellSize + totalLeftPadding;
        var dropY = dragCardData.row * cellSize;
        dragDropService.setDropCoordinates([dropX, dropY]);
    }

    function reShuffleCardsByDrag() {
        var draggedRowAndColumn = positionUtil.getRowAndColumn(dragMouseX, dragMouseY, gridCellsMatrix);
        var draggedCellColumn = draggedRowAndColumn[1];
        var draggedCellRow = draggedRowAndColumn[0];
        var overlappingCard;

        overlappingCard = gridCellsMatrix[draggedCellColumn][draggedCellRow];

        if (overlappingCard != dragCardData) {
            var prevIndex = positionUtil.getCardIndex(cardDataList, dragCardData);
            positionUtil.detachCardFromList(cardDataList, prevIndex);
            var indexToInsertBefore = prevIndex;

            if (!overlappingCard) {
                indexToInsertBefore = positionUtil.findIndexToInsertBefore(cardDataList, draggedCellColumn, draggedCellRow);
            } else {
                var isBefore = positionUtil.shouldInsertBefore(overlappingCard, dragMouseX);
                var overlappingIndex = positionUtil.getCardIndex(cardDataList, overlappingCard);
                if (isBefore) {
                    indexToInsertBefore = overlappingIndex;
                } else {
                    indexToInsertBefore = overlappingIndex + 1;
                }
            }

            positionUtil.insertCardToList(cardDataList, dragCardData, indexToInsertBefore);
            if (prevIndex != indexToInsertBefore) {
                adjustAllPositions();
                positionAllComponentDivWithAnimation(false);
            }
        }


    }

    function reactToShuffleAnimationEnd() {
        isMiddleOfShuffle = false;
        prevMatrix = positionUtil.copyMatrix(gridCellsMatrix);
    }

    /**Reaction to change End**/

    /**State Change**/
    function applyBGStateToBGCards() {
        var cardData;
        for (var i = 0; i < cardDataList.length; i++) {
            cardData = cardDataList[i];
            if (cardData != resizeCardData && cardData != dragCardData) {
                cardDataList[i].cardElement.applyBGState();
            }
        }
    }

    function restoreNormalStateToBGCards() {
        var cardData;
        for (var i = 0; i < cardDataList.length; i++) {
            cardData = cardDataList[i];
            if (cardData != resizeCardData && cardData != dragCardData) {
                cardDataList[i].cardElement.restoreFromBGState();
            }
        }
    }

    /**State Change End.**/

    /**Action Function ro send as params to service**/
    function onRemoveButtonClicked(cardData) {
        removeCard(cardData);
    }

    function onReviveButtonClicked() {
        reviveCard();
    }

    /** Event Listener ***/
    function onScroll(e) {
        setTimeout(scrollTimeoutEnd, SCROLL_TIMEOUT_TIME)
    }

    function scrollTimeoutEnd(){

    }

    /** Resize Events ***/
    function onResizeStart() {
        isResizing = true;
        var target = d3.event.target;
        var d3Target = d3.select(target);

        resizeCardData = d3Target.datum();

        applyBGStateToBGCards();

        resizeCardData.cardElement.setResizeState();

        hideAddCardDiv();
    }

    function onResizeMove() {
        if (resizeCardData) {
            var resizeState = d3.event.detail.data;
            var roundedCellWidth = iMath.ceil(cellSize); //some time there are glitches, so we want to deal with rounded numbers
            var newWidth = iMath.ceil(resizeState.width / roundedCellWidth);
            var newHeight = iMath.ceil(resizeState.height / cellSize);
            //Make sure we're at least 1 on 1
            newWidth = iMath.max(1, newWidth);
            newHeight = iMath.max(1, newHeight);

            var addWidthCount = newWidth - resizeCardData.width;
            var addHeightCount = newHeight - resizeCardData.height;

            addWidthAndHeight(resizeCardData, addWidthCount, addHeightCount);
            updateResizeServiceShiftCoordinates();
        }
    }

    function onResizeEnd() {
        restoreNormalStateToBGCards();
        informActionToSave();
    }

    function onResizeAnimationComplete() {
        resizeCardData.cardElement.restoreNormalState();
        resizeCardData = null;

        showAddCardDiv();
    }

    function fadeInBG() {
        hideAddCardDiv();
        regularBGDiv.transition()
            .duration(FADE_IN_ANIMATION_DURATION / 2)
            .delay(FADE_IN_ANIMATION_DURATION / 2)
            .ease('cubic-out')
            .tween('pook', function (d) {
                var interpolator = d3.interpolate(0, 1);
                return function (t) {
                    regularBGDiv.style('opacity', interpolator(t));
                    if (t == 1) {
                        showAddCardDiv();
                    }
                }
            });
    }

    /**Drag Events***/
    function onDragStart() {
        var target = d3.event.target;
        var d3Target = d3.select(target);
        dragCardData = d3Target.datum();

        applyBGStateToBGCards();
        dragCardData.cardElement.setDropTargetState();

        hideAddCardDiv();
    }

    function oDropAnimationEnd() {
        dragCardData.cardElement.restoreNormalState();
        dragCardData = null;
        showAddCardDiv();
    }

    function onDragMove(handleX, handleY) {
        if (!isMiddleOfShuffle) {
            reactToDrag(handleX, handleY);
        }
    }

    function onDrop() {
        prevMatrix = positionUtil.copyMatrix(gridCellsMatrix);
        restoreNormalStateToBGCards();
        informActionToSave();
    }

    /***Event Listener End***/

    /**BG Mouse Events***/
    function onMouseEnterBG() {
        var mouseXY = d3.mouse(contentBGHitAreaDiv.node());
        var x = mouseXY[0];
        var y = mouseXY[1];
        var rowAndColumn = positionUtil.getRowAndColumn(x, y, gridCellsMatrix);
        var column = rowAndColumn[1];
        var row = iMath.floor(y / cellSize);
        row = iMath.max(row, 0);

    }

    /**BG Mouse Events End.***/
}

FunGrid.FADE_IN_COMPLETE_EVENT = 'fadeInCompleteEvent';

FunGrid.getInstance = function () {
    if (!FunGrid.instance) {
        FunGrid.instance = new FunGrid();
    }

    return FunGrid.instance;
};