/**
 * Created by avitzur on 9/18/2015.
 */
function AnimateCardUtil() {
    //Constants
    //Event Constants
    var REPOSITION_COMPLETE_EVENT = "repositionCompleteEvent";
    var RESIZE_COMPLETE_EVENT = "resizeCompleteEvent";
    var CLONE_RETURN_COMPLETE_EVENT = "cloneReturnCompleteEvent";


    var iMath = Math;
    var duration = 500;

    /***Public Properties*/
    this.REPOSITION_COMPLETE_EVENT = REPOSITION_COMPLETE_EVENT;
    this.RESIZE_COMPLETE_EVENT = RESIZE_COMPLETE_EVENT;
    this.CLONE_RETURN_COMPLETE_EVENT = CLONE_RETURN_COMPLETE_EVENT;
    this.DEFAULT_DURATION = duration;

    /***Public Functions*/
    this.runRepositionEaseOut = function (divToAnimate, prevLeft, prevTop, newLeft, newTop, animationDuration) {
        duration = animationDuration;
        return runRepositionEaseOut(divToAnimate, prevLeft, prevTop, newLeft, newTop);
    };

    this.runRepositionLinear = function (divToAnimate, prevLeft, prevTop, newLeft, newTop, animationDuration) {
        duration = animationDuration;
        return runRepositionLinear(divToAnimate, prevLeft, prevTop, newLeft, newTop);
    };

    this.runCardResizeEaseOut = function (divToAnimate, prevWidth, prevHeight, newWidth, newHeight, animationDuration) {
        duration = animationDuration;
        runCardResizeEaseOut(divToAnimate, prevWidth, prevHeight, newWidth, newHeight);
    };

    this.runCardResizeLinear = function (divToAnimate, prevWidth, prevHeight, newWidth, newHeight, animationDuration) {
        duration = animationDuration;
        runCardResizeLinear(divToAnimate, prevWidth, prevHeight, newWidth, newHeight);
    };

    this.runCloneReturn = function (divToAnimate, prevWidth, prevHeight, prevTop, prevLeft, newWidth, newHeight, newTop, newLeft, animationDuration) {
        duration = animationDuration;
        runCloneReturn(divToAnimate, prevWidth, prevHeight, prevTop, prevLeft, newWidth, newHeight, newTop, newLeft);
    };

    this.runCardFadeInAnimation = function (carsObject, divToAnimate, prevLeft, newLeft, animationDuration) {
        duration = animationDuration;
        runCardFadeInAnimation(carsObject, divToAnimate, prevLeft, newLeft);
    };


    this.runRepositionAndResizeAnimation = function(divToAnimate, prevLeft, prevTop, prevWidth, prevHeight, newLeft, newTop, newWidth, newHeight, cardElement, onComplete){
        runRepositionAndResizeAnimation(easeOutCubic, divToAnimate, prevLeft, prevTop, prevWidth, prevHeight, newLeft, newTop, newWidth, newHeight, cardElement, onComplete);
    };

    /*Actions*/
    function runRepositionEaseOut(divToAnimate, prevLeft, prevTop, newLeft, newTop) {
        return runRepositionAnimation(easeOutCubic, divToAnimate, prevLeft, prevTop, newLeft, newTop);
    }

    function runRepositionLinear(divToAnimate, prevLeft, prevTop, newLeft, newTop) {
        return runRepositionAnimation(linearTween, divToAnimate, prevLeft, prevTop, newLeft, newTop);
    }

    function runCardResizeEaseOut(divToAnimate, prevWidth, prevHeight, newWidth, newHeight) {
        runCardResizeAnimation(easeOutCubic, divToAnimate, prevWidth, prevHeight, newWidth, newHeight);
    }

    function runCardResizeLinear(divToAnimate, prevWidth, prevHeight, newWidth, newHeight) {
        runCardResizeAnimation(linearTween, divToAnimate, prevWidth, prevHeight, newWidth, newHeight);
    }

    function runCloneReturn(divToAnimate, prevWidth, prevHeight, prevTop, prevLeft, newWidth, newHeight, newTop, newLeft, canvasWidth) {
        var startTime = new Date().getTime();
        var widthChange = newWidth - prevWidth;
        var heightChange = newHeight - prevHeight;
        var topChange = newTop - prevTop;
        var leftChange = newLeft - prevLeft;

        function repeatAnimation() {
            var nowTime = new Date().getTime();
            var progressTime = nowTime - startTime;
            progressTime = iMath.min(duration, progressTime);

            var width = linearTween(progressTime, prevWidth, widthChange, duration);
            var height = linearTween(progressTime, prevHeight, heightChange, duration);
            var left = linearTween(progressTime, prevLeft, leftChange, duration);
            var top = linearTween(progressTime, prevTop, topChange, duration);

            if (canvasWidth) {
                width = iMath.min(width, canvasWidth - left);
            }

            divToAnimate.style({
                width: width + "px",
                height: height + "px",
                top: top + "px",
                left: left + "px"
            });

            if (progressTime < duration) {
                requestAnimationFrame(repeatAnimation);
            } else {
                dispatchEventByNameAndData(divToAnimate, CLONE_RETURN_COMPLETE_EVENT);
            }
        }

        requestAnimationFrame(repeatAnimation);
    }

    function runCardFadeInAnimation(carsObject, divToAnimate, prevLeft, newLeft) {
        var startTime = new Date().getTime();
        var animationDuration = duration;
        var leftChange = newLeft - prevLeft;

        function repeatAnimation() {
            var nowTime = new Date().getTime();
            var progressTime = nowTime - startTime;
            progressTime = iMath.min(animationDuration, progressTime);
            var left = easeOutCubic(progressTime, prevLeft, leftChange, duration);
            var opacity = easeOutCubic(progressTime, 0, 1, duration);

            divToAnimate.style({
                left: left + "px",
                opacity: opacity
            });

            if (progressTime < animationDuration) {
                requestAnimationFrame(repeatAnimation);
            } else {
                carsObject.isFadeComplete = true;
                carsObject.redrawIfReady();
            }
        }

        requestAnimationFrame(repeatAnimation);
    }


    function runCardResizeAnimation(tweenFunction, divToAnimate, prevWidth, prevHeight, newWidth, newHeight) {
        var startTime = new Date().getTime();
        var widthChange = newWidth - prevWidth;
        var heightChange = newHeight - prevHeight;

        function repeatAnimation() {
            var nowTime = new Date().getTime();
            var progressTime = nowTime - startTime;
            progressTime = iMath.min(duration, progressTime);
            var width = tweenFunction(progressTime, prevWidth, widthChange, duration);
            var height = tweenFunction(progressTime, prevHeight, heightChange, duration);

            divToAnimate.style({
                width: width + "px",
                height: height + "px"
            });

            if (progressTime < duration) {
                requestAnimationFrame(repeatAnimation);
            } else {
                dispatchEventByNameAndData(divToAnimate, RESIZE_COMPLETE_EVENT);
            }
        }

        requestAnimationFrame(repeatAnimation);
    }


    function runRepositionAnimation(tweenFunction, divToAnimate, prevLeft, prevTop, newLeft, newTop) {
        var startTime = new Date().getTime();
        var manageAnimationObject = new ManageAnimationObject(prevLeft, prevTop);


        var leftChange = iMath.abs(newLeft - prevLeft);
        var topChange = iMath.abs(newTop - prevTop);
        var leftIsPositive = 1;
        var topIsPositive = 1;
        if (newLeft < prevLeft) {
            leftIsPositive = -1;
        }
        if (newTop < prevTop) {
            topIsPositive = -1;
        }

        var animationDuration = duration;

        function repeatAnimation() {
            var nowTime = new Date().getTime();
            var progressTime = nowTime - startTime;
            progressTime = iMath.min(animationDuration, progressTime);
            updateLeftAndTopByProgress(manageAnimationObject, tweenFunction, prevLeft, prevTop, leftChange, topChange, leftIsPositive, topIsPositive, progressTime, animationDuration);

            divToAnimate.style({
                left: manageAnimationObject.left + "px",
                top: manageAnimationObject.top + "px"
            });

            if (progressTime < animationDuration && !manageAnimationObject.stop) {
                requestAnimationFrame(repeatAnimation);
            } else if (!manageAnimationObject.stop) {
                dispatchEventByNameAndData(divToAnimate, REPOSITION_COMPLETE_EVENT);
            }
        }

        requestAnimationFrame(repeatAnimation);

        return manageAnimationObject;
    }

    function runRepositionAndResizeAnimation(tweenFunction, divToAnimate, prevLeft, prevTop, prevWidth, prevHeight, newLeft, newTop, newWidth, newHeight, cardElement, onComplete) {
        var startTime = new Date().getTime();
        var manageAnimationObject = new ManageAnimationObject(prevLeft, prevTop);

        var widthChange = newWidth - prevWidth;
        var heightChange = newHeight - prevHeight;
        var leftChange = iMath.abs(newLeft - prevLeft);
        var topChange = iMath.abs(newTop - prevTop);
        var leftIsPositive = 1;
        var topIsPositive = 1;
        if (newLeft < prevLeft) {
            leftIsPositive = -1;
        }
        if (newTop < prevTop) {
            topIsPositive = -1;
        }

        var animationDuration = duration;

        cardElement.applyOverflowHidden();
        cardElement.applyBGState();

        function repeatAnimation() {
            var nowTime = new Date().getTime();
            var progressTime = nowTime - startTime;
            progressTime = iMath.min(animationDuration, progressTime);
            updateLeftAndTopByProgress(manageAnimationObject, tweenFunction, prevLeft, prevTop, leftChange, topChange, leftIsPositive, topIsPositive, progressTime, animationDuration);

            var width = tweenFunction(progressTime, prevWidth, widthChange, duration);
            var height = tweenFunction(progressTime, prevHeight, heightChange, duration);

            divToAnimate.style({
                left: manageAnimationObject.left + "px",
                top: manageAnimationObject.top + "px",
                width: width + "px",
                height: height + "px"
            });

            if (progressTime < animationDuration && !manageAnimationObject.stop) {
                requestAnimationFrame(repeatAnimation);
            } else {
                if (onComplete){
                    onComplete();
                }
                cardElement.cancelOverflowHidden();
                cardElement.restoreFromBGState();
                cardElement.redrawBySize();
            }
        }

        requestAnimationFrame(repeatAnimation);

        return manageAnimationObject;
    }

    /*Calculations*/
    /*Animation progress calculations*/
    function linearTween(currentProgress, startValue, changeInValue, duration) {
        var currentValue = startValue + (currentProgress / duration) * changeInValue;
        return currentValue;
    }

    function easeOutCubic(currentProgress, startValue, changeInValue, duration) {
        currentProgress /= duration;
        currentProgress--;
        var currentValue = changeInValue * (currentProgress * currentProgress * currentProgress + 1) + startValue;
        return currentValue;
    }

    /*Positioning Calculations*/
    function updateLeftAndTopByProgress(manageAnimationObject, tweenFunction, prevLeft, prevTop, leftChange, topChange, leftIsPositive, topIsPositive, currentProgress, duration) {
        var totalChange = leftChange + topChange;
        var progressInPixels = tweenFunction(currentProgress, 0, totalChange, duration);
        var currentTop = prevTop + iMath.min(progressInPixels, topChange) * topIsPositive;
        var currentLeft = prevLeft + iMath.max(progressInPixels - topChange, 0) * leftIsPositive;

        manageAnimationObject.top = currentTop;
        manageAnimationObject.left = currentLeft;
    }

    //Util objects
    function ManageAnimationObject(left, top) {
        this.left = left;
        this.top = top;
        this.stop = false;
    }
}

AnimateCardUtil.getInstance = function () {
    if (!AnimateCardUtil.instance) {
        AnimateCardUtil.instance = new AnimateCardUtil();
    }

    return AnimateCardUtil.instance;
};
