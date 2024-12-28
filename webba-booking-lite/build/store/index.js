/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************************!*\
  !*** ./src/store/frontend/index.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   default_state: () => (/* binding */ default_state),
/* harmony export */   store_name: () => (/* binding */ store_name)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);


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
        path: `/wbk/v2/get-user-bookings/`
      });
      dispatch.setUserFutureBookings(result.bookings);
    },
    getUserPastBookings: () => async ({
      dispatch
    }) => {
      const params = {
        pastBookings: true
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
})();

/******/ })()
;
//# sourceMappingURL=index.js.map