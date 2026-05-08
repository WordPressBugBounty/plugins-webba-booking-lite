import apiFetch from "@wordpress/api-fetch";
import { createReduxStore, register } from "@wordpress/data";
import { addQueryArgs } from "@wordpress/url";
import { ISettingsField } from "../../admin/components/Settings/types";

const DEFAULT_STATE = {
  staff_members: null,
  locations: null,
  appointments: null,
  services: null,
  units: null,
  cancelled_appointments: null,
  service_categories: null,
  email_templates: null,
  coupons: null,
  pricing_rules: null,
  gg_calendars: null,
  outlook_calendars: null,
  connected_calendars: null,
  isLoading: false,
  preset: {},
  fieldOptions: {},
  ggAuthData: {},
  outlookAuthData: {},
  busy: false,
  dashboardStats: {
    blocks: null,
    chart: null,
    priceFormat: null,
  },
  cellData: null,
  deleteFailed: false,
  filters: {},
  forms: null,
  enableData: {},
  options: {},
  sourcedOptions: {},
  loadingStates: {
    locations: false,
    staff_members: false,
    appointments: false,
    services: false,
    cancelled_appointments: false,
    service_categories: false,
    email_templates: false,
    coupons: false,
    pricing_rules: false,
    gg_calendars: false,
    connected_calendars: false,
    options: false,
  },
};
const actions = {
  toggleBusy: () => ({ type: "TOGGLE_BUSY" }),

  setLoading: (loading: boolean) => ({
    type: "SET_LOADING",
    loading,
  }),
  setItems(model, items) {
    return {
      type: "SET_ITEMS",
      model,
      items,
    };
  },
  setItem:
    (model, data) =>
    async ({ dispatch }) => {
      dispatch.toggleBusy();
      const response: any = await apiFetch({
        path: `/wbkdata/v1/save-item/`,
        method: "POST",
        data: {
          model,
          data,
        },
      });
      dispatch({
        type: "SET_ITEM",
        model: model,
        data: { ...data, ...response.data, id: response?.id },
      });
      dispatch.toggleBusy();
    },
  updateUserCalendar:
    (data: Record<string, any>) =>
    async ({ dispatch }) => {
      dispatch.toggleBusy();
      try {
        const response: any = await apiFetch({
          path: `/wbk/v2/update-user-calendar/`,
          method: "POST",
          data,
        });
        dispatch({
          type: "SET_ITEM",
          model: "connected_calendars",
          data: { ...data, ...response?.data, id: response?.id ?? data?.id },
        });
      } finally {
        dispatch.toggleBusy();
      }
    },
  addItem:
    (model, data) =>
    async ({ dispatch }) => {
      dispatch.toggleBusy();
      const update = { ...data };
      delete update.id;
      const response: any = await apiFetch({
        path: `/wbkdata/v1/save-item/`,
        method: "POST",
        data: {
          model: model,
          data: update,
        },
      });
      dispatch({
        type: "ADD_ITEM",
        model: model,
        data: { ...update, ...response.data, id: response.id },
      });
      dispatch.toggleBusy();
      return { ...update, ...response.data, id: response.id };
    },
  deleteItems:
    (model, ids) =>
    async ({ dispatch }) => {
      try {
        await apiFetch({
          path: `/wbkdata/v1/delete-items/`,
          method: "POST",
          data: {
            model: model,
            ids: ids,
          },
        });

        dispatch({ type: "DELETE_ITEMS", model: model, ids: ids });
      } catch (e: any) {
        if (e?.code === "rest_forbidden" || e.status === "fail") {
          dispatch.setDeleteFailed(true);
        }
      }
    },
  setPreset(preset) {
    return {
      type: "SET_PRESET",
      preset,
    };
  },
  setFieldOptions(model: string, field: string, options: Record<string, string | number>) {
    return {
      type: "SET_FIELD_OPTIONS",
      model,
      field,
      options,
    };
  },
  setFieldLoading(model: string, field: string, loading: boolean = true) {
    return {
      type: "SET_FIELD_LOADING",
      model,
      field,
      loading,
    };
  },
  setGgAuthData(calendarId, data) {
    return {
      type: "SET_GG_AUTH_DATA",
      data,
      calendarId,
    };
  },
  setOutlookAuthData(calendarId, data) {
    return {
      type: "SET_OUTLOOK_AUTH_DATA",
      data,
      calendarId,
    };
  },
  filterItems:
    (model: string, filters: TFilterValue<TAllowedFilterValues>) =>
    async ({ dispatch }) => {
      dispatch.setLoading(true);

      const queryParams = {
        model,
        filters,
      };

      const result = await apiFetch({
        path: addQueryArgs(`/wbkdata/v1/get-items/`, queryParams),
      });

      dispatch.setItems(model, result);
      dispatch.setLoading(false);
    },
  setDashboardStats: (data) => {
    return {
      type: "SET_DASHBOARD_STATS",
      data,
    };
  },
  filterDashboardStats:
    (filters) =>
    async ({ dispatch }) => {
      const result = await apiFetch({
        path: addQueryArgs(`/wbk/v2/get-dashboard-stats/`, { filters }),
      });
      dispatch.setDashboardStats(result);
    },
  setCellData: (model, data) => {
    return {
      type: "SET_CELL_DATA",
      data,
      model,
    };
  },
  setDeleteFailed: (status) => {
    return {
      type: "SET_DELETE_FAILED",
      status,
    };
  },
  setFilters: (model, filters) => {
    return {
      type: "SET_FILTERS",
      model,
      filters,
    };
  },
  updateAppearance:
    (options: Record<string, any>) =>
    async ({ dispatch }) => {
      const res = await apiFetch({
        path: "/wbk/v2/save-appearance/",
        method: "POST",
        data: {
          options,
        },
      });

      return res;
    },
  setEnableData: (endpoint: string, data: Record<string, string | number | boolean>) => {
    return {
      type: "SET_ENABLE_DATA",
      endpoint,
      data,
    };
  },
  fetchEnableData: (endpoint: string, data: Record<string, string | number | boolean>) => {
    return async ({ dispatch }) => {
      const result = await apiFetch({
        path: addQueryArgs(`/wbk/v2/${endpoint}/`, { ...data }),
      });

      dispatch.setEnableData(endpoint, result);
      return result;
    };
  },
  setToastNotification: (notification: Record<string, any> | null) => {
    return {
      type: "SET_TOAST_NOTIFICATION",
      notification,
    };
  },
  setOptions: (section: string, form_data: Record<string, any>) => {
    return async ({ dispatch, select }: any) => {
      dispatch.toggleBusy();
      const result = await apiFetch({
        path: "/wbk/v2/save-options/",
        method: "POST",
        data: {
          form_data: JSON.stringify({
            section,
            ...form_data,
          }),
        },
      });
      const options = select.getOptions();

      dispatch({
        type: "SET_OPTIONS",
        data: {
          ...options,
          [section]: {
            ...options?.[section],
            fields: Object.values(
              options?.[section].fields.reduce(
                (acc: Record<string, any>, field: ISettingsField, index: number) => {
                  acc[index] = {
                    ...field,
                    value: form_data[field.id],
                  };
                  return acc;
                },
                {}
              )
            ),
          },
        },
      });
      dispatch.toggleBusy();
    };
  },
  removeZoomAuth: () => {
    return async ({ dispatch }) => {
      const result = await apiFetch({
        path: "/wbk/v2/remove-zoom-auth/",
        method: "POST",
      });

      dispatch({
        type: "REMOVE_ZOOM_AUTH",
      });

  return result;
};
  },
  setSourcedOptions: (model, field, options) => {
    return {
      type: "SET_SOURCED_OPTIONS",
      model,
      field,
      options,
    };
  },
  setLoadingState: (model: string, loading: boolean) => {
    return {
      type: "SET_LOADING_STATE",
      model,
      loading,
    };
  },
  submitWizardInitialSetup: (data: Record<string, string | number | unknown>) => {
    return async () => {
      const response: { status?: string; shortcode?: string } =
        await apiFetch({
          path: "/webba-booking/v1/wizard/submit-initial-setup",
          method: "POST",
          data,
        });
      return response;
    };
  },
  submitWizardFinalSetup: (payload: {
    final_action: "finalize" | "setup_advanced";
    enable_emails?: boolean;
    enable_sms?: boolean;
    enable_payments?: boolean;
    enable_google?: boolean;
  }) => {
    return async () => {
      const response: { status?: string; url?: string } =
        await apiFetch({
          path: "/webba-booking/v1/wizard/submit-final-setup",
          method: "POST",
          data: payload,
        });
      return response;
    };
  },
};

interface BaseItem {
  id: string | number;
  [key: string]: any;
}

const updateModel = <T extends BaseItem>(model: T[], data: Partial<T>): T[] =>
  model.map((item) => (item.id === data.id ? { ...item, ...data } : item));

const deleteFromModel = <T extends BaseItem>(model: T[], ids: (string | number)[]): T[] =>
  model.filter((item) => !ids.includes(item.id));

const reducer = (state: State = DEFAULT_STATE, action: Action): State => {
  switch (action.type) {
    case "SET_LOADING": {
      return {
        ...state,
        isLoading: action.loading,
      };
    }

    case "SET_ITEMS": {
      if (action.model in state) {
        return {
          ...state,
          [action.model]: action.items,
        };
      }
      return state;
    }

    case "SET_ITEM": {
      if (action.model in state) {
        return {
          ...state,
          [action.model]: updateModel(state[action.model], action.data),
        };
      }
      return state;
    }

    case "ADD_ITEM": {
      if (action.model in state) {
        return {
          ...state,
          [action.model]: [...state[action.model], action.data],
        };
      }
      return state;
    }

    case "DELETE_ITEMS": {
      if (action.model in state) {
        return {
          ...state,
          [action.model]: deleteFromModel(state[action.model], action.ids),
        };
      }
      return state;
    }

    case "SET_PRESET": {
      return {
        ...state,
        preset: action.preset,
      };
    }
    case "SET_GG_AUTH_DATA": {
      return {
        ...state,
        ggAuthData: {
          ...state.ggAuthData,
          [action.calendarId]: action.data,
        },
      };
    }
    case "SET_OUTLOOK_AUTH_DATA": {
      return {
        ...state,
        outlookAuthData: {
          ...state.outlookAuthData,
          [action.calendarId]: action.data,
        },
      };
    }
    case "SET_ENABLE_DATA": {
      return {
        ...state,
        enableData: {
          ...state.enableData,
          [action.endpoint]: action.data,
        },
      };
    }
    case "SET_FIELD_OPTIONS": {
      return {
        ...state,
        fieldOptions: {
          ...state.fieldOptions,
          [action.model]: {
            ...state.fieldOptions[action.model],
            ...action.options[action.model],
          },
        },
      };
    }
    case "SET_FIELD_LOADING": {
      const modelFields = state.fieldOptions[action.model] || {};
      const previousFieldState = modelFields[action.field];
      let updatedFieldState: Record<string, unknown> | unknown[] = { loading: action.loading };

      if (Array.isArray(previousFieldState)) {
        updatedFieldState = { options: previousFieldState, loading: action.loading };
      } else if (
        previousFieldState &&
        typeof previousFieldState === "object" &&
        !Array.isArray(previousFieldState)
      ) {
        const existingOptions = { ...(previousFieldState as Record<string, unknown>) };
        delete existingOptions.loading;
        delete existingOptions.options;
        updatedFieldState = { ...existingOptions, loading: action.loading } as Record<string, unknown>;
      }

      return {
        ...state,
        fieldOptions: {
          ...state.fieldOptions,
          [action.model]: {
            ...modelFields,
            [action.field]: updatedFieldState,
          },
        },
      };
    }
    case "TOGGLE_BUSY": {
      return {
        ...state,
        busy: !state.busy,
      };
    }
    case "SET_DASHBOARD_STATS": {
      return {
        ...state,
        dashboardStats: action.data,
      };
    }
    case "SET_CELL_DATA": {
      return {
        ...state,
        cellData: {
          ...state.cellData,
          [action.model]: action.data,
        },
      };
    }
    case "SET_DELETE_FAILED": {
      return {
        ...state,
        deleteFailed: action.status,
      };
    }
    case "SET_FILTERS": {
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.model]: action.filters,
        },
      };
    }
    case "SET_TOAST_NOTIFICATION": {
      return {
        ...state,
        toastNotification: action.notification,
      };
    }
    case "SET_OPTIONS": {
      return {
        ...state,
        options: action.data,
      };
    }
    case "SET_SOURCED_OPTIONS": {
      return {
        ...state,
        sourcedOptions: {
          ...state.sourcedOptions,
          [action.model]: {
            ...state.sourcedOptions[action.model],
            [action.field]: action.options,
          },
        },
      };
    }
    case "SET_LOADING_STATE": {
      return {
        ...state,
        loadingStates: {
          ...state.loadingStates,
          [action.model]: action.loading,
        },
      };
    }
    default:
      return state;
  }
};

const selectors = {
  getItems: (state: State, model: string) => {
    if (state[model]) {
      return state[model].sort((a: any, b: any) => b.id - a.id);
    }

    return state[model] || [];
  },
  getLoading: (state) => state.isLoading,
  getPreset(state) {
    return state.preset;
  },
  getFieldOptions: (state: any, model: string, field: string) => {
    const fieldState = state.fieldOptions?.[model]?.[field];
    if (fieldState === undefined || fieldState === null) {
      return [];
    }
    if (Array.isArray(fieldState)) {
      return fieldState;
    }
    if (typeof fieldState === "object") {
      const fieldStateObject = fieldState as Record<string, unknown>;
      if (Array.isArray(fieldStateObject.options)) {
        return fieldStateObject.options;
      }
      const optionList = fieldStateObject.options;
      const namedOptions = { ...fieldStateObject };
      delete namedOptions.loading;
      delete namedOptions.options;
      if (Array.isArray(optionList)) {
        return optionList;
      }
      const formattedOptions: Record<string, string | { label: string }> = {};
      for (const optionKey of Object.keys(namedOptions)) {
        if (optionKey === "loading") {
          continue;
        }
        const optionValue = namedOptions[optionKey];
        if (
          typeof optionValue === "string" ||
          (optionValue && typeof optionValue === "object" && "label" in (optionValue as object))
        ) {
          formattedOptions[optionKey] = optionValue as string | { label: string };
        }
      }
      return formattedOptions;
    }
    return [];
  },
  getFieldLoading: (state: any, model: string, field: string) => {
    const fieldState = state.fieldOptions?.[model]?.[field];
    if (
      fieldState &&
      typeof fieldState === "object" &&
      !Array.isArray(fieldState) &&
      "loading" in fieldState
    ) {
      return Boolean((fieldState as { loading?: boolean }).loading);
    }
    return false;
  },
  getModelFieldLoading: (state: any, model: string) => state[model] === null && state.isLoading,
  getGgAuthData(state, calendarId) {
    return state.ggAuthData[calendarId] || {};
  },
  getOutlookAuthData(state, calendarId) {
    return state.outlookAuthData[calendarId] || {};
  },
  isBusy: (state) => state.busy,
  getDashboardStats: (state) => state.dashboardStats,
  getCellData: (state, model) => state.cellData?.[model] || {},
  getDeleteFailed: (state) => state.deleteFailed,
  getFilters: (state: any, model: string) => state.filters?.[model] || {},
  getEnableData: (state: any, endpoint: string, data: Record<string, string | number | boolean>) =>
    state.enableData?.[endpoint] || {},
  getToastNotification: (state) => state.toastNotification,
  getOptions: (state: any) => state.options || {},
  getSourcedOptions: (state: any, model: string, field: string) => {
    return state.sourcedOptions?.[model]?.[field] || [];
  },
  getLoadingState: (state: any, model: string) => {
    return state.loadingStates?.[model] || false;
  },
};

export const store = createReduxStore("webba_booking/data_store", {
  reducer: reducer,
  actions,
  selectors: selectors,
  resolvers: {
    getItems:
      (model: string, filters: Record<string, string | number>[] | null) =>
      async ({ dispatch }) => {
        dispatch.setLoading(true);
        dispatch.setLoadingState(model, true);

        try {
          const queryParams = {
            model,
            filters,
            lang: "bn",
          };

          const result = await apiFetch({
            path: addQueryArgs(`/wbkdata/v1/get-items/`, queryParams),
          });

          dispatch.setItems(model, result);
        } catch (error) {
          dispatch.setItems(model, [{ error }]);
        } finally {
          dispatch.setLoading(false);
          dispatch.setLoadingState(model, false);
        }
      },
    getPreset:
      () =>
      async ({ dispatch }) => {
        const result = await apiFetch({
          path: `/wbk/v2/get-preset/`,
        });
        dispatch.setPreset(result);
      },
    getFieldOptions:
      (
        model: string,
        field: string,
        formData: Record<string, string>,
        isDependent: boolean = false
      ) =>
      async ({ dispatch }) => {
        if (isDependent) {
          return;
        }

        dispatch.setFieldLoading(model, field, true);

        const options = await apiFetch({
          path: `/wbk/v2/get-field-options/`,
          method: "POST",
          data: {
            model,
            field,
            form: formData,
          },
        });

        dispatch.setFieldOptions(model, field, options);
      },
    getGgAuthData:
      (calendarId: string | number) =>
      async ({ dispatch }) => {
        const result = await apiFetch({
          path: addQueryArgs(`/wbk/v2/get-calendar-auth-data/`, {
            calendar_id: calendarId,
          }),
        });
        dispatch.setGgAuthData(calendarId, result);
      },
    getOutlookAuthData:
      (calendarId: string | number) =>
      async ({ dispatch }) => {
        const result = await apiFetch({
          path: addQueryArgs(`/wbk/v2/get-outlook-auth-data/`, {
            calendar_id: calendarId,
          }),
        });
        dispatch.setOutlookAuthData(calendarId, result);
      },
    getDashboardStats:
      () =>
      async ({ dispatch }) => {
        const result = await apiFetch({
          path: `/wbk/v2/get-dashboard-stats/`,
        });
        dispatch.setDashboardStats(result);
      },
    getCellData:
      (model) =>
      async ({ dispatch }) => {
        const result = await apiFetch({
          path: addQueryArgs(`/wbk/v2/get-cell-detail/`, {
            model,
          }),
        });
        dispatch.setCellData(model, result);
      },
    getEnableData:
      (endpoint: string, data: Record<string, string | number | boolean>) =>
      async ({ dispatch }) => {
        if (!endpoint) return;

        const result = await apiFetch({
          path: addQueryArgs(`/wbk/v2/${endpoint}/`, { ...data }),
        });
        dispatch.setEnableData(endpoint, result);
      },
    getOptions:
      () =>
      async ({ dispatch }) => {
        dispatch.setLoadingState("options", true);
        const result: any = await apiFetch({
          path: `/wbk/v2/get-options/`,
        });

        dispatch({
          type: "SET_OPTIONS",
          data: result?.data,
        });

        dispatch.setLoadingState("options", false);
      },
  },
});

register(store);

export const store_name = "webba_booking/data_store";
export const default_state = DEFAULT_STATE;
