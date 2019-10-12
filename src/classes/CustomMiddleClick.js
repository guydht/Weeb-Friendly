let middleClickFlag = true;

export default { enable: () => middleClickFlag = true, disable: () => middleClickFlag = false };

function middleClick() {
    var distanceX = 0,
        distanceY = 0;
    var circle = document.createElement("guydhtCircle"),
        startX, startY, moveInterval, changeElementInterval, elementToScroll = {};
    circle.innerHTML = "<svg viewbox='0 0 100 100'><circle cx='50' cy='50' r='50' /><circle cx='50' cy='50' r='6' style='fill: rgba(200, 200, 200, 0.6);' /><path d='M50 0 L65 25 L35 25 Z M0 50 L25 65 L25 35 Z M50 100 L65 75 L35 75 Z M100 50 L75 65 L75 35 Z' /></svg>";
    var style = document.createElement("style");
    style.id = "guydhtMiddleClickStyler";
    style.innerHTML = "guydhtCover *{transition: all 0s !important; border: none !important; background: none !important;}guydhtCircle{transform: translate(-50%, -50%); position: fixed; width: 30px; height: 30px; z-index: 999999999999999999;}guydhtCircle svg path{fill: rgba(200, 200, 200, 0.6);}guydhtCircle svg{fill: rgba(0, 0, 0, 0.75);}guydhtCover{cursor: none; position: fixed; top: 0; left: 0; height: 100%; width: 100%; z-index: 9999999999999999999999999999; background: none !important;}guydhtCursor{position: fixed; fill: black; height: 40px; width: 40px; margin-left: -20px; margin-top: -20px;}guydhtCover svg{filter: drop-shadow(0 0 10px rgb(255, 255, 255)); overflow: visible !important}guydhtCursor svg{fill: black !important;}";
    var cover = document.createElement("guydhtCover"),
        cursor = document.createElement("guydhtCursor");
    document.body.appendChild(cover);
    cover.appendChild(circle);
    cover.appendChild(cursor);
    cover.appendChild(style);
    cursor.innerHTML = "<svg viewbox='0 0 100 100'><circle cx='50' cy='50' r='12'></circle><path d='M50 100 L40 80 L 60 80 Z'></path></svg>";
    document.querySelector("html").addEventListener("mousedown", onmousedown);
    cover.onmouseup = cover.onclick = function (e) {
        e.stopPropagation();
        return false;
    };
    cover.onmousedown = removeMiddleClick;

    function tempFunction(e) {
        removeMiddleClick(e);
        setTimeout(function () {
            cover.onmouseup(e);
        });
    };

    function removeMiddleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        clearInterval(moveInterval);
        cover.onmouseup = remove;
        window.addEventListener("blur", remove);

        function remove(e) {
            e.stopPropagation();
            e.preventDefault();
            clearInterval(moveInterval);
            clearInterval(changeElementInterval);
            this.style.display = "none";
            if (circle.style.left.replace("px", "") != e.clientX - 15 && circle.style.top.replace("px", "") != e.clientY - 15) e.preventDefault();
            this.onmouseup = function () { };
            window.removeEventListener("mousedown", tempFunction);
            window.removeEventListener("blur", remove);
            window.removeEventListener("mousemove", onMouseMove);
        };
    };
    cover.style.display = "none";

    function onmousedown(e) {
        if (cover.parentNode == null) document.body.appendChild(cover);
        if (middleClickFlag === false) return;
        if (e.path.some(function (ele) {
            return ele.tagName == "A"
        }) || e.button != 1) return;
        if (document.webkitFullscreenElement != null || document.pointerLockElement != null) {
            e.preventDefault();
            return;
        }
        if (e.button == 1) e.preventDefault();
        elementToScroll = {
            y: e.path.find(function (ele) {
                var height = ele.clientHeight,
                    style = ele.tagName != null ? getComputedStyle(ele) : {};
                return height + 30 < ele.scrollHeight && height > 0 && (style.overflowY != "visible" && style.overflowY != "hidden");
            }),
            x: e.path.find(function (ele) {
                var width = ele.clientWidth,
                    style = ele.tagName != null ? getComputedStyle(ele) : {};
                return width + 30 < ele.scrollWidth && width > 0 && (style.overflowX != "visible" && style.overflowX != "hidden");
            }),
        };
        if (elementToScroll.y == null && elementToScroll.x == null && window != top) {
            return;
        }
        e.stopImmediatePropagation();
        if (elementToScroll.x == null || elementToScroll.x == document.getElementsByTagName("html")[0] || elementToScroll.x == document.body) elementToScroll.x = null;
        if (elementToScroll.y == null || elementToScroll.y == document.getElementsByTagName("html")[0] || elementToScroll.y == document.body) elementToScroll.y = null;
        setTimeout(function () {
            window.addEventListener("mousedown", tempFunction);
        });
        if (!e.path.includes(window)) focus = e.target;
        let position = circle.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        circle.style = "left: " + (startX - (position.width / 2)) + "px; top: " + (startY - (position.height / 2)) + "px;";
        window.addEventListener("mousemove", onMouseMove);
        onMouseMove(e);
        moveInterval = setInterval(function () {
            if (elementToScroll.y) elementToScroll.y.scrollTop += parseInt(distanceY);
            else window.scrollBy(0, parseInt(distanceY));
            if (elementToScroll.x) elementToScroll.x.scrollLeft += parseInt(distanceX);
            else window.scrollBy(parseInt(distanceX), 0);
        }, 25);
        cover.removeAttribute("style");
    }

    function onMouseMove(e) {
        let yMulti = e.clientY < startY ? -1 : 1,
            xMulti = e.clientX < startX ? -1 : 1;
        distanceX = xMulti * Math.pow((e.clientX - startX) * xMulti, 2) / 500, distanceY = yMulti * Math.pow((e.clientY - startY) * yMulti, 2) / 500;
        let angle = yMulti == -1 ? Math.PI - Math.atan(distanceX / distanceY) : Math.atan(distanceX / distanceY * -1);
        cursor.style = "transform: rotate(" + angle + "rad); top: " + e.clientY + "px; left: " + e.clientX + "px;";
    }
}
middleClick();