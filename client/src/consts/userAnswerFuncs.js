export function checkAnswer(myImg, correctPositions) {
    var posX = 0;
    var posY = 0;
    var ImgPos;
    ImgPos = findPosition(myImg);
    var e = window.event;
    if (e.pageX || e.pageY) {
        posX = e.pageX;
        posY = e.pageY;
    }
    else if (e.clientX || e.clientY) {
        posX = e.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posY = e.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    posX = posX - ImgPos[0];
    posY = posY - ImgPos[1];

    return findSectionGlobal({x: posX, y: posY}, correctPositions, {width: myImg.clientWidth, height: myImg.clientHeight});
}

function findPosition(oElement) {
    if (typeof (oElement.offsetParent) != "undefined") {
        for (var posX = 0, posY = 0; oElement; oElement = oElement.offsetParent) {
            posX += oElement.offsetLeft;
            posY += oElement.offsetTop;
        }
        return [posX, posY]; // returns img's top left
    }
    else {
        return [oElement.x, oElement.y]; // returns img's top left
    }
}

function findSectionGlobal(click, corRect, imgDimensions) { // recieving click positions, correct positions in decimal, and img's width and height

    const pxCorRect = {
        left:corRect.left * imgDimensions.width,
        right:corRect.right * imgDimensions.width,
        top:corRect.top * imgDimensions.height,
        bottom:corRect.bottom * imgDimensions.height
    }
    return (click.x > pxCorRect.left && click.x < pxCorRect.right) && (click.y > pxCorRect.top && click.y < pxCorRect.bottom);
}