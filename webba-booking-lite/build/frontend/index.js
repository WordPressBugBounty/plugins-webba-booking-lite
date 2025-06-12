/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js":
/*!**************************************************************!*\
  !*** ./node_modules/@wojtekmaj/date-utils/dist/esm/index.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getCenturyEnd: () => (/* binding */ getCenturyEnd),
/* harmony export */   getCenturyRange: () => (/* binding */ getCenturyRange),
/* harmony export */   getCenturyStart: () => (/* binding */ getCenturyStart),
/* harmony export */   getDate: () => (/* binding */ getDate),
/* harmony export */   getDayEnd: () => (/* binding */ getDayEnd),
/* harmony export */   getDayRange: () => (/* binding */ getDayRange),
/* harmony export */   getDayStart: () => (/* binding */ getDayStart),
/* harmony export */   getDaysInMonth: () => (/* binding */ getDaysInMonth),
/* harmony export */   getDecadeEnd: () => (/* binding */ getDecadeEnd),
/* harmony export */   getDecadeRange: () => (/* binding */ getDecadeRange),
/* harmony export */   getDecadeStart: () => (/* binding */ getDecadeStart),
/* harmony export */   getHours: () => (/* binding */ getHours),
/* harmony export */   getHoursMinutes: () => (/* binding */ getHoursMinutes),
/* harmony export */   getHoursMinutesSeconds: () => (/* binding */ getHoursMinutesSeconds),
/* harmony export */   getISOLocalDate: () => (/* binding */ getISOLocalDate),
/* harmony export */   getISOLocalDateTime: () => (/* binding */ getISOLocalDateTime),
/* harmony export */   getISOLocalMonth: () => (/* binding */ getISOLocalMonth),
/* harmony export */   getMilliseconds: () => (/* binding */ getMilliseconds),
/* harmony export */   getMinutes: () => (/* binding */ getMinutes),
/* harmony export */   getMonth: () => (/* binding */ getMonth),
/* harmony export */   getMonthEnd: () => (/* binding */ getMonthEnd),
/* harmony export */   getMonthHuman: () => (/* binding */ getMonthHuman),
/* harmony export */   getMonthRange: () => (/* binding */ getMonthRange),
/* harmony export */   getMonthStart: () => (/* binding */ getMonthStart),
/* harmony export */   getNextCenturyEnd: () => (/* binding */ getNextCenturyEnd),
/* harmony export */   getNextCenturyStart: () => (/* binding */ getNextCenturyStart),
/* harmony export */   getNextDayEnd: () => (/* binding */ getNextDayEnd),
/* harmony export */   getNextDayStart: () => (/* binding */ getNextDayStart),
/* harmony export */   getNextDecadeEnd: () => (/* binding */ getNextDecadeEnd),
/* harmony export */   getNextDecadeStart: () => (/* binding */ getNextDecadeStart),
/* harmony export */   getNextMonthEnd: () => (/* binding */ getNextMonthEnd),
/* harmony export */   getNextMonthStart: () => (/* binding */ getNextMonthStart),
/* harmony export */   getNextYearEnd: () => (/* binding */ getNextYearEnd),
/* harmony export */   getNextYearStart: () => (/* binding */ getNextYearStart),
/* harmony export */   getPreviousCenturyEnd: () => (/* binding */ getPreviousCenturyEnd),
/* harmony export */   getPreviousCenturyStart: () => (/* binding */ getPreviousCenturyStart),
/* harmony export */   getPreviousDayEnd: () => (/* binding */ getPreviousDayEnd),
/* harmony export */   getPreviousDayStart: () => (/* binding */ getPreviousDayStart),
/* harmony export */   getPreviousDecadeEnd: () => (/* binding */ getPreviousDecadeEnd),
/* harmony export */   getPreviousDecadeStart: () => (/* binding */ getPreviousDecadeStart),
/* harmony export */   getPreviousMonthEnd: () => (/* binding */ getPreviousMonthEnd),
/* harmony export */   getPreviousMonthStart: () => (/* binding */ getPreviousMonthStart),
/* harmony export */   getPreviousYearEnd: () => (/* binding */ getPreviousYearEnd),
/* harmony export */   getPreviousYearStart: () => (/* binding */ getPreviousYearStart),
/* harmony export */   getSeconds: () => (/* binding */ getSeconds),
/* harmony export */   getYear: () => (/* binding */ getYear),
/* harmony export */   getYearEnd: () => (/* binding */ getYearEnd),
/* harmony export */   getYearRange: () => (/* binding */ getYearRange),
/* harmony export */   getYearStart: () => (/* binding */ getYearStart)
/* harmony export */ });
/**
 * Utils
 */
function makeGetEdgeOfNeighbor(getPeriod, getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborInternal(date, offset) {
        if (offset === void 0) { offset = defaultOffset; }
        var previousPeriod = getPeriod(date) + offset;
        return getEdgeOfPeriod(previousPeriod);
    };
}
function makeGetEnd(getBeginOfNextPeriod) {
    return function makeGetEndInternal(date) {
        return new Date(getBeginOfNextPeriod(date).getTime() - 1);
    };
}
function makeGetRange(getStart, getEnd) {
    return function makeGetRangeInternal(date) {
        return [getStart(date), getEnd(date)];
    };
}
/**
 * Simple getters - getting a property of a given point in time
 */
/**
 * Gets year from a given date.
 *
 * @param {DateLike} date Date to get year from
 * @returns {number} Year
 */
function getYear(date) {
    if (date instanceof Date) {
        return date.getFullYear();
    }
    if (typeof date === 'number') {
        return date;
    }
    var year = parseInt(date, 10);
    if (typeof date === 'string' && !isNaN(year)) {
        return year;
    }
    throw new Error("Failed to get year from date: ".concat(date, "."));
}
/**
 * Gets month from a given date.
 *
 * @param {Date} date Date to get month from
 * @returns {number} Month
 */
function getMonth(date) {
    if (date instanceof Date) {
        return date.getMonth();
    }
    throw new Error("Failed to get month from date: ".concat(date, "."));
}
/**
 * Gets human-readable month from a given date.
 *
 * @param {Date} date Date to get human-readable month from
 * @returns {number} Human-readable month
 */
function getMonthHuman(date) {
    if (date instanceof Date) {
        return date.getMonth() + 1;
    }
    throw new Error("Failed to get human-readable month from date: ".concat(date, "."));
}
/**
 * Gets day of the month from a given date.
 *
 * @param {Date} date Date to get day of the month from
 * @returns {number} Day of the month
 */
function getDate(date) {
    if (date instanceof Date) {
        return date.getDate();
    }
    throw new Error("Failed to get year from date: ".concat(date, "."));
}
/**
 * Gets hours from a given date.
 *
 * @param {Date | string} date Date to get hours from
 * @returns {number} Hours
 */
function getHours(date) {
    if (date instanceof Date) {
        return date.getHours();
    }
    if (typeof date === 'string') {
        var datePieces = date.split(':');
        if (datePieces.length >= 2) {
            var hoursString = datePieces[0];
            if (hoursString) {
                var hours = parseInt(hoursString, 10);
                if (!isNaN(hours)) {
                    return hours;
                }
            }
        }
    }
    throw new Error("Failed to get hours from date: ".concat(date, "."));
}
/**
 * Gets minutes from a given date.
 *
 * @param {Date | string} date Date to get minutes from
 * @returns {number} Minutes
 */
function getMinutes(date) {
    if (date instanceof Date) {
        return date.getMinutes();
    }
    if (typeof date === 'string') {
        var datePieces = date.split(':');
        if (datePieces.length >= 2) {
            var minutesString = datePieces[1] || '0';
            var minutes = parseInt(minutesString, 10);
            if (!isNaN(minutes)) {
                return minutes;
            }
        }
    }
    throw new Error("Failed to get minutes from date: ".concat(date, "."));
}
/**
 * Gets seconds from a given date.
 *
 * @param {Date | string} date Date to get seconds from
 * @returns {number} Seconds
 */
function getSeconds(date) {
    if (date instanceof Date) {
        return date.getSeconds();
    }
    if (typeof date === 'string') {
        var datePieces = date.split(':');
        if (datePieces.length >= 2) {
            var secondsWithMillisecondsString = datePieces[2] || '0';
            var seconds = parseInt(secondsWithMillisecondsString, 10);
            if (!isNaN(seconds)) {
                return seconds;
            }
        }
    }
    throw new Error("Failed to get seconds from date: ".concat(date, "."));
}
/**
 * Gets milliseconds from a given date.
 *
 * @param {Date | string} date Date to get milliseconds from
 * @returns {number} Milliseconds
 */
function getMilliseconds(date) {
    if (date instanceof Date) {
        return date.getMilliseconds();
    }
    if (typeof date === 'string') {
        var datePieces = date.split(':');
        if (datePieces.length >= 2) {
            var secondsWithMillisecondsString = datePieces[2] || '0';
            var millisecondsString = secondsWithMillisecondsString.split('.')[1] || '0';
            var milliseconds = parseInt(millisecondsString, 10);
            if (!isNaN(milliseconds)) {
                return milliseconds;
            }
        }
    }
    throw new Error("Failed to get seconds from date: ".concat(date, "."));
}
/**
 * Century
 */
/**
 * Gets century start date from a given date.
 *
 * @param {DateLike} date Date to get century start from
 * @returns {Date} Century start date
 */
function getCenturyStart(date) {
    var year = getYear(date);
    var centuryStartYear = year + ((-year + 1) % 100);
    var centuryStartDate = new Date();
    centuryStartDate.setFullYear(centuryStartYear, 0, 1);
    centuryStartDate.setHours(0, 0, 0, 0);
    return centuryStartDate;
}
/**
 * Gets previous century start date from a given date.
 *
 * @param {DateLike} date Date to get previous century start from
 * @returns {Date} Previous century start date
 */
var getPreviousCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, -100);
/**
 * Gets next century start date from a given date.
 *
 * @param {DateLike} date Date to get next century start from
 * @returns {Date} Next century start date
 */
var getNextCenturyStart = makeGetEdgeOfNeighbor(getYear, getCenturyStart, 100);
/**
 * Gets century end date from a given date.
 *
 * @param {DateLike} date Date to get century end from
 * @returns {Date} Century end date
 */
var getCenturyEnd = makeGetEnd(getNextCenturyStart);
/**
 * Gets previous century end date from a given date.
 *
 * @param {DateLike} date Date to get previous century end from
 * @returns {Date} Previous century end date
 */
var getPreviousCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, -100);
/**
 * Gets next century end date from a given date.
 *
 * @param {DateLike} date Date to get next century end from
 * @returns {Date} Next century end date
 */
var getNextCenturyEnd = makeGetEdgeOfNeighbor(getYear, getCenturyEnd, 100);
/**
 * Gets century start and end dates from a given date.
 *
 * @param {DateLike} date Date to get century start and end from
 * @returns {[Date, Date]} Century start and end dates
 */
var getCenturyRange = makeGetRange(getCenturyStart, getCenturyEnd);
/**
 * Decade
 */
/**
 * Gets decade start date from a given date.
 *
 * @param {DateLike} date Date to get decade start from
 * @returns {Date} Decade start date
 */
function getDecadeStart(date) {
    var year = getYear(date);
    var decadeStartYear = year + ((-year + 1) % 10);
    var decadeStartDate = new Date();
    decadeStartDate.setFullYear(decadeStartYear, 0, 1);
    decadeStartDate.setHours(0, 0, 0, 0);
    return decadeStartDate;
}
/**
 * Gets previous decade start date from a given date.
 *
 * @param {DateLike} date Date to get previous decade start from
 * @returns {Date} Previous decade start date
 */
var getPreviousDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, -10);
/**
 * Gets next decade start date from a given date.
 *
 * @param {DateLike} date Date to get next decade start from
 * @returns {Date} Next decade start date
 */
var getNextDecadeStart = makeGetEdgeOfNeighbor(getYear, getDecadeStart, 10);
/**
 * Gets decade end date from a given date.
 *
 * @param {DateLike} date Date to get decade end from
 * @returns {Date} Decade end date
 */
var getDecadeEnd = makeGetEnd(getNextDecadeStart);
/**
 * Gets previous decade end date from a given date.
 *
 * @param {DateLike} date Date to get previous decade end from
 * @returns {Date} Previous decade end date
 */
var getPreviousDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, -10);
/**
 * Gets next decade end date from a given date.
 *
 * @param {DateLike} date Date to get next decade end from
 * @returns {Date} Next decade end date
 */
var getNextDecadeEnd = makeGetEdgeOfNeighbor(getYear, getDecadeEnd, 10);
/**
 * Gets decade start and end dates from a given date.
 *
 * @param {DateLike} date Date to get decade start and end from
 * @returns {[Date, Date]} Decade start and end dates
 */
var getDecadeRange = makeGetRange(getDecadeStart, getDecadeEnd);
/**
 * Year
 */
/**
 * Gets year start date from a given date.
 *
 * @param {DateLike} date Date to get year start from
 * @returns {Date} Year start date
 */
function getYearStart(date) {
    var year = getYear(date);
    var yearStartDate = new Date();
    yearStartDate.setFullYear(year, 0, 1);
    yearStartDate.setHours(0, 0, 0, 0);
    return yearStartDate;
}
/**
 * Gets previous year start date from a given date.
 *
 * @param {DateLike} date Date to get previous year start from
 * @returns {Date} Previous year start date
 */
var getPreviousYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, -1);
/**
 * Gets next year start date from a given date.
 *
 * @param {DateLike} date Date to get next year start from
 * @returns {Date} Next year start date
 */
var getNextYearStart = makeGetEdgeOfNeighbor(getYear, getYearStart, 1);
/**
 * Gets year end date from a given date.
 *
 * @param {DateLike} date Date to get year end from
 * @returns {Date} Year end date
 */
var getYearEnd = makeGetEnd(getNextYearStart);
/**
 * Gets previous year end date from a given date.
 *
 * @param {DateLike} date Date to get previous year end from
 * @returns {Date} Previous year end date
 */
var getPreviousYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, -1);
/**
 * Gets next year end date from a given date.
 *
 * @param {DateLike} date Date to get next year end from
 * @returns {Date} Next year end date
 */
var getNextYearEnd = makeGetEdgeOfNeighbor(getYear, getYearEnd, 1);
/**
 * Gets year start and end dates from a given date.
 *
 * @param {DateLike} date Date to get year start and end from
 * @returns {[Date, Date]} Year start and end dates
 */
var getYearRange = makeGetRange(getYearStart, getYearEnd);
/**
 * Month
 */
function makeGetEdgeOfNeighborMonth(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborMonthInternal(date, offset) {
        if (offset === void 0) { offset = defaultOffset; }
        var year = getYear(date);
        var month = getMonth(date) + offset;
        var previousPeriod = new Date();
        previousPeriod.setFullYear(year, month, 1);
        previousPeriod.setHours(0, 0, 0, 0);
        return getEdgeOfPeriod(previousPeriod);
    };
}
/**
 * Gets month start date from a given date.
 *
 * @param {DateLike} date Date to get month start from
 * @returns {Date} Month start date
 */
function getMonthStart(date) {
    var year = getYear(date);
    var month = getMonth(date);
    var monthStartDate = new Date();
    monthStartDate.setFullYear(year, month, 1);
    monthStartDate.setHours(0, 0, 0, 0);
    return monthStartDate;
}
/**
 * Gets previous month start date from a given date.
 *
 * @param {DateLike} date Date to get previous month start from
 * @returns {Date} Previous month start date
 */
var getPreviousMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, -1);
/**
 * Gets next month start date from a given date.
 *
 * @param {DateLike} date Date to get next month start from
 * @returns {Date} Next month start date
 */
var getNextMonthStart = makeGetEdgeOfNeighborMonth(getMonthStart, 1);
/**
 * Gets month end date from a given date.
 *
 * @param {DateLike} date Date to get month end from
 * @returns {Date} Month end date
 */
var getMonthEnd = makeGetEnd(getNextMonthStart);
/**
 * Gets previous month end date from a given date.
 *
 * @param {DateLike} date Date to get previous month end from
 * @returns {Date} Previous month end date
 */
var getPreviousMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, -1);
/**
 * Gets next month end date from a given date.
 *
 * @param {DateLike} date Date to get next month end from
 * @returns {Date} Next month end date
 */
var getNextMonthEnd = makeGetEdgeOfNeighborMonth(getMonthEnd, 1);
/**
 * Gets month start and end dates from a given date.
 *
 * @param {DateLike} date Date to get month start and end from
 * @returns {[Date, Date]} Month start and end dates
 */
var getMonthRange = makeGetRange(getMonthStart, getMonthEnd);
/**
 * Day
 */
function makeGetEdgeOfNeighborDay(getEdgeOfPeriod, defaultOffset) {
    return function makeGetEdgeOfNeighborDayInternal(date, offset) {
        if (offset === void 0) { offset = defaultOffset; }
        var year = getYear(date);
        var month = getMonth(date);
        var day = getDate(date) + offset;
        var previousPeriod = new Date();
        previousPeriod.setFullYear(year, month, day);
        previousPeriod.setHours(0, 0, 0, 0);
        return getEdgeOfPeriod(previousPeriod);
    };
}
/**
 * Gets day start date from a given date.
 *
 * @param {DateLike} date Date to get day start from
 * @returns {Date} Day start date
 */
function getDayStart(date) {
    var year = getYear(date);
    var month = getMonth(date);
    var day = getDate(date);
    var dayStartDate = new Date();
    dayStartDate.setFullYear(year, month, day);
    dayStartDate.setHours(0, 0, 0, 0);
    return dayStartDate;
}
/**
 * Gets previous day start date from a given date.
 *
 * @param {DateLike} date Date to get previous day start from
 * @returns {Date} Previous day start date
 */
var getPreviousDayStart = makeGetEdgeOfNeighborDay(getDayStart, -1);
/**
 * Gets next day start date from a given date.
 *
 * @param {DateLike} date Date to get next day start from
 * @returns {Date} Next day start date
 */
var getNextDayStart = makeGetEdgeOfNeighborDay(getDayStart, 1);
/**
 * Gets day end date from a given date.
 *
 * @param {DateLike} date Date to get day end from
 * @returns {Date} Day end date
 */
var getDayEnd = makeGetEnd(getNextDayStart);
/**
 * Gets previous day end date from a given date.
 *
 * @param {DateLike} date Date to get previous day end from
 * @returns {Date} Previous day end date
 */
var getPreviousDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, -1);
/**
 * Gets next day end date from a given date.
 *
 * @param {DateLike} date Date to get next day end from
 * @returns {Date} Next day end date
 */
var getNextDayEnd = makeGetEdgeOfNeighborDay(getDayEnd, 1);
/**
 * Gets day start and end dates from a given date.
 *
 * @param {DateLike} date Date to get day start and end from
 * @returns {[Date, Date]} Day start and end dates
 */
var getDayRange = makeGetRange(getDayStart, getDayEnd);
/**
 * Other
 */
/**
 * Returns a number of days in a month of a given date.
 *
 * @param {Date} date Date
 * @returns {number} Number of days in a month
 */
function getDaysInMonth(date) {
    return getDate(getMonthEnd(date));
}
function padStart(num, val) {
    if (val === void 0) { val = 2; }
    var numStr = "".concat(num);
    if (numStr.length >= val) {
        return num;
    }
    return "0000".concat(numStr).slice(-val);
}
/**
 * Returns local hours and minutes (hh:mm).
 *
 * @param {Date | string} date Date to get hours and minutes from
 * @returns {string} Local hours and minutes
 */
function getHoursMinutes(date) {
    var hours = padStart(getHours(date));
    var minutes = padStart(getMinutes(date));
    return "".concat(hours, ":").concat(minutes);
}
/**
 * Returns local hours, minutes and seconds (hh:mm:ss).
 *
 * @param {Date | string} date Date to get hours, minutes and seconds from
 * @returns {string} Local hours, minutes and seconds
 */
function getHoursMinutesSeconds(date) {
    var hours = padStart(getHours(date));
    var minutes = padStart(getMinutes(date));
    var seconds = padStart(getSeconds(date));
    return "".concat(hours, ":").concat(minutes, ":").concat(seconds);
}
/**
 * Returns local month in ISO-like format (YYYY-MM).
 *
 * @param {Date} date Date to get month in ISO-like format from
 * @returns {string} Local month in ISO-like format
 */
function getISOLocalMonth(date) {
    var year = padStart(getYear(date), 4);
    var month = padStart(getMonthHuman(date));
    return "".concat(year, "-").concat(month);
}
/**
 * Returns local date in ISO-like format (YYYY-MM-DD).
 *
 * @param {Date} date Date to get date in ISO-like format from
 * @returns {string} Local date in ISO-like format
 */
function getISOLocalDate(date) {
    var year = padStart(getYear(date), 4);
    var month = padStart(getMonthHuman(date));
    var day = padStart(getDate(date));
    return "".concat(year, "-").concat(month, "-").concat(day);
}
/**
 * Returns local date & time in ISO-like format (YYYY-MM-DDThh:mm:ss).
 *
 * @param {Date} date Date to get date & time in ISO-like format from
 * @returns {string} Local date & time in ISO-like format
 */
function getISOLocalDateTime(date) {
    return "".concat(getISOLocalDate(date), "T").concat(getHoursMinutesSeconds(date));
}


/***/ }),

/***/ "./node_modules/get-user-locale/dist/esm/index.js":
/*!********************************************************!*\
  !*** ./node_modules/get-user-locale/dist/esm/index.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getUserLocale: () => (/* binding */ getUserLocale),
/* harmony export */   getUserLocales: () => (/* binding */ getUserLocales)
/* harmony export */ });
/* harmony import */ var mem__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mem */ "./node_modules/mem/dist/index.js");

function isString(el) {
    return typeof el === 'string';
}
function isUnique(el, index, arr) {
    return arr.indexOf(el) === index;
}
function isAllLowerCase(el) {
    return el.toLowerCase() === el;
}
function fixCommas(el) {
    return el.indexOf(',') === -1 ? el : el.split(',');
}
function normalizeLocale(locale) {
    if (!locale) {
        return locale;
    }
    if (locale === 'C' || locale === 'posix' || locale === 'POSIX') {
        return 'en-US';
    }
    // If there's a dot (.) in the locale, it's likely in the format of "en-US.UTF-8", so we only take the first part
    if (locale.indexOf('.') !== -1) {
        var _a = locale.split('.')[0], actualLocale = _a === void 0 ? '' : _a;
        return normalizeLocale(actualLocale);
    }
    // If there's an at sign (@) in the locale, it's likely in the format of "en-US@posix", so we only take the first part
    if (locale.indexOf('@') !== -1) {
        var _b = locale.split('@')[0], actualLocale = _b === void 0 ? '' : _b;
        return normalizeLocale(actualLocale);
    }
    // If there's a dash (-) in the locale and it's not all lower case, it's already in the format of "en-US", so we return it
    if (locale.indexOf('-') === -1 || !isAllLowerCase(locale)) {
        return locale;
    }
    var _c = locale.split('-'), splitEl1 = _c[0], _d = _c[1], splitEl2 = _d === void 0 ? '' : _d;
    return "".concat(splitEl1, "-").concat(splitEl2.toUpperCase());
}
function getUserLocalesInternal(_a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.useFallbackLocale, useFallbackLocale = _c === void 0 ? true : _c, _d = _b.fallbackLocale, fallbackLocale = _d === void 0 ? 'en-US' : _d;
    var languageList = [];
    if (typeof navigator !== 'undefined') {
        var rawLanguages = navigator.languages || [];
        var languages = [];
        for (var _i = 0, rawLanguages_1 = rawLanguages; _i < rawLanguages_1.length; _i++) {
            var rawLanguagesItem = rawLanguages_1[_i];
            languages = languages.concat(fixCommas(rawLanguagesItem));
        }
        var rawLanguage = navigator.language;
        var language = rawLanguage ? fixCommas(rawLanguage) : rawLanguage;
        languageList = languageList.concat(languages, language);
    }
    if (useFallbackLocale) {
        languageList.push(fallbackLocale);
    }
    return languageList.filter(isString).map(normalizeLocale).filter(isUnique);
}
var getUserLocales = mem__WEBPACK_IMPORTED_MODULE_0__(getUserLocalesInternal, { cacheKey: JSON.stringify });
function getUserLocaleInternal(options) {
    return getUserLocales(options)[0] || null;
}
var getUserLocale = mem__WEBPACK_IMPORTED_MODULE_0__(getUserLocaleInternal, { cacheKey: JSON.stringify });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getUserLocale);


/***/ }),

/***/ "./node_modules/map-age-cleaner/dist/index.js":
/*!****************************************************!*\
  !*** ./node_modules/map-age-cleaner/dist/index.js ***!
  \****************************************************/
/***/ (function(module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const p_defer_1 = __importDefault(__webpack_require__(/*! p-defer */ "./node_modules/p-defer/index.js"));
function mapAgeCleaner(map, property = 'maxAge') {
    let processingKey;
    let processingTimer;
    let processingDeferred;
    const cleanup = () => __awaiter(this, void 0, void 0, function* () {
        if (processingKey !== undefined) {
            // If we are already processing an item, we can safely exit
            return;
        }
        const setupTimer = (item) => __awaiter(this, void 0, void 0, function* () {
            processingDeferred = p_defer_1.default();
            const delay = item[1][property] - Date.now();
            if (delay <= 0) {
                // Remove the item immediately if the delay is equal to or below 0
                map.delete(item[0]);
                processingDeferred.resolve();
                return;
            }
            // Keep track of the current processed key
            processingKey = item[0];
            processingTimer = setTimeout(() => {
                // Remove the item when the timeout fires
                map.delete(item[0]);
                if (processingDeferred) {
                    processingDeferred.resolve();
                }
            }, delay);
            // tslint:disable-next-line:strict-type-predicates
            if (typeof processingTimer.unref === 'function') {
                // Don't hold up the process from exiting
                processingTimer.unref();
            }
            return processingDeferred.promise;
        });
        try {
            for (const entry of map) {
                yield setupTimer(entry);
            }
        }
        catch (_a) {
            // Do nothing if an error occurs, this means the timer was cleaned up and we should stop processing
        }
        processingKey = undefined;
    });
    const reset = () => {
        processingKey = undefined;
        if (processingTimer !== undefined) {
            clearTimeout(processingTimer);
            processingTimer = undefined;
        }
        if (processingDeferred !== undefined) { // tslint:disable-line:early-exit
            processingDeferred.reject(undefined);
            processingDeferred = undefined;
        }
    };
    const originalSet = map.set.bind(map);
    map.set = (key, value) => {
        if (map.has(key)) {
            // If the key already exist, remove it so we can add it back at the end of the map.
            map.delete(key);
        }
        // Call the original `map.set`
        const result = originalSet(key, value);
        // If we are already processing a key and the key added is the current processed key, stop processing it
        if (processingKey && processingKey === key) {
            reset();
        }
        // Always run the cleanup method in case it wasn't started yet
        cleanup(); // tslint:disable-line:no-floating-promises
        return result;
    };
    cleanup(); // tslint:disable-line:no-floating-promises
    return map;
}
exports["default"] = mapAgeCleaner;
// Add support for CJS
module.exports = mapAgeCleaner;
module.exports["default"] = mapAgeCleaner;


/***/ }),

/***/ "./node_modules/mem/dist/index.js":
/*!****************************************!*\
  !*** ./node_modules/mem/dist/index.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const mimicFn = __webpack_require__(/*! mimic-fn */ "./node_modules/mem/node_modules/mimic-fn/index.js");
const mapAgeCleaner = __webpack_require__(/*! map-age-cleaner */ "./node_modules/map-age-cleaner/dist/index.js");
const decoratorInstanceMap = new WeakMap();
const cacheStore = new WeakMap();
/**
[Memoize](https://en.wikipedia.org/wiki/Memoization) functions - An optimization used to speed up consecutive function calls by caching the result of calls with identical input.

@param fn - Function to be memoized.

@example
```
import mem = require('mem');

let i = 0;
const counter = () => ++i;
const memoized = mem(counter);

memoized('foo');
//=> 1

// Cached as it's the same arguments
memoized('foo');
//=> 1

// Not cached anymore as the arguments changed
memoized('bar');
//=> 2

memoized('bar');
//=> 2
```
*/
const mem = (fn, { cacheKey, cache = new Map(), maxAge } = {}) => {
    if (typeof maxAge === 'number') {
        // TODO: Drop after https://github.com/SamVerschueren/map-age-cleaner/issues/5
        // @ts-expect-error
        mapAgeCleaner(cache);
    }
    const memoized = function (...arguments_) {
        const key = cacheKey ? cacheKey(arguments_) : arguments_[0];
        const cacheItem = cache.get(key);
        if (cacheItem) {
            return cacheItem.data;
        }
        const result = fn.apply(this, arguments_);
        cache.set(key, {
            data: result,
            maxAge: maxAge ? Date.now() + maxAge : Number.POSITIVE_INFINITY
        });
        return result;
    };
    mimicFn(memoized, fn, {
        ignoreNonConfigurable: true
    });
    cacheStore.set(memoized, cache);
    return memoized;
};
/**
@returns A [decorator](https://github.com/tc39/proposal-decorators) to memoize class methods or static class methods.

@example
```
import mem = require('mem');

class Example {
    index = 0

    @mem.decorator()
    counter() {
        return ++this.index;
    }
}

class ExampleWithOptions {
    index = 0

    @mem.decorator({maxAge: 1000})
    counter() {
        return ++this.index;
    }
}
```
*/
mem.decorator = (options = {}) => (target, propertyKey, descriptor) => {
    const input = target[propertyKey];
    if (typeof input !== 'function') {
        throw new TypeError('The decorated value must be a function');
    }
    delete descriptor.value;
    delete descriptor.writable;
    descriptor.get = function () {
        if (!decoratorInstanceMap.has(this)) {
            const value = mem(input, options);
            decoratorInstanceMap.set(this, value);
            return value;
        }
        return decoratorInstanceMap.get(this);
    };
};
/**
Clear all cached data of a memoized function.

@param fn - Memoized function.
*/
mem.clear = (fn) => {
    const cache = cacheStore.get(fn);
    if (!cache) {
        throw new TypeError('Can\'t clear a function that was not memoized!');
    }
    if (typeof cache.clear !== 'function') {
        throw new TypeError('The cache Map can\'t be cleared!');
    }
    cache.clear();
};
module.exports = mem;


/***/ }),

/***/ "./node_modules/mem/node_modules/mimic-fn/index.js":
/*!*********************************************************!*\
  !*** ./node_modules/mem/node_modules/mimic-fn/index.js ***!
  \*********************************************************/
/***/ ((module) => {



const copyProperty = (to, from, property, ignoreNonConfigurable) => {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') {
		return;
	}

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') {
		return;
	}

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, fromDescriptor);
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
//  - one its descriptors is changed
//  - it is non-writable and its value is changed
const canCopyProperty = function (toDescriptor, fromDescriptor) {
	return toDescriptor === undefined || toDescriptor.configurable || (
		toDescriptor.writable === fromDescriptor.writable &&
		toDescriptor.enumerable === fromDescriptor.enumerable &&
		toDescriptor.configurable === fromDescriptor.configurable &&
		(toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
	);
};

const changePrototype = (to, from) => {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) {
		return;
	}

	Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to, from, name) => {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName);
	Object.defineProperty(to, 'toString', {...toStringDescriptor, value: newToString});
};

const mimicFn = (to, from, {ignoreNonConfigurable = false} = {}) => {
	const {name} = to;

	for (const property of Reflect.ownKeys(from)) {
		copyProperty(to, from, property, ignoreNonConfigurable);
	}

	changePrototype(to, from);
	changeToString(to, from, name);

	return to;
};

module.exports = mimicFn;


/***/ }),

/***/ "./node_modules/p-defer/index.js":
/*!***************************************!*\
  !*** ./node_modules/p-defer/index.js ***!
  \***************************************/
/***/ ((module) => {


module.exports = () => {
	const ret = {};

	ret.promise = new Promise((resolve, reject) => {
		ret.resolve = resolve;
		ret.reject = reject;
	});

	return ret;
};


/***/ }),

/***/ "./node_modules/react-calendar/dist/Calendar.css":
/*!*******************************************************!*\
  !*** ./node_modules/react-calendar/dist/Calendar.css ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/Calendar.js":
/*!**********************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/Calendar.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ "./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs");
/* harmony import */ var _Calendar_Navigation_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./Calendar/Navigation.js */ "./node_modules/react-calendar/dist/esm/Calendar/Navigation.js");
/* harmony import */ var _CenturyView_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./CenturyView.js */ "./node_modules/react-calendar/dist/esm/CenturyView.js");
/* harmony import */ var _DecadeView_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./DecadeView.js */ "./node_modules/react-calendar/dist/esm/DecadeView.js");
/* harmony import */ var _YearView_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./YearView.js */ "./node_modules/react-calendar/dist/esm/YearView.js");
/* harmony import */ var _MonthView_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./MonthView.js */ "./node_modules/react-calendar/dist/esm/MonthView.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
/* harmony import */ var _shared_utils_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./shared/utils.js */ "./node_modules/react-calendar/dist/esm/shared/utils.js");
'use client';
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};










var baseClassName = 'react-calendar';
var allViews = ['century', 'decade', 'year', 'month'];
var allValueTypes = ['decade', 'year', 'month', 'day'];
var defaultMinDate = new Date();
defaultMinDate.setFullYear(1, 0, 1);
defaultMinDate.setHours(0, 0, 0, 0);
var defaultMaxDate = new Date(8.64e15);
function toDate(value) {
    if (value instanceof Date) {
        return value;
    }
    return new Date(value);
}
/**
 * Returns views array with disallowed values cut off.
 */
function getLimitedViews(minDetail, maxDetail) {
    return allViews.slice(allViews.indexOf(minDetail), allViews.indexOf(maxDetail) + 1);
}
/**
 * Determines whether a given view is allowed with currently applied settings.
 */
function isViewAllowed(view, minDetail, maxDetail) {
    var views = getLimitedViews(minDetail, maxDetail);
    return views.indexOf(view) !== -1;
}
/**
 * Gets either provided view if allowed by minDetail and maxDetail, or gets
 * the default view if not allowed.
 */
function getView(view, minDetail, maxDetail) {
    if (!view) {
        return maxDetail;
    }
    if (isViewAllowed(view, minDetail, maxDetail)) {
        return view;
    }
    return maxDetail;
}
/**
 * Returns value type that can be returned with currently applied settings.
 */
function getValueType(view) {
    var index = allViews.indexOf(view);
    return allValueTypes[index];
}
function getValue(value, index) {
    var rawValue = Array.isArray(value) ? value[index] : value;
    if (!rawValue) {
        return null;
    }
    var valueDate = toDate(rawValue);
    if (Number.isNaN(valueDate.getTime())) {
        throw new Error("Invalid date: ".concat(value));
    }
    return valueDate;
}
function getDetailValue(_a, index) {
    var value = _a.value, minDate = _a.minDate, maxDate = _a.maxDate, maxDetail = _a.maxDetail;
    var valuePiece = getValue(value, index);
    if (!valuePiece) {
        return null;
    }
    var valueType = getValueType(maxDetail);
    var detailValueFrom = (function () {
        switch (index) {
            case 0:
                return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(valueType, valuePiece);
            case 1:
                return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getEnd)(valueType, valuePiece);
            default:
                throw new Error("Invalid index value: ".concat(index));
        }
    })();
    return (0,_shared_utils_js__WEBPACK_IMPORTED_MODULE_4__.between)(detailValueFrom, minDate, maxDate);
}
var getDetailValueFrom = function (args) { return getDetailValue(args, 0); };
var getDetailValueTo = function (args) { return getDetailValue(args, 1); };
var getDetailValueArray = function (args) {
    return [getDetailValueFrom, getDetailValueTo].map(function (fn) { return fn(args); });
};
function getActiveStartDate(_a) {
    var maxDate = _a.maxDate, maxDetail = _a.maxDetail, minDate = _a.minDate, minDetail = _a.minDetail, value = _a.value, view = _a.view;
    var rangeType = getView(view, minDetail, maxDetail);
    var valueFrom = getDetailValueFrom({
        value: value,
        minDate: minDate,
        maxDate: maxDate,
        maxDetail: maxDetail,
    }) || new Date();
    return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(rangeType, valueFrom);
}
function getInitialActiveStartDate(_a) {
    var activeStartDate = _a.activeStartDate, defaultActiveStartDate = _a.defaultActiveStartDate, defaultValue = _a.defaultValue, defaultView = _a.defaultView, maxDate = _a.maxDate, maxDetail = _a.maxDetail, minDate = _a.minDate, minDetail = _a.minDetail, value = _a.value, view = _a.view;
    var rangeType = getView(view, minDetail, maxDetail);
    var valueFrom = activeStartDate || defaultActiveStartDate;
    if (valueFrom) {
        return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(rangeType, valueFrom);
    }
    return getActiveStartDate({
        maxDate: maxDate,
        maxDetail: maxDetail,
        minDate: minDate,
        minDetail: minDetail,
        value: value || defaultValue,
        view: view || defaultView,
    });
}
function getIsSingleValue(value) {
    return value && (!Array.isArray(value) || value.length === 1);
}
function areDatesEqual(date1, date2) {
    return date1 instanceof Date && date2 instanceof Date && date1.getTime() === date2.getTime();
}
var Calendar = (0,react__WEBPACK_IMPORTED_MODULE_1__.forwardRef)(function Calendar(props, ref) {
    var activeStartDateProps = props.activeStartDate, allowPartialRange = props.allowPartialRange, calendarType = props.calendarType, className = props.className, defaultActiveStartDate = props.defaultActiveStartDate, defaultValue = props.defaultValue, defaultView = props.defaultView, formatDay = props.formatDay, formatLongDate = props.formatLongDate, formatMonth = props.formatMonth, formatMonthYear = props.formatMonthYear, formatShortWeekday = props.formatShortWeekday, formatWeekday = props.formatWeekday, formatYear = props.formatYear, _a = props.goToRangeStartOnSelect, goToRangeStartOnSelect = _a === void 0 ? true : _a, inputRef = props.inputRef, locale = props.locale, _b = props.maxDate, maxDate = _b === void 0 ? defaultMaxDate : _b, _c = props.maxDetail, maxDetail = _c === void 0 ? 'month' : _c, _d = props.minDate, minDate = _d === void 0 ? defaultMinDate : _d, _e = props.minDetail, minDetail = _e === void 0 ? 'century' : _e, navigationAriaLabel = props.navigationAriaLabel, navigationAriaLive = props.navigationAriaLive, navigationLabel = props.navigationLabel, next2AriaLabel = props.next2AriaLabel, next2Label = props.next2Label, nextAriaLabel = props.nextAriaLabel, nextLabel = props.nextLabel, onActiveStartDateChange = props.onActiveStartDateChange, onChangeProps = props.onChange, onClickDay = props.onClickDay, onClickDecade = props.onClickDecade, onClickMonth = props.onClickMonth, onClickWeekNumber = props.onClickWeekNumber, onClickYear = props.onClickYear, onDrillDown = props.onDrillDown, onDrillUp = props.onDrillUp, onViewChange = props.onViewChange, prev2AriaLabel = props.prev2AriaLabel, prev2Label = props.prev2Label, prevAriaLabel = props.prevAriaLabel, prevLabel = props.prevLabel, _f = props.returnValue, returnValue = _f === void 0 ? 'start' : _f, selectRange = props.selectRange, showDoubleView = props.showDoubleView, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks, _g = props.showNavigation, showNavigation = _g === void 0 ? true : _g, showNeighboringCentury = props.showNeighboringCentury, showNeighboringDecade = props.showNeighboringDecade, _h = props.showNeighboringMonth, showNeighboringMonth = _h === void 0 ? true : _h, showWeekNumbers = props.showWeekNumbers, tileClassName = props.tileClassName, tileContent = props.tileContent, tileDisabled = props.tileDisabled, valueProps = props.value, viewProps = props.view;
    var _j = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(defaultActiveStartDate), activeStartDateState = _j[0], setActiveStartDateState = _j[1];
    var _k = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(null), hoverState = _k[0], setHoverState = _k[1];
    var _l = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(Array.isArray(defaultValue)
        ? defaultValue.map(function (el) { return (el !== null ? toDate(el) : null); })
        : defaultValue !== null && defaultValue !== undefined
            ? toDate(defaultValue)
            : null), valueState = _l[0], setValueState = _l[1];
    var _m = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(defaultView), viewState = _m[0], setViewState = _m[1];
    var activeStartDate = activeStartDateProps ||
        activeStartDateState ||
        getInitialActiveStartDate({
            activeStartDate: activeStartDateProps,
            defaultActiveStartDate: defaultActiveStartDate,
            defaultValue: defaultValue,
            defaultView: defaultView,
            maxDate: maxDate,
            maxDetail: maxDetail,
            minDate: minDate,
            minDetail: minDetail,
            value: valueProps,
            view: viewProps,
        });
    var value = (function () {
        var rawValue = (function () {
            // In the middle of range selection, use value from state
            if (selectRange && getIsSingleValue(valueState)) {
                return valueState;
            }
            return valueProps !== undefined ? valueProps : valueState;
        })();
        if (!rawValue) {
            return null;
        }
        return Array.isArray(rawValue)
            ? rawValue.map(function (el) { return (el !== null ? toDate(el) : null); })
            : rawValue !== null
                ? toDate(rawValue)
                : null;
    })();
    var valueType = getValueType(maxDetail);
    var view = getView(viewProps || viewState, minDetail, maxDetail);
    var views = getLimitedViews(minDetail, maxDetail);
    var hover = selectRange ? hoverState : null;
    var drillDownAvailable = views.indexOf(view) < views.length - 1;
    var drillUpAvailable = views.indexOf(view) > 0;
    var getProcessedValue = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function (value) {
        var processFunction = (function () {
            switch (returnValue) {
                case 'start':
                    return getDetailValueFrom;
                case 'end':
                    return getDetailValueTo;
                case 'range':
                    return getDetailValueArray;
                default:
                    throw new Error('Invalid returnValue.');
            }
        })();
        return processFunction({
            maxDate: maxDate,
            maxDetail: maxDetail,
            minDate: minDate,
            value: value,
        });
    }, [maxDate, maxDetail, minDate, returnValue]);
    var setActiveStartDate = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function (nextActiveStartDate, action) {
        setActiveStartDateState(nextActiveStartDate);
        var args = {
            action: action,
            activeStartDate: nextActiveStartDate,
            value: value,
            view: view,
        };
        if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
            onActiveStartDateChange(args);
        }
    }, [activeStartDate, onActiveStartDateChange, value, view]);
    var onClickTile = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function (value, event) {
        var callback = (function () {
            switch (view) {
                case 'century':
                    return onClickDecade;
                case 'decade':
                    return onClickYear;
                case 'year':
                    return onClickMonth;
                case 'month':
                    return onClickDay;
                default:
                    throw new Error("Invalid view: ".concat(view, "."));
            }
        })();
        if (callback)
            callback(value, event);
    }, [onClickDay, onClickDecade, onClickMonth, onClickYear, view]);
    var drillDown = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function (nextActiveStartDate, event) {
        if (!drillDownAvailable) {
            return;
        }
        onClickTile(nextActiveStartDate, event);
        var nextView = views[views.indexOf(view) + 1];
        if (!nextView) {
            throw new Error('Attempted to drill down from the lowest view.');
        }
        setActiveStartDateState(nextActiveStartDate);
        setViewState(nextView);
        var args = {
            action: 'drillDown',
            activeStartDate: nextActiveStartDate,
            value: value,
            view: nextView,
        };
        if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
            onActiveStartDateChange(args);
        }
        if (onViewChange && view !== nextView) {
            onViewChange(args);
        }
        if (onDrillDown) {
            onDrillDown(args);
        }
    }, [
        activeStartDate,
        drillDownAvailable,
        onActiveStartDateChange,
        onClickTile,
        onDrillDown,
        onViewChange,
        value,
        view,
        views,
    ]);
    var drillUp = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function () {
        if (!drillUpAvailable) {
            return;
        }
        var nextView = views[views.indexOf(view) - 1];
        if (!nextView) {
            throw new Error('Attempted to drill up from the highest view.');
        }
        var nextActiveStartDate = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(nextView, activeStartDate);
        setActiveStartDateState(nextActiveStartDate);
        setViewState(nextView);
        var args = {
            action: 'drillUp',
            activeStartDate: nextActiveStartDate,
            value: value,
            view: nextView,
        };
        if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
            onActiveStartDateChange(args);
        }
        if (onViewChange && view !== nextView) {
            onViewChange(args);
        }
        if (onDrillUp) {
            onDrillUp(args);
        }
    }, [
        activeStartDate,
        drillUpAvailable,
        onActiveStartDateChange,
        onDrillUp,
        onViewChange,
        value,
        view,
        views,
    ]);
    var onChange = (0,react__WEBPACK_IMPORTED_MODULE_1__.useCallback)(function (rawNextValue, event) {
        var previousValue = value;
        onClickTile(rawNextValue, event);
        var isFirstValueInRange = selectRange && !getIsSingleValue(previousValue);
        var nextValue;
        if (selectRange) {
            // Range selection turned on
            if (isFirstValueInRange) {
                // Value has 0 or 2 elements - either way we're starting a new array
                // First value
                nextValue = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(valueType, rawNextValue);
            }
            else {
                if (!previousValue) {
                    throw new Error('previousValue is required');
                }
                if (Array.isArray(previousValue)) {
                    throw new Error('previousValue must not be an array');
                }
                // Second value
                nextValue = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getValueRange)(valueType, previousValue, rawNextValue);
            }
        }
        else {
            // Range selection turned off
            nextValue = getProcessedValue(rawNextValue);
        }
        var nextActiveStartDate = 
        // Range selection turned off
        !selectRange ||
            // Range selection turned on, first value
            isFirstValueInRange ||
            // Range selection turned on, second value, goToRangeStartOnSelect toggled on
            goToRangeStartOnSelect
            ? getActiveStartDate({
                maxDate: maxDate,
                maxDetail: maxDetail,
                minDate: minDate,
                minDetail: minDetail,
                value: nextValue,
                view: view,
            })
            : null;
        event.persist();
        setActiveStartDateState(nextActiveStartDate);
        setValueState(nextValue);
        var args = {
            action: 'onChange',
            activeStartDate: nextActiveStartDate,
            value: nextValue,
            view: view,
        };
        if (onActiveStartDateChange && !areDatesEqual(activeStartDate, nextActiveStartDate)) {
            onActiveStartDateChange(args);
        }
        if (onChangeProps) {
            if (selectRange) {
                var isSingleValue = getIsSingleValue(nextValue);
                if (!isSingleValue) {
                    onChangeProps(nextValue || null, event);
                }
                else if (allowPartialRange) {
                    if (Array.isArray(nextValue)) {
                        throw new Error('value must not be an array');
                    }
                    onChangeProps([nextValue || null, null], event);
                }
            }
            else {
                onChangeProps(nextValue || null, event);
            }
        }
    }, [
        activeStartDate,
        allowPartialRange,
        getProcessedValue,
        goToRangeStartOnSelect,
        maxDate,
        maxDetail,
        minDate,
        minDetail,
        onActiveStartDateChange,
        onChangeProps,
        onClickTile,
        selectRange,
        value,
        valueType,
        view,
    ]);
    function onMouseOver(nextHover) {
        setHoverState(nextHover);
    }
    function onMouseLeave() {
        setHoverState(null);
    }
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useImperativeHandle)(ref, function () { return ({
        activeStartDate: activeStartDate,
        drillDown: drillDown,
        drillUp: drillUp,
        onChange: onChange,
        setActiveStartDate: setActiveStartDate,
        value: value,
        view: view,
    }); }, [activeStartDate, drillDown, drillUp, onChange, setActiveStartDate, value, view]);
    function renderContent(next) {
        var currentActiveStartDate = next
            ? (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBeginNext)(view, activeStartDate)
            : (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_3__.getBegin)(view, activeStartDate);
        var onClick = drillDownAvailable ? drillDown : onChange;
        var commonProps = {
            activeStartDate: currentActiveStartDate,
            hover: hover,
            locale: locale,
            maxDate: maxDate,
            minDate: minDate,
            onClick: onClick,
            onMouseOver: selectRange ? onMouseOver : undefined,
            tileClassName: tileClassName,
            tileContent: tileContent,
            tileDisabled: tileDisabled,
            value: value,
            valueType: valueType,
        };
        switch (view) {
            case 'century': {
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_CenturyView_js__WEBPACK_IMPORTED_MODULE_5__["default"], __assign({ formatYear: formatYear, showNeighboringCentury: showNeighboringCentury }, commonProps)));
            }
            case 'decade': {
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_DecadeView_js__WEBPACK_IMPORTED_MODULE_6__["default"], __assign({ formatYear: formatYear, showNeighboringDecade: showNeighboringDecade }, commonProps)));
            }
            case 'year': {
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_YearView_js__WEBPACK_IMPORTED_MODULE_7__["default"], __assign({ formatMonth: formatMonth, formatMonthYear: formatMonthYear }, commonProps)));
            }
            case 'month': {
                return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_MonthView_js__WEBPACK_IMPORTED_MODULE_8__["default"], __assign({ calendarType: calendarType, formatDay: formatDay, formatLongDate: formatLongDate, formatShortWeekday: formatShortWeekday, formatWeekday: formatWeekday, onClickWeekNumber: onClickWeekNumber, onMouseLeave: selectRange ? onMouseLeave : undefined, showFixedNumberOfWeeks: typeof showFixedNumberOfWeeks !== 'undefined'
                        ? showFixedNumberOfWeeks
                        : showDoubleView, showNeighboringMonth: showNeighboringMonth, showWeekNumbers: showWeekNumbers }, commonProps)));
            }
            default:
                throw new Error("Invalid view: ".concat(view, "."));
        }
    }
    function renderNavigation() {
        if (!showNavigation) {
            return null;
        }
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Calendar_Navigation_js__WEBPACK_IMPORTED_MODULE_9__["default"], { activeStartDate: activeStartDate, drillUp: drillUp, formatMonthYear: formatMonthYear, formatYear: formatYear, locale: locale, maxDate: maxDate, minDate: minDate, navigationAriaLabel: navigationAriaLabel, navigationAriaLive: navigationAriaLive, navigationLabel: navigationLabel, next2AriaLabel: next2AriaLabel, next2Label: next2Label, nextAriaLabel: nextAriaLabel, nextLabel: nextLabel, prev2AriaLabel: prev2AriaLabel, prev2Label: prev2Label, prevAriaLabel: prevAriaLabel, prevLabel: prevLabel, setActiveStartDate: setActiveStartDate, showDoubleView: showDoubleView, view: view, views: views }));
    }
    var valueArray = Array.isArray(value) ? value : [value];
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__["default"])(baseClassName, selectRange && valueArray.length === 1 && "".concat(baseClassName, "--selectRange"), showDoubleView && "".concat(baseClassName, "--doubleView"), className), ref: inputRef, children: [renderNavigation(), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "".concat(baseClassName, "__viewContainer"), onBlur: selectRange ? onMouseLeave : undefined, onMouseLeave: selectRange ? onMouseLeave : undefined, children: [renderContent(), showDoubleView ? renderContent(true) : null] })] }));
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Calendar);


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/Calendar/Navigation.js":
/*!*********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/Calendar/Navigation.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Navigation)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var get_user_locale__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! get-user-locale */ "./node_modules/get-user-locale/dist/esm/index.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");
'use client';




var className = 'react-calendar__navigation';
function Navigation(_a) {
    var activeStartDate = _a.activeStartDate, drillUp = _a.drillUp, _b = _a.formatMonthYear, formatMonthYear = _b === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatMonthYear : _b, _c = _a.formatYear, formatYear = _c === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatYear : _c, locale = _a.locale, maxDate = _a.maxDate, minDate = _a.minDate, _d = _a.navigationAriaLabel, navigationAriaLabel = _d === void 0 ? '' : _d, navigationAriaLive = _a.navigationAriaLive, navigationLabel = _a.navigationLabel, _e = _a.next2AriaLabel, next2AriaLabel = _e === void 0 ? '' : _e, _f = _a.next2Label, next2Label = _f === void 0 ? '»' : _f, _g = _a.nextAriaLabel, nextAriaLabel = _g === void 0 ? '' : _g, _h = _a.nextLabel, nextLabel = _h === void 0 ? '›' : _h, _j = _a.prev2AriaLabel, prev2AriaLabel = _j === void 0 ? '' : _j, _k = _a.prev2Label, prev2Label = _k === void 0 ? '«' : _k, _l = _a.prevAriaLabel, prevAriaLabel = _l === void 0 ? '' : _l, _m = _a.prevLabel, prevLabel = _m === void 0 ? '‹' : _m, setActiveStartDate = _a.setActiveStartDate, showDoubleView = _a.showDoubleView, view = _a.view, views = _a.views;
    var drillUpAvailable = views.indexOf(view) > 0;
    var shouldShowPrevNext2Buttons = view !== 'century';
    var previousActiveStartDate = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getBeginPrevious)(view, activeStartDate);
    var previousActiveStartDate2 = shouldShowPrevNext2Buttons
        ? (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getBeginPrevious2)(view, activeStartDate)
        : undefined;
    var nextActiveStartDate = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getBeginNext)(view, activeStartDate);
    var nextActiveStartDate2 = shouldShowPrevNext2Buttons
        ? (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getBeginNext2)(view, activeStartDate)
        : undefined;
    var prevButtonDisabled = (function () {
        if (previousActiveStartDate.getFullYear() < 0) {
            return true;
        }
        var previousActiveEndDate = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getEndPrevious)(view, activeStartDate);
        return minDate && minDate >= previousActiveEndDate;
    })();
    var prev2ButtonDisabled = shouldShowPrevNext2Buttons &&
        (function () {
            if (previousActiveStartDate2.getFullYear() < 0) {
                return true;
            }
            var previousActiveEndDate = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getEndPrevious2)(view, activeStartDate);
            return minDate && minDate >= previousActiveEndDate;
        })();
    var nextButtonDisabled = maxDate && maxDate < nextActiveStartDate;
    var next2ButtonDisabled = shouldShowPrevNext2Buttons && maxDate && maxDate < nextActiveStartDate2;
    function onClickPrevious() {
        setActiveStartDate(previousActiveStartDate, 'prev');
    }
    function onClickPrevious2() {
        setActiveStartDate(previousActiveStartDate2, 'prev2');
    }
    function onClickNext() {
        setActiveStartDate(nextActiveStartDate, 'next');
    }
    function onClickNext2() {
        setActiveStartDate(nextActiveStartDate2, 'next2');
    }
    function renderLabel(date) {
        var label = (function () {
            switch (view) {
                case 'century':
                    return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getCenturyLabel)(locale, formatYear, date);
                case 'decade':
                    return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getDecadeLabel)(locale, formatYear, date);
                case 'year':
                    return formatYear(locale, date);
                case 'month':
                    return formatMonthYear(locale, date);
                default:
                    throw new Error("Invalid view: ".concat(view, "."));
            }
        })();
        return navigationLabel
            ? navigationLabel({
                date: date,
                label: label,
                locale: locale || (0,get_user_locale__WEBPACK_IMPORTED_MODULE_3__.getUserLocale)() || undefined,
                view: view,
            })
            : label;
    }
    function renderButton() {
        var labelClassName = "".concat(className, "__label");
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { "aria-label": navigationAriaLabel, "aria-live": navigationAriaLive, className: labelClassName, disabled: !drillUpAvailable, onClick: drillUp, style: { flexGrow: 1 }, type: "button", children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--from"), children: renderLabel(activeStartDate) }), showDoubleView ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, { children: [(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "".concat(labelClassName, "__divider"), children: " \u2013 " }), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { className: "".concat(labelClassName, "__labelText ").concat(labelClassName, "__labelText--to"), children: renderLabel(nextActiveStartDate) })] })) : null] }));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: className, children: [prev2Label !== null && shouldShowPrevNext2Buttons ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { "aria-label": prev2AriaLabel, className: "".concat(className, "__arrow ").concat(className, "__prev2-button"), disabled: prev2ButtonDisabled, onClick: onClickPrevious2, type: "button", children: prev2Label })) : null, prevLabel !== null && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { "aria-label": prevAriaLabel, className: "".concat(className, "__arrow ").concat(className, "__prev-button"), disabled: prevButtonDisabled, onClick: onClickPrevious, type: "button", children: prevLabel })), renderButton(), nextLabel !== null && ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { "aria-label": nextAriaLabel, className: "".concat(className, "__arrow ").concat(className, "__next-button"), disabled: nextButtonDisabled, onClick: onClickNext, type: "button", children: nextLabel })), next2Label !== null && shouldShowPrevNext2Buttons ? ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { "aria-label": next2AriaLabel, className: "".concat(className, "__arrow ").concat(className, "__next2-button"), disabled: next2ButtonDisabled, onClick: onClickNext2, type: "button", children: next2Label })) : null] }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/CenturyView.js":
/*!*************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/CenturyView.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CenturyView)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _CenturyView_Decades_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CenturyView/Decades.js */ "./node_modules/react-calendar/dist/esm/CenturyView/Decades.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


/**
 * Displays a given century.
 */
function CenturyView(props) {
    function renderDecades() {
        return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_CenturyView_Decades_js__WEBPACK_IMPORTED_MODULE_1__["default"], __assign({}, props));
    }
    return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "react-calendar__century-view", children: renderDecades() });
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/CenturyView/Decade.js":
/*!********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/CenturyView/Decade.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Decade)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _Tile_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Tile.js */ "./node_modules/react-calendar/dist/esm/Tile.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





var className = 'react-calendar__century-view__decades__decade';
function Decade(_a) {
    var _b = _a.classes, classes = _b === void 0 ? [] : _b, currentCentury = _a.currentCentury, _c = _a.formatYear, formatYear = _c === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatYear : _c, otherProps = __rest(_a, ["classes", "currentCentury", "formatYear"]);
    var date = otherProps.date, locale = otherProps.locale;
    var classesProps = [];
    if (classes) {
        classesProps.push.apply(classesProps, classes);
    }
    if (className) {
        classesProps.push(className);
    }
    if ((0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getCenturyStart)(date).getFullYear() !== currentCentury) {
        classesProps.push("".concat(className, "--neighboringCentury"));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tile_js__WEBPACK_IMPORTED_MODULE_3__["default"], __assign({}, otherProps, { classes: classesProps, maxDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getDecadeEnd, minDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getDecadeStart, view: "century", children: (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_4__.getDecadeLabel)(locale, formatYear, date) })));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/CenturyView/Decades.js":
/*!*********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/CenturyView/Decades.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Decades)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _TileGroup_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TileGroup.js */ "./node_modules/react-calendar/dist/esm/TileGroup.js");
/* harmony import */ var _Decade_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Decade.js */ "./node_modules/react-calendar/dist/esm/CenturyView/Decade.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





function Decades(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, showNeighboringCentury = props.showNeighboringCentury, value = props.value, valueType = props.valueType, otherProps = __rest(props, ["activeStartDate", "hover", "showNeighboringCentury", "value", "valueType"]);
    var start = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_1__.getBeginOfCenturyYear)(activeStartDate);
    var end = start + (showNeighboringCentury ? 119 : 99);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_TileGroup_js__WEBPACK_IMPORTED_MODULE_2__["default"], { className: "react-calendar__century-view__decades", dateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getDecadeStart, dateType: "decade", end: end, hover: hover, renderTile: function (_a) {
            var date = _a.date, otherTileProps = __rest(_a, ["date"]);
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Decade_js__WEBPACK_IMPORTED_MODULE_4__["default"], __assign({}, otherProps, otherTileProps, { activeStartDate: activeStartDate, currentCentury: start, date: date }), date.getTime()));
        }, start: start, step: 10, value: value, valueType: valueType }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/DecadeView.js":
/*!************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/DecadeView.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DecadeView)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _DecadeView_Years_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./DecadeView/Years.js */ "./node_modules/react-calendar/dist/esm/DecadeView/Years.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


/**
 * Displays a given decade.
 */
function DecadeView(props) {
    function renderYears() {
        return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_DecadeView_Years_js__WEBPACK_IMPORTED_MODULE_1__["default"], __assign({}, props));
    }
    return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "react-calendar__decade-view", children: renderYears() });
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/DecadeView/Year.js":
/*!*****************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/DecadeView/Year.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Year)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _Tile_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Tile.js */ "./node_modules/react-calendar/dist/esm/Tile.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};




var className = 'react-calendar__decade-view__years__year';
function Year(_a) {
    var _b = _a.classes, classes = _b === void 0 ? [] : _b, currentDecade = _a.currentDecade, _c = _a.formatYear, formatYear = _c === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatYear : _c, otherProps = __rest(_a, ["classes", "currentDecade", "formatYear"]);
    var date = otherProps.date, locale = otherProps.locale;
    var classesProps = [];
    if (classes) {
        classesProps.push.apply(classesProps, classes);
    }
    if (className) {
        classesProps.push(className);
    }
    if ((0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getDecadeStart)(date).getFullYear() !== currentDecade) {
        classesProps.push("".concat(className, "--neighboringDecade"));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tile_js__WEBPACK_IMPORTED_MODULE_3__["default"], __assign({}, otherProps, { classes: classesProps, maxDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getYearEnd, minDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_2__.getYearStart, view: "decade", children: formatYear(locale, date) })));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/DecadeView/Years.js":
/*!******************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/DecadeView/Years.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Years)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _TileGroup_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TileGroup.js */ "./node_modules/react-calendar/dist/esm/TileGroup.js");
/* harmony import */ var _Year_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Year.js */ "./node_modules/react-calendar/dist/esm/DecadeView/Year.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





