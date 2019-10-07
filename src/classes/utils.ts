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

export { objectToFormData, stringCompare, stringRelativeSimilarity, levenshteinDistance, getCurrentSeason, hasInternet, CacheLocalStorage, chunkArray , groupBy};