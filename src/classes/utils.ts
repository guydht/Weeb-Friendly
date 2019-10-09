import { Seasons } from "jikants/dist/src/interfaces/season/Season";

function objectToFormData(object: object): FormData {
    let formData = new FormData();
    for (let key in object)
        formData.append(key, (object as any)[key]);
    return formData;
}


function levenshteinDistance(s1: string, s2: string): number {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    var costs = [];
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i === 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function stringRelativeSimilarity(str1: string, str2: string) {
    var longer = str1;
    var shorter = str2;
    if (str1.length < str2.length) {
        longer = str2;
        shorter = str1;
    }
    var longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - levenshteinDistance(longer, shorter)) / longerLength;
}

function stringCompare(givenString: string, toCompare: string) {
    let givenSplit = givenString.split(" "),
        compareSplit = toCompare.split(" ");
    let minDistances = givenSplit.map(givenWord => {
        return Math.min(
            ...compareSplit.map(compareWord => {
                return levenshteinDistance(givenWord, compareWord);
            })
        );
    });
    return minDistances.reduce((acc, curr) => acc + curr, 0);
}

function getCurrentSeason(): Seasons {
    let month = new Date().getMonth();
    switch (month) {
        case 12:
        case 1:
        case 2:
            return 'winter';
        case 3:
        case 4:
        case 5:
            return 'spring';
        case 6:
        case 7:
        case 8:
            return 'summer';
    }
    return "fall";
}

function hasInternet(): Promise<boolean> {
    return new Promise(resolve => {
        window.require("dns").lookup("google.com", function (err: any) {
            resolve(!(err && err.code === "ENOTFOUND"));
        })
    });
}

class CacheLocalStorage {
    static DEFAULT_TTL_DAYS = 30;
    storageKey: string;
    cacheTTLDays: number;
    storage: any;
    stoarge: any;
    constructor(storageKey: string, cacheTTLDays: number, initialStorage: any) {
        if (!storageKey)
            throw new Error("You must give me a valid key to store in localStorage!");
        this.storageKey = storageKey
        this.cacheTTLDays = cacheTTLDays || CacheLocalStorage.DEFAULT_TTL_DAYS;
        this.storage = initialStorage || JSON.parse(localStorage.getItem(storageKey) || "false") || {};
        for (let key in this.storage)
            this.storage[key][0] = new Date(this.storage[key][0]);
    }
    cleanCache() {
        for (let key in this.storage)
            if (this.storage[key][0] < new Date())
                delete this.stoarge[key];
        this.syncWithLocalStorage();
    }
    syncWithLocalStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
    }
    setItem(key: string | number, item: any) {
        this.cleanCache();
        this.storage[key] = [ttl_date(this.cacheTTLDays), item];
        this.syncWithLocalStorage();
    }
    getItem(key: string | number) {
        this.cleanCache();
        return (this.storage[key] || [])[1];
    }
}

function ttl_date(days: number) {
    let date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}


function chunkArray<T>(myArray: T[], chunk_size: number): T[][] {
    var results = [],
        arrayCopy = [...myArray];

    while (arrayCopy.length)
        results.push(arrayCopy.splice(0, chunk_size));
    return results;
}

function groupBy<T>(arr: T[], propertyPath: string[]): T[][] {
    let obj = new Map<any, T[]>();
    for (let ele of arr) {
        let value: any = (ele as any)[propertyPath[0]];
        for (let property of propertyPath.slice(1))
            value = value[property];
        obj.set(value, [ele].concat(obj.get(value) || []));
    }
    return [...obj.values()];
}

function Confirm(String: any, sendResponse: any, timer: any, yesText: any, noText: any) {
    String = String.charAt(0).toUpperCase() + String.replace(/\s\w|^./g, (letter: any) => letter.toUpperCase()).slice(1);
    var div = document.createElement("div"),
        stringDotsFlag = false,
        previousFocusedElement = document.activeElement;
    if (!sendResponse) sendResponse = function () { }
    div.dataset.string = String;
    if (stringDotsFlag) String = String.trim() + "...";
    var width = 1,
        elements = document.getElementsByClassName("GuydhtTemporaryBox"),
        top = 15,
        i = 0,
        array = [],
        asd = "<div style='position:absolute; bottom:0; width:100%; height:5px; background-color:rgba(255,255,255,0.3); opacity:0; overflow: hidden;' id='progressBar'><div style='width:100%; height:100%; background-color: rgba(0, 0, 0, 0.4); position: relative; left: -100%;' id='progress'></div></div>";
    for (i = 0; i < elements.length; i++)
        if ((elements[i] as any).style.top.includes("%")) array[i] = parseInt((elements[i] as any).style.top.replace("%", ""));
        else array[i] = 100 / (window.innerHeight / (Number((elements[i] as any).style.top.replace("px", "")) + 50));
    if (!yesText) yesText = "Yes";
    if (!noText) noText = "No";
    array.sort(function (a, b) {
        return a - b
    });
    for (i = 0; i < elements.length; i++) {
        if (top === array[i]) top = top + 15;
        else break;
    }
    div.innerHTML = "<h1 style='color:white; pointer-events: none; font-size:20px; line-height:normal; margin-bottom: 20px;'>" + String + "</h1><button class='Yes' style='color:white; border:none; float: left; margin-left: 100px; height:25px; margin-top: -5px; border-radius:7px; width:50px; background:rgba(81, 163, 81, 0.5); font-size: 13px; box-shadow: 0 0 12px rgb(153, 153, 153); left:15px; transition:all .5s; outline: 0; position:absolute; bottom: 8px;'>" + yesText + "</button><button class='No' style='color:white; border:none; float: right; margin-right: 100px; height:25px; margin-top: -5px; border-radius:7px; width:50px; background:rgba(163,81, 81, 0.5); font-size: 13px; box-shadow: 0 0 12px rgb(153, 153, 153); right:15px; transition:all .5s; outline: 0; position:absolute; bottom: 8px;' >" + noText + "</button>" + asd;
    (div as any).style = "cursor:default; text-align:center; box-shadow: 0 0 12px rgb(153, 153, 153); transition: all .5s; z-index:9999999999999; width: 450px; height: fit-content; background: rgb(81, 81, 163); opacity:0; left: calc(50% - 225px); padding: 10px 0;position:fixed; top: calc(" + top + "% - 50px);";

    div.className = "GuydhtTemporaryBox";
    div.onmouseenter = div.onmouseover = function () {
        (this as any).style.opacity = 1;
        (this as any).style.boxShadow = "0 0 12px rgb(30, 30, 30)";
        if (timer === true) clearInterval(loadConfirm);
    };
    div.onmouseleave = function () {
        (this as any).style.opacity = 0.8;
        (this as any).style.boxShadow = "0 0 12px rgb(153, 153, 153)";
        if (timer === true) loadConfirm = setInterval(loadingConfirm, 25);
    };
    document.body.appendChild(div);
    (div.children[1] as any).onmouseover = (div.children[2] as any).onmouseover = function () {
        (this as any).style.boxShadow = "0 0 12px rgb(30, 30, 30)";
    };
    (div.children[1] as any).onmouseout = (div.children[2] as any).onmouseout = function () {
        (this as any).style.boxShadow = "0 0 12px rgb(153, 153, 153)"
    };
    (div.children[1] as any).onclick = function () {
        (this as any).innerHTML += "✔";
        sendResponse(true);
        setTimeout(function () {
            div.remove();
        }, 500);
        div.onmouseleave = function () { };
        div.onmouseenter = function () { };
        div.style.opacity = "0";
        div.style.pointerEvents = "none";
        (previousFocusedElement as any).focus();
    };
    (div.children[2] as any).onclick = function () {
        this.innerHTML += "✔";
        sendResponse(false);
        setTimeout(function () {
            div.remove();
        }, 500);
        div.onmouseleave = function () { };
        div.onmouseenter = function () { };
        div.style.opacity = "0";
        div.style.pointerEvents = "none";
        (previousFocusedElement as any).focus();
    }
    document.addEventListener("keydown", keydown);
    div.tabIndex = 0;
    div.focus();
    div.style.outline = "none";

    function keydown(e: any): any {
        if (!(div as any).visible) return document.removeEventListener("keydown", keydown);
        e.stopPropagation();
        e.preventDefault();
        if (["KeyY", "Enter"].includes(e.code)) (div.children[1] as any).click();
        else if (["KeyN", "Escape"].includes(e.code)) (div.children[2] as any).click();
    }
    setTimeout(function () {
        div.style.opacity = "0.8";
    }, 0);
    if (timer === true) {
        (div.querySelector("#progressBar") as any).style.opacity = "1";
        var loadConfirm = setInterval(loadingConfirm, 25);
        div.onmouseup = function () {
            clearInterval(loadConfirm);
            setTimeout(function () {
                div.remove();
            }, 500);
            this.onmouseleave = function () { };
            this.onmouseenter = function () { };
            (this as any).style.opacity = 0;
            (this as any).style.pointerEvents = "none";
        }
    }
    var totalWidth = div.clientWidth;
    div.onresize = function () {
        totalWidth = div.clientWidth;
    };

    function loadingConfirm(this: any) {
        width += 4;
        if (width >= totalWidth) {
            setTimeout(function () {
                div.remove();
            }, 500);
            (this as any).onmouseout = function () { };
            (this as any).onmouseover = function () { };
            div.style.opacity = "0";
            div.style.pointerEvents = "none";
            clearInterval(loadConfirm);
        } else (div.querySelector("#progress") as any).style.transform = "translateX(" + width + "px)";
    }
}
export { objectToFormData, stringCompare, stringRelativeSimilarity, levenshteinDistance, getCurrentSeason, hasInternet, CacheLocalStorage, chunkArray, groupBy, Confirm };

