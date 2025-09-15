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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!************************************!*\
  !*** ./src/store/backend/index.js ***!
  \************************************/
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
  services: []
};
const actions = {
  setItems(model, items) {
    return {
      type: 'SET_ITEMS',
      model,
      items
    };
  },
  setItem: (model, data) => async ({
    dispatch
  }) => {
    const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbkdata/v1/save-item/`,
      method: 'POST',
      data: {
        model: model,
        data: data
      }
    });
    dispatch({
      type: 'SET_ITEM',
      model: model,
      data: data
    });
  },
  addItem: (model, data) => async ({
    dispatch
  }) => {
    const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbkdata/v1/save-item/`,
      method: 'POST',
      data: {
        model: model,
        data: data
      }
    });
    dispatch({
      type: 'ADD_ITEM',
      model: model,
      data: data
    });
  },
  deleteItems: (model, ids) => async ({
    dispatch
  }) => {
    const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/wbkdata/v1/delete-items/`,
      method: 'POST',
      data: {
        model: model,
        ids: ids
      }
    });
    dispatch({
      type: 'DELETE_ITEMS',
      model: model,
      ids: ids
    });
  }
};
const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.createReduxStore)('webba_booking/data_store', {
  reducer(state = DEFAULT_STATE, action) {
    switch (action.type) {
      case 'SET_ITEMS':
        switch (action.model) {
          case 'services':
            return {
              ...state,
              services: action.items
            };
        }
      case 'SET_ITEM':
        switch (action.model) {
          case 'services':
            const updatedServices = state.services.map(service => service.id === action.data.id ? {
              ...service,
              ...action.data
            } : service);
            return {
              ...state,
              services: updatedServices
            };
        }
      case 'ADD_ITEM':
        switch (action.model) {
          case 'services':
            const updatedServices = state.services;
            updatedServices.push(action.data);
            return {
              ...state,
              services: updatedServices
            };
        }
      case 'DELETE_ITEMS':
        switch (action.model) {
          case 'services':
            const idsToRemove = action.data.ids;
            const filteredServices = state.services.filter(service => !idsToRemove.includes(service.id));
            return {
              ...state,
              services: filteredServices
            };
        }
    }
    return state;
  },
  actions,
  selectors: {
    getItems: (state, model) => {
      switch (model) {
        case 'services':
          return state.services;
          // removed by dead control flow
{}
      }
    },
    getBookingsByUser(state) {}
  },
  resolvers: {
    getItems: model => async ({
      dispatch
    }) => {
      const params = {
        model: model
      };
      const queryString = new URLSearchParams(params).toString();
      const result = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
        path: `/wbkdata/v1/get-items/?${queryString}`
      });
      dispatch.setItems('services', result);
    }
  }
});
(0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.register)(store);
const store_name = 'webba_booking/data_store';
const default_state = DEFAULT_STATE;
})();

/******/ })()
;
//# sourceMappingURL=index.js.map