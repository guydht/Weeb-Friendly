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

function hasInternet() {
    return new Promise(resolve => {
        window.require("dns").lookup("google.com", function (err: any) {
            resolve(!(err && err.code === "ENOTFOUND"));
        })
    });
}

export { objectToFormData, stringCompare, stringRelativeSimilarity, levenshteinDistance, getCurrentSeason, hasInternet };