function Years(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, showNeighboringDecade = props.showNeighboringDecade, value = props.value, valueType = props.valueType, otherProps = __rest(props, ["activeStartDate", "hover", "showNeighboringDecade", "value", "valueType"]);
    var start = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_1__.getBeginOfDecadeYear)(activeStartDate);
    var end = start + (showNeighboringDecade ? 11 : 9);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_TileGroup_js__WEBPACK_IMPORTED_MODULE_2__["default"], { className: "react-calendar__decade-view__years", dateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getYearStart, dateType: "year", end: end, hover: hover, renderTile: function (_a) {
            var date = _a.date, otherTileProps = __rest(_a, ["date"]);
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Year_js__WEBPACK_IMPORTED_MODULE_4__["default"], __assign({}, otherProps, otherTileProps, { activeStartDate: activeStartDate, currentDecade: start, date: date }), date.getTime()));
        }, start: start, value: value, valueType: valueType }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/Flex.js":
/*!******************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/Flex.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Flex)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};


function toPercent(num) {
    return "".concat(num, "%");
}
function Flex(_a) {
    var children = _a.children, className = _a.className, count = _a.count, direction = _a.direction, offset = _a.offset, style = _a.style, wrap = _a.wrap, otherProps = __rest(_a, ["children", "className", "count", "direction", "offset", "style", "wrap"]);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", __assign({ className: className, style: __assign({ display: 'flex', flexDirection: direction, flexWrap: wrap ? 'wrap' : 'nowrap' }, style) }, otherProps, { children: react__WEBPACK_IMPORTED_MODULE_1__.Children.map(children, function (child, index) {
            var marginInlineStart = offset && index === 0 ? toPercent((100 * offset) / count) : null;
            return (0,react__WEBPACK_IMPORTED_MODULE_1__.cloneElement)(child, __assign(__assign({}, child.props), { style: {
                    flexBasis: toPercent(100 / count),
                    flexShrink: 0,
                    flexGrow: 0,
                    overflow: 'hidden',
                    marginLeft: marginInlineStart,
                    marginInlineStart: marginInlineStart,
                    marginInlineEnd: 0,
                } }));
        }) })));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView.js":
/*!***********************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MonthView)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! clsx */ "./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs");
/* harmony import */ var _MonthView_Days_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MonthView/Days.js */ "./node_modules/react-calendar/dist/esm/MonthView/Days.js");
/* harmony import */ var _MonthView_Weekdays_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MonthView/Weekdays.js */ "./node_modules/react-calendar/dist/esm/MonthView/Weekdays.js");
/* harmony import */ var _MonthView_WeekNumbers_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./MonthView/WeekNumbers.js */ "./node_modules/react-calendar/dist/esm/MonthView/WeekNumbers.js");
/* harmony import */ var _shared_const_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shared/const.js */ "./node_modules/react-calendar/dist/esm/shared/const.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};






function getCalendarTypeFromLocale(locale) {
    if (locale) {
        for (var _i = 0, _a = Object.entries(_shared_const_js__WEBPACK_IMPORTED_MODULE_2__.CALENDAR_TYPE_LOCALES); _i < _a.length; _i++) {
            var _b = _a[_i], calendarType = _b[0], locales = _b[1];
            if (locales.includes(locale)) {
                return calendarType;
            }
        }
    }
    return _shared_const_js__WEBPACK_IMPORTED_MODULE_2__.CALENDAR_TYPES.ISO_8601;
}
/**
 * Displays a given month.
 */
function MonthView(props) {
    var activeStartDate = props.activeStartDate, locale = props.locale, onMouseLeave = props.onMouseLeave, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;
    var _a = props.calendarType, calendarType = _a === void 0 ? getCalendarTypeFromLocale(locale) : _a, formatShortWeekday = props.formatShortWeekday, formatWeekday = props.formatWeekday, onClickWeekNumber = props.onClickWeekNumber, showWeekNumbers = props.showWeekNumbers, childProps = __rest(props, ["calendarType", "formatShortWeekday", "formatWeekday", "onClickWeekNumber", "showWeekNumbers"]);
    function renderWeekdays() {
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_MonthView_Weekdays_js__WEBPACK_IMPORTED_MODULE_3__["default"], { calendarType: calendarType, formatShortWeekday: formatShortWeekday, formatWeekday: formatWeekday, locale: locale, onMouseLeave: onMouseLeave }));
    }
    function renderWeekNumbers() {
        if (!showWeekNumbers) {
            return null;
        }
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_MonthView_WeekNumbers_js__WEBPACK_IMPORTED_MODULE_4__["default"], { activeStartDate: activeStartDate, calendarType: calendarType, onClickWeekNumber: onClickWeekNumber, onMouseLeave: onMouseLeave, showFixedNumberOfWeeks: showFixedNumberOfWeeks }));
    }
    function renderDays() {
        return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_MonthView_Days_js__WEBPACK_IMPORTED_MODULE_5__["default"], __assign({ calendarType: calendarType }, childProps));
    }
    var className = 'react-calendar__month-view';
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])(className, showWeekNumbers ? "".concat(className, "--weekNumbers") : ''), children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: {
                display: 'flex',
                alignItems: 'flex-end',
            }, children: [renderWeekNumbers(), (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: {
                        flexGrow: 1,
                        width: '100%',
                    }, children: [renderWeekdays(), renderDays()] })] }) }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView/Day.js":
/*!***************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView/Day.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Day)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _Tile_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Tile.js */ "./node_modules/react-calendar/dist/esm/Tile.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





var className = 'react-calendar__month-view__days__day';
function Day(_a) {
    var calendarType = _a.calendarType, _b = _a.classes, classes = _b === void 0 ? [] : _b, currentMonthIndex = _a.currentMonthIndex, _c = _a.formatDay, formatDay = _c === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatDay : _c, _d = _a.formatLongDate, formatLongDate = _d === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatLongDate : _d, otherProps = __rest(_a, ["calendarType", "classes", "currentMonthIndex", "formatDay", "formatLongDate"]);
    var date = otherProps.date, locale = otherProps.locale;
    var classesProps = [];
    if (classes) {
        classesProps.push.apply(classesProps, classes);
    }
    if (className) {
        classesProps.push(className);
    }
    if ((0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.isWeekend)(date, calendarType)) {
        classesProps.push("".concat(className, "--weekend"));
    }
    if (date.getMonth() !== currentMonthIndex) {
        classesProps.push("".concat(className, "--neighboringMonth"));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tile_js__WEBPACK_IMPORTED_MODULE_3__["default"], __assign({}, otherProps, { classes: classesProps, formatAbbr: formatLongDate, maxDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_4__.getDayEnd, minDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_4__.getDayStart, view: "month", children: formatDay(locale, date) })));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView/Days.js":
/*!****************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView/Days.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Days)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _TileGroup_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../TileGroup.js */ "./node_modules/react-calendar/dist/esm/TileGroup.js");
/* harmony import */ var _Day_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Day.js */ "./node_modules/react-calendar/dist/esm/MonthView/Day.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};





function Days(props) {
    var activeStartDate = props.activeStartDate, calendarType = props.calendarType, hover = props.hover, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks, showNeighboringMonth = props.showNeighboringMonth, value = props.value, valueType = props.valueType, otherProps = __rest(props, ["activeStartDate", "calendarType", "hover", "showFixedNumberOfWeeks", "showNeighboringMonth", "value", "valueType"]);
    var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(activeStartDate);
    var monthIndex = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonth)(activeStartDate);
    var hasFixedNumberOfWeeks = showFixedNumberOfWeeks || showNeighboringMonth;
    var dayOfWeek = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getDayOfWeek)(activeStartDate, calendarType);
    var offset = hasFixedNumberOfWeeks ? 0 : dayOfWeek;
    /**
     * Defines on which day of the month the grid shall start. If we simply show current
     * month, we obviously start on day one, but if showNeighboringMonth is set to
     * true, we need to find the beginning of the week the first day of the month is in.
     */
    var start = (hasFixedNumberOfWeeks ? -dayOfWeek : 0) + 1;
    /**
     * Defines on which day of the month the grid shall end. If we simply show current
     * month, we need to stop on the last day of the month, but if showNeighboringMonth
     * is set to true, we need to find the end of the week the last day of the month is in.
     */
    var end = (function () {
        if (showFixedNumberOfWeeks) {
            // Always show 6 weeks
            return start + 6 * 7 - 1;
        }
        var daysInMonth = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDaysInMonth)(activeStartDate);
        if (showNeighboringMonth) {
            var activeEndDate = new Date();
            activeEndDate.setFullYear(year, monthIndex, daysInMonth);
            activeEndDate.setHours(0, 0, 0, 0);
            var daysUntilEndOfTheWeek = 7 - (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getDayOfWeek)(activeEndDate, calendarType) - 1;
            return daysInMonth + daysUntilEndOfTheWeek;
        }
        return daysInMonth;
    })();
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_TileGroup_js__WEBPACK_IMPORTED_MODULE_3__["default"], { className: "react-calendar__month-view__days", count: 7, dateTransform: function (day) {
            var date = new Date();
            date.setFullYear(year, monthIndex, day);
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDayStart)(date);
        }, dateType: "day", hover: hover, end: end, renderTile: function (_a) {
            var date = _a.date, otherTileProps = __rest(_a, ["date"]);
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Day_js__WEBPACK_IMPORTED_MODULE_4__["default"], __assign({}, otherProps, otherTileProps, { activeStartDate: activeStartDate, calendarType: calendarType, currentMonthIndex: monthIndex, date: date }), date.getTime()));
        }, offset: offset, start: start, value: value, valueType: valueType }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView/WeekNumber.js":
/*!**********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView/WeekNumber.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WeekNumber)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};

var className = 'react-calendar__tile';
function WeekNumber(props) {
    var onClickWeekNumber = props.onClickWeekNumber, weekNumber = props.weekNumber;
    var children = (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { children: weekNumber });
    if (onClickWeekNumber) {
        var date_1 = props.date, onClickWeekNumber_1 = props.onClickWeekNumber, weekNumber_1 = props.weekNumber, otherProps = __rest(props, ["date", "onClickWeekNumber", "weekNumber"]);
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", __assign({}, otherProps, { className: className, onClick: function (event) { return onClickWeekNumber_1(weekNumber_1, date_1, event); }, type: "button", children: children })));
        // biome-ignore lint/style/noUselessElse: TypeScript is unhappy if we remove this else
    }
    else {
        var date = props.date, onClickWeekNumber_2 = props.onClickWeekNumber, weekNumber_2 = props.weekNumber, otherProps = __rest(props, ["date", "onClickWeekNumber", "weekNumber"]);
        return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", __assign({}, otherProps, { className: className, children: children })));
    }
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView/WeekNumbers.js":
/*!***********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView/WeekNumbers.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WeekNumbers)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _WeekNumber_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./WeekNumber.js */ "./node_modules/react-calendar/dist/esm/MonthView/WeekNumber.js");
/* harmony import */ var _Flex_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Flex.js */ "./node_modules/react-calendar/dist/esm/Flex.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");





function WeekNumbers(props) {
    var activeStartDate = props.activeStartDate, calendarType = props.calendarType, onClickWeekNumber = props.onClickWeekNumber, onMouseLeave = props.onMouseLeave, showFixedNumberOfWeeks = props.showFixedNumberOfWeeks;
    var numberOfWeeks = (function () {
        if (showFixedNumberOfWeeks) {
            return 6;
        }
        var numberOfDays = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDaysInMonth)(activeStartDate);
        var startWeekday = (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getDayOfWeek)(activeStartDate, calendarType);
        var days = numberOfDays - (7 - startWeekday);
        return 1 + Math.ceil(days / 7);
    })();
    var dates = (function () {
        var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(activeStartDate);
        var monthIndex = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonth)(activeStartDate);
        var day = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDate)(activeStartDate);
        var result = [];
        for (var index = 0; index < numberOfWeeks; index += 1) {
            result.push((0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getBeginOfWeek)(new Date(year, monthIndex, day + index * 7), calendarType));
        }
        return result;
    })();
    var weekNumbers = dates.map(function (date) { return (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_2__.getWeekNumber)(date, calendarType); });
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Flex_js__WEBPACK_IMPORTED_MODULE_3__["default"], { className: "react-calendar__month-view__weekNumbers", count: numberOfWeeks, direction: "column", onFocus: onMouseLeave, onMouseOver: onMouseLeave, style: { flexBasis: 'calc(100% * (1 / 8)', flexShrink: 0 }, children: weekNumbers.map(function (weekNumber, weekIndex) {
            var date = dates[weekIndex];
            if (!date) {
                throw new Error('date is not defined');
            }
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_WeekNumber_js__WEBPACK_IMPORTED_MODULE_4__["default"], { date: date, onClickWeekNumber: onClickWeekNumber, weekNumber: weekNumber }, weekNumber));
        }) }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/MonthView/Weekdays.js":
/*!********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/MonthView/Weekdays.js ***!
  \********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Weekdays)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! clsx */ "./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _Flex_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../Flex.js */ "./node_modules/react-calendar/dist/esm/Flex.js");
/* harmony import */ var _shared_dates_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");






var className = 'react-calendar__month-view__weekdays';
var weekdayClassName = "".concat(className, "__weekday");
function Weekdays(props) {
    var calendarType = props.calendarType, _a = props.formatShortWeekday, formatShortWeekday = _a === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_2__.formatShortWeekday : _a, _b = props.formatWeekday, formatWeekday = _b === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_2__.formatWeekday : _b, locale = props.locale, onMouseLeave = props.onMouseLeave;
    var anyDate = new Date();
    var beginOfMonth = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getMonthStart)(anyDate);
    var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getYear)(beginOfMonth);
    var monthIndex = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getMonth)(beginOfMonth);
    var weekdays = [];
    for (var weekday = 1; weekday <= 7; weekday += 1) {
        var weekdayDate = new Date(year, monthIndex, weekday - (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_4__.getDayOfWeek)(beginOfMonth, calendarType));
        var abbr = formatWeekday(locale, weekdayDate);
        weekdays.push((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_1__["default"])(weekdayClassName, (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_4__.isCurrentDayOfWeek)(weekdayDate) && "".concat(weekdayClassName, "--current"), (0,_shared_dates_js__WEBPACK_IMPORTED_MODULE_4__.isWeekend)(weekdayDate, calendarType) && "".concat(weekdayClassName, "--weekend")), children: (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("abbr", { "aria-label": abbr, title: abbr, children: formatShortWeekday(locale, weekdayDate).replace('.', '') }) }, weekday));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Flex_js__WEBPACK_IMPORTED_MODULE_5__["default"], { className: className, count: 7, onFocus: onMouseLeave, onMouseOver: onMouseLeave, children: weekdays }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/Tile.js":
/*!******************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/Tile.js ***!
  \******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Tile)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var clsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! clsx */ "./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs");



function Tile(props) {
    var activeStartDate = props.activeStartDate, children = props.children, classes = props.classes, date = props.date, formatAbbr = props.formatAbbr, locale = props.locale, maxDate = props.maxDate, maxDateTransform = props.maxDateTransform, minDate = props.minDate, minDateTransform = props.minDateTransform, onClick = props.onClick, onMouseOver = props.onMouseOver, style = props.style, tileClassNameProps = props.tileClassName, tileContentProps = props.tileContent, tileDisabled = props.tileDisabled, view = props.view;
    var tileClassName = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(function () {
        var args = { activeStartDate: activeStartDate, date: date, view: view };
        return typeof tileClassNameProps === 'function' ? tileClassNameProps(args) : tileClassNameProps;
    }, [activeStartDate, date, tileClassNameProps, view]);
    var tileContent = (0,react__WEBPACK_IMPORTED_MODULE_1__.useMemo)(function () {
        var args = { activeStartDate: activeStartDate, date: date, view: view };
        return typeof tileContentProps === 'function' ? tileContentProps(args) : tileContentProps;
    }, [activeStartDate, date, tileContentProps, view]);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { className: (0,clsx__WEBPACK_IMPORTED_MODULE_2__["default"])(classes, tileClassName), disabled: (minDate && minDateTransform(minDate) > date) ||
            (maxDate && maxDateTransform(maxDate) < date) ||
            (tileDisabled === null || tileDisabled === void 0 ? void 0 : tileDisabled({ activeStartDate: activeStartDate, date: date, view: view })), onClick: onClick ? function (event) { return onClick(date, event); } : undefined, onFocus: onMouseOver ? function () { return onMouseOver(date); } : undefined, onMouseOver: onMouseOver ? function () { return onMouseOver(date); } : undefined, style: style, type: "button", children: [formatAbbr ? (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("abbr", { "aria-label": formatAbbr(locale, date), children: children }) : children, tileContent] }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/TileGroup.js":
/*!***********************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/TileGroup.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TileGroup)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _Flex_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Flex.js */ "./node_modules/react-calendar/dist/esm/Flex.js");
/* harmony import */ var _shared_utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared/utils.js */ "./node_modules/react-calendar/dist/esm/shared/utils.js");



function TileGroup(_a) {
    var className = _a.className, _b = _a.count, count = _b === void 0 ? 3 : _b, dateTransform = _a.dateTransform, dateType = _a.dateType, end = _a.end, hover = _a.hover, offset = _a.offset, renderTile = _a.renderTile, start = _a.start, _c = _a.step, step = _c === void 0 ? 1 : _c, value = _a.value, valueType = _a.valueType;
    var tiles = [];
    for (var point = start; point <= end; point += step) {
        var date = dateTransform(point);
        tiles.push(renderTile({
            classes: (0,_shared_utils_js__WEBPACK_IMPORTED_MODULE_1__.getTileClasses)({
                date: date,
                dateType: dateType,
                hover: hover,
                value: value,
                valueType: valueType,
            }),
            date: date,
        }));
    }
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Flex_js__WEBPACK_IMPORTED_MODULE_2__["default"], { className: className, count: count, offset: offset, wrap: true, children: tiles }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/YearView.js":
/*!**********************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/YearView.js ***!
  \**********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ YearView)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _YearView_Months_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./YearView/Months.js */ "./node_modules/react-calendar/dist/esm/YearView/Months.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};


/**
 * Displays a given year.
 */
function YearView(props) {
    function renderMonths() {
        return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_YearView_Months_js__WEBPACK_IMPORTED_MODULE_1__["default"], __assign({}, props));
    }
    return (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { className: "react-calendar__year-view", children: renderMonths() });
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/YearView/Month.js":
/*!****************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/YearView/Month.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Month)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _Tile_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Tile.js */ "./node_modules/react-calendar/dist/esm/Tile.js");
/* harmony import */ var _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};




var className = 'react-calendar__year-view__months__month';
function Month(_a) {
    var _b = _a.classes, classes = _b === void 0 ? [] : _b, _c = _a.formatMonth, formatMonth = _c === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatMonth : _c, _d = _a.formatMonthYear, formatMonthYear = _d === void 0 ? _shared_dateFormatter_js__WEBPACK_IMPORTED_MODULE_1__.formatMonthYear : _d, otherProps = __rest(_a, ["classes", "formatMonth", "formatMonthYear"]);
    var date = otherProps.date, locale = otherProps.locale;
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Tile_js__WEBPACK_IMPORTED_MODULE_2__["default"], __assign({}, otherProps, { classes: __spreadArray(__spreadArray([], classes, true), [className], false), formatAbbr: formatMonthYear, maxDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getMonthEnd, minDateTransform: _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_3__.getMonthStart, view: "year", children: formatMonth(locale, date) })));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/YearView/Months.js":
/*!*****************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/YearView/Months.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Months)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-runtime */ "./node_modules/react/jsx-runtime.js");
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _TileGroup_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../TileGroup.js */ "./node_modules/react-calendar/dist/esm/TileGroup.js");
/* harmony import */ var _Month_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./Month.js */ "./node_modules/react-calendar/dist/esm/YearView/Month.js");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (undefined && undefined.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};




function Months(props) {
    var activeStartDate = props.activeStartDate, hover = props.hover, value = props.value, valueType = props.valueType, otherProps = __rest(props, ["activeStartDate", "hover", "value", "valueType"]);
    var start = 0;
    var end = 11;
    var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(activeStartDate);
    return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_TileGroup_js__WEBPACK_IMPORTED_MODULE_2__["default"], { className: "react-calendar__year-view__months", dateTransform: function (monthIndex) {
            var date = new Date();
            date.setFullYear(year, monthIndex, 1);
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonthStart)(date);
        }, dateType: "month", end: end, hover: hover, renderTile: function (_a) {
            var date = _a.date, otherTileProps = __rest(_a, ["date"]);
            return ((0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(_Month_js__WEBPACK_IMPORTED_MODULE_3__["default"], __assign({}, otherProps, otherTileProps, { activeStartDate: activeStartDate, date: date }), date.getTime()));
        }, start: start, value: value, valueType: valueType }));
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Calendar: () => (/* reexport safe */ _Calendar_js__WEBPACK_IMPORTED_MODULE_0__["default"]),
/* harmony export */   CenturyView: () => (/* reexport safe */ _CenturyView_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   DecadeView: () => (/* reexport safe */ _DecadeView_js__WEBPACK_IMPORTED_MODULE_2__["default"]),
/* harmony export */   MonthView: () => (/* reexport safe */ _MonthView_js__WEBPACK_IMPORTED_MODULE_3__["default"]),
/* harmony export */   Navigation: () => (/* reexport safe */ _Calendar_Navigation_js__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   YearView: () => (/* reexport safe */ _YearView_js__WEBPACK_IMPORTED_MODULE_5__["default"]),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _Calendar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Calendar.js */ "./node_modules/react-calendar/dist/esm/Calendar.js");
/* harmony import */ var _CenturyView_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CenturyView.js */ "./node_modules/react-calendar/dist/esm/CenturyView.js");
/* harmony import */ var _DecadeView_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./DecadeView.js */ "./node_modules/react-calendar/dist/esm/DecadeView.js");
/* harmony import */ var _MonthView_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./MonthView.js */ "./node_modules/react-calendar/dist/esm/MonthView.js");
/* harmony import */ var _Calendar_Navigation_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Calendar/Navigation.js */ "./node_modules/react-calendar/dist/esm/Calendar/Navigation.js");
/* harmony import */ var _YearView_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./YearView.js */ "./node_modules/react-calendar/dist/esm/YearView.js");







/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_Calendar_js__WEBPACK_IMPORTED_MODULE_0__["default"]);


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/shared/const.js":
/*!**************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/shared/const.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CALENDAR_TYPES: () => (/* binding */ CALENDAR_TYPES),
/* harmony export */   CALENDAR_TYPE_LOCALES: () => (/* binding */ CALENDAR_TYPE_LOCALES),
/* harmony export */   WEEKDAYS: () => (/* binding */ WEEKDAYS)
/* harmony export */ });
var CALENDAR_TYPES = {
    GREGORY: 'gregory',
    HEBREW: 'hebrew',
    ISLAMIC: 'islamic',
    ISO_8601: 'iso8601',
};
var CALENDAR_TYPE_LOCALES = {
    gregory: [
        'en-CA',
        'en-US',
        'es-AR',
        'es-BO',
        'es-CL',
        'es-CO',
        'es-CR',
        'es-DO',
        'es-EC',
        'es-GT',
        'es-HN',
        'es-MX',
        'es-NI',
        'es-PA',
        'es-PE',
        'es-PR',
        'es-SV',
        'es-VE',
        'pt-BR',
    ],
    hebrew: ['he', 'he-IL'],
    islamic: [
        // ar-LB, ar-MA intentionally missing
        'ar',
        'ar-AE',
        'ar-BH',
        'ar-DZ',
        'ar-EG',
        'ar-IQ',
        'ar-JO',
        'ar-KW',
        'ar-LY',
        'ar-OM',
        'ar-QA',
        'ar-SA',
        'ar-SD',
        'ar-SY',
        'ar-YE',
        'dv',
        'dv-MV',
        'ps',
        'ps-AR',
    ],
};
var WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js":
/*!**********************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/shared/dateFormatter.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatDate: () => (/* binding */ formatDate),
/* harmony export */   formatDay: () => (/* binding */ formatDay),
/* harmony export */   formatLongDate: () => (/* binding */ formatLongDate),
/* harmony export */   formatMonth: () => (/* binding */ formatMonth),
/* harmony export */   formatMonthYear: () => (/* binding */ formatMonthYear),
/* harmony export */   formatShortWeekday: () => (/* binding */ formatShortWeekday),
/* harmony export */   formatWeekday: () => (/* binding */ formatWeekday),
/* harmony export */   formatYear: () => (/* binding */ formatYear)
/* harmony export */ });
/* harmony import */ var get_user_locale__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! get-user-locale */ "./node_modules/get-user-locale/dist/esm/index.js");

var formatterCache = new Map();
function getFormatter(options) {
    return function formatter(locale, date) {
        var localeWithDefault = locale || (0,get_user_locale__WEBPACK_IMPORTED_MODULE_0__["default"])();
        if (!formatterCache.has(localeWithDefault)) {
            formatterCache.set(localeWithDefault, new Map());
        }
        var formatterCacheLocale = formatterCache.get(localeWithDefault);
        if (!formatterCacheLocale.has(options)) {
            formatterCacheLocale.set(options, new Intl.DateTimeFormat(localeWithDefault || undefined, options).format);
        }
        return formatterCacheLocale.get(options)(date);
    };
}
/**
 * Changes the hour in a Date to ensure right date formatting even if DST is messed up.
 * Workaround for bug in WebKit and Firefox with historical dates.
 * For more details, see:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=750465
 * https://bugzilla.mozilla.org/show_bug.cgi?id=1385643
 *
 * @param {Date} date Date.
 * @returns {Date} Date with hour set to 12.
 */
function toSafeHour(date) {
    var safeDate = new Date(date);
    return new Date(safeDate.setHours(12));
}
function getSafeFormatter(options) {
    return function (locale, date) { return getFormatter(options)(locale, toSafeHour(date)); };
}
var formatDateOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
};
var formatDayOptions = { day: 'numeric' };
var formatLongDateOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
};
var formatMonthOptions = { month: 'long' };
var formatMonthYearOptions = {
    month: 'long',
    year: 'numeric',
};
var formatShortWeekdayOptions = { weekday: 'short' };
var formatWeekdayOptions = { weekday: 'long' };
var formatYearOptions = { year: 'numeric' };
var formatDate = getSafeFormatter(formatDateOptions);
var formatDay = getSafeFormatter(formatDayOptions);
var formatLongDate = getSafeFormatter(formatLongDateOptions);
var formatMonth = getSafeFormatter(formatMonthOptions);
var formatMonthYear = getSafeFormatter(formatMonthYearOptions);
var formatShortWeekday = getSafeFormatter(formatShortWeekdayOptions);
var formatWeekday = getSafeFormatter(formatWeekdayOptions);
var formatYear = getSafeFormatter(formatYearOptions);


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/shared/dates.js":
/*!**************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/shared/dates.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getBegin: () => (/* binding */ getBegin),
/* harmony export */   getBeginNext: () => (/* binding */ getBeginNext),
/* harmony export */   getBeginNext2: () => (/* binding */ getBeginNext2),
/* harmony export */   getBeginOfCenturyYear: () => (/* binding */ getBeginOfCenturyYear),
/* harmony export */   getBeginOfDecadeYear: () => (/* binding */ getBeginOfDecadeYear),
/* harmony export */   getBeginOfWeek: () => (/* binding */ getBeginOfWeek),
/* harmony export */   getBeginPrevious: () => (/* binding */ getBeginPrevious),
/* harmony export */   getBeginPrevious2: () => (/* binding */ getBeginPrevious2),
/* harmony export */   getCenturyLabel: () => (/* binding */ getCenturyLabel),
/* harmony export */   getDayOfWeek: () => (/* binding */ getDayOfWeek),
/* harmony export */   getDecadeLabel: () => (/* binding */ getDecadeLabel),
/* harmony export */   getEnd: () => (/* binding */ getEnd),
/* harmony export */   getEndPrevious: () => (/* binding */ getEndPrevious),
/* harmony export */   getEndPrevious2: () => (/* binding */ getEndPrevious2),
/* harmony export */   getRange: () => (/* binding */ getRange),
/* harmony export */   getValueRange: () => (/* binding */ getValueRange),
/* harmony export */   getWeekNumber: () => (/* binding */ getWeekNumber),
/* harmony export */   isCurrentDayOfWeek: () => (/* binding */ isCurrentDayOfWeek),
/* harmony export */   isWeekend: () => (/* binding */ isWeekend)
/* harmony export */ });
/* harmony import */ var _wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wojtekmaj/date-utils */ "./node_modules/@wojtekmaj/date-utils/dist/esm/index.js");
/* harmony import */ var _const_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./const.js */ "./node_modules/react-calendar/dist/esm/shared/const.js");
/* harmony import */ var _dateFormatter_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./dateFormatter.js */ "./node_modules/react-calendar/dist/esm/shared/dateFormatter.js");



var SUNDAY = _const_js__WEBPACK_IMPORTED_MODULE_0__.WEEKDAYS[0];
var FRIDAY = _const_js__WEBPACK_IMPORTED_MODULE_0__.WEEKDAYS[5];
var SATURDAY = _const_js__WEBPACK_IMPORTED_MODULE_0__.WEEKDAYS[6];
/* Simple getters - getting a property of a given point in time */
/**
 * Gets day of the week of a given date.
 * @param {Date} date Date.
 * @param {CalendarType} [calendarType="iso8601"] Calendar type.
 * @returns {number} Day of the week.
 */
function getDayOfWeek(date, calendarType) {
    if (calendarType === void 0) { calendarType = _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601; }
    var weekday = date.getDay();
    switch (calendarType) {
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601:
            // Shifts days of the week so that Monday is 0, Sunday is 6
            return (weekday + 6) % 7;
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISLAMIC:
            return (weekday + 1) % 7;
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.HEBREW:
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.GREGORY:
            return weekday;
        default:
            throw new Error('Unsupported calendar type.');
    }
}
/**
 * Century
 */
/**
 * Gets the year of the beginning of a century of a given date.
 * @param {Date} date Date.
 * @returns {number} Year of the beginning of a century.
 */
function getBeginOfCenturyYear(date) {
    var beginOfCentury = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getCenturyStart)(date);
    return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(beginOfCentury);
}
/**
 * Decade
 */
/**
 * Gets the year of the beginning of a decade of a given date.
 * @param {Date} date Date.
 * @returns {number} Year of the beginning of a decade.
 */
function getBeginOfDecadeYear(date) {
    var beginOfDecade = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDecadeStart)(date);
    return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(beginOfDecade);
}
/**
 * Week
 */
/**
 * Returns the beginning of a given week.
 *
 * @param {Date} date Date.
 * @param {CalendarType} [calendarType="iso8601"] Calendar type.
 * @returns {Date} Beginning of a given week.
 */
function getBeginOfWeek(date, calendarType) {
    if (calendarType === void 0) { calendarType = _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601; }
    var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(date);
    var monthIndex = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonth)(date);
    var day = date.getDate() - getDayOfWeek(date, calendarType);
    return new Date(year, monthIndex, day);
}
/**
 * Gets week number according to ISO 8601 or US standard.
 * In ISO 8601, Arabic and Hebrew week 1 is the one with January 4.
 * In US calendar week 1 is the one with January 1.
 *
 * @param {Date} date Date.
 * @param {CalendarType} [calendarType="iso8601"] Calendar type.
 * @returns {number} Week number.
 */
function getWeekNumber(date, calendarType) {
    if (calendarType === void 0) { calendarType = _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601; }
    var calendarTypeForWeekNumber = calendarType === _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.GREGORY ? _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.GREGORY : _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601;
    var beginOfWeek = getBeginOfWeek(date, calendarType);
    var year = (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYear)(date) + 1;
    var dayInWeekOne;
    var beginOfFirstWeek;
    // Look for the first week one that does not come after a given date
    do {
        dayInWeekOne = new Date(year, 0, calendarTypeForWeekNumber === _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601 ? 4 : 1);
        beginOfFirstWeek = getBeginOfWeek(dayInWeekOne, calendarType);
        year -= 1;
    } while (date < beginOfFirstWeek);
    return Math.round((beginOfWeek.getTime() - beginOfFirstWeek.getTime()) / (8.64e7 * 7)) + 1;
}
/**
 * Others
 */
/**
 * Returns the beginning of a given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date} Beginning of a given range.
 */
function getBegin(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getCenturyStart)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDecadeStart)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYearStart)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonthStart)(date);
        case 'day':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDayStart)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Returns the beginning of a previous given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date} Beginning of a previous given range.
 */
function getBeginPrevious(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousCenturyStart)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousDecadeStart)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousYearStart)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousMonthStart)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Returns the beginning of a next given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date} Beginning of a next given range.
 */
function getBeginNext(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextCenturyStart)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextDecadeStart)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextYearStart)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextMonthStart)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
function getBeginPrevious2(rangeType, date) {
    switch (rangeType) {
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousDecadeStart)(date, -100);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousYearStart)(date, -10);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousMonthStart)(date, -12);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
function getBeginNext2(rangeType, date) {
    switch (rangeType) {
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextDecadeStart)(date, 100);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextYearStart)(date, 10);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getNextMonthStart)(date, 12);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Returns the end of a given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date} End of a given range.
 */
function getEnd(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getCenturyEnd)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDecadeEnd)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYearEnd)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonthEnd)(date);
        case 'day':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDayEnd)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Returns the end of a previous given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date} End of a previous given range.
 */
function getEndPrevious(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousCenturyEnd)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousDecadeEnd)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousYearEnd)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousMonthEnd)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
function getEndPrevious2(rangeType, date) {
    switch (rangeType) {
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousDecadeEnd)(date, -100);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousYearEnd)(date, -10);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getPreviousMonthEnd)(date, -12);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Returns an array with the beginning and the end of a given range.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date Date.
 * @returns {Date[]} Beginning and end of a given range.
 */
function getRange(rangeType, date) {
    switch (rangeType) {
        case 'century':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getCenturyRange)(date);
        case 'decade':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDecadeRange)(date);
        case 'year':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getYearRange)(date);
        case 'month':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getMonthRange)(date);
        case 'day':
            return (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDayRange)(date);
        default:
            throw new Error("Invalid rangeType: ".concat(rangeType));
    }
}
/**
 * Creates a range out of two values, ensuring they are in order and covering entire period ranges.
 *
 * @param {RangeType} rangeType Range type (e.g. 'day')
 * @param {Date} date1 First date.
 * @param {Date} date2 Second date.
 * @returns {Date[]} Beginning and end of a given range.
 */
function getValueRange(rangeType, date1, date2) {
    var rawNextValue = [date1, date2].sort(function (a, b) { return a.getTime() - b.getTime(); });
    return [getBegin(rangeType, rawNextValue[0]), getEnd(rangeType, rawNextValue[1])];
}
function toYearLabel(locale, formatYear, dates) {
    return dates.map(function (date) { return (formatYear || _dateFormatter_js__WEBPACK_IMPORTED_MODULE_2__.formatYear)(locale, date); }).join(' – ');
}
/**
 * @callback FormatYear
 * @param {string} locale Locale.
 * @param {Date} date Date.
 * @returns {string} Formatted year.
 */
/**
 * Returns a string labelling a century of a given date.
 * For example, for 2017 it will return 2001-2100.
 *
 * @param {string} locale Locale.
 * @param {FormatYear} formatYear Function to format a year.
 * @param {Date|string|number} date Date or a year as a string or as a number.
 * @returns {string} String labelling a century of a given date.
 */
function getCenturyLabel(locale, formatYear, date) {
    return toYearLabel(locale, formatYear, (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getCenturyRange)(date));
}
/**
 * Returns a string labelling a decade of a given date.
 * For example, for 2017 it will return 2011-2020.
 *
 * @param {string} locale Locale.
 * @param {FormatYear} formatYear Function to format a year.
 * @param {Date|string|number} date Date or a year as a string or as a number.
 * @returns {string} String labelling a decade of a given date.
 */
function getDecadeLabel(locale, formatYear, date) {
    return toYearLabel(locale, formatYear, (0,_wojtekmaj_date_utils__WEBPACK_IMPORTED_MODULE_1__.getDecadeRange)(date));
}
/**
 * Returns a boolean determining whether a given date is the current day of the week.
 *
 * @param {Date} date Date.
 * @returns {boolean} Whether a given date is the current day of the week.
 */
function isCurrentDayOfWeek(date) {
    return date.getDay() === new Date().getDay();
}
/**
 * Returns a boolean determining whether a given date is a weekend day.
 *
 * @param {Date} date Date.
 * @param {CalendarType} [calendarType="iso8601"] Calendar type.
 * @returns {boolean} Whether a given date is a weekend day.
 */
function isWeekend(date, calendarType) {
    if (calendarType === void 0) { calendarType = _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601; }
    var weekday = date.getDay();
    switch (calendarType) {
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISLAMIC:
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.HEBREW:
            return weekday === FRIDAY || weekday === SATURDAY;
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.ISO_8601:
        case _const_js__WEBPACK_IMPORTED_MODULE_0__.CALENDAR_TYPES.GREGORY:
            return weekday === SATURDAY || weekday === SUNDAY;
        default:
            throw new Error('Unsupported calendar type.');
    }
}


/***/ }),

/***/ "./node_modules/react-calendar/dist/esm/shared/utils.js":
/*!**************************************************************!*\
  !*** ./node_modules/react-calendar/dist/esm/shared/utils.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   between: () => (/* binding */ between),
/* harmony export */   doRangesOverlap: () => (/* binding */ doRangesOverlap),
/* harmony export */   getTileClasses: () => (/* binding */ getTileClasses),
/* harmony export */   isRangeWithinRange: () => (/* binding */ isRangeWithinRange),
/* harmony export */   isValueWithinRange: () => (/* binding */ isValueWithinRange)
/* harmony export */ });
/* harmony import */ var _dates_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dates.js */ "./node_modules/react-calendar/dist/esm/shared/dates.js");

/**
 * Returns a value no smaller than min and no larger than max.
 *
 * @param {Date} value Value to return.
 * @param {Date} min Minimum return value.
 * @param {Date} max Maximum return value.
 * @returns {Date} Value between min and max.
 */
function between(value, min, max) {
    if (min && min > value) {
        return min;
    }
    if (max && max < value) {
        return max;
    }
    return value;
}
function isValueWithinRange(value, range) {
    return range[0] <= value && range[1] >= value;
}
function isRangeWithinRange(greaterRange, smallerRange) {
    return greaterRange[0] <= smallerRange[0] && greaterRange[1] >= smallerRange[1];
}
function doRangesOverlap(range1, range2) {
    return isValueWithinRange(range1[0], range2) || isValueWithinRange(range1[1], range2);
}
function getRangeClassNames(valueRange, dateRange, baseClassName) {
    var isRange = doRangesOverlap(dateRange, valueRange);
    var classes = [];
    if (isRange) {
        classes.push(baseClassName);
        var isRangeStart = isValueWithinRange(valueRange[0], dateRange);
        var isRangeEnd = isValueWithinRange(valueRange[1], dateRange);
        if (isRangeStart) {
            classes.push("".concat(baseClassName, "Start"));
        }
        if (isRangeEnd) {
            classes.push("".concat(baseClassName, "End"));
        }
        if (isRangeStart && isRangeEnd) {
            classes.push("".concat(baseClassName, "BothEnds"));
        }
    }
    return classes;
}
function isCompleteValue(value) {
    if (Array.isArray(value)) {
        return value[0] !== null && value[1] !== null;
    }
    return value !== null;
}
function getTileClasses(args) {
    if (!args) {
        throw new Error('args is required');
    }
    var value = args.value, date = args.date, hover = args.hover;
    var className = 'react-calendar__tile';
    var classes = [className];
    if (!date) {
        return classes;
    }
    var now = new Date();
    var dateRange = (function () {
        if (Array.isArray(date)) {
            return date;
        }
        var dateType = args.dateType;
        if (!dateType) {
            throw new Error('dateType is required when date is not an array of two dates');
        }
        return (0,_dates_js__WEBPACK_IMPORTED_MODULE_0__.getRange)(dateType, date);
    })();
    if (isValueWithinRange(now, dateRange)) {
        classes.push("".concat(className, "--now"));
    }
    if (!value || !isCompleteValue(value)) {
        return classes;
    }
    var valueRange = (function () {
        if (Array.isArray(value)) {
            return value;
        }
        var valueType = args.valueType;
        if (!valueType) {
            throw new Error('valueType is required when value is not an array of two dates');
        }
        return (0,_dates_js__WEBPACK_IMPORTED_MODULE_0__.getRange)(valueType, value);
    })();
    if (isRangeWithinRange(valueRange, dateRange)) {
        classes.push("".concat(className, "--active"));
    }
    else if (doRangesOverlap(valueRange, dateRange)) {
        classes.push("".concat(className, "--hasActive"));
    }
    var valueRangeClassNames = getRangeClassNames(valueRange, dateRange, "".concat(className, "--range"));
    classes.push.apply(classes, valueRangeClassNames);
    var valueArray = Array.isArray(value) ? value : [value];
    if (hover && valueArray.length === 1) {
        var hoverRange = hover > valueRange[0] ? [valueRange[0], hover] : [hover, valueRange[0]];
        var hoverRangeClassNames = getRangeClassNames(hoverRange, dateRange, "".concat(className, "--hover"));
        classes.push.apply(classes, hoverRangeClassNames);
    }
    return classes;
}


/***/ }),

/***/ "./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs":
/*!*********************************************************************!*\
  !*** ./node_modules/react-calendar/node_modules/clsx/dist/clsx.mjs ***!
  \*********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clsx: () => (/* binding */ clsx),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
function r(e){var t,f,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var o=e.length;for(t=0;t<o;t++)e[t]&&(f=r(e[t]))&&(n&&(n+=" "),n+=f)}else for(f in e)e[f]&&(n&&(n+=" "),n+=f);return n}function clsx(){for(var e,t,f=0,n="",o=arguments.length;f<o;f++)(e=arguments[f])&&(t=r(e))&&(n&&(n+=" "),n+=t);return n}/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (clsx);

/***/ }),

/***/ "./node_modules/react-custom-scroll/dist/index.es.js":
/*!***********************************************************!*\
  !*** ./node_modules/react-custom-scroll/dist/index.es.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CustomScroll: () => (/* binding */ Ao)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
var un = Object.defineProperty;
var fn = (e, t, r) => t in e ? un(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var b = (e, t, r) => (fn(e, typeof t != "symbol" ? t + "" : t, r), r);

var St = { exports: {} }, Ie = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Xt;
function mn() {
  if (Xt)
    return Ie;
  Xt = 1;
  var e = react__WEBPACK_IMPORTED_MODULE_0__, t = Symbol.for("react.element"), r = Symbol.for("react.fragment"), o = Object.prototype.hasOwnProperty, i = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, s = { key: !0, ref: !0, __self: !0, __source: !0 };
  function c(f, l, h) {
    var p, g = {}, S = null, R = null;
    h !== void 0 && (S = "" + h), l.key !== void 0 && (S = "" + l.key), l.ref !== void 0 && (R = l.ref);
    for (p in l)
      o.call(l, p) && !s.hasOwnProperty(p) && (g[p] = l[p]);
    if (f && f.defaultProps)
      for (p in l = f.defaultProps, l)
        g[p] === void 0 && (g[p] = l[p]);
    return { $$typeof: t, type: f, key: S, ref: R, props: g, _owner: i.current };
  }
  return Ie.Fragment = r, Ie.jsx = c, Ie.jsxs = c, Ie;
}
var Me = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Kt;
function vn() {
  return Kt || (Kt = 1,  true && function() {
    var e = react__WEBPACK_IMPORTED_MODULE_0__, t = Symbol.for("react.element"), r = Symbol.for("react.portal"), o = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), s = Symbol.for("react.profiler"), c = Symbol.for("react.provider"), f = Symbol.for("react.context"), l = Symbol.for("react.forward_ref"), h = Symbol.for("react.suspense"), p = Symbol.for("react.suspense_list"), g = Symbol.for("react.memo"), S = Symbol.for("react.lazy"), R = Symbol.for("react.offscreen"), O = Symbol.iterator, j = "@@iterator";
    function F(n) {
      if (n === null || typeof n != "object")
        return null;
      var a = O && n[O] || n[j];
      return typeof a == "function" ? a : null;
    }
    var x = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function y(n) {
      {
        for (var a = arguments.length, u = new Array(a > 1 ? a - 1 : 0), d = 1; d < a; d++)
          u[d - 1] = arguments[d];
        _("error", n, u);
      }
    }
    function _(n, a, u) {
      {
        var d = x.ReactDebugCurrentFrame, P = d.getStackAddendum();
        P !== "" && (a += "%s", u = u.concat([P]));
        var k = u.map(function(C) {
          return String(C);
        });
        k.unshift("Warning: " + a), Function.prototype.apply.call(console[n], console, k);
      }
    }
    var A = !1, N = !1, E = !1, m = !1, Z = !1, Q;
    Q = Symbol.for("react.module.reference");
    function lt(n) {
      return !!(typeof n == "string" || typeof n == "function" || n === o || n === s || Z || n === i || n === h || n === p || m || n === R || A || N || E || typeof n == "object" && n !== null && (n.$$typeof === S || n.$$typeof === g || n.$$typeof === c || n.$$typeof === f || n.$$typeof === l || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      n.$$typeof === Q || n.getModuleId !== void 0));
    }
    function ut(n, a, u) {
      var d = n.displayName;
      if (d)
        return d;
      var P = a.displayName || a.name || "";
      return P !== "" ? u + "(" + P + ")" : u;
    }
    function Le(n) {
      return n.displayName || "Context";
    }
    function z(n) {
      if (n == null)
        return null;
      if (typeof n.tag == "number" && y("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof n == "function")
        return n.displayName || n.name || null;
      if (typeof n == "string")
        return n;
      switch (n) {
        case o:
          return "Fragment";
        case r:
          return "Portal";
        case s:
          return "Profiler";
        case i:
          return "StrictMode";
        case h:
          return "Suspense";
        case p:
          return "SuspenseList";
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case f:
            var a = n;
            return Le(a) + ".Consumer";
          case c:
            var u = n;
            return Le(u._context) + ".Provider";
          case l:
            return ut(n, n.render, "ForwardRef");
          case g:
            var d = n.displayName || null;
            return d !== null ? d : z(n.type) || "Memo";
          case S: {
            var P = n, k = P._payload, C = P._init;
            try {
              return z(C(k));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var ee = Object.assign, ue = 0, We, ve, De, V, oe, ie, L;
    function ye() {
    }
    ye.__reactDisabledLog = !0;
    function Ne() {
      {
        if (ue === 0) {
          We = console.log, ve = console.info, De = console.warn, V = console.error, oe = console.group, ie = console.groupCollapsed, L = console.groupEnd;
          var n = {
            configurable: !0,
            enumerable: !0,
            value: ye,
            writable: !0
          };
          Object.defineProperties(console, {
            info: n,
            log: n,
            warn: n,
            error: n,
            group: n,
            groupCollapsed: n,
            groupEnd: n
          });
        }
        ue++;
      }
    }
    function be() {
      {
        if (ue--, ue === 0) {
          var n = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: ee({}, n, {
              value: We
            }),
            info: ee({}, n, {
              value: ve
            }),
            warn: ee({}, n, {
              value: De
            }),
            error: ee({}, n, {
              value: V
            }),
            group: ee({}, n, {
              value: oe
            }),
            groupCollapsed: ee({}, n, {
              value: ie
            }),
            groupEnd: ee({}, n, {
              value: L
            })
          });
        }
        ue < 0 && y("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var te = x.ReactCurrentDispatcher, se;
    function G(n, a, u) {
      {
        if (se === void 0)
          try {
            throw Error();
          } catch (P) {
            var d = P.stack.trim().match(/\n( *(at )?)/);
            se = d && d[1] || "";
          }
        return `
` + se + n;
      }
    }
    var q = !1, ae;
    {
      var Se = typeof WeakMap == "function" ? WeakMap : Map;
      ae = new Se();
    }
    function X(n, a) {
      if (!n || q)
        return "";
      {
        var u = ae.get(n);
        if (u !== void 0)
          return u;
      }
      var d;
      q = !0;
      var P = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var k;
      k = te.current, te.current = null, Ne();
      try {
        if (a) {
          var C = function() {
            throw Error();
          };
          if (Object.defineProperty(C.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(C, []);
            } catch (re) {
              d = re;
            }
            Reflect.construct(n, [], C);
          } else {
            try {
              C.call();
            } catch (re) {
              d = re;
            }
            n.call(C.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (re) {
            d = re;
          }
          n();
        }
      } catch (re) {
        if (re && d && typeof re.stack == "string") {
          for (var w = re.stack.split(`
`), W = d.stack.split(`
`), H = w.length - 1, I = W.length - 1; H >= 1 && I >= 0 && w[H] !== W[I]; )
            I--;
          for (; H >= 1 && I >= 0; H--, I--)
            if (w[H] !== W[I]) {
              if (H !== 1 || I !== 1)
                do
                  if (H--, I--, I < 0 || w[H] !== W[I]) {
                    var B = `
` + w[H].replace(" at new ", " at ");
                    return n.displayName && B.includes("<anonymous>") && (B = B.replace("<anonymous>", n.displayName)), typeof n == "function" && ae.set(n, B), B;
                  }
                while (H >= 1 && I >= 0);
              break;
            }
        }
      } finally {
        q = !1, te.current = k, be(), Error.prepareStackTrace = P;
      }
      var Ee = n ? n.displayName || n.name : "", Gt = Ee ? G(Ee) : "";
      return typeof n == "function" && ae.set(n, Gt), Gt;
    }
    function Wr(n, a, u) {
      return X(n, !1);
    }
    function Yr(n) {
      var a = n.prototype;
      return !!(a && a.isReactComponent);
    }
    function Ye(n, a, u) {
      if (n == null)
        return "";
      if (typeof n == "function")
        return X(n, Yr(n));
      if (typeof n == "string")
        return G(n);
      switch (n) {
        case h:
          return G("Suspense");
        case p:
          return G("SuspenseList");
      }
      if (typeof n == "object")
        switch (n.$$typeof) {
          case l:
            return Wr(n.render);
          case g:
            return Ye(n.type, a, u);
          case S: {
            var d = n, P = d._payload, k = d._init;
            try {
              return Ye(k(P), a, u);
            } catch {
            }
          }
        }
      return "";
    }
    var ze = Object.prototype.hasOwnProperty, Ht = {}, It = x.ReactDebugCurrentFrame;
    function Ve(n) {
      if (n) {
        var a = n._owner, u = Ye(n.type, n._source, a ? a.type : null);
        It.setExtraStackFrame(u);
      } else
        It.setExtraStackFrame(null);
    }
    function zr(n, a, u, d, P) {
      {
        var k = Function.call.bind(ze);
        for (var C in n)
          if (k(n, C)) {
            var w = void 0;
            try {
              if (typeof n[C] != "function") {
                var W = Error((d || "React class") + ": " + u + " type `" + C + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof n[C] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw W.name = "Invariant Violation", W;
              }
              w = n[C](a, C, d, u, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (H) {
              w = H;
            }
            w && !(w instanceof Error) && (Ve(P), y("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", d || "React class", u, C, typeof w), Ve(null)), w instanceof Error && !(w.message in Ht) && (Ht[w.message] = !0, Ve(P), y("Failed %s type: %s", u, w.message), Ve(null));
          }
      }
    }
    var Vr = Array.isArray;
    function ft(n) {
      return Vr(n);
    }
    function Br(n) {
      {
        var a = typeof Symbol == "function" && Symbol.toStringTag, u = a && n[Symbol.toStringTag] || n.constructor.name || "Object";
        return u;
      }
    }
    function Ur(n) {
      try {
        return Mt(n), !1;
      } catch {
        return !0;
      }
    }
    function Mt(n) {
      return "" + n;
    }
    function $t(n) {
      if (Ur(n))
        return y("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Br(n)), Mt(n);
    }
    var je = x.ReactCurrentOwner, Gr = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ft, Lt, dt;
    dt = {};
    function qr(n) {
      if (ze.call(n, "ref")) {
        var a = Object.getOwnPropertyDescriptor(n, "ref").get;
        if (a && a.isReactWarning)
          return !1;
      }
      return n.ref !== void 0;
    }
    function Xr(n) {
      if (ze.call(n, "key")) {
        var a = Object.getOwnPropertyDescriptor(n, "key").get;
        if (a && a.isReactWarning)
          return !1;
      }
      return n.key !== void 0;
    }
    function Kr(n, a) {
      if (typeof n.ref == "string" && je.current && a && je.current.stateNode !== a) {
        var u = z(je.current.type);
        dt[u] || (y('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', z(je.current.type), n.ref), dt[u] = !0);
      }
    }
    function Jr(n, a) {
      {
        var u = function() {
          Ft || (Ft = !0, y("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", a));
        };
        u.isReactWarning = !0, Object.defineProperty(n, "key", {
          get: u,
          configurable: !0
        });
      }
    }
    function Zr(n, a) {
      {
        var u = function() {
          Lt || (Lt = !0, y("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", a));
        };
        u.isReactWarning = !0, Object.defineProperty(n, "ref", {
          get: u,
          configurable: !0
        });
      }
    }
    var Qr = function(n, a, u, d, P, k, C) {
      var w = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: t,
        // Built-in properties that belong on the element
        type: n,
        key: a,
        ref: u,
        props: C,
        // Record the component responsible for creating this element.
        _owner: k
      };
      return w._store = {}, Object.defineProperty(w._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(w, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: d
      }), Object.defineProperty(w, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: P
      }), Object.freeze && (Object.freeze(w.props), Object.freeze(w)), w;
    };
    function en(n, a, u, d, P) {
      {
        var k, C = {}, w = null, W = null;
        u !== void 0 && ($t(u), w = "" + u), Xr(a) && ($t(a.key), w = "" + a.key), qr(a) && (W = a.ref, Kr(a, P));
        for (k in a)
          ze.call(a, k) && !Gr.hasOwnProperty(k) && (C[k] = a[k]);
        if (n && n.defaultProps) {
          var H = n.defaultProps;
          for (k in H)
            C[k] === void 0 && (C[k] = H[k]);
        }
        if (w || W) {
          var I = typeof n == "function" ? n.displayName || n.name || "Unknown" : n;
          w && Jr(C, I), W && Zr(C, I);
        }
        return Qr(n, w, W, P, d, je.current, C);
      }
    }
    var ht = x.ReactCurrentOwner, Wt = x.ReactDebugCurrentFrame;
    function we(n) {
      if (n) {
        var a = n._owner, u = Ye(n.type, n._source, a ? a.type : null);
        Wt.setExtraStackFrame(u);
      } else
        Wt.setExtraStackFrame(null);
    }
    var pt;
    pt = !1;
    function gt(n) {
      return typeof n == "object" && n !== null && n.$$typeof === t;
    }
    function Yt() {
      {
        if (ht.current) {
          var n = z(ht.current.type);
          if (n)
            return `

Check the render method of \`` + n + "`.";
        }
        return "";
      }
    }
    function tn(n) {
      {
        if (n !== void 0) {
          var a = n.fileName.replace(/^.*[\\\/]/, ""), u = n.lineNumber;
          return `

Check your code at ` + a + ":" + u + ".";
        }
        return "";
      }
    }
    var zt = {};
    function rn(n) {
      {
        var a = Yt();
        if (!a) {
          var u = typeof n == "string" ? n : n.displayName || n.name;
          u && (a = `

Check the top-level render call using <` + u + ">.");
        }
        return a;
      }
    }
    function Vt(n, a) {
      {
        if (!n._store || n._store.validated || n.key != null)
          return;
        n._store.validated = !0;
        var u = rn(a);
        if (zt[u])
          return;
        zt[u] = !0;
        var d = "";
        n && n._owner && n._owner !== ht.current && (d = " It was passed a child from " + z(n._owner.type) + "."), we(n), y('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', u, d), we(null);
      }
    }
    function Bt(n, a) {
      {
        if (typeof n != "object")
          return;
        if (ft(n))
          for (var u = 0; u < n.length; u++) {
            var d = n[u];
            gt(d) && Vt(d, a);
          }
        else if (gt(n))
          n._store && (n._store.validated = !0);
        else if (n) {
          var P = F(n);
          if (typeof P == "function" && P !== n.entries)
            for (var k = P.call(n), C; !(C = k.next()).done; )
              gt(C.value) && Vt(C.value, a);
        }
      }
    }
    function nn(n) {
      {
        var a = n.type;
        if (a == null || typeof a == "string")
          return;
        var u;
        if (typeof a == "function")
          u = a.propTypes;
        else if (typeof a == "object" && (a.$$typeof === l || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        a.$$typeof === g))
          u = a.propTypes;
        else
          return;
        if (u) {
          var d = z(a);
          zr(u, n.props, "prop", d, n);
        } else if (a.PropTypes !== void 0 && !pt) {
          pt = !0;
          var P = z(a);
          y("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", P || "Unknown");
        }
        typeof a.getDefaultProps == "function" && !a.getDefaultProps.isReactClassApproved && y("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function on(n) {
      {
        for (var a = Object.keys(n.props), u = 0; u < a.length; u++) {
          var d = a[u];
          if (d !== "children" && d !== "key") {
            we(n), y("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", d), we(null);
            break;
          }
        }
        n.ref !== null && (we(n), y("Invalid attribute `ref` supplied to `React.Fragment`."), we(null));
      }
    }
    function Ut(n, a, u, d, P, k) {
      {
        var C = lt(n);
        if (!C) {
          var w = "";
          (n === void 0 || typeof n == "object" && n !== null && Object.keys(n).length === 0) && (w += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var W = tn(P);
          W ? w += W : w += Yt();
          var H;
          n === null ? H = "null" : ft(n) ? H = "array" : n !== void 0 && n.$$typeof === t ? (H = "<" + (z(n.type) || "Unknown") + " />", w = " Did you accidentally export a JSX literal instead of a component?") : H = typeof n, y("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", H, w);
        }
        var I = en(n, a, u, P, k);
        if (I == null)
          return I;
        if (C) {
          var B = a.children;
          if (B !== void 0)
            if (d)
              if (ft(B)) {
                for (var Ee = 0; Ee < B.length; Ee++)
                  Bt(B[Ee], n);
                Object.freeze && Object.freeze(B);
              } else
                y("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Bt(B, n);
        }
        return n === o ? on(I) : nn(I), I;
      }
    }
    function sn(n, a, u) {
      return Ut(n, a, u, !0);
    }
    function an(n, a, u) {
      return Ut(n, a, u, !1);
    }
    var cn = an, ln = sn;
    Me.Fragment = o, Me.jsx = cn, Me.jsxs = ln;
  }()), Me;
}
 false ? 0 : St.exports = vn();
var ce = St.exports, Y = function() {
  return Y = Object.assign || function(t) {
    for (var r, o = 1, i = arguments.length; o < i; o++) {
      r = arguments[o];
      for (var s in r)
        Object.prototype.hasOwnProperty.call(r, s) && (t[s] = r[s]);
    }
    return t;
  }, Y.apply(this, arguments);
};
function Ce(e, t, r) {
  if (r || arguments.length === 2)
    for (var o = 0, i = t.length, s; o < i; o++)
      (s || !(o in t)) && (s || (s = Array.prototype.slice.call(t, 0, o)), s[o] = t[o]);
  return e.concat(s || Array.prototype.slice.call(t));
}
function yn(e) {
  var t = /* @__PURE__ */ Object.create(null);
  return function(r) {
    return t[r] === void 0 && (t[r] = e(r)), t[r];
  };
}
var bn = /^((children|dangerouslySetInnerHTML|key|ref|autoFocus|defaultValue|defaultChecked|innerHTML|suppressContentEditableWarning|suppressHydrationWarning|valueLink|abbr|accept|acceptCharset|accessKey|action|allow|allowUserMedia|allowPaymentRequest|allowFullScreen|allowTransparency|alt|async|autoComplete|autoPlay|capture|cellPadding|cellSpacing|challenge|charSet|checked|cite|classID|className|cols|colSpan|content|contentEditable|contextMenu|controls|controlsList|coords|crossOrigin|data|dateTime|decoding|default|defer|dir|disabled|disablePictureInPicture|download|draggable|encType|enterKeyHint|form|formAction|formEncType|formMethod|formNoValidate|formTarget|frameBorder|headers|height|hidden|high|href|hrefLang|htmlFor|httpEquiv|id|inputMode|integrity|is|keyParams|keyType|kind|label|lang|list|loading|loop|low|marginHeight|marginWidth|max|maxLength|media|mediaGroup|method|min|minLength|multiple|muted|name|nonce|noValidate|open|optimum|pattern|placeholder|playsInline|poster|preload|profile|radioGroup|readOnly|referrerPolicy|rel|required|reversed|role|rows|rowSpan|sandbox|scope|scoped|scrolling|seamless|selected|shape|size|sizes|slot|span|spellCheck|src|srcDoc|srcLang|srcSet|start|step|style|summary|tabIndex|target|title|translate|type|useMap|value|width|wmode|wrap|about|datatype|inlist|prefix|property|resource|typeof|vocab|autoCapitalize|autoCorrect|autoSave|color|incremental|fallback|inert|itemProp|itemScope|itemType|itemID|itemRef|on|option|results|security|unselectable|accentHeight|accumulate|additive|alignmentBaseline|allowReorder|alphabetic|amplitude|arabicForm|ascent|attributeName|attributeType|autoReverse|azimuth|baseFrequency|baselineShift|baseProfile|bbox|begin|bias|by|calcMode|capHeight|clip|clipPathUnits|clipPath|clipRule|colorInterpolation|colorInterpolationFilters|colorProfile|colorRendering|contentScriptType|contentStyleType|cursor|cx|cy|d|decelerate|descent|diffuseConstant|direction|display|divisor|dominantBaseline|dur|dx|dy|edgeMode|elevation|enableBackground|end|exponent|externalResourcesRequired|fill|fillOpacity|fillRule|filter|filterRes|filterUnits|floodColor|floodOpacity|focusable|fontFamily|fontSize|fontSizeAdjust|fontStretch|fontStyle|fontVariant|fontWeight|format|from|fr|fx|fy|g1|g2|glyphName|glyphOrientationHorizontal|glyphOrientationVertical|glyphRef|gradientTransform|gradientUnits|hanging|horizAdvX|horizOriginX|ideographic|imageRendering|in|in2|intercept|k|k1|k2|k3|k4|kernelMatrix|kernelUnitLength|kerning|keyPoints|keySplines|keyTimes|lengthAdjust|letterSpacing|lightingColor|limitingConeAngle|local|markerEnd|markerMid|markerStart|markerHeight|markerUnits|markerWidth|mask|maskContentUnits|maskUnits|mathematical|mode|numOctaves|offset|opacity|operator|order|orient|orientation|origin|overflow|overlinePosition|overlineThickness|panose1|paintOrder|pathLength|patternContentUnits|patternTransform|patternUnits|pointerEvents|points|pointsAtX|pointsAtY|pointsAtZ|preserveAlpha|preserveAspectRatio|primitiveUnits|r|radius|refX|refY|renderingIntent|repeatCount|repeatDur|requiredExtensions|requiredFeatures|restart|result|rotate|rx|ry|scale|seed|shapeRendering|slope|spacing|specularConstant|specularExponent|speed|spreadMethod|startOffset|stdDeviation|stemh|stemv|stitchTiles|stopColor|stopOpacity|strikethroughPosition|strikethroughThickness|string|stroke|strokeDasharray|strokeDashoffset|strokeLinecap|strokeLinejoin|strokeMiterlimit|strokeOpacity|strokeWidth|surfaceScale|systemLanguage|tableValues|targetX|targetY|textAnchor|textDecoration|textRendering|textLength|to|transform|u1|u2|underlinePosition|underlineThickness|unicode|unicodeBidi|unicodeRange|unitsPerEm|vAlphabetic|vHanging|vIdeographic|vMathematical|values|vectorEffect|version|vertAdvY|vertOriginX|vertOriginY|viewBox|viewTarget|visibility|widths|wordSpacing|writingMode|x|xHeight|x1|x2|xChannelSelector|xlinkActuate|xlinkArcrole|xlinkHref|xlinkRole|xlinkShow|xlinkTitle|xlinkType|xmlBase|xmlns|xmlnsXlink|xmlLang|xmlSpace|y|y1|y2|yChannelSelector|z|zoomAndPan|for|class|autofocus)|(([Dd][Aa][Tt][Aa]|[Aa][Rr][Ii][Aa]|x)-.*))$/, Sn = /* @__PURE__ */ yn(
  function(e) {
    return bn.test(e) || e.charCodeAt(0) === 111 && e.charCodeAt(1) === 110 && e.charCodeAt(2) < 91;
  }
  /* Z+1 */
), D = "-ms-", Fe = "-moz-", T = "-webkit-", gr = "comm", rt = "rule", kt = "decl", wn = "@import", mr = "@keyframes", En = "@layer", vr = Math.abs, Ot = String.fromCharCode, wt = Object.assign;
function Rn(e, t) {
  return $(e, 0) ^ 45 ? (((t << 2 ^ $(e, 0)) << 2 ^ $(e, 1)) << 2 ^ $(e, 2)) << 2 ^ $(e, 3) : 0;
}
function yr(e) {
  return e.trim();
}
function ne(e, t) {
  return (e = t.exec(e)) ? e[0] : e;
}
function v(e, t, r) {
  return e.replace(t, r);
}
function Xe(e, t, r) {
  return e.indexOf(t, r);
}
function $(e, t) {
  return e.charCodeAt(t) | 0;
}
function Pe(e, t, r) {
  return e.slice(t, r);
}
function J(e) {
  return e.length;
}
function br(e) {
  return e.length;
}
function $e(e, t) {
  return t.push(e), e;
}
function Cn(e, t) {
  return e.map(t).join("");
}
function Jt(e, t) {
  return e.filter(function(r) {
    return !ne(r, t);
  });
}
var nt = 1, Te = 1, Sr = 0, U = 0, M = 0, Oe = "";
function ot(e, t, r, o, i, s, c, f) {
  return { value: e, root: t, parent: r, type: o, props: i, children: s, line: nt, column: Te, length: c, return: "", siblings: f };
}
function le(e, t) {
  return wt(ot("", null, null, "", null, null, 0, e.siblings), e, { length: -e.length }, t);
}
function Re(e) {
  for (; e.root; )
    e = le(e.root, { children: [e] });
  $e(e, e.siblings);
}
function Pn() {
  return M;
}
function Tn() {
  return M = U > 0 ? $(Oe, --U) : 0, Te--, M === 10 && (Te = 1, nt--), M;
}
function K() {
  return M = U < Sr ? $(Oe, U++) : 0, Te++, M === 10 && (Te = 1, nt++), M;
}
function he() {
  return $(Oe, U);
}
function Ke() {
  return U;
}
function it(e, t) {
  return Pe(Oe, e, t);
}
function Et(e) {
  switch (e) {
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    case 59:
    case 123:
    case 125:
      return 4;
    case 58:
      return 3;
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function xn(e) {
  return nt = Te = 1, Sr = J(Oe = e), U = 0, [];
}
function _n(e) {
  return Oe = "", e;
}
function mt(e) {
  return yr(it(U - 1, Rt(e === 91 ? e + 2 : e === 40 ? e + 1 : e)));
}
function kn(e) {
  for (; (M = he()) && M < 33; )
    K();
  return Et(e) > 2 || Et(M) > 3 ? "" : " ";
}
function On(e, t) {
  for (; --t && K() && !(M < 48 || M > 102 || M > 57 && M < 65 || M > 70 && M < 97); )
    ;
  return it(e, Ke() + (t < 6 && he() == 32 && K() == 32));
}
function Rt(e) {
  for (; K(); )
    switch (M) {
      case e:
        return U;
      case 34:
      case 39:
        e !== 34 && e !== 39 && Rt(M);
        break;
      case 40:
        e === 41 && Rt(e);
        break;
      case 92:
        K();
        break;
    }
  return U;
}
function An(e, t) {
  for (; K() && e + M !== 57; )
    if (e + M === 84 && he() === 47)
      break;
  return "/*" + it(t, U - 1) + "*" + Ot(e === 47 ? e : K());
}
function Dn(e) {
  for (; !Et(he()); )
    K();
  return it(e, U);
}
function Nn(e) {
  return _n(Je("", null, null, null, [""], e = xn(e), 0, [0], e));
}
function Je(e, t, r, o, i, s, c, f, l) {
  for (var h = 0, p = 0, g = c, S = 0, R = 0, O = 0, j = 1, F = 1, x = 1, y = 0, _ = "", A = i, N = s, E = o, m = _; F; )
    switch (O = y, y = K()) {
      case 40:
        if (O != 108 && $(m, g - 1) == 58) {
          Xe(m += v(mt(y), "&", "&\f"), "&\f", vr(h ? f[h - 1] : 0)) != -1 && (x = -1);
          break;
        }
      case 34:
      case 39:
      case 91:
        m += mt(y);
        break;
      case 9:
      case 10:
      case 13:
      case 32:
        m += kn(O);
        break;
      case 92:
        m += On(Ke() - 1, 7);
        continue;
      case 47:
        switch (he()) {
          case 42:
          case 47:
            $e(jn(An(K(), Ke()), t, r, l), l);
            break;
          default:
            m += "/";
        }
        break;
      case 123 * j:
        f[h++] = J(m) * x;
      case 125 * j:
      case 59:
      case 0:
        switch (y) {
          case 0:
          case 125:
            F = 0;
          case 59 + p:
            x == -1 && (m = v(m, /\f/g, "")), R > 0 && J(m) - g && $e(R > 32 ? Qt(m + ";", o, r, g - 1, l) : Qt(v(m, " ", "") + ";", o, r, g - 2, l), l);
            break;
          case 59:
            m += ";";
          default:
            if ($e(E = Zt(m, t, r, h, p, i, f, _, A = [], N = [], g, s), s), y === 123)
              if (p === 0)
                Je(m, t, E, E, A, s, g, f, N);
              else
                switch (S === 99 && $(m, 3) === 110 ? 100 : S) {
                  case 100:
                  case 108:
                  case 109:
                  case 115:
                    Je(e, E, E, o && $e(Zt(e, E, E, 0, 0, i, f, _, i, A = [], g, N), N), i, N, g, f, o ? A : N);
                    break;
                  default:
                    Je(m, E, E, E, [""], N, 0, f, N);
                }
        }
        h = p = R = 0, j = x = 1, _ = m = "", g = c;
        break;
      case 58:
        g = 1 + J(m), R = O;
      default:
        if (j < 1) {
          if (y == 123)
            --j;
          else if (y == 125 && j++ == 0 && Tn() == 125)
            continue;
        }
        switch (m += Ot(y), y * j) {
          case 38:
            x = p > 0 ? 1 : (m += "\f", -1);
            break;
          case 44:
            f[h++] = (J(m) - 1) * x, x = 1;
            break;
          case 64:
            he() === 45 && (m += mt(K())), S = he(), p = g = J(_ = m += Dn(Ke())), y++;
            break;
          case 45:
            O === 45 && J(m) == 2 && (j = 0);
        }
    }
  return s;
}
function Zt(e, t, r, o, i, s, c, f, l, h, p, g) {
  for (var S = i - 1, R = i === 0 ? s : [""], O = br(R), j = 0, F = 0, x = 0; j < o; ++j)
    for (var y = 0, _ = Pe(e, S + 1, S = vr(F = c[j])), A = e; y < O; ++y)
      (A = yr(F > 0 ? R[y] + " " + _ : v(_, /&\f/g, R[y]))) && (l[x++] = A);
  return ot(e, t, r, i === 0 ? rt : f, l, h, p, g);
}
function jn(e, t, r, o) {
  return ot(e, t, r, gr, Ot(Pn()), Pe(e, 2, -2), 0, o);
}
function Qt(e, t, r, o, i) {
  return ot(e, t, r, kt, Pe(e, 0, o), Pe(e, o + 1, -1), o, i);
}
function wr(e, t, r) {
  switch (Rn(e, t)) {
    case 5103:
      return T + "print-" + e + e;
    case 5737:
    case 4201:
    case 3177:
    case 3433:
    case 1641:
    case 4457:
    case 2921:
    case 5572:
    case 6356:
    case 5844:
    case 3191:
    case 6645:
    case 3005:
    case 6391:
    case 5879:
    case 5623:
    case 6135:
    case 4599:
    case 4855:
    case 4215:
    case 6389:
    case 5109:
    case 5365:
    case 5621:
    case 3829:
      return T + e + e;
    case 4789:
      return Fe + e + e;
    case 5349:
    case 4246:
    case 4810:
    case 6968:
    case 2756:
      return T + e + Fe + e + D + e + e;
    case 5936:
      switch ($(e, t + 11)) {
        case 114:
          return T + e + D + v(e, /[svh]\w+-[tblr]{2}/, "tb") + e;
        case 108:
          return T + e + D + v(e, /[svh]\w+-[tblr]{2}/, "tb-rl") + e;
        case 45:
          return T + e + D + v(e, /[svh]\w+-[tblr]{2}/, "lr") + e;
      }
    case 6828:
    case 4268:
    case 2903:
      return T + e + D + e + e;
    case 6165:
      return T + e + D + "flex-" + e + e;
    case 5187:
      return T + e + v(e, /(\w+).+(:[^]+)/, T + "box-$1$2" + D + "flex-$1$2") + e;
    case 5443:
      return T + e + D + "flex-item-" + v(e, /flex-|-self/g, "") + (ne(e, /flex-|baseline/) ? "" : D + "grid-row-" + v(e, /flex-|-self/g, "")) + e;
    case 4675:
      return T + e + D + "flex-line-pack" + v(e, /align-content|flex-|-self/g, "") + e;
    case 5548:
      return T + e + D + v(e, "shrink", "negative") + e;
    case 5292:
      return T + e + D + v(e, "basis", "preferred-size") + e;
    case 6060:
      return T + "box-" + v(e, "-grow", "") + T + e + D + v(e, "grow", "positive") + e;
    case 4554:
      return T + v(e, /([^-])(transform)/g, "$1" + T + "$2") + e;
    case 6187:
      return v(v(v(e, /(zoom-|grab)/, T + "$1"), /(image-set)/, T + "$1"), e, "") + e;
    case 5495:
    case 3959:
      return v(e, /(image-set\([^]*)/, T + "$1$`$1");
    case 4968:
      return v(v(e, /(.+:)(flex-)?(.*)/, T + "box-pack:$3" + D + "flex-pack:$3"), /s.+-b[^;]+/, "justify") + T + e + e;
    case 4200:
      if (!ne(e, /flex-|baseline/))
        return D + "grid-column-align" + Pe(e, t) + e;
      break;
    case 2592:
    case 3360:
      return D + v(e, "template-", "") + e;
    case 4384:
    case 3616:
      return r && r.some(function(o, i) {
        return t = i, ne(o.props, /grid-\w+-end/);
      }) ? ~Xe(e + (r = r[t].value), "span", 0) ? e : D + v(e, "-start", "") + e + D + "grid-row-span:" + (~Xe(r, "span", 0) ? ne(r, /\d+/) : +ne(r, /\d+/) - +ne(e, /\d+/)) + ";" : D + v(e, "-start", "") + e;
    case 4896:
    case 4128:
      return r && r.some(function(o) {
        return ne(o.props, /grid-\w+-start/);
      }) ? e : D + v(v(e, "-end", "-span"), "span ", "") + e;
    case 4095:
    case 3583:
    case 4068:
    case 2532:
      return v(e, /(.+)-inline(.+)/, T + "$1$2") + e;
    case 8116:
    case 7059:
    case 5753:
    case 5535:
    case 5445:
    case 5701:
    case 4933:
    case 4677:
    case 5533:
    case 5789:
    case 5021:
    case 4765:
      if (J(e) - 1 - t > 6)
        switch ($(e, t + 1)) {
          case 109:
            if ($(e, t + 4) !== 45)
              break;
          case 102:
            return v(e, /(.+:)(.+)-([^]+)/, "$1" + T + "$2-$3$1" + Fe + ($(e, t + 3) == 108 ? "$3" : "$2-$3")) + e;
          case 115:
            return ~Xe(e, "stretch", 0) ? wr(v(e, "stretch", "fill-available"), t, r) + e : e;
        }
      break;
    case 5152:
    case 5920:
      return v(e, /(.+?):(\d+)(\s*\/\s*(span)?\s*(\d+))?(.*)/, function(o, i, s, c, f, l, h) {
        return D + i + ":" + s + h + (c ? D + i + "-span:" + (f ? l : +l - +s) + h : "") + e;
      });
    case 4949:
      if ($(e, t + 6) === 121)
        return v(e, ":", ":" + T) + e;
      break;
    case 6444:
      switch ($(e, $(e, 14) === 45 ? 18 : 11)) {
        case 120:
          return v(e, /(.+:)([^;\s!]+)(;|(\s+)?!.+)?/, "$1" + T + ($(e, 14) === 45 ? "inline-" : "") + "box$3$1" + T + "$2$3$1" + D + "$2box$3") + e;
        case 100:
          return v(e, ":", ":" + D) + e;
      }
      break;
    case 5719:
    case 2647:
    case 2135:
    case 3927:
    case 2391:
      return v(e, "scroll-", "scroll-snap-") + e;
  }
  return e;
}
function et(e, t) {
  for (var r = "", o = 0; o < e.length; o++)
    r += t(e[o], o, e, t) || "";
  return r;
}
function Hn(e, t, r, o) {
  switch (e.type) {
    case En:
      if (e.children.length)
        break;
    case wn:
    case kt:
      return e.return = e.return || e.value;
    case gr:
      return "";
    case mr:
      return e.return = e.value + "{" + et(e.children, o) + "}";
    case rt:
      if (!J(e.value = e.props.join(",")))
        return "";
  }
  return J(r = et(e.children, o)) ? e.return = e.value + "{" + r + "}" : "";
}
function In(e) {
  var t = br(e);
  return function(r, o, i, s) {
    for (var c = "", f = 0; f < t; f++)
      c += e[f](r, o, i, s) || "";
    return c;
  };
}
function Mn(e) {
  return function(t) {
    t.root || (t = t.return) && e(t);
  };
}
function $n(e, t, r, o) {
  if (e.length > -1 && !e.return)
    switch (e.type) {
      case kt:
        e.return = wr(e.value, e.length, r);
        return;
      case mr:
        return et([le(e, { value: v(e.value, "@", "@" + T) })], o);
      case rt:
        if (e.length)
          return Cn(r = e.props, function(i) {
            switch (ne(i, o = /(::plac\w+|:read-\w+)/)) {
              case ":read-only":
              case ":read-write":
                Re(le(e, { props: [v(i, /:(read-\w+)/, ":" + Fe + "$1")] })), Re(le(e, { props: [i] })), wt(e, { props: Jt(r, o) });
                break;
              case "::placeholder":
                Re(le(e, { props: [v(i, /:(plac\w+)/, ":" + T + "input-$1")] })), Re(le(e, { props: [v(i, /:(plac\w+)/, ":" + Fe + "$1")] })), Re(le(e, { props: [v(i, /:(plac\w+)/, D + "input-$1")] })), Re(le(e, { props: [i] })), wt(e, { props: Jt(r, o) });
                break;
            }
            return "";
          });
    }
}
var Fn = {
  animationIterationCount: 1,
  borderImageOutset: 1,
  borderImageSlice: 1,
  borderImageWidth: 1,
  boxFlex: 1,
  boxFlexGroup: 1,
  boxOrdinalGroup: 1,
  columnCount: 1,
  columns: 1,
  flex: 1,
  flexGrow: 1,
  flexPositive: 1,
  flexShrink: 1,
  flexNegative: 1,
  flexOrder: 1,
  gridRow: 1,
  gridRowEnd: 1,
  gridRowSpan: 1,
  gridRowStart: 1,
  gridColumn: 1,
  gridColumnEnd: 1,
  gridColumnSpan: 1,
  gridColumnStart: 1,
  msGridRow: 1,
  msGridRowSpan: 1,
  msGridColumn: 1,
  msGridColumnSpan: 1,
  fontWeight: 1,
  lineHeight: 1,
  opacity: 1,
  order: 1,
  orphans: 1,
  tabSize: 1,
  widows: 1,
  zIndex: 1,
  zoom: 1,
  WebkitLineClamp: 1,
  // SVG-related properties
  fillOpacity: 1,
  floodOpacity: 1,
  stopOpacity: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1,
  strokeMiterlimit: 1,
  strokeOpacity: 1,
  strokeWidth: 1
}, me = typeof process < "u" && process.env !== void 0 && (process.env.REACT_APP_SC_ATTR || process.env.SC_ATTR) || "data-styled", Er = "active", Rr = "data-styled-version", st = "6.1.8", At = `/*!sc*/
`, Dt = typeof window < "u" && "HTMLElement" in window, Ln = !!(typeof SC_DISABLE_SPEEDY == "boolean" ? SC_DISABLE_SPEEDY : typeof process < "u" && process.env !== void 0 && process.env.REACT_APP_SC_DISABLE_SPEEDY !== void 0 && process.env.REACT_APP_SC_DISABLE_SPEEDY !== "" ? process.env.REACT_APP_SC_DISABLE_SPEEDY !== "false" && process.env.REACT_APP_SC_DISABLE_SPEEDY : typeof process < "u" && process.env !== void 0 && process.env.SC_DISABLE_SPEEDY !== void 0 && process.env.SC_DISABLE_SPEEDY !== "" ? process.env.SC_DISABLE_SPEEDY !== "false" && process.env.SC_DISABLE_SPEEDY : "development" !== "production"), er = /invalid hook call/i, Be = /* @__PURE__ */ new Set(), Wn = function(e, t) {
  if (true) {
    var r = t ? ' with the id of "'.concat(t, '"') : "", o = "The component ".concat(e).concat(r, ` has been created dynamically.
`) + `You may see this warning because you've called styled inside another component.
To resolve this only create new StyledComponents outside of any render method and function component.`, i = console.error;
    try {
      var s = !0;
      console.error = function(c) {
        for (var f = [], l = 1; l < arguments.length; l++)
          f[l - 1] = arguments[l];
        er.test(c) ? (s = !1, Be.delete(o)) : i.apply(void 0, Ce([c], f, !1));
      }, (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(), s && !Be.has(o) && (console.warn(o), Be.add(o));
    } catch (c) {
      er.test(c.message) && Be.delete(o);
    } finally {
      console.error = i;
    }
  }
}, at = Object.freeze([]), xe = Object.freeze({});
function Yn(e, t, r) {
  return r === void 0 && (r = xe), e.theme !== r.theme && e.theme || t || r.theme;
}
var Ct = /* @__PURE__ */ new Set(["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "tr", "track", "u", "ul", "use", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "text", "tspan"]), zn = /[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~-]+/g, Vn = /(^-|-$)/g;
function tr(e) {
  return e.replace(zn, "-").replace(Vn, "");
}
var Bn = /(a)(d)/gi, Ue = 52, rr = function(e) {
  return String.fromCharCode(e + (e > 25 ? 39 : 97));
};
function Pt(e) {
  var t, r = "";
  for (t = Math.abs(e); t > Ue; t = t / Ue | 0)
    r = rr(t % Ue) + r;
  return (rr(t % Ue) + r).replace(Bn, "$1-$2");
}
var vt, Cr = 5381, fe = function(e, t) {
  for (var r = t.length; r; )
    e = 33 * e ^ t.charCodeAt(--r);
  return e;
}, Pr = function(e) {
  return fe(Cr, e);
};
function Un(e) {
  return Pt(Pr(e) >>> 0);
}
function Tr(e) {
  return  true && typeof e == "string" && e || e.displayName || e.name || "Component";
}
function yt(e) {
  return typeof e == "string" && ( false || e.charAt(0) === e.charAt(0).toLowerCase());
}
var xr = typeof Symbol == "function" && Symbol.for, _r = xr ? Symbol.for("react.memo") : 60115, Gn = xr ? Symbol.for("react.forward_ref") : 60112, qn = { childContextTypes: !0, contextType: !0, contextTypes: !0, defaultProps: !0, displayName: !0, getDefaultProps: !0, getDerivedStateFromError: !0, getDerivedStateFromProps: !0, mixins: !0, propTypes: !0, type: !0 }, Xn = { name: !0, length: !0, prototype: !0, caller: !0, callee: !0, arguments: !0, arity: !0 }, kr = { $$typeof: !0, compare: !0, defaultProps: !0, displayName: !0, propTypes: !0, type: !0 }, Kn = ((vt = {})[Gn] = { $$typeof: !0, render: !0, defaultProps: !0, displayName: !0, propTypes: !0 }, vt[_r] = kr, vt);
function nr(e) {
  return ("type" in (t = e) && t.type.$$typeof) === _r ? kr : "$$typeof" in e ? Kn[e.$$typeof] : qn;
  var t;
}
var Jn = Object.defineProperty, Zn = Object.getOwnPropertyNames, or = Object.getOwnPropertySymbols, Qn = Object.getOwnPropertyDescriptor, eo = Object.getPrototypeOf, ir = Object.prototype;
function Or(e, t, r) {
  if (typeof t != "string") {
    if (ir) {
      var o = eo(t);
      o && o !== ir && Or(e, o, r);
    }
    var i = Zn(t);
    or && (i = i.concat(or(t)));
    for (var s = nr(e), c = nr(t), f = 0; f < i.length; ++f) {
      var l = i[f];
      if (!(l in Xn || r && r[l] || c && l in c || s && l in s)) {
        var h = Qn(t, l);
        try {
          Jn(e, l, h);
        } catch {
        }
      }
    }
  }
  return e;
}
function _e(e) {
  return typeof e == "function";
}
function Nt(e) {
  return typeof e == "object" && "styledComponentId" in e;
}
function de(e, t) {
  return e && t ? "".concat(e, " ").concat(t) : e || t || "";
}
function sr(e, t) {
  if (e.length === 0)
    return "";
  for (var r = e[0], o = 1; o < e.length; o++)
    r += t ? t + e[o] : e[o];
  return r;
}
function ke(e) {
  return e !== null && typeof e == "object" && e.constructor.name === Object.name && !("props" in e && e.$$typeof);
}
function Tt(e, t, r) {
  if (r === void 0 && (r = !1), !r && !ke(e) && !Array.isArray(e))
    return t;
  if (Array.isArray(t))
    for (var o = 0; o < t.length; o++)
      e[o] = Tt(e[o], t[o]);
  else if (ke(t))
    for (var o in t)
      e[o] = Tt(e[o], t[o]);
  return e;
}
function jt(e, t) {
  Object.defineProperty(e, "toString", { value: t });
}
var to =  true ? { 1: `Cannot create styled-component for component: %s.

`, 2: `Can't collect styles once you've consumed a \`ServerStyleSheet\`'s styles! \`ServerStyleSheet\` is a one off instance for each server-side render cycle.

- Are you trying to reuse it across renders?
- Are you accidentally calling collectStyles twice?

`, 3: `Streaming SSR is only supported in a Node.js environment; Please do not try to call this method in the browser.

`, 4: `The \`StyleSheetManager\` expects a valid target or sheet prop!

- Does this error occur on the client and is your target falsy?
- Does this error occur on the server and is the sheet falsy?

`, 5: `The clone method cannot be used on the client!

- Are you running in a client-like environment on the server?
- Are you trying to run SSR on the client?

`, 6: `Trying to insert a new style tag, but the given Node is unmounted!

- Are you using a custom target that isn't mounted?
- Does your document not have a valid head element?
- Have you accidentally removed a style tag manually?

`, 7: 'ThemeProvider: Please return an object from your "theme" prop function, e.g.\n\n```js\ntheme={() => ({})}\n```\n\n', 8: `ThemeProvider: Please make your "theme" prop an object.

`, 9: "Missing document `<head>`\n\n", 10: `Cannot find a StyleSheet instance. Usually this happens if there are multiple copies of styled-components loaded at once. Check out this issue for how to troubleshoot and fix the common cases where this situation can happen: https://github.com/styled-components/styled-components/issues/1941#issuecomment-417862021

`, 11: `_This error was replaced with a dev-time warning, it will be deleted for v4 final._ [createGlobalStyle] received children which will not be rendered. Please use the component without passing children elements.

`, 12: "It seems you are interpolating a keyframe declaration (%s) into an untagged string. This was supported in styled-components v3, but is not longer supported in v4 as keyframes are now injected on-demand. Please wrap your string in the css\\`\\` helper which ensures the styles are injected correctly. See https://www.styled-components.com/docs/api#css\n\n", 13: `%s is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.

`, 14: `ThemeProvider: "theme" prop is required.

`, 15: "A stylis plugin has been supplied that is not named. We need a name for each plugin to be able to prevent styling collisions between different stylis configurations within the same app. Before you pass your plugin to `<StyleSheetManager stylisPlugins={[]}>`, please make sure each plugin is uniquely-named, e.g.\n\n```js\nObject.defineProperty(importedPlugin, 'name', { value: 'some-unique-name' });\n```\n\n", 16: `Reached the limit of how many styled components may be created at group %s.
You may only create up to 1,073,741,824 components. If you're creating components dynamically,
as for instance in your render method then you may be running into this limitation.

`, 17: `CSSStyleSheet could not be found on HTMLStyleElement.
Has styled-components' style tag been unmounted or altered by another script?
`, 18: "ThemeProvider: Please make sure your useTheme hook is within a `<ThemeProvider>`" } : 0;
function ro() {
  for (var e = [], t = 0; t < arguments.length; t++)
    e[t] = arguments[t];
  for (var r = e[0], o = [], i = 1, s = e.length; i < s; i += 1)
    o.push(e[i]);
  return o.forEach(function(c) {
    r = r.replace(/%[a-z]/, c);
  }), r;
}
function Ae(e) {
  for (var t = [], r = 1; r < arguments.length; r++)
    t[r - 1] = arguments[r];
  return  false ? 0 : new Error(ro.apply(void 0, Ce([to[e]], t, !1)).trim());
}
var no = function() {
  function e(t) {
    this.groupSizes = new Uint32Array(512), this.length = 512, this.tag = t;
  }
  return e.prototype.indexOfGroup = function(t) {
    for (var r = 0, o = 0; o < t; o++)
      r += this.groupSizes[o];
    return r;
  }, e.prototype.insertRules = function(t, r) {
    if (t >= this.groupSizes.length) {
      for (var o = this.groupSizes, i = o.length, s = i; t >= s; )
        if ((s <<= 1) < 0)
          throw Ae(16, "".concat(t));
      this.groupSizes = new Uint32Array(s), this.groupSizes.set(o), this.length = s;
      for (var c = i; c < s; c++)
        this.groupSizes[c] = 0;
    }
    for (var f = this.indexOfGroup(t + 1), l = (c = 0, r.length); c < l; c++)
      this.tag.insertRule(f, r[c]) && (this.groupSizes[t]++, f++);
  }, e.prototype.clearGroup = function(t) {
    if (t < this.length) {
      var r = this.groupSizes[t], o = this.indexOfGroup(t), i = o + r;
      this.groupSizes[t] = 0;
      for (var s = o; s < i; s++)
        this.tag.deleteRule(o);
    }
  }, e.prototype.getGroup = function(t) {
    var r = "";
    if (t >= this.length || this.groupSizes[t] === 0)
      return r;
    for (var o = this.groupSizes[t], i = this.indexOfGroup(t), s = i + o, c = i; c < s; c++)
      r += "".concat(this.tag.getRule(c)).concat(At);
    return r;
  }, e;
}(), Ze = /* @__PURE__ */ new Map(), tt = /* @__PURE__ */ new Map(), Qe = 1, Ge = function(e) {
  if (Ze.has(e))
    return Ze.get(e);
  for (; tt.has(Qe); )
    Qe++;
  var t = Qe++;
  if ( true && ((0 | t) < 0 || t > 1073741824))
    throw Ae(16, "".concat(t));
  return Ze.set(e, t), tt.set(t, e), t;
}, oo = function(e, t) {
  Qe = t + 1, Ze.set(e, t), tt.set(t, e);
}, io = "style[".concat(me, "][").concat(Rr, '="').concat(st, '"]'), so = new RegExp("^".concat(me, '\\.g(\\d+)\\[id="([\\w\\d-]+)"\\].*?"([^"]*)')), ao = function(e, t, r) {
  for (var o, i = r.split(","), s = 0, c = i.length; s < c; s++)
    (o = i[s]) && e.registerName(t, o);
}, co = function(e, t) {
  for (var r, o = ((r = t.textContent) !== null && r !== void 0 ? r : "").split(At), i = [], s = 0, c = o.length; s < c; s++) {
    var f = o[s].trim();
    if (f) {
      var l = f.match(so);
      if (l) {
        var h = 0 | parseInt(l[1], 10), p = l[2];
        h !== 0 && (oo(p, h), ao(e, p, l[3]), e.getTag().insertRules(h, i)), i.length = 0;
      } else
        i.push(f);
    }
  }
};
function lo() {
  return  true ? __webpack_require__.nc : 0;
}
var Ar = function(e) {
  var t = document.head, r = e || t, o = document.createElement("style"), i = function(f) {
    var l = Array.from(f.querySelectorAll("style[".concat(me, "]")));
    return l[l.length - 1];
  }(r), s = i !== void 0 ? i.nextSibling : null;
  o.setAttribute(me, Er), o.setAttribute(Rr, st);
  var c = lo();
  return c && o.setAttribute("nonce", c), r.insertBefore(o, s), o;
}, uo = function() {
  function e(t) {
    this.element = Ar(t), this.element.appendChild(document.createTextNode("")), this.sheet = function(r) {
      if (r.sheet)
        return r.sheet;
      for (var o = document.styleSheets, i = 0, s = o.length; i < s; i++) {
        var c = o[i];
        if (c.ownerNode === r)
          return c;
      }
      throw Ae(17);
    }(this.element), this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    try {
      return this.sheet.insertRule(r, t), this.length++, !0;
    } catch {
      return !1;
    }
  }, e.prototype.deleteRule = function(t) {
    this.sheet.deleteRule(t), this.length--;
  }, e.prototype.getRule = function(t) {
    var r = this.sheet.cssRules[t];
    return r && r.cssText ? r.cssText : "";
  }, e;
}(), fo = function() {
  function e(t) {
    this.element = Ar(t), this.nodes = this.element.childNodes, this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    if (t <= this.length && t >= 0) {
      var o = document.createTextNode(r);
      return this.element.insertBefore(o, this.nodes[t] || null), this.length++, !0;
    }
    return !1;
  }, e.prototype.deleteRule = function(t) {
    this.element.removeChild(this.nodes[t]), this.length--;
  }, e.prototype.getRule = function(t) {
    return t < this.length ? this.nodes[t].textContent : "";
  }, e;
}(), ho = function() {
  function e(t) {
    this.rules = [], this.length = 0;
  }
  return e.prototype.insertRule = function(t, r) {
    return t <= this.length && (this.rules.splice(t, 0, r), this.length++, !0);
  }, e.prototype.deleteRule = function(t) {
    this.rules.splice(t, 1), this.length--;
  }, e.prototype.getRule = function(t) {
    return t < this.length ? this.rules[t] : "";
  }, e;
}(), ar = Dt, po = { isServer: !Dt, useCSSOMInjection: !Ln }, Dr = function() {
  function e(t, r, o) {
    t === void 0 && (t = xe), r === void 0 && (r = {});
    var i = this;
    this.options = Y(Y({}, po), t), this.gs = r, this.names = new Map(o), this.server = !!t.isServer, !this.server && Dt && ar && (ar = !1, function(s) {
      for (var c = document.querySelectorAll(io), f = 0, l = c.length; f < l; f++) {
        var h = c[f];
        h && h.getAttribute(me) !== Er && (co(s, h), h.parentNode && h.parentNode.removeChild(h));
      }
    }(this)), jt(this, function() {
      return function(s) {
        for (var c = s.getTag(), f = c.length, l = "", h = function(g) {
          var S = function(x) {
            return tt.get(x);
          }(g);
          if (S === void 0)
            return "continue";
          var R = s.names.get(S), O = c.getGroup(g);
          if (R === void 0 || O.length === 0)
            return "continue";
          var j = "".concat(me, ".g").concat(g, '[id="').concat(S, '"]'), F = "";
          R !== void 0 && R.forEach(function(x) {
            x.length > 0 && (F += "".concat(x, ","));
          }), l += "".concat(O).concat(j, '{content:"').concat(F, '"}').concat(At);
        }, p = 0; p < f; p++)
          h(p);
        return l;
      }(i);
    });
  }
  return e.registerId = function(t) {
    return Ge(t);
  }, e.prototype.reconstructWithOptions = function(t, r) {
    return r === void 0 && (r = !0), new e(Y(Y({}, this.options), t), this.gs, r && this.names || void 0);
  }, e.prototype.allocateGSInstance = function(t) {
    return this.gs[t] = (this.gs[t] || 0) + 1;
  }, e.prototype.getTag = function() {
    return this.tag || (this.tag = (t = function(r) {
      var o = r.useCSSOMInjection, i = r.target;
      return r.isServer ? new ho(i) : o ? new uo(i) : new fo(i);
    }(this.options), new no(t)));
    var t;
  }, e.prototype.hasNameForId = function(t, r) {
    return this.names.has(t) && this.names.get(t).has(r);
  }, e.prototype.registerName = function(t, r) {
    if (Ge(t), this.names.has(t))
      this.names.get(t).add(r);
    else {
      var o = /* @__PURE__ */ new Set();
      o.add(r), this.names.set(t, o);
    }
  }, e.prototype.insertRules = function(t, r, o) {
    this.registerName(t, r), this.getTag().insertRules(Ge(t), o);
  }, e.prototype.clearNames = function(t) {
    this.names.has(t) && this.names.get(t).clear();
  }, e.prototype.clearRules = function(t) {
    this.getTag().clearGroup(Ge(t)), this.clearNames(t);
  }, e.prototype.clearTag = function() {
    this.tag = void 0;
  }, e;
}(), go = /&/g, mo = /^\s*\/\/.*$/gm;
function Nr(e, t) {
  return e.map(function(r) {
    return r.type === "rule" && (r.value = "".concat(t, " ").concat(r.value), r.value = r.value.replaceAll(",", ",".concat(t, " ")), r.props = r.props.map(function(o) {
      return "".concat(t, " ").concat(o);
    })), Array.isArray(r.children) && r.type !== "@keyframes" && (r.children = Nr(r.children, t)), r;
  });
}
function vo(e) {
  var t, r, o, i = e === void 0 ? xe : e, s = i.options, c = s === void 0 ? xe : s, f = i.plugins, l = f === void 0 ? at : f, h = function(S, R, O) {
    return O.startsWith(r) && O.endsWith(r) && O.replaceAll(r, "").length > 0 ? ".".concat(t) : S;
  }, p = l.slice();
  p.push(function(S) {
    S.type === rt && S.value.includes("&") && (S.props[0] = S.props[0].replace(go, r).replace(o, h));
  }), c.prefix && p.push($n), p.push(Hn);
  var g = function(S, R, O, j) {
    R === void 0 && (R = ""), O === void 0 && (O = ""), j === void 0 && (j = "&"), t = j, r = R, o = new RegExp("\\".concat(r, "\\b"), "g");
    var F = S.replace(mo, ""), x = Nn(O || R ? "".concat(O, " ").concat(R, " { ").concat(F, " }") : F);
    c.namespace && (x = Nr(x, c.namespace));
    var y = [];
    return et(x, In(p.concat(Mn(function(_) {
      return y.push(_);
    })))), y;
  };
  return g.hash = l.length ? l.reduce(function(S, R) {
    return R.name || Ae(15), fe(S, R.name);
  }, Cr).toString() : "", g;
}
var yo = new Dr(), xt = vo(), jr = react__WEBPACK_IMPORTED_MODULE_0__.createContext({ shouldForwardProp: void 0, styleSheet: yo, stylis: xt });
jr.Consumer;
react__WEBPACK_IMPORTED_MODULE_0__.createContext(void 0);
function cr() {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(jr);
}
var lr = function() {
  function e(t, r) {
    var o = this;
    this.inject = function(i, s) {
      s === void 0 && (s = xt);
      var c = o.name + s.hash;
      i.hasNameForId(o.id, c) || i.insertRules(o.id, c, s(o.rules, c, "@keyframes"));
    }, this.name = t, this.id = "sc-keyframes-".concat(t), this.rules = r, jt(this, function() {
      throw Ae(12, String(o.name));
    });
  }
  return e.prototype.getName = function(t) {
    return t === void 0 && (t = xt), this.name + t.hash;
  }, e;
}(), bo = function(e) {
  return e >= "A" && e <= "Z";
};
function ur(e) {
  for (var t = "", r = 0; r < e.length; r++) {
    var o = e[r];
    if (r === 1 && o === "-" && e[0] === "-")
      return e;
    bo(o) ? t += "-" + o.toLowerCase() : t += o;
  }
  return t.startsWith("ms-") ? "-" + t : t;
}
var Hr = function(e) {
  return e == null || e === !1 || e === "";
}, Ir = function(e) {
  var t, r, o = [];
  for (var i in e) {
    var s = e[i];
    e.hasOwnProperty(i) && !Hr(s) && (Array.isArray(s) && s.isCss || _e(s) ? o.push("".concat(ur(i), ":"), s, ";") : ke(s) ? o.push.apply(o, Ce(Ce(["".concat(i, " {")], Ir(s), !1), ["}"], !1)) : o.push("".concat(ur(i), ": ").concat((t = i, (r = s) == null || typeof r == "boolean" || r === "" ? "" : typeof r != "number" || r === 0 || t in Fn || t.startsWith("--") ? String(r).trim() : "".concat(r, "px")), ";")));
  }
  return o;
};
function pe(e, t, r, o) {
  if (Hr(e))
    return [];
  if (Nt(e))
    return [".".concat(e.styledComponentId)];
  if (_e(e)) {
    if (!_e(s = e) || s.prototype && s.prototype.isReactComponent || !t)
      return [e];
    var i = e(t);
    return  false || typeof i != "object" || Array.isArray(i) || i instanceof lr || ke(i) || i === null || console.error("".concat(Tr(e), " is not a styled component and cannot be referred to via component selector. See https://www.styled-components.com/docs/advanced#referring-to-other-components for more details.")), pe(i, t, r, o);
  }
  var s;
  return e instanceof lr ? r ? (e.inject(r, o), [e.getName(o)]) : [e] : ke(e) ? Ir(e) : Array.isArray(e) ? Array.prototype.concat.apply(at, e.map(function(c) {
    return pe(c, t, r, o);
  })) : [e.toString()];
}
function So(e) {
  for (var t = 0; t < e.length; t += 1) {
    var r = e[t];
    if (_e(r) && !Nt(r))
      return !1;
  }
  return !0;
}
var wo = Pr(st), Eo = function() {
  function e(t, r, o) {
    this.rules = t, this.staticRulesId = "", this.isStatic =  false && 0, this.componentId = r, this.baseHash = fe(wo, r), this.baseStyle = o, Dr.registerId(r);
  }
  return e.prototype.generateAndInjectStyles = function(t, r, o) {
    var i = this.baseStyle ? this.baseStyle.generateAndInjectStyles(t, r, o) : "";
    if (this.isStatic && !o.hash)
      if (this.staticRulesId && r.hasNameForId(this.componentId, this.staticRulesId))
        i = de(i, this.staticRulesId);
      else {
        var s = sr(pe(this.rules, t, r, o)), c = Pt(fe(this.baseHash, s) >>> 0);
        if (!r.hasNameForId(this.componentId, c)) {
          var f = o(s, ".".concat(c), void 0, this.componentId);
          r.insertRules(this.componentId, c, f);
        }
        i = de(i, c), this.staticRulesId = c;
      }
    else {
      for (var l = fe(this.baseHash, o.hash), h = "", p = 0; p < this.rules.length; p++) {
        var g = this.rules[p];
        if (typeof g == "string")
          h += g,  true && (l = fe(l, g));
        else if (g) {
          var S = sr(pe(g, t, r, o));
          l = fe(l, S + p), h += S;
        }
      }
      if (h) {
        var R = Pt(l >>> 0);
        r.hasNameForId(this.componentId, R) || r.insertRules(this.componentId, R, o(h, ".".concat(R), void 0, this.componentId)), i = de(i, R);
      }
    }
    return i;
  }, e;
}(), Mr = react__WEBPACK_IMPORTED_MODULE_0__.createContext(void 0);
Mr.Consumer;
var bt = {}, fr = /* @__PURE__ */ new Set();
function Ro(e, t, r) {
  var o = Nt(e), i = e, s = !yt(e), c = t.attrs, f = c === void 0 ? at : c, l = t.componentId, h = l === void 0 ? function(A, N) {
    var E = typeof A != "string" ? "sc" : tr(A);
    bt[E] = (bt[E] || 0) + 1;
    var m = "".concat(E, "-").concat(Un(st + E + bt[E]));
    return N ? "".concat(N, "-").concat(m) : m;
  }(t.displayName, t.parentComponentId) : l, p = t.displayName, g = p === void 0 ? function(A) {
    return yt(A) ? "styled.".concat(A) : "Styled(".concat(Tr(A), ")");
  }(e) : p, S = t.displayName && t.componentId ? "".concat(tr(t.displayName), "-").concat(t.componentId) : t.componentId || h, R = o && i.attrs ? i.attrs.concat(f).filter(Boolean) : f, O = t.shouldForwardProp;
  if (o && i.shouldForwardProp) {
    var j = i.shouldForwardProp;
    if (t.shouldForwardProp) {
      var F = t.shouldForwardProp;
      O = function(A, N) {
        return j(A, N) && F(A, N);
      };
    } else
      O = j;
  }
  var x = new Eo(r, S, o ? i.componentStyle : void 0);
  function y(A, N) {
    return function(E, m, Z) {
      var Q = E.attrs, lt = E.componentStyle, ut = E.defaultProps, Le = E.foldedComponentIds, z = E.styledComponentId, ee = E.target, ue = react__WEBPACK_IMPORTED_MODULE_0__.useContext(Mr), We = cr(), ve = E.shouldForwardProp || We.shouldForwardProp;
       true && (0,react__WEBPACK_IMPORTED_MODULE_0__.useDebugValue)(z);
      var De = Yn(m, ue, ut) || xe, V = function(be, te, se) {
        for (var G, q = Y(Y({}, te), { className: void 0, theme: se }), ae = 0; ae < be.length; ae += 1) {
          var Se = _e(G = be[ae]) ? G(q) : G;
          for (var X in Se)
            q[X] = X === "className" ? de(q[X], Se[X]) : X === "style" ? Y(Y({}, q[X]), Se[X]) : Se[X];
        }
        return te.className && (q.className = de(q.className, te.className)), q;
      }(Q, m, De), oe = V.as || ee, ie = {};
      for (var L in V)
        V[L] === void 0 || L[0] === "$" || L === "as" || L === "theme" && V.theme === De || (L === "forwardedAs" ? ie.as = V.forwardedAs : ve && !ve(L, oe) || (ie[L] = V[L], ve || "development" !== "development" || Sn(L) || fr.has(L) || !Ct.has(oe) || (fr.add(L), console.warn('styled-components: it looks like an unknown prop "'.concat(L, '" is being sent through to the DOM, which will likely trigger a React console error. If you would like automatic filtering of unknown props, you can opt-into that behavior via `<StyleSheetManager shouldForwardProp={...}>` (connect an API like `@emotion/is-prop-valid`) or consider using transient props (`$` prefix for automatic filtering.)')))));
      var ye = function(be, te) {
        var se = cr(), G = be.generateAndInjectStyles(te, se.styleSheet, se.stylis);
        return  true && (0,react__WEBPACK_IMPORTED_MODULE_0__.useDebugValue)(G), G;
      }(lt, V);
       true && E.warnTooManyClasses && E.warnTooManyClasses(ye);
      var Ne = de(Le, z);
      return ye && (Ne += " " + ye), V.className && (Ne += " " + V.className), ie[yt(oe) && !Ct.has(oe) ? "class" : "className"] = Ne, ie.ref = Z, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(oe, ie);
    }(_, A, N);
  }
  y.displayName = g;
  var _ = react__WEBPACK_IMPORTED_MODULE_0__.forwardRef(y);
  return _.attrs = R, _.componentStyle = x, _.displayName = g, _.shouldForwardProp = O, _.foldedComponentIds = o ? de(i.foldedComponentIds, i.styledComponentId) : "", _.styledComponentId = S, _.target = o ? i.target : e, Object.defineProperty(_, "defaultProps", { get: function() {
    return this._foldedDefaultProps;
  }, set: function(A) {
    this._foldedDefaultProps = o ? function(N) {
      for (var E = [], m = 1; m < arguments.length; m++)
        E[m - 1] = arguments[m];
      for (var Z = 0, Q = E; Z < Q.length; Z++)
        Tt(N, Q[Z], !0);
      return N;
    }({}, i.defaultProps, A) : A;
  } }),  true && (Wn(g, S), _.warnTooManyClasses = /* @__PURE__ */ function(A, N) {
    var E = {}, m = !1;
    return function(Z) {
      if (!m && (E[Z] = !0, Object.keys(E).length >= 200)) {
        var Q = N ? ' with the id of "'.concat(N, '"') : "";
        console.warn("Over ".concat(200, " classes were generated for component ").concat(A).concat(Q, `.
`) + `Consider using the attrs method, together with a style object for frequently changed styles.
Example:
  const Component = styled.div.attrs(props => ({
    style: {
      background: props.background,
    },
  }))\`width: 100%;\`

  <Component />`), m = !0, E = {};
      }
    };
  }(g, S)), jt(_, function() {
    return ".".concat(_.styledComponentId);
  }), s && Or(_, e, { attrs: !0, componentStyle: !0, displayName: !0, foldedComponentIds: !0, shouldForwardProp: !0, styledComponentId: !0, target: !0 }), _;
}
function dr(e, t) {
  for (var r = [e[0]], o = 0, i = t.length; o < i; o += 1)
    r.push(t[o], e[o + 1]);
  return r;
}
var hr = function(e) {
  return Object.assign(e, { isCss: !0 });
};
function Co(e) {
  for (var t = [], r = 1; r < arguments.length; r++)
    t[r - 1] = arguments[r];
  if (_e(e) || ke(e))
    return hr(pe(dr(at, Ce([e], t, !0))));
  var o = e;
  return t.length === 0 && o.length === 1 && typeof o[0] == "string" ? pe(o) : hr(pe(dr(o, t)));
}
function _t(e, t, r) {
  if (r === void 0 && (r = xe), !t)
    throw Ae(1, t);
  var o = function(i) {
    for (var s = [], c = 1; c < arguments.length; c++)
      s[c - 1] = arguments[c];
    return e(t, r, Co.apply(void 0, Ce([i], s, !1)));
  };
  return o.attrs = function(i) {
    return _t(e, t, Y(Y({}, r), { attrs: Array.prototype.concat(r.attrs, i).filter(Boolean) }));
  }, o.withConfig = function(i) {
    return _t(e, t, Y(Y({}, r), i));
  }, o;
}
var $r = function(e) {
  return _t(Ro, e);
}, ct = $r;
Ct.forEach(function(e) {
  ct[e] = $r(e);
});
 true && typeof navigator < "u" && navigator.product === "ReactNative" && console.warn(`It looks like you've imported 'styled-components' on React Native.
Perhaps you're looking to import 'styled-components/native'?
Read more about this at https://www.styled-components.com/docs/basics#react-native`);
var qe = "__sc-".concat(me, "__");
 true && typeof window < "u" && (window[qe] || (window[qe] = 0), window[qe] === 1 && console.warn(`It looks like there are several instances of 'styled-components' initialized in this application. This may cause dynamic styles to not render properly, errors during the rehydration process, a missing theme prop, and makes your application bigger without good reason.

See https://s-c.sh/2BAXzed for more info.`), window[qe] += 1);
const Po = (e, t) => {
  let r;
  function o() {
    clearTimeout(r);
  }
  function i() {
    o(), r = setTimeout(() => {
      e();
    }, t);
  }
  return i.cancel = o, i;
}, pr = (e, t, r) => (t = !t && t !== 0 ? e : t, r = !r && r !== 0 ? e : r, t > r ? (console.error("min limit is greater than max limit"), e) : e < t ? t : e > r ? r : e), Fr = (e, t) => e.clientX > t.left && e.clientX < t.right && e.clientY > t.top && e.clientY < t.top + t.height, To = (e, t) => {
  const r = t.getBoundingClientRect();
  return Fr(e, r);
}, Lr = ct.div`
  position: absolute;
  height: 100%;
  width: 6px;
  right: 3px;
  opacity: 0;
  z-index: 1;
  transition: opacity 0.4s ease-out;
  padding: 6px 0;
  box-sizing: border-box;
  will-change: opacity;
  pointer-events: none;

  &.rcs-custom-scrollbar-rtl {
    right: auto;
    left: 3px;
  }

  &.scroll-visible {
    opacity: 1;
    transition-duration: 0.2s;
  }
`, xo = ct.div`
  height: calc(100% - 12px);
  margin-top: 6px;
  background-color: rgba(78, 183, 245, 0.7);
  border-radius: 3px;
`, _o = ct.div`
  min-height: 0;
  min-width: 0;

  & .rcs-outer-container {
    overflow: hidden;

    & .rcs-positioning {
      position: relative;
    }
  }

  & .rcs-inner-container {
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;

    &:after {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 0;
      background-image: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2) 0%,
        rgba(0, 0, 0, 0.05) 60%,
        rgba(0, 0, 0, 0) 100%
      );
      pointer-events: none;
      transition: height 0.1s ease-in;
      will-change: height;
    }

    &.rcs-content-scrolled:after {
      height: 5px;
      transition: height 0.15s ease-out;
    }
  }

  &.rcs-scroll-handle-dragged .rcs-inner-container {
    user-select: none;
  }

  &.rcs-scroll-handle-dragged ${Lr} {
    opacity: 1;
  }

  & .rcs-custom-scroll-handle {
    position: absolute;
    width: 100%;
    top: 0;
  }
`;
class Ao extends react__WEBPACK_IMPORTED_MODULE_0__.Component {
  constructor(r) {
    super(r);
    b(this, "scrollbarYWidth");
    b(this, "hideScrollThumb");
    b(this, "contentHeight", 0);
    b(this, "visibleHeight", 0);
    b(this, "scrollHandleHeight", 0);
    b(this, "scrollRatio", 1);
    b(this, "hasScroll", !1);
    b(this, "startDragHandlePos", 0);
    b(this, "startDragMousePos", 0);
    b(this, "customScrollRef", (0,react__WEBPACK_IMPORTED_MODULE_0__.createRef)());
    b(this, "innerContainerRef", (0,react__WEBPACK_IMPORTED_MODULE_0__.createRef)());
    b(this, "customScrollbarRef", (0,react__WEBPACK_IMPORTED_MODULE_0__.createRef)());
    b(this, "scrollHandleRef", (0,react__WEBPACK_IMPORTED_MODULE_0__.createRef)());
    b(this, "contentWrapperRef", (0,react__WEBPACK_IMPORTED_MODULE_0__.createRef)());
    b(this, "adjustFreezePosition", (r) => {
      if (!this.contentWrapperRef.current)
        return;
      const o = this.getScrolledElement(), i = this.contentWrapperRef.current;
      this.props.freezePosition && (i.scrollTop = this.state.scrollPos), r.freezePosition && (o.scrollTop = this.state.scrollPos);
    });
    b(this, "toggleScrollIfNeeded", () => {
      const r = this.contentHeight - this.visibleHeight > 1;
      this.hasScroll !== r && (this.hasScroll = r, this.forceUpdate());
    });
    b(this, "updateScrollPosition", (r) => {
      const o = this.getScrolledElement(), i = pr(
        r,
        0,
        this.contentHeight - this.visibleHeight
      );
      o.scrollTop = i, this.setState({
        scrollPos: i
      });
    });
    b(this, "onClick", (r) => {
      if (!this.hasScroll || !this.isMouseEventOnCustomScrollbar(r) || this.isMouseEventOnScrollHandle(r))
        return;
      const o = this.calculateNewScrollHandleTop(r), i = this.getScrollValueFromHandlePosition(o);
      this.updateScrollPosition(i);
    });
    b(this, "isMouseEventOnCustomScrollbar", (r) => {
      if (!this.customScrollbarRef.current)
        return !1;
      const i = this.customScrollRef.current.getBoundingClientRect(), s = this.customScrollbarRef.current.getBoundingClientRect(), c = this.props.rtl ? {
        left: i.left,
        right: s.right
      } : {
        left: s.left,
        width: i.right
      }, f = {
        right: i.right,
        top: i.top,
        height: i.height,
        ...c
      };
      return Fr(r, f);
    });
    b(this, "isMouseEventOnScrollHandle", (r) => {
      if (!this.scrollHandleRef.current)
        return !1;
      const o = this.scrollHandleRef.current;
      return To(r, o);
    });
    b(this, "calculateNewScrollHandleTop", (r) => {
      const s = this.customScrollRef.current.getBoundingClientRect().top + window.pageYOffset, c = r.pageY - s, f = this.getScrollHandleStyle().top;
      let l;
      return c > f + this.scrollHandleHeight ? l = f + Math.min(
        this.scrollHandleHeight,
        this.visibleHeight - this.scrollHandleHeight
      ) : l = f - Math.max(this.scrollHandleHeight, 0), l;
    });
    b(this, "getScrollValueFromHandlePosition", (r) => r / this.scrollRatio);
    b(this, "getScrollHandleStyle", () => {
      const r = this.state.scrollPos * this.scrollRatio;
      return this.scrollHandleHeight = this.visibleHeight * this.scrollRatio, {
        height: this.scrollHandleHeight,
        top: r
      };
    });
    b(this, "adjustCustomScrollPosToContentPos", (r) => {
      this.setState({
        scrollPos: r
      });
    });
    b(this, "onScroll", (r) => {
      this.props.freezePosition || (this.hideScrollThumb(), this.adjustCustomScrollPosToContentPos(r.currentTarget.scrollTop), this.props.onScroll && this.props.onScroll(r));
    });
    b(this, "getScrolledElement", () => this.innerContainerRef.current);
    b(this, "onMouseDown", (r) => {
      !this.hasScroll || !this.isMouseEventOnScrollHandle(r) || (this.startDragHandlePos = this.getScrollHandleStyle().top, this.startDragMousePos = r.pageY, this.setState({
        onDrag: !0
      }), document.addEventListener("mousemove", this.onHandleDrag, {
        passive: !1
      }), document.addEventListener("mouseup", this.onHandleDragEnd, {
        passive: !1
      }));
    });
    b(this, "onTouchStart", () => {
      this.setState({
        onDrag: !0
      });
    });
    b(this, "onHandleDrag", (r) => {
      r.preventDefault();
      const o = r.pageY - this.startDragMousePos, i = pr(
        this.startDragHandlePos + o,
        0,
        this.visibleHeight - this.scrollHandleHeight
      ), s = this.getScrollValueFromHandlePosition(i);
      this.updateScrollPosition(s);
    });
    b(this, "onHandleDragEnd", (r) => {
      this.setState({
        onDrag: !1
      }), r.preventDefault(), document.removeEventListener("mousemove", this.onHandleDrag), document.removeEventListener("mouseup", this.onHandleDragEnd);
    });
    b(this, "getInnerContainerClasses", () => this.state.scrollPos && this.props.addScrolledClass ? "rcs-inner-container rcs-content-scrolled" : "rcs-inner-container");
    b(this, "getScrollStyles", () => {
      const r = this.scrollbarYWidth || 20, o = this.props.rtl ? "marginLeft" : "marginRight", i = {
        height: this.props.heightRelativeToParent || this.props.flex ? "100%" : "",
        overscrollBehavior: this.props.allowOuterScroll ? "auto" : "none"
      };
      i[o] = -1 * r;
      const s = {
        height: this.props.heightRelativeToParent || this.props.flex ? "100%" : "",
        overflowY: this.props.freezePosition ? "hidden" : "visible"
      };
      return s[o] = this.scrollbarYWidth ? 0 : r, {
        innerContainer: i,
        contentWrapper: s
      };
    });
    b(this, "getOuterContainerStyle", () => ({
      height: this.props.heightRelativeToParent || this.props.flex ? "100%" : ""
    }));
    b(this, "getRootStyles", () => {
      const r = {};
      return this.props.heightRelativeToParent ? r.height = this.props.heightRelativeToParent : this.props.flex && (r.flex = this.props.flex), r;
    });
    b(this, "enforceMinHandleHeight", (r) => {
      const o = this.props.minScrollHandleHeight || 38;
      if (r.height >= o)
        return r;
      const i = o - r.height, s = this.state.scrollPos / (this.contentHeight - this.visibleHeight), c = i * s, f = r.top - c;
      return {
        height: o,
        top: f
      };
    });
    b(this, "onMouseEnter", () => {
      this.setState({ visible: !0 });
    });
    b(this, "onMouseLeave", () => {
      this.setState({ visible: !1 });
    });
    this.scrollbarYWidth = 0, this.state = {
      scrollPos: 0,
      onDrag: !1,
      visible: !1
    }, this.hideScrollThumb = Po(() => {
      this.setState({
        onDrag: !1
      });
    }, 500);
  }
  componentDidMount() {
    typeof this.props.scrollTo < "u" ? this.updateScrollPosition(this.props.scrollTo) : this.forceUpdate();
  }
  componentDidUpdate(r, o) {
    const i = this.contentHeight, s = this.visibleHeight, c = this.getScrolledElement(), f = o.scrollPos >= i - s;
    this.contentHeight = c.scrollHeight, this.scrollbarYWidth = c.offsetWidth - c.clientWidth, this.visibleHeight = c.clientHeight, this.scrollRatio = this.contentHeight ? this.visibleHeight / this.contentHeight : 1, this.toggleScrollIfNeeded();
    const l = this.state === o;
    (this.props.freezePosition || r.freezePosition) && this.adjustFreezePosition(r), typeof this.props.scrollTo < "u" && this.props.scrollTo !== r.scrollTo ? this.updateScrollPosition(this.props.scrollTo) : this.props.keepAtBottom && l && f && this.updateScrollPosition(this.contentHeight - this.visibleHeight);
  }
  componentWillUnmount() {
    this.hideScrollThumb.cancel(), document.removeEventListener("mousemove", this.onHandleDrag), document.removeEventListener("mouseup", this.onHandleDragEnd);
  }
  render() {
    const r = this.getScrollStyles(), o = this.getRootStyles(), i = this.enforceMinHandleHeight(
      this.getScrollHandleStyle()
    ), s = [
      this.props.className || "",
      "rcs-custom-scroll",
      this.state.onDrag ? "rcs-scroll-handle-dragged" : ""
    ].join(" ");
    return /* @__PURE__ */ ce.jsx(
      _o,
      {
        className: s,
        style: o,
        ref: this.customScrollRef,
        children: /* @__PURE__ */ ce.jsxs(
          "div",
          {
            "data-testid": "outer-container",
            className: "rcs-outer-container",
            style: this.getOuterContainerStyle(),
            onMouseDown: this.onMouseDown,
            onTouchStart: this.onTouchStart,
            onClick: this.onClick,
            onMouseEnter: this.onMouseEnter,
            onMouseLeave: this.onMouseLeave,
            children: [
              this.hasScroll ? /* @__PURE__ */ ce.jsx("div", { className: "rcs-positioning", children: /* @__PURE__ */ ce.jsx(
                Lr,
                {
                  "data-testid": "custom-scrollbar",
                  ref: this.customScrollbarRef,
                  className: `rcs-custom-scrollbar ${this.props.rtl ? "rcs-custom-scrollbar-rtl" : ""} ${this.state.visible ? "scroll-visible" : ""}`,
                  children: /* @__PURE__ */ ce.jsx(
                    "div",
                    {
                      "data-testid": "custom-scroll-handle",
                      ref: this.scrollHandleRef,
                      className: "rcs-custom-scroll-handle",
                      style: i,
                      children: /* @__PURE__ */ ce.jsx(
                        xo,
                        {
                          className: this.props.handleClass || "rcs-inner-handle"
                        }
                      )
                    }
                  )
                },
                "scrollbar"
              ) }) : null,
              /* @__PURE__ */ ce.jsx(
                "div",
                {
                  "data-testid": "inner-container",
                  ref: this.innerContainerRef,
                  className: this.getInnerContainerClasses(),
                  style: r.innerContainer,
                  onScroll: this.onScroll,
                  children: /* @__PURE__ */ ce.jsx(
                    "div",
                    {
                      ref: this.contentWrapperRef,
                      style: r.contentWrapper,
                      children: this.props.children
                    }
                  )
                }
              )
            ]
          }
        )
      }
    );
  }
}

//# sourceMappingURL=index.es.js.map


/***/ }),

/***/ "./node_modules/react-loading-skeleton/dist/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/react-loading-skeleton/dist/index.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SkeletonTheme: () => (/* binding */ SkeletonTheme),
/* harmony export */   "default": () => (/* binding */ Skeleton)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
'use client';


/**
 * @internal
 */
const SkeletonThemeContext = react__WEBPACK_IMPORTED_MODULE_0__.createContext({});

/* eslint-disable react/no-array-index-key */
const defaultEnableAnimation = true;
// For performance & cleanliness, don't add any inline styles unless we have to
function styleOptionsToCssProperties({ baseColor, highlightColor, width, height, borderRadius, circle, direction, duration, enableAnimation = defaultEnableAnimation, customHighlightBackground, }) {
    const style = {};
    if (direction === 'rtl')
        style['--animation-direction'] = 'reverse';
    if (typeof duration === 'number')
        style['--animation-duration'] = `${duration}s`;
    if (!enableAnimation)
        style['--pseudo-element-display'] = 'none';
    if (typeof width === 'string' || typeof width === 'number')
        style.width = width;
    if (typeof height === 'string' || typeof height === 'number')
        style.height = height;
    if (typeof borderRadius === 'string' || typeof borderRadius === 'number')
        style.borderRadius = borderRadius;
    if (circle)
        style.borderRadius = '50%';
    if (typeof baseColor !== 'undefined')
        style['--base-color'] = baseColor;
    if (typeof highlightColor !== 'undefined')
        style['--highlight-color'] = highlightColor;
    if (typeof customHighlightBackground === 'string')
        style['--custom-highlight-background'] = customHighlightBackground;
    return style;
}
function Skeleton({ count = 1, wrapper: Wrapper, className: customClassName, containerClassName, containerTestId, circle = false, style: styleProp, ...originalPropsStyleOptions }) {
    var _a, _b, _c;
    const contextStyleOptions = react__WEBPACK_IMPORTED_MODULE_0__.useContext(SkeletonThemeContext);
    const propsStyleOptions = { ...originalPropsStyleOptions };
    // DO NOT overwrite style options from the context if `propsStyleOptions`
    // has properties explicity set to undefined
    for (const [key, value] of Object.entries(originalPropsStyleOptions)) {
        if (typeof value === 'undefined') {
            delete propsStyleOptions[key];
        }
    }
    // Props take priority over context
    const styleOptions = {
        ...contextStyleOptions,
        ...propsStyleOptions,
        circle,
    };
    // `styleProp` has the least priority out of everything
    const style = {
        ...styleProp,
        ...styleOptionsToCssProperties(styleOptions),
    };
    let className = 'react-loading-skeleton';
    if (customClassName)
        className += ` ${customClassName}`;
    const inline = (_a = styleOptions.inline) !== null && _a !== void 0 ? _a : false;
    const elements = [];
    const countCeil = Math.ceil(count);
    for (let i = 0; i < countCeil; i++) {
        let thisStyle = style;
        if (countCeil > count && i === countCeil - 1) {
            // count is not an integer and we've reached the last iteration of
            // the loop, so add a "fractional" skeleton.
            //
            // For example, if count is 3.5, we've already added 3 full
            // skeletons, so now we add one more skeleton that is 0.5 times the
            // original width.
            const width = (_b = thisStyle.width) !== null && _b !== void 0 ? _b : '100%'; // 100% is the default since that's what's in the CSS
            const fractionalPart = count % 1;
            const fractionalWidth = typeof width === 'number'
                ? width * fractionalPart
                : `calc(${width} * ${fractionalPart})`;
            thisStyle = { ...thisStyle, width: fractionalWidth };
        }
        const skeletonSpan = (react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: className, style: thisStyle, key: i }, "\u200C"));
        if (inline) {
            elements.push(skeletonSpan);
        }
        else {
            // Without the <br />, the skeleton lines will all run together if
            // `width` is specified
            elements.push(react__WEBPACK_IMPORTED_MODULE_0__.createElement(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, { key: i },
                skeletonSpan,
                react__WEBPACK_IMPORTED_MODULE_0__.createElement("br", null)));
        }
    }
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement("span", { className: containerClassName, "data-testid": containerTestId, "aria-live": "polite", "aria-busy": (_c = styleOptions.enableAnimation) !== null && _c !== void 0 ? _c : defaultEnableAnimation }, Wrapper
        ? elements.map((el, i) => react__WEBPACK_IMPORTED_MODULE_0__.createElement(Wrapper, { key: i }, el))
        : elements));
}

function SkeletonTheme({ children, ...styleOptions }) {
    return (react__WEBPACK_IMPORTED_MODULE_0__.createElement(SkeletonThemeContext.Provider, { value: styleOptions }, children));
}




/***/ }),

/***/ "./node_modules/react-loading-skeleton/dist/skeleton.css":
/*!***************************************************************!*\
  !*** ./node_modules/react-loading-skeleton/dist/skeleton.css ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./node_modules/react/cjs/react-jsx-runtime.development.js":
/*!*****************************************************************!*\
  !*** ./node_modules/react/cjs/react-jsx-runtime.development.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



if (true) {
  (function() {
'use strict';

var React = __webpack_require__(/*! react */ "react");

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types.
var REACT_ELEMENT_TYPE = Symbol.for('react.element');
var REACT_PORTAL_TYPE = Symbol.for('react.portal');
var REACT_FRAGMENT_TYPE = Symbol.for('react.fragment');
var REACT_STRICT_MODE_TYPE = Symbol.for('react.strict_mode');
var REACT_PROFILER_TYPE = Symbol.for('react.profiler');
var REACT_PROVIDER_TYPE = Symbol.for('react.provider');
var REACT_CONTEXT_TYPE = Symbol.for('react.context');
var REACT_FORWARD_REF_TYPE = Symbol.for('react.forward_ref');
var REACT_SUSPENSE_TYPE = Symbol.for('react.suspense');
var REACT_SUSPENSE_LIST_TYPE = Symbol.for('react.suspense_list');
var REACT_MEMO_TYPE = Symbol.for('react.memo');
var REACT_LAZY_TYPE = Symbol.for('react.lazy');
var REACT_OFFSCREEN_TYPE = Symbol.for('react.offscreen');
var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';
function getIteratorFn(maybeIterable) {
  if (maybeIterable === null || typeof maybeIterable !== 'object') {
    return null;
  }

  var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];

  if (typeof maybeIterator === 'function') {
    return maybeIterator;
  }

  return null;
}

var ReactSharedInternals = React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;

function error(format) {
  {
    {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      printWarning('error', format, args);
    }
  }
}

function printWarning(level, format, args) {
  // When changing this logic, you might want to also
  // update consoleWithStackDev.www.js as well.
  {
    var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
    var stack = ReactDebugCurrentFrame.getStackAddendum();

    if (stack !== '') {
      format += '%s';
      args = args.concat([stack]);
    } // eslint-disable-next-line react-internal/safe-string-coercion


    var argsWithFormat = args.map(function (item) {
      return String(item);
    }); // Careful: RN currently depends on this prefix

    argsWithFormat.unshift('Warning: ' + format); // We intentionally don't use spread (or .apply) directly because it
    // breaks IE9: https://github.com/facebook/react/issues/13610
    // eslint-disable-next-line react-internal/no-production-logging

    Function.prototype.apply.call(console[level], console, argsWithFormat);
  }
}

// -----------------------------------------------------------------------------

var enableScopeAPI = false; // Experimental Create Event Handle API.
var enableCacheElement = false;
var enableTransitionTracing = false; // No known bugs, but needs performance testing

var enableLegacyHidden = false; // Enables unstable_avoidThisFallback feature in Fiber
// stuff. Intended to enable React core members to more easily debug scheduling
// issues in DEV builds.

var enableDebugTracing = false; // Track which Fiber(s) schedule render work.

var REACT_MODULE_REFERENCE;

{
  REACT_MODULE_REFERENCE = Symbol.for('react.module.reference');
}

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing  || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden  || type === REACT_OFFSCREEN_TYPE || enableScopeAPI  || enableCacheElement  || enableTransitionTracing ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
    // types supported by any Flight configuration anywhere since
    // we don't know which Flight build this will end up being used
    // with.
    type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== undefined) {
      return true;
    }
  }

  return false;
}

function getWrappedName(outerType, innerType, wrapperName) {
  var displayName = outerType.displayName;

  if (displayName) {
    return displayName;
  }

  var functionName = innerType.displayName || innerType.name || '';
  return functionName !== '' ? wrapperName + "(" + functionName + ")" : wrapperName;
} // Keep in sync with react-reconciler/getComponentNameFromFiber


function getContextName(type) {
  return type.displayName || 'Context';
} // Note that the reconciler package should generally prefer to use getComponentNameFromFiber() instead.


function getComponentNameFromType(type) {
  if (type == null) {
    // Host root, text node or just invalid type.
    return null;
  }

  {
    if (typeof type.tag === 'number') {
      error('Received an unexpected object in getComponentNameFromType(). ' + 'This is likely a bug in React. Please file an issue.');
    }
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || null;
  }

  if (typeof type === 'string') {
    return type;
  }

  switch (type) {
    case REACT_FRAGMENT_TYPE:
      return 'Fragment';

    case REACT_PORTAL_TYPE:
      return 'Portal';

    case REACT_PROFILER_TYPE:
      return 'Profiler';

    case REACT_STRICT_MODE_TYPE:
      return 'StrictMode';

    case REACT_SUSPENSE_TYPE:
      return 'Suspense';

    case REACT_SUSPENSE_LIST_TYPE:
      return 'SuspenseList';

  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_CONTEXT_TYPE:
        var context = type;
        return getContextName(context) + '.Consumer';

      case REACT_PROVIDER_TYPE:
        var provider = type;
        return getContextName(provider._context) + '.Provider';

      case REACT_FORWARD_REF_TYPE:
        return getWrappedName(type, type.render, 'ForwardRef');

      case REACT_MEMO_TYPE:
        var outerName = type.displayName || null;

        if (outerName !== null) {
          return outerName;
        }

        return getComponentNameFromType(type.type) || 'Memo';

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            return getComponentNameFromType(init(payload));
          } catch (x) {
            return null;
          }
        }

      // eslint-disable-next-line no-fallthrough
    }
  }

  return null;
}

var assign = Object.assign;

// Helpers to patch console.logs to avoid logging during side-effect free
// replaying on render function. This currently only patches the object
// lazily which won't cover if the log function was extracted eagerly.
// We could also eagerly patch the method.
var disabledDepth = 0;
var prevLog;
var prevInfo;
var prevWarn;
var prevError;
var prevGroup;
var prevGroupCollapsed;
var prevGroupEnd;

function disabledLog() {}

disabledLog.__reactDisabledLog = true;
function disableLogs() {
  {
    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      prevLog = console.log;
      prevInfo = console.info;
      prevWarn = console.warn;
      prevError = console.error;
      prevGroup = console.group;
      prevGroupCollapsed = console.groupCollapsed;
      prevGroupEnd = console.groupEnd; // https://github.com/facebook/react/issues/19099

      var props = {
        configurable: true,
        enumerable: true,
        value: disabledLog,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        info: props,
        log: props,
        warn: props,
        error: props,
        group: props,
        groupCollapsed: props,
        groupEnd: props
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    disabledDepth++;
  }
}
function reenableLogs() {
  {
    disabledDepth--;

    if (disabledDepth === 0) {
      /* eslint-disable react-internal/no-production-logging */
      var props = {
        configurable: true,
        enumerable: true,
        writable: true
      }; // $FlowFixMe Flow thinks console is immutable.

      Object.defineProperties(console, {
        log: assign({}, props, {
          value: prevLog
        }),
        info: assign({}, props, {
          value: prevInfo
        }),
        warn: assign({}, props, {
          value: prevWarn
        }),
        error: assign({}, props, {
          value: prevError
        }),
        group: assign({}, props, {
          value: prevGroup
        }),
        groupCollapsed: assign({}, props, {
          value: prevGroupCollapsed
        }),
        groupEnd: assign({}, props, {
          value: prevGroupEnd
        })
      });
      /* eslint-enable react-internal/no-production-logging */
    }

    if (disabledDepth < 0) {
      error('disabledDepth fell below zero. ' + 'This is a bug in React. Please file an issue.');
    }
  }
}

var ReactCurrentDispatcher = ReactSharedInternals.ReactCurrentDispatcher;
var prefix;
function describeBuiltInComponentFrame(name, source, ownerFn) {
  {
    if (prefix === undefined) {
      // Extract the VM specific prefix used by each line.
      try {
        throw Error();
      } catch (x) {
        var match = x.stack.trim().match(/\n( *(at )?)/);
        prefix = match && match[1] || '';
      }
    } // We use the prefix to ensure our stacks line up with native stack frames.


    return '\n' + prefix + name;
  }
}
var reentry = false;
var componentFrameCache;

{
  var PossiblyWeakMap = typeof WeakMap === 'function' ? WeakMap : Map;
  componentFrameCache = new PossiblyWeakMap();
}

function describeNativeComponentFrame(fn, construct) {
  // If something asked for a stack inside a fake render, it should get ignored.
  if ( !fn || reentry) {
    return '';
  }

  {
    var frame = componentFrameCache.get(fn);

    if (frame !== undefined) {
      return frame;
    }
  }

  var control;
  reentry = true;
  var previousPrepareStackTrace = Error.prepareStackTrace; // $FlowFixMe It does accept undefined.

  Error.prepareStackTrace = undefined;
  var previousDispatcher;

  {
    previousDispatcher = ReactCurrentDispatcher.current; // Set the dispatcher in DEV because this might be call in the render function
    // for warnings.

    ReactCurrentDispatcher.current = null;
    disableLogs();
  }

  try {
    // This should throw.
    if (construct) {
      // Something should be setting the props in the constructor.
      var Fake = function () {
        throw Error();
      }; // $FlowFixMe


      Object.defineProperty(Fake.prototype, 'props', {
        set: function () {
          // We use a throwing setter instead of frozen or non-writable props
          // because that won't throw in a non-strict mode function.
          throw Error();
        }
      });

      if (typeof Reflect === 'object' && Reflect.construct) {
        // We construct a different control for this case to include any extra
        // frames added by the construct call.
        try {
          Reflect.construct(Fake, []);
        } catch (x) {
          control = x;
        }

        Reflect.construct(fn, [], Fake);
      } else {
        try {
          Fake.call();
        } catch (x) {
          control = x;
        }

        fn.call(Fake.prototype);
      }
    } else {
      try {
        throw Error();
      } catch (x) {
        control = x;
      }

      fn();
    }
  } catch (sample) {
    // This is inlined manually because closure doesn't do it for us.
    if (sample && control && typeof sample.stack === 'string') {
      // This extracts the first frame from the sample that isn't also in the control.
      // Skipping one frame that we assume is the frame that calls the two.
      var sampleLines = sample.stack.split('\n');
      var controlLines = control.stack.split('\n');
      var s = sampleLines.length - 1;
      var c = controlLines.length - 1;

      while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
        // We expect at least one stack frame to be shared.
        // Typically this will be the root most one. However, stack frames may be
        // cut off due to maximum stack limits. In this case, one maybe cut off
        // earlier than the other. We assume that the sample is longer or the same
        // and there for cut off earlier. So we should find the root most frame in
        // the sample somewhere in the control.
        c--;
      }

      for (; s >= 1 && c >= 0; s--, c--) {
        // Next we find the first one that isn't the same which should be the
        // frame that called our sample function and the control.
        if (sampleLines[s] !== controlLines[c]) {
          // In V8, the first line is describing the message but other VMs don't.
          // If we're about to return the first line, and the control is also on the same
          // line, that's a pretty good indicator that our sample threw at same line as
          // the control. I.e. before we entered the sample frame. So we ignore this result.
          // This can happen if you passed a class to function component, or non-function.
          if (s !== 1 || c !== 1) {
            do {
              s--;
              c--; // We may still have similar intermediate frames from the construct call.
              // The next one that isn't the same should be our match though.

              if (c < 0 || sampleLines[s] !== controlLines[c]) {
                // V8 adds a "new" prefix for native classes. Let's remove it to make it prettier.
                var _frame = '\n' + sampleLines[s].replace(' at new ', ' at '); // If our component frame is labeled "<anonymous>"
                // but we have a user-provided "displayName"
                // splice it in to make the stack more readable.


                if (fn.displayName && _frame.includes('<anonymous>')) {
                  _frame = _frame.replace('<anonymous>', fn.displayName);
                }

                {
                  if (typeof fn === 'function') {
                    componentFrameCache.set(fn, _frame);
                  }
                } // Return the line we found.


                return _frame;
              }
            } while (s >= 1 && c >= 0);
          }

          break;
        }
      }
    }
  } finally {
    reentry = false;

    {
      ReactCurrentDispatcher.current = previousDispatcher;
      reenableLogs();
    }

    Error.prepareStackTrace = previousPrepareStackTrace;
  } // Fallback to just using the name if we couldn't make it throw.


  var name = fn ? fn.displayName || fn.name : '';
  var syntheticFrame = name ? describeBuiltInComponentFrame(name) : '';

  {
    if (typeof fn === 'function') {
      componentFrameCache.set(fn, syntheticFrame);
    }
  }

  return syntheticFrame;
}
function describeFunctionComponentFrame(fn, source, ownerFn) {
  {
    return describeNativeComponentFrame(fn, false);
  }
}

function shouldConstruct(Component) {
  var prototype = Component.prototype;
  return !!(prototype && prototype.isReactComponent);
}

function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {

  if (type == null) {
    return '';
  }

  if (typeof type === 'function') {
    {
      return describeNativeComponentFrame(type, shouldConstruct(type));
    }
  }

  if (typeof type === 'string') {
    return describeBuiltInComponentFrame(type);
  }

  switch (type) {
    case REACT_SUSPENSE_TYPE:
      return describeBuiltInComponentFrame('Suspense');

    case REACT_SUSPENSE_LIST_TYPE:
      return describeBuiltInComponentFrame('SuspenseList');
  }

  if (typeof type === 'object') {
    switch (type.$$typeof) {
      case REACT_FORWARD_REF_TYPE:
        return describeFunctionComponentFrame(type.render);

      case REACT_MEMO_TYPE:
        // Memo may contain any component type so we recursively resolve it.
        return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);

      case REACT_LAZY_TYPE:
        {
          var lazyComponent = type;
          var payload = lazyComponent._payload;
          var init = lazyComponent._init;

          try {
            // Lazy may contain any component type so we recursively resolve it.
            return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
          } catch (x) {}
        }
    }
  }

  return '';
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

var loggedTypeFailures = {};
var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame.setExtraStackFrame(null);
    }
  }
}

function checkPropTypes(typeSpecs, values, location, componentName, element) {
  {
    // $FlowFixMe This is okay but Flow doesn't know it.
    var has = Function.call.bind(hasOwnProperty);

    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error$1 = void 0; // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.

        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            // eslint-disable-next-line react-internal/prod-error-codes
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED');
        } catch (ex) {
          error$1 = ex;
        }

        if (error$1 && !(error$1 instanceof Error)) {
          setCurrentlyValidatingElement(element);

          error('%s: type specification of %s' + ' `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error$1);

          setCurrentlyValidatingElement(null);
        }

        if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error$1.message] = true;
          setCurrentlyValidatingElement(element);

          error('Failed %s type: %s', location, error$1.message);

          setCurrentlyValidatingElement(null);
        }
      }
    }
  }
}

var isArrayImpl = Array.isArray; // eslint-disable-next-line no-redeclare

function isArray(a) {
  return isArrayImpl(a);
}

/*
 * The `'' + value` pattern (used in in perf-sensitive code) throws for Symbol
 * and Temporal.* types. See https://github.com/facebook/react/pull/22064.
 *
 * The functions in this module will throw an easier-to-understand,
 * easier-to-debug exception with a clear errors message message explaining the
 * problem. (Instead of a confusing exception thrown inside the implementation
 * of the `value` object).
 */
// $FlowFixMe only called in DEV, so void return is not possible.
function typeName(value) {
  {
    // toStringTag is needed for namespaced types like Temporal.Instant
    var hasToStringTag = typeof Symbol === 'function' && Symbol.toStringTag;
    var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || 'Object';
    return type;
  }
} // $FlowFixMe only called in DEV, so void return is not possible.


function willCoercionThrow(value) {
  {
    try {
      testStringCoercion(value);
      return false;
    } catch (e) {
      return true;
    }
  }
}

function testStringCoercion(value) {
  // If you ended up here by following an exception call stack, here's what's
  // happened: you supplied an object or symbol value to React (as a prop, key,
  // DOM attribute, CSS property, string ref, etc.) and when React tried to
  // coerce it to a string using `'' + value`, an exception was thrown.
  //
  // The most common types that will cause this exception are `Symbol` instances
  // and Temporal objects like `Temporal.Instant`. But any object that has a
  // `valueOf` or `[Symbol.toPrimitive]` method that throws will also cause this
  // exception. (Library authors do this to prevent users from using built-in
  // numeric operators like `+` or comparison operators like `>=` because custom
  // methods are needed to perform accurate arithmetic or comparison.)
  //
  // To fix the problem, coerce this object or symbol value to a string before
  // passing it to React. The most reliable way is usually `String(value)`.
  //
  // To find which value is throwing, check the browser or debugger console.
  // Before this exception was thrown, there should be `console.error` output
  // that shows the type (Symbol, Temporal.PlainDate, etc.) that caused the
  // problem and how that type was used: key, atrribute, input value prop, etc.
  // In most cases, this console output also shows the component and its
  // ancestor components where the exception happened.
  //
  // eslint-disable-next-line react-internal/safe-string-coercion
  return '' + value;
}
function checkKeyStringCoercion(value) {
  {
    if (willCoercionThrow(value)) {
      error('The provided key is an unsupported type %s.' + ' This value must be coerced to a string before before using it here.', typeName(value));

      return testStringCoercion(value); // throw (to help callers find troubleshooting comments)
    }
  }
}

var ReactCurrentOwner = ReactSharedInternals.ReactCurrentOwner;
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};
var specialPropKeyWarningShown;
var specialPropRefWarningShown;
var didWarnAboutStringRefs;

{
  didWarnAboutStringRefs = {};
}

function hasValidRef(config) {
  {
    if (hasOwnProperty.call(config, 'ref')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'ref').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.ref !== undefined;
}

function hasValidKey(config) {
  {
    if (hasOwnProperty.call(config, 'key')) {
      var getter = Object.getOwnPropertyDescriptor(config, 'key').get;

      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }

  return config.key !== undefined;
}

function warnIfStringRefCannotBeAutoConverted(config, self) {
  {
    if (typeof config.ref === 'string' && ReactCurrentOwner.current && self && ReactCurrentOwner.current.stateNode !== self) {
      var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);

      if (!didWarnAboutStringRefs[componentName]) {
        error('Component "%s" contains the string ref "%s". ' + 'Support for string refs will be removed in a future major release. ' + 'This case cannot be automatically converted to an arrow function. ' + 'We ask you to manually fix this case by using useRef() or createRef() instead. ' + 'Learn more about using refs safely here: ' + 'https://reactjs.org/link/strict-mode-string-ref', getComponentNameFromType(ReactCurrentOwner.current.type), config.ref);

        didWarnAboutStringRefs[componentName] = true;
      }
    }
  }
}

function defineKeyPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingKey = function () {
      if (!specialPropKeyWarningShown) {
        specialPropKeyWarningShown = true;

        error('%s: `key` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingKey.isReactWarning = true;
    Object.defineProperty(props, 'key', {
      get: warnAboutAccessingKey,
      configurable: true
    });
  }
}

function defineRefPropWarningGetter(props, displayName) {
  {
    var warnAboutAccessingRef = function () {
      if (!specialPropRefWarningShown) {
        specialPropRefWarningShown = true;

        error('%s: `ref` is not a prop. Trying to access it will result ' + 'in `undefined` being returned. If you need to access the same ' + 'value within the child component, you should pass it as a different ' + 'prop. (https://reactjs.org/link/special-props)', displayName);
      }
    };

    warnAboutAccessingRef.isReactWarning = true;
    Object.defineProperty(props, 'ref', {
      get: warnAboutAccessingRef,
      configurable: true
    });
  }
}
/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, instanceof check
 * will not work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} props
 * @param {*} key
 * @param {string|object} ref
 * @param {*} owner
 * @param {*} self A *temporary* helper to detect places where `this` is
 * different from the `owner` when React.createElement is called, so that we
 * can warn. We want to get rid of owner and replace string `ref`s with arrow
 * functions, and as long as `this` and owner are the same, there will be no
 * change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @internal
 */


var ReactElement = function (type, key, ref, self, source, owner, props) {
  var element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,
    // Record the component responsible for creating this element.
    _owner: owner
  };

  {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    element._store = {}; // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.

    Object.defineProperty(element._store, 'validated', {
      configurable: false,
      enumerable: false,
      writable: true,
      value: false
    }); // self and source are DEV only properties.

    Object.defineProperty(element, '_self', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: self
    }); // Two elements created in two different places should be considered
    // equal for testing purposes and therefore we hide it from enumeration.

    Object.defineProperty(element, '_source', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: source
    });

    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};
/**
 * https://github.com/reactjs/rfcs/pull/107
 * @param {*} type
 * @param {object} props
 * @param {string} key
 */

function jsxDEV(type, config, maybeKey, source, self) {
  {
    var propName; // Reserved names are extracted

    var props = {};
    var key = null;
    var ref = null; // Currently, key can be spread in as a prop. This causes a potential
    // issue if key is also explicitly declared (ie. <div {...props} key="Hi" />
    // or <div key="Hi" {...props} /> ). We want to deprecate key spread,
    // but as an intermediary step, we will use jsxDEV for everything except
    // <div {...props} key="Hi" />, because we aren't currently able to tell if
    // key is explicitly declared to be undefined or not.

    if (maybeKey !== undefined) {
      {
        checkKeyStringCoercion(maybeKey);
      }

      key = '' + maybeKey;
    }

    if (hasValidKey(config)) {
      {
        checkKeyStringCoercion(config.key);
      }

      key = '' + config.key;
    }

    if (hasValidRef(config)) {
      ref = config.ref;
      warnIfStringRefCannotBeAutoConverted(config, self);
    } // Remaining properties are added to a new props object


    for (propName in config) {
      if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
        props[propName] = config[propName];
      }
    } // Resolve default props


    if (type && type.defaultProps) {
      var defaultProps = type.defaultProps;

      for (propName in defaultProps) {
        if (props[propName] === undefined) {
          props[propName] = defaultProps[propName];
        }
      }
    }

    if (key || ref) {
      var displayName = typeof type === 'function' ? type.displayName || type.name || 'Unknown' : type;

      if (key) {
        defineKeyPropWarningGetter(props, displayName);
      }

      if (ref) {
        defineRefPropWarningGetter(props, displayName);
      }
    }

    return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
  }
}

var ReactCurrentOwner$1 = ReactSharedInternals.ReactCurrentOwner;
var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;

function setCurrentlyValidatingElement$1(element) {
  {
    if (element) {
      var owner = element._owner;
      var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
      ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
    } else {
      ReactDebugCurrentFrame$1.setExtraStackFrame(null);
    }
  }
}

var propTypesMisspellWarningShown;

{
  propTypesMisspellWarningShown = false;
}
/**
 * Verifies the object is a ReactElement.
 * See https://reactjs.org/docs/react-api.html#isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a ReactElement.
 * @final
 */


function isValidElement(object) {
  {
    return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
  }
}

function getDeclarationErrorAddendum() {
  {
    if (ReactCurrentOwner$1.current) {
      var name = getComponentNameFromType(ReactCurrentOwner$1.current.type);

      if (name) {
        return '\n\nCheck the render method of `' + name + '`.';
      }
    }

    return '';
  }
}

function getSourceInfoErrorAddendum(source) {
  {
    if (source !== undefined) {
      var fileName = source.fileName.replace(/^.*[\\\/]/, '');
      var lineNumber = source.lineNumber;
      return '\n\nCheck your code at ' + fileName + ':' + lineNumber + '.';
    }

    return '';
  }
}
/**
 * Warn if there's no key explicitly set on dynamic arrays of children or
 * object keys are not valid. This allows us to keep track of children between
 * updates.
 */


var ownerHasKeyUseWarning = {};

function getCurrentComponentErrorInfo(parentType) {
  {
    var info = getDeclarationErrorAddendum();

    if (!info) {
      var parentName = typeof parentType === 'string' ? parentType : parentType.displayName || parentType.name;

      if (parentName) {
        info = "\n\nCheck the top-level render call using <" + parentName + ">.";
      }
    }

    return info;
  }
}
/**
 * Warn if the element doesn't have an explicit key assigned to it.
 * This element is in an array. The array could grow and shrink or be
 * reordered. All children that haven't already been validated are required to
 * have a "key" property assigned to it. Error statuses are cached so a warning
 * will only be shown once.
 *
 * @internal
 * @param {ReactElement} element Element that requires a key.
 * @param {*} parentType element's parent's type.
 */


function validateExplicitKey(element, parentType) {
  {
    if (!element._store || element._store.validated || element.key != null) {
      return;
    }

    element._store.validated = true;
    var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);

    if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
      return;
    }

    ownerHasKeyUseWarning[currentComponentErrorInfo] = true; // Usually the current owner is the offender, but if it accepts children as a
    // property, it may be the creator of the child that's responsible for
    // assigning it a key.

    var childOwner = '';

    if (element && element._owner && element._owner !== ReactCurrentOwner$1.current) {
      // Give the component that originally created this child.
      childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
    }

    setCurrentlyValidatingElement$1(element);

    error('Each child in a list should have a unique "key" prop.' + '%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);

    setCurrentlyValidatingElement$1(null);
  }
}
/**
 * Ensure that every element either is passed in a static location, in an
 * array with an explicit keys property defined, or in an object literal
 * with valid key property.
 *
 * @internal
 * @param {ReactNode} node Statically passed child of any type.
 * @param {*} parentType node's parent's type.
 */


function validateChildKeys(node, parentType) {
  {
    if (typeof node !== 'object') {
      return;
    }

    if (isArray(node)) {
      for (var i = 0; i < node.length; i++) {
        var child = node[i];

        if (isValidElement(child)) {
          validateExplicitKey(child, parentType);
        }
      }
    } else if (isValidElement(node)) {
      // This element was passed in a valid location.
      if (node._store) {
        node._store.validated = true;
      }
    } else if (node) {
      var iteratorFn = getIteratorFn(node);

      if (typeof iteratorFn === 'function') {
        // Entry iterators used to provide implicit keys,
        // but now we print a separate warning for them later.
        if (iteratorFn !== node.entries) {
          var iterator = iteratorFn.call(node);
          var step;

          while (!(step = iterator.next()).done) {
            if (isValidElement(step.value)) {
              validateExplicitKey(step.value, parentType);
            }
          }
        }
      }
    }
  }
}
/**
 * Given an element, validate that its props follow the propTypes definition,
 * provided by the type.
 *
 * @param {ReactElement} element
 */


