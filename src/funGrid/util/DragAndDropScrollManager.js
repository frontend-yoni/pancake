function DragAndDropScrollManager() {
    /** Constants **/
    var SCROLL_ACTIVATION_AREA_SIZE = 30;
    var SCROLL_ACTIVATION_OVERFLOW_SIZE = 10;
    var MIN_PIXEL_PER_SECOND = 100;
    var MAX_PIXEL_PER_SECOND = 600;

    var containerDiv;
    var topPad = 0;
    /** Internally Set **/
    var mousePoint;
    var bcRect;
    var pixelPerSecond;
    var lastFrameTime;
    var currFrameTime;
    var isActive;
    var isFirstMove;

    /** Public APIs **/
    this.setScrollContainer = function (containerDivI, topPadI) {
        containerDiv = containerDivI;
        topPad = topPadI || 0;
        containerDiv.addEventListener("mousedown", onMouseDown);
    };

    function attachDocEvents() {
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);

        document.addEventListener("scroll", onDocScroll);
        containerDiv.addEventListener("scroll", onInnerScroll);

        isActive = true;
    }

    function detachDocEvents() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        document.removeEventListener("scroll", onDocScroll);
        containerDiv.removeEventListener("scroll", onInnerScroll);

        isActive = false;
    }

    /** Event Listeners **/
    function onMouseDown() {
        d3.select(containerDiv).classed("DisableUserSelect", true);
        attachDocEvents();
        updateBCRect();
        isFirstMove = true;

    }

    function onMouseUp(e) {
        d3.select(containerDiv).classed("DisableUserSelect", false);
        detachDocEvents();
    }

    function onMouseMove(e) {
        mousePoint = createPoint(e);
        if (isFirstMove) {
            activateScrollAnimation();
        }

        isFirstMove = false;
    }

    function onDocScroll(e) {
        if (e.isInnerScroll) {
            return;
        }
        updateBCRect();
    }

    function onInnerScroll(e) {
        e.isInnerScroll = true;
    }

    /** Scroll Animation **/
    function activateScrollAnimation() {
        isActive = true;
        lastFrameTime = new Date().getTime();
        scrollFrame();
    }

    function scrollFrame() {
        currFrameTime = new Date().getTime();
        if (!isActive) {
            return;
        }

        determineScrollSpeed();
        if (pixelPerSecond) {
            performScroll();
        }

        requestAnimationFrame(scrollFrame);

        lastFrameTime = currFrameTime;
    }


    function stopAnimation() {
        isActive = false;
    }

    /** Util **/
    function determineScrollSpeed() {
        var topDelta = mousePoint.y - bcRect.top;
        var bottomDelta = bcRect.height - topDelta;

        var distanceFromActualTop = topDelta - topPad;
        distanceFromActualTop = Math.max(0.01, distanceFromActualTop);

        if (distanceFromActualTop <= SCROLL_ACTIVATION_AREA_SIZE) { //Top side
            pixelPerSecond = -1 * calculateScrollSpeed(distanceFromActualTop);
        } else if (bottomDelta <= SCROLL_ACTIVATION_AREA_SIZE) { //Bottom side
            pixelPerSecond = calculateScrollSpeed(bottomDelta);
        } else { //None
            pixelPerSecond = 0;
        }
    }

    function performScroll() {
        var secondsPast = (currFrameTime - lastFrameTime) / 1000;
        var shiftPixels = secondsPast * pixelPerSecond;

        shiftPixels = Math.round(shiftPixels);

        var newScrollTop = containerDiv.scrollTop + shiftPixels;
        containerDiv.scrollTop = newScrollTop;
    }

    function calculateScrollSpeed(delta) {
        var speed = 0;
        var ratio;

        if (delta > 0 && delta <= SCROLL_ACTIVATION_AREA_SIZE) {
            ratio = 1 - delta / SCROLL_ACTIVATION_AREA_SIZE;
        } else if (delta < 0 && delta >= -SCROLL_ACTIVATION_OVERFLOW_SIZE) {
            ratio = 1;
        }

        if (ratio >= 0) {
            speed = getValueByProgress(MIN_PIXEL_PER_SECOND, MAX_PIXEL_PER_SECOND, ratio);
        }
        return speed;
    }

    /** Measurements Calculations **/
    function createPoint(e) {
        var x = e.clientX;
        var y = e.clientY;
        if (e.touches) {
            x = e.touches[0].clientX;
            y = e.touches[0].clientY;
        }

        return {x:x, y:y};
    }

    function updateBCRect() {
        bcRect = containerDiv.getBoundingClientRect();
    }

    function getValueByProgress(startValue, endValue, t) {
        return startValue + (endValue - startValue) * t;
    }
}