function validatePropTypes(element) {
  {
    var type = element.type;

    if (type === null || type === undefined || typeof type === 'string') {
      return;
    }

    var propTypes;

    if (typeof type === 'function') {
      propTypes = type.propTypes;
    } else if (typeof type === 'object' && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
    // Inner props are checked in the reconciler.
    type.$$typeof === REACT_MEMO_TYPE)) {
      propTypes = type.propTypes;
    } else {
      return;
    }

    if (propTypes) {
      // Intentionally inside to avoid triggering lazy initializers:
      var name = getComponentNameFromType(type);
      checkPropTypes(propTypes, element.props, 'prop', name, element);
    } else if (type.PropTypes !== undefined && !propTypesMisspellWarningShown) {
      propTypesMisspellWarningShown = true; // Intentionally inside to avoid triggering lazy initializers:

      var _name = getComponentNameFromType(type);

      error('Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?', _name || 'Unknown');
    }

    if (typeof type.getDefaultProps === 'function' && !type.getDefaultProps.isReactClassApproved) {
      error('getDefaultProps is only used on classic React.createClass ' + 'definitions. Use a static property named `defaultProps` instead.');
    }
  }
}
/**
 * Given a fragment, validate that it can only be provided with fragment props
 * @param {ReactElement} fragment
 */


function validateFragmentProps(fragment) {
  {
    var keys = Object.keys(fragment.props);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];

      if (key !== 'children' && key !== 'key') {
        setCurrentlyValidatingElement$1(fragment);

        error('Invalid prop `%s` supplied to `React.Fragment`. ' + 'React.Fragment can only have `key` and `children` props.', key);

        setCurrentlyValidatingElement$1(null);
        break;
      }
    }

    if (fragment.ref !== null) {
      setCurrentlyValidatingElement$1(fragment);

      error('Invalid attribute `ref` supplied to `React.Fragment`.');

      setCurrentlyValidatingElement$1(null);
    }
  }
}

var didWarnAboutKeySpread = {};
function jsxWithValidation(type, props, key, isStaticChildren, source, self) {
  {
    var validType = isValidElementType(type); // We warn in this case but don't throw. We expect the element creation to
    // succeed and there will likely be errors in render.

    if (!validType) {
      var info = '';

      if (type === undefined || typeof type === 'object' && type !== null && Object.keys(type).length === 0) {
        info += ' You likely forgot to export your component from the file ' + "it's defined in, or you might have mixed up default and named imports.";
      }

      var sourceInfo = getSourceInfoErrorAddendum(source);

      if (sourceInfo) {
        info += sourceInfo;
      } else {
        info += getDeclarationErrorAddendum();
      }

      var typeString;

      if (type === null) {
        typeString = 'null';
      } else if (isArray(type)) {
        typeString = 'array';
      } else if (type !== undefined && type.$$typeof === REACT_ELEMENT_TYPE) {
        typeString = "<" + (getComponentNameFromType(type.type) || 'Unknown') + " />";
        info = ' Did you accidentally export a JSX literal instead of a component?';
      } else {
        typeString = typeof type;
      }

      error('React.jsx: type is invalid -- expected a string (for ' + 'built-in components) or a class/function (for composite ' + 'components) but got: %s.%s', typeString, info);
    }

    var element = jsxDEV(type, props, key, source, self); // The result can be nullish if a mock or a custom function is used.
    // TODO: Drop this when these are no longer allowed as the type argument.

    if (element == null) {
      return element;
    } // Skip key warning if the type isn't valid since our key validation logic
    // doesn't expect a non-string/function type and can throw confusing errors.
    // We don't want exception behavior to differ between dev and prod.
    // (Rendering will throw with a helpful message and as soon as the type is
    // fixed, the key warnings will appear.)


    if (validType) {
      var children = props.children;

      if (children !== undefined) {
        if (isStaticChildren) {
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              validateChildKeys(children[i], type);
            }

            if (Object.freeze) {
              Object.freeze(children);
            }
          } else {
            error('React.jsx: Static children should always be an array. ' + 'You are likely explicitly calling React.jsxs or React.jsxDEV. ' + 'Use the Babel transform instead.');
          }
        } else {
          validateChildKeys(children, type);
        }
      }
    }

    {
      if (hasOwnProperty.call(props, 'key')) {
        var componentName = getComponentNameFromType(type);
        var keys = Object.keys(props).filter(function (k) {
          return k !== 'key';
        });
        var beforeExample = keys.length > 0 ? '{key: someKey, ' + keys.join(': ..., ') + ': ...}' : '{key: someKey}';

        if (!didWarnAboutKeySpread[componentName + beforeExample]) {
          var afterExample = keys.length > 0 ? '{' + keys.join(': ..., ') + ': ...}' : '{}';

          error('A props object containing a "key" prop is being spread into JSX:\n' + '  let props = %s;\n' + '  <%s {...props} />\n' + 'React keys must be passed directly to JSX without using spread:\n' + '  let props = %s;\n' + '  <%s key={someKey} {...props} />', beforeExample, componentName, afterExample, componentName);

          didWarnAboutKeySpread[componentName + beforeExample] = true;
        }
      }
    }

    if (type === REACT_FRAGMENT_TYPE) {
      validateFragmentProps(element);
    } else {
      validatePropTypes(element);
    }

    return element;
  }
} // These two functions exist to still get child warnings in dev
// even with the prod transform. This means that jsxDEV is purely
// opt-in behavior for better messages but that we won't stop
// giving you warnings if you use production apis.

function jsxWithValidationStatic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, true);
  }
}
function jsxWithValidationDynamic(type, props, key) {
  {
    return jsxWithValidation(type, props, key, false);
  }
}

var jsx =  jsxWithValidationDynamic ; // we may want to special case jsxs internally to take advantage of static children.
// for now we can ship identical prod functions

var jsxs =  jsxWithValidationStatic ;

exports.Fragment = REACT_FRAGMENT_TYPE;
exports.jsx = jsx;
exports.jsxs = jsxs;
  })();
}


/***/ }),

/***/ "./node_modules/react/jsx-runtime.js":
/*!*******************************************!*\
  !*** ./node_modules/react/jsx-runtime.js ***!
  \*******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-jsx-runtime.development.js */ "./node_modules/react/cjs/react-jsx-runtime.development.js");
}


/***/ }),

/***/ "./src/assets/frontend.scss":
/*!**********************************!*\
  !*** ./src/assets/frontend.scss ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/components/Button/index.jsx":
/*!*****************************************!*\
  !*** ./src/components/Button/index.jsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");




const Button = ({
  label,
  onClick,
  disabled,
  loadingLabel = label
}) => {
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    appearance
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_2__.store_name).getPreset();
  const handleClick = async () => {
    try {
      setIsLoading(true);
      await onClick();
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: `button-wbk ${isLoading ? 'loading-wbk' : ''}`,
    onClick: handleClick,
    disabled: disabled,
    style: {
      backgroundColor: appearance[1]
    }
  }, isLoading ? loadingLabel : label);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Button);

/***/ }),

/***/ "./src/components/ItemBlock/index.jsx":
/*!********************************************!*\
  !*** ./src/components/ItemBlock/index.jsx ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ItemBlock)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);





function ItemBlock({
  data,
  selected,
  onChange,
  type,
  handleAction
}) {
  const [actionState, setActionState] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)('');
  const handleCancelAction = (event, action, id) => {
    event.preventDefault();
    setActionState('confirmCancel');
  };
  const handleCancelConfirmAction = async (event, action, id) => {
    event.preventDefault();
    setActionState('loading');
    await handleAction(event, 'cancel', data.id);
  };
  const wording = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_2__.store_name).getPreset().wording;
  let className = 'item-wbk timeslot-animation-wbk';
  let fieldName = '';
  let title = '-';
  let showActions = true;
  switch (type) {
    case 'booking':
      fieldName = 'wbk_booking';
      title = data.service_name;
      break;
    case 'past-booking':
      fieldName = 'wbk_booking';
      title = data.service_name;
      showActions = false;
      break;
    case 'service':
      fieldName = 'wbk_service_id';
      break;
    case 'extras':
      fieldName = 'wbk_extras';
      break;
  }
  const [showDescription, setShowDescription] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", {
    className: className
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: 'item-title-wbk'
  }, title), data.date && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "item-block-sub-title-wbk clock-icon-wbk item-wbk icon-wbk clock-grey-icon-wbk"
  }, data.date + ' ' + data.time_formated)), data.price && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "item-block-sub-title-wbk clock-icon-wbk item-wbk icon-wbk money-grey-icon-wbk"
  }, data.price)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "checkbox",
    className: "hidden-wbk",
    value: data.id,
    onChange: onChange
  }), showActions && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    class: "item-block-controls-wbk"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#",
    onClick: event => handleAction(event, 'reschedule', data.id, data.service_id)
  }, wording.reschedule), actionState === 'confirmCancel' ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "color-red-wbk",
    onClick: event => handleCancelConfirmAction(event, data.id),
    href: "#"
  }, wording.confirm_cancel) : actionState === 'loading' ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "loading-small-horizontal-wbk"
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    className: "color-red-wbk",
    onClick: event => handleCancelAction(event),
    href: "#"
  }, wording.cancel))));
}

/***/ }),

/***/ "./src/components/LoginForm/index.jsx":
/*!********************************************!*\
  !*** ./src/components/LoginForm/index.jsx ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _Button___WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Button/ */ "./src/components/Button/index.jsx");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");






const LoginForm = ({
  onSuccess
}) => {
  const [username, setUsername] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [password, setPassword] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [isLoading, setIsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isLoginDisabled, setIsLoginDisabled] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(true);
  const {
    wording,
    appearance
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_3__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_4__.store_name).getPreset();

  // Check login button state whenever username or password changes
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setIsLoginDisabled(username.trim() === '' || password.trim() === '');
  }, [username, password]);
  const handleKeyDown = event => {
    if (event.key === 'Enter' && !isLoginDisabled) {
      login();
    }
  };
  const login = async event => {
    setError('');
    setIsLoading(true);
    try {
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_1___default()({
        path: '/wbk/v2/login',
        method: 'POST',
        data: {
          username,
          password
        }
      });
      onSuccess(response);
    } catch (loginError) {
      setError(loginError.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__heading"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("h2", {
    className: "wbk-form__title",
    style: {
      color: appearance[0],
      borderColor: appearance[0]
    }
  }, wording.label_login_title)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__input-wrapper"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__group"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "wbk-form__label"
  }, wording.label_login_user), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "text",
    value: username,
    onChange: e => setUsername(e.target.value),
    onKeyDown: handleKeyDown,
    disabled: isLoading
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__group"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "wbk-form__label"
  }, wording.label_login_password), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    type: "password",
    value: password,
    onChange: e => setPassword(e.target.value),
    onKeyDown: handleKeyDown,
    disabled: isLoading
  }))), error && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__error"
  }, error), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "wbk-form__button-holder"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_Button___WEBPACK_IMPORTED_MODULE_2__["default"], {
    onClick: login,
    label: wording.label_login_button,
    loadingLabel: wording.loading,
    disabled: isLoginDisabled || isLoading
  })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LoginForm);

/***/ }),

/***/ "./src/components/Navbar/index.jsx":
/*!*****************************************!*\
  !*** ./src/components/Navbar/index.jsx ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");




const Navbar = ({
  setTab
}) => {
  const [isOpen, setIsOpen] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [currentTab, setCurrentTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('future_bookings');
  const {
    wording
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_2__.store_name).getPreset();
  const handleLinkClick = (event, name) => {
    event.preventDefault();
    setTab({
      name: name
    });
    setCurrentTab(name);
  };
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("nav", {
    className: "navbar-wbk"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "menu-toggle-wbk",
    onClick: toggleMenu
  }, "\u2630"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: `navbar-links-wbk ${isOpen ? 'open-wbk' : ''}`
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#bookings",
    onClick: event => handleLinkClick(event, 'future_bookings'),
    className: `${currentTab === 'future_bookings' ? 'active-wbk' : ''}`
  }, wording.bookings)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("a", {
    href: "#booking-history",
    onClick: event => handleLinkClick(event, 'booking_history'),
    className: `${currentTab === 'booking_history' ? 'active-wbk' : ''}`
  }, wording.booking_history))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Navbar);

/***/ }),

/***/ "./src/components/ServiceCalendar/index.jsx":
/*!**************************************************!*\
  !*** ./src/components/ServiceCalendar/index.jsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_calendar__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-calendar */ "./node_modules/react-calendar/dist/esm/index.js");
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_calendar_dist_Calendar_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-calendar/dist/Calendar.css */ "./node_modules/react-calendar/dist/Calendar.css");






const ServiceCalendar = ({
  onChange
}) => {
  const formData = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_1__.store_name).getFormData();
  const {
    settings
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_1__.store_name).getPreset();
  const {
    services
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_2__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_1__.store_name).getPreset();
  const service = services.find(service => service.id == formData.services[0]);
  const daysOfWeekToDisable = Object.values(service.business_days).map(Number);
  const tileDisabled = ({
    date
  }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return true;
    }
    if (!daysOfWeekToDisable.includes(date.getDay())) {
      return true;
    }
    return false;
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, formData && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_calendar__WEBPACK_IMPORTED_MODULE_4__["default"], {
    calendarType: settings.week_start == 1 ? 'iso8601' : 'gregory',
    onChange: onChange,
    value: formData.date,
    tileDisabled: tileDisabled
  }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ServiceCalendar);

/***/ }),

/***/ "./src/components/TimeSlot/index.jsx":
/*!*******************************************!*\
  !*** ./src/components/TimeSlot/index.jsx ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../store/frontend */ "./src/store/frontend/index.js");



const TimeSlot = ({
  data,
  onChange,
  selected
}) => {
  const {
    appearance
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.select)(_store_frontend__WEBPACK_IMPORTED_MODULE_2__.store_name).getPreset();
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("li", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("input", {
    className: "timeslot_radio-w",
    type: "radio",
    name: 'time',
    value: data.start,
    onChange: onChange,
    checked: selected == data.start
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "radio-time-block-wbk timeslot-animation-wbk",
    style: {
      backgroundColor: data.start == selected && appearance[1],
      borderColor: data.start == selected ? appearance[1] : appearance[0]
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "radio-checkmark",
    style: data.start == selected ? {
      borderColor: `#ffffff`
    } : {}
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "time-w",
    "data-server-date": data.formated_time,
    "data-local-date": data.formated_date_local,
    "data-server-time": data.formated_time,
    "data-local-time": data.formated_time_local,
    "data-start": data.start,
    "data-end": data.end,
    "data-service": null
  }, data.formated_time))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TimeSlot);

/***/ }),

/***/ "./src/frontend/App.jsx":
/*!******************************!*\
  !*** ./src/frontend/App.jsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _assets_frontend_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../assets/frontend.scss */ "./src/assets/frontend.scss");


const App = () => {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "main-block-w"
  }, data.services ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: data.settings.narrow_form ? 'appointment-box-w wbk_narrow_form' : 'appointment-box-w'
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-status-wrapper-w",
    style: {
      background: data.appearance[0]
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(StatusBar, {
    steps: steps
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "circle-chart-wb"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    style: {
      background: data.appearance[0]
    },
    className: "circle-chart-text-wb"
  }, "1", ' ', __('of', 'webba-booking-lite') + ' ' + steps.length)), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-status-text-mobile-w"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "current-step-w"
  }, "Services"), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("p", {
    className: "next-step-w"
  }, "Next", (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("span", {
    className: "btn-ring-wb"
  }), ": Date and time")))), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-content-w"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-content-scroll-w"
  }, data.services && (is_single_service ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(WbkText, {
    value: "",
    name: 'date',
    placeholder: data.settings.date_placeholder,
    label: data.settings.date_label
  })) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, attributes.showCategoryList && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(WbkSelect, {
    options: data.categories,
    label: data.settings.category_label
  }), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("label", {
    className: "wbk-input-label wbk_service_label"
  }, data.settings.service_label), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
    className: "wbk_v5_service_list"
  }, filtered_services.map((value, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(ServiceBlock, {
    data: value,
    selected: selectedServices,
    onChange: handleServiceSelect,
    type: attributes.multipleServices,
    environment: data,
    key: index
  }))))), ' '), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "button-block-w two-buttons-w"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    type: "button",
    className: "button-w button-prev-w",
    style: {
      background: data.appearance[1]
    }
  }, __('Back', 'webba-booking-lite')), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "button_container_wbk"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("button", {
    className: "button-w button-next-w",
    style: {
      background: data.appearance[1]
    }
  }, __('Next', 'webba-booking-lite')))))) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-box-w loading_holder_w"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(Skeleton, {
    count: 5,
    height: 30
  })));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);

/***/ }),

/***/ "./src/frontend/UserDashboard.jsx":
/*!****************************************!*\
  !*** ./src/frontend/UserDashboard.jsx ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _assets_frontend_scss__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./assets/frontend.scss */ "./src/frontend/assets/frontend.scss");
/* harmony import */ var react_loading_skeleton__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! react-loading-skeleton */ "./node_modules/react-loading-skeleton/dist/index.js");
/* harmony import */ var react_loading_skeleton_dist_skeleton_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-loading-skeleton/dist/skeleton.css */ "./node_modules/react-loading-skeleton/dist/skeleton.css");
/* harmony import */ var _components_Navbar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/Navbar */ "./src/components/Navbar/index.jsx");
/* harmony import */ var _components_LoginForm___WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/LoginForm/ */ "./src/components/LoginForm/index.jsx");
/* harmony import */ var _components_ItemBlock___WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/ItemBlock/ */ "./src/components/ItemBlock/index.jsx");
/* harmony import */ var _components_ServiceCalendar___WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../components/ServiceCalendar/ */ "./src/components/ServiceCalendar/index.jsx");
/* harmony import */ var _components_TimeSlot__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../components/TimeSlot */ "./src/components/TimeSlot/index.jsx");
/* harmony import */ var _components_Button___WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../components/Button/ */ "./src/components/Button/index.jsx");
/* harmony import */ var react_custom_scroll__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react-custom-scroll */ "./node_modules/react-custom-scroll/dist/index.es.js");
/* harmony import */ var _store_frontend__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../store/frontend */ "./src/store/frontend/index.js");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_11__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_12__);















const UserDashboard = () => {
  const [tab, setTab] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({
    name: 'future_bookings',
    details: null
  });
  const [timeSlotsLoading, setTimeSlotsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isFutureBookingsLoading, setIsFutureBookingsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isPastBookingsLoading, setIsPastBookingsLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const {
    preset,
    futureBookings,
    pastBookings,
    formData,
    dynamicAttributes
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_11__.useSelect)(select => {
    const currentPreset = select(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name).getPreset();
    return {
      preset: currentPreset,
      futureBookings: currentPreset && currentPreset.user ? select(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name).getUserFutureBookings() : null,
      pastBookings: currentPreset && currentPreset.user ? select(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name).getUserPastBookings() : null,
      formData: select(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name).getFormData(),
      dynamicAttributes: select(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name).getDynamicAttributes()
    };
  }, [_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name]);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_12__.useEffect)(() => {
    if (!futureBookings) {
      setIsFutureBookingsLoading(true);
    } else {
      setIsFutureBookingsLoading(false);
    }
    if (!pastBookings) {
      setIsPastBookingsLoading(true);
    } else {
      setIsPastBookingsLoading(false);
    }
  }, [futureBookings, pastBookings]);
  const {
    setUserName,
    setFormData,
    fetchTimeSlots,
    updateBooking,
    deleteBooking
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_11__.dispatch)(_store_frontend__WEBPACK_IMPORTED_MODULE_10__.store_name);
  const handleSuccessLogin = response => {
    // to do: replace with real booking name
    setUserName('abcd');
  };
  const handleBookingAction = (event, action, id, service_id) => {
    event.preventDefault();
    switch (action) {
      case 'reschedule':
        setFormData('booking', id);
        setFormData('services', [service_id]);
        setTab({
          name: 'reschedule',
          details: id
        });
        break;
      case 'cancel':
        setFormData('booking', id);
        deleteBooking();
        break;
    }
  };
  const handleReschedule = async event => {
    await updateBooking();
    setTab({
      name: 'future_bookings'
    });
  };
  const handleSetDate = async (value, event) => {
    var timeZoneOffsetInMinutes = new Date().getTimezoneOffset();
    setFormData('time', null);
    setFormData('offset', timeZoneOffsetInMinutes);
    setFormData('date', value);
    setTimeSlotsLoading(true);
    await fetchTimeSlots();
    setTimeSlotsLoading(false);
  };
  const handleTimeSelect = event => {
    setFormData('time', event.target.value);
  };
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "main-block-wbk"
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: preset?.settings?.narrow_form ? 'appointment-box-wbk narrow-form-wbk' : 'appointment-box-wbk' + (!preset.user ? ' justify-content-center-wbk' : '')
  }, Object.keys(preset).length === 0 ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_loading_skeleton__WEBPACK_IMPORTED_MODULE_13__["default"], null) : !preset.user ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_LoginForm___WEBPACK_IMPORTED_MODULE_4__["default"], {
    onSuccess: handleSuccessLogin
  }) : (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-status-wrapper-wbk",
    style: {
      backgroundColor: preset?.appearance[0]
    }
  }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Navbar__WEBPACK_IMPORTED_MODULE_3__["default"], {
    setTab: setTab
  })), (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
    className: "appointment-content-wbk"
  }, (() => {
    switch (tab.name) {
      case 'future_bookings':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_custom_scroll__WEBPACK_IMPORTED_MODULE_9__.CustomScroll, {
          heightRelativeToParent: `640px`
        }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
          className: "items-list-wbk"
        }, isFutureBookingsLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_loading_skeleton__WEBPACK_IMPORTED_MODULE_13__["default"], {
          count: 4,
          height: `160px`,
          borderRadius: `10px`
        }), !isFutureBookingsLoading && futureBookings && futureBookings.length > 0 ? futureBookings.map((value, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ItemBlock___WEBPACK_IMPORTED_MODULE_5__["default"], {
          data: value,
          selected: false,
          type: 'booking',
          key: index,
          key: value.id,
          handleAction: handleBookingAction
        })) : !isFutureBookingsLoading && preset.wording.no_booking));
      case 'reschedule':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react__WEBPACK_IMPORTED_MODULE_0__.Fragment, null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ServiceCalendar___WEBPACK_IMPORTED_MODULE_6__["default"], {
          onChange: handleSetDate
        }), timeSlotsLoading ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
          className: "mt-50-wbk"
        }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_loading_skeleton__WEBPACK_IMPORTED_MODULE_13__["default"], {
          count: 8,
          inline: true,
          width: `calc(25% - 10px)`,
          height: `50px`,
          style: {
            marginRight: `10px`
          },
          borderRadius: `10px`
        })) : dynamicAttributes.timeSlots ? (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
          className: "mt-50-wbk"
        }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_custom_scroll__WEBPACK_IMPORTED_MODULE_9__.CustomScroll, {
          heightRelativeToParent: `205px`
        }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
          className: "timeslots-list-wbk"
        }, dynamicAttributes.timeSlots.map((value, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_TimeSlot__WEBPACK_IMPORTED_MODULE_7__["default"], {
          key: index,
          data: value,
          onChange: handleTimeSelect,
          selected: formData.time,
          style: {
            backgroundColor: preset?.appearance[1]
          }
        }))))) : null, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", {
          className: "button-holder-wbk"
        }, formData.time && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_Button___WEBPACK_IMPORTED_MODULE_8__["default"], {
          onClick: handleReschedule,
          label: preset.wording.reschedule,
          loadingLabel: preset.wording.loading,
          disabled: false,
          style: {
            backgroundColor: preset?.appearance[1]
          }
        })));
      case 'booking_history':
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_custom_scroll__WEBPACK_IMPORTED_MODULE_9__.CustomScroll, {
          heightRelativeToParent: `640px`
        }, (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("ul", {
          className: "items-list-wbk"
        }, isPastBookingsLoading && (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(react_loading_skeleton__WEBPACK_IMPORTED_MODULE_13__["default"], {
          count: 4,
          height: `130px`,
          borderRadius: `10px`
        }), !isPastBookingsLoading && pastBookings && pastBookings.length > 0 ? pastBookings.map((value, index) => (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_components_ItemBlock___WEBPACK_IMPORTED_MODULE_5__["default"], {
          data: value,
          selected: false,
          type: 'past-booking',
          index: index,
          key: value.id,
          handleAction: handleBookingAction
        })) : !isPastBookingsLoading && preset.wording.no_booking));
        break;
      default:
        return (0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)("div", null);
    }
  })()))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (UserDashboard);

/***/ }),

/***/ "./src/frontend/assets/frontend.scss":
/*!*******************************************!*\
  !*** ./src/frontend/assets/frontend.scss ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "./src/frontend/hooks/useLocale.jsx":
/*!******************************************!*\
  !*** ./src/frontend/hooks/useLocale.jsx ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useLocale: () => (/* binding */ useLocale)
/* harmony export */ });
const useLocale = () => {
  const locale = document.documentElement?.lang || 'en-US';
  const [lang, localeCode = ''] = locale.split('-');
  return {
    lang,
    locale,
    localeCode
  };
};

/***/ }),

/***/ "./src/store/frontend/index.js":
/*!*************************************!*\
  !*** ./src/store/frontend/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   default_state: () => (/* binding */ default_state),
/* harmony export */   store_name: () => (/* binding */ store_name)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _frontend_hooks_useLocale__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../frontend/hooks/useLocale */ "./src/frontend/hooks/useLocale.jsx");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/url */ "@wordpress/url");
/* harmony import */ var _wordpress_url__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_url__WEBPACK_IMPORTED_MODULE_3__);




const {
  lang
} = (0,_frontend_hooks_useLocale__WEBPACK_IMPORTED_MODULE_2__.useLocale)();
const DEFAULT_STATE = {
  userFutureBookings: null,
  userPastBookings: null,
  preset: {},
  formData: {
    services: [],
    offset: null,
    date: null,
    booking: null,
    time: null
  },
  dynamicAttributes: {
    timeSlots: null
  }
};
const actions = {
  setUserFutureBookings(bookings) {
    return {
      type: 'SET_USER_FUTURE_BOOKING',
      bookings
    };
  },
  setUserPastBookings(bookings) {
    return {
      type: 'SET_USER_PAST_BOOKING',
      bookings
    };
  },
  setPreset(preset) {
    return {
      type: 'SET_PRESET',
      preset
    };
  },
  setUserName(userName) {
    return {
      type: 'SET_USER_NAME',
      userName
    };
  },
  setFormData(key, value) {
    return {
      type: 'SET_FORM_DATA',
      key,
      value
    };
  },
  setDynamicAttribute(key, value) {
    return {
      type: 'SET_DYNAMIC_ATTRIBUTE',
      key,
      value
    };
  },
  fetchTimeSlots: () => async ({
    select,
    dispatch
  }) => {
    const queryString = new URLSearchParams(select.getFormData()).toString();
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbk/v2/get-time-slots/?${queryString}`
    });
    dispatch.setDynamicAttribute('timeSlots', response.timeslots);
  },
  updateBooking: () => async ({
    select,
    dispatch
  }) => {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbk/v2/update-booking`,
      method: 'POST',
      data: select.getFormData()
    });
    let bookings = select.getUserFutureBookings();
    const index = bookings.findIndex(booking => {
      if (!Number.isInteger(Number(booking.id))) {
        return false;
      }
      return booking.id === response.booking.id;
    });
    if (index !== -1) {
      bookings[index] = {
        ...bookings[index],
        ...response.booking
      };
    }
    dispatch.setUserFutureBookings(bookings);
  },
  deleteBooking: () => async ({
    select,
    dispatch
  }) => {
    const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbk/v2/delete-booking`,
      method: 'POST',
      data: select.getFormData()
    });
    let bookings = select.getUserFutureBookings();
    const updatedBookings = bookings.filter(booking => booking.id !== select.getFormData().booking);
    dispatch.setUserFutureBookings(updatedBookings);
  }
};
const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.createReduxStore)('webba_booking/frontend_store', {
  reducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
      case 'SET_USER_FUTURE_BOOKING':
        return {
          ...state,
          userFutureBookings: action.bookings
        };
      case 'SET_USER_PAST_BOOKING':
        return {
          ...state,
          userPastBookings: action.bookings
        };
      case 'SET_PRESET':
        return {
          ...state,
          preset: action.preset
        };
      case 'SET_USER_NAME':
        return {
          ...state,
          preset: {
            ...state.preset,
            user: action.userName
          }
        };
      case 'SET_FORM_DATA':
        return {
          ...state,
          formData: {
            ...state.formData,
            [action.key]: action.value
          }
        };
      case 'SET_DYNAMIC_ATTRIBUTE':
        return {
          ...state,
          dynamicAttributes: {
            ...state.dynamicAttributes,
            [action.key]: action.value
          }
        };
    }
    return state;
  },
  actions,
  selectors: {
    getUserFutureBookings(state) {
      return state.userFutureBookings;
    },
    getUserPastBookings(state) {
      return state.userPastBookings;
    },
    getPreset(state) {
      return state.preset;
    },
    getFormData(state) {
      return state.formData;
    },
    getDynamicAttributes(state) {
      return state.dynamicAttributes;
    },
    getSelectedDate(state) {
      return state.seletedDate;
    }
  },
  resolvers: {
    getUserFutureBookings: () => async ({
      dispatch
    }) => {
      const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path: (0,_wordpress_url__WEBPACK_IMPORTED_MODULE_3__.addQueryArgs)(`/wbk/v2/get-user-bookings/`, {
          lang
        })
      });
      dispatch.setUserFutureBookings(result.bookings);
    },
    getUserPastBookings: () => async ({
      dispatch
    }) => {
      const params = {
        pastBookings: true,
        lang
      };
      const queryString = new URLSearchParams(params).toString();
      const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path: `/wbk/v2/get-user-bookings/?${queryString}`
      });
      dispatch.setUserPastBookings(result.bookings);
    },
    getPreset: () => async ({
      dispatch
    }) => {
      const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path: `/wbk/v2/get-preset/`
      });
      dispatch.setPreset(result);
    }
  }
});
(0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.register)(store);
const store_name = 'webba_booking/frontend_store';
const default_state = DEFAULT_STATE;

/***/ }),

/***/ "@wordpress/api-fetch":
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
/***/ ((module) => {

module.exports = window["wp"]["apiFetch"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/url":
/*!*****************************!*\
  !*** external ["wp","url"] ***!
  \*****************************/
/***/ ((module) => {

module.exports = window["wp"]["url"];

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

module.exports = window["React"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************!*\
  !*** ./src/frontend/index.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _UserDashboard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./UserDashboard */ "./src/frontend/UserDashboard.jsx");
/* harmony import */ var _App__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./App */ "./src/frontend/App.jsx");

const {
  render
} = wp.element;


const container = document.getElementById('wbk_user_dashboard');
if (container) {
  render((0,react__WEBPACK_IMPORTED_MODULE_0__.createElement)(_UserDashboard__WEBPACK_IMPORTED_MODULE_1__["default"], null), container);
}
})();

/******/ })()
;
//# sourceMappingURL=index.js.map