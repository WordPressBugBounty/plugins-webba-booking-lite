import apiFetch from "@wordpress/api-fetch";
import { createReduxStore, register } from "@wordpress/data";
import { addQueryArgs } from "@wordpress/url";
import { ISettingsField } from "../../admin/components/Settings/types";

declare global {
  interface Window {
    __wbkScheduleFetchStatus?: Map<string, "pending">;
  }
}

const scheduleFetchStatus =
  typeof window !== "undefined"
    ? (window.__wbkScheduleFetchStatus ??= new Map<string, "pending">())
    : new Map<string, "pending">();

const getScheduleFetchKey = (serviceId: number | string, month: string) =>
  `${String(serviceId)}:${month}`;

const DEFAULT_STATE = {
  staff_members: null,
  locations: null,
  appointments: null,
  services: null,
  units: null,
  extras: null,
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
  setupChecklist: null,
  setupChecklistLoading: false,
  setupChecklistExpandRequest: 0,
  featureTour: null,
  featureTourLoading: false,
  schedule: {},
  scheduleLoading: false,
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
      try {
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
      } finally {
        dispatch.toggleBusy();
      }
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
      try {
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
        return { ...update, ...response.data, id: response.id };
      } finally {
        dispatch.toggleBusy();
      }
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
  setSchedule: (serviceId: number | string, month: string, data: Record<string, unknown>) => {
    return {
      type: "SET_SCHEDULE",
      serviceId,
      month,
      data,
    };
  },
  setScheduleLoading: (loading: boolean) => ({
    type: "SET_SCHEDULE_LOADING",
    loading,
  }),
  fetchSchedule:
    (serviceId: number | string, month: string) =>
    async ({ dispatch }) => {
      if (!serviceId || !month) {
        return null;
      }

      const key = getScheduleFetchKey(serviceId, month);
      if (scheduleFetchStatus.get(key) === "pending") {
        return null;
      }

      scheduleFetchStatus.set(key, "pending");
      dispatch.setScheduleLoading(true);
      try {
        const result = await apiFetch({
          path: addQueryArgs(`/wbk/v2/get-schedule/`, {
            service_id: serviceId,
            month,
          }),
        });
        dispatch.setSchedule(serviceId, month, result as Record<string, unknown>);
        return result;
      } catch (error) {
        throw error;
      } finally {
        scheduleFetchStatus.delete(key);
        dispatch.setScheduleLoading(false);
      }
    },
  lockDay:
    (serviceId: number | string, day: number) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/lock-day/",
        method: "POST",
        data: {
          service_id: serviceId,
          day,
        },
      });
    },
  unlockDay:
    (serviceId: number | string, day: number) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/unlock-day/",
        method: "POST",
        data: {
          service_id: serviceId,
          day,
        },
      });
    },
  lockTime:
    (serviceId: number | string, time: number) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/lock-time/",
        method: "POST",
        data: {
          service_id: serviceId,
          time,
        },
      });
    },
  unlockTime:
    (serviceId: number | string, time: number) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/unlock-time/",
        method: "POST",
        data: {
          service_id: serviceId,
          time,
        },
      });
    },
  scheduleToolsAction:
    (data: {
      lock_action: "lock" | "unlock";
      lock_target?: "dates" | "timeslots";
      date_range: string;
      service: number | string;
      category: number | string;
      exclude_dates?: string;
      days_of_week: string | Array<number | string>;
      from?: number | string;
      to?: number | string;
    }) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/schedule-tools-action/",
        method: "POST",
        data: {
          lock_target: "dates",
          ...data,
        },
      });
    },
  createMultipleBookings:
    (data: {
      service_id: number | string;
      date: string;
      times: Array<number | string>;
      quantity: number | string;
      status: string;
      name: string;
      email: string;
      phone?: string;
      desc?: string;
    }) =>
    async () => {
      return apiFetch({
        path: "/wbk/v2/create-multiple-bookings/",
        method: "POST",
        data,
      });
    },
  fetchTimeSlots:
    (params: { date: string; services: string | number; offset?: number }) =>
    async () => {
      return apiFetch({
        path: addQueryArgs(`/wbk/v2/get-time-slots`, {
          date: params.date,
          services: params.services,
          offset: params.offset ?? 0,
        }),
      });
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
  setAdminTheme: (theme: "light" | "dark") => ({
    type: "SET_ADMIN_THEME",
    theme,
  }),
  saveAdminTheme:
    (theme: "light" | "dark") =>
    async ({ dispatch }) => {
      const result = await apiFetch({
        path: "/wbk/v2/save-admin-theme/",
        method: "POST",
        data: { theme },
      });

      dispatch.setAdminTheme(theme);
      return result;
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
  setSetupChecklist: (checklist: Record<string, unknown> | null) => ({
    type: "SET_SETUP_CHECKLIST",
    checklist,
  }),
  setSetupChecklistLoading: (loading: boolean) => ({
    type: "SET_SETUP_CHECKLIST_LOADING",
    loading,
  }),
  fetchSetupChecklist: () => async ({ dispatch }: { dispatch: any }) => {
    dispatch.setSetupChecklistLoading(true);
    try {
      const response = await apiFetch({
        path: "/webba-booking/v1/setup-checklist",
      });
      dispatch.setSetupChecklist(response);
      return response;
    } finally {
      dispatch.setSetupChecklistLoading(false);
    }
  },
  dismissSetupChecklist: () => async ({ dispatch }: { dispatch: any }) => {
    const response: { status?: string; state?: Record<string, unknown> } =
      await apiFetch({
        path: "/webba-booking/v1/setup-checklist/dismiss",
        method: "POST",
      });
    if (response?.state) {
      dispatch.setSetupChecklist(response.state);
    }
    return response;
  },
  completeSetupChecklistStep: (stepId: string) =>
    async ({ dispatch }: { dispatch: any }) => {
      const response: { status?: string; state?: Record<string, unknown> } =
        await apiFetch({
          path: "/webba-booking/v1/setup-checklist/complete-step",
          method: "POST",
          data: { step_id: stepId },
        });
      if (response?.state) {
        dispatch.setSetupChecklist(response.state);
      }
      return response;
    },
  saveSetupChecklistEmailNotifications: (
    templates: { id: number; enabled: boolean }[]
  ) => async ({ dispatch }: { dispatch: any }) => {
    const response: { status?: string; state?: Record<string, unknown> } =
      await apiFetch({
        path: "/webba-booking/v1/setup-checklist/save-email-notifications",
        method: "POST",
        data: { templates },
      });
    if (response?.state) {
      dispatch.setSetupChecklist(response.state);
    }
    return response;
  },
  skipSetupChecklistStep: (stepId: string) =>
    async ({ dispatch }: { dispatch: any }) => {
      const response: { status?: string; state?: Record<string, unknown> } =
        await apiFetch({
          path: "/webba-booking/v1/setup-checklist/skip-step",
          method: "POST",
          data: { step_id: stepId },
        });
      if (response?.state) {
        dispatch.setSetupChecklist(response.state);
      }
      return response;
    },
  setFeatureTour: (tour: Record<string, unknown> | null) => ({
    type: "SET_FEATURE_TOUR",
    tour,
  }),
  setFeatureTourLoading: (loading: boolean) => ({
    type: "SET_FEATURE_TOUR_LOADING",
    loading,
  }),
  fetchFeatureTour: () => async ({ dispatch }: { dispatch: any }) => {
    dispatch.setFeatureTourLoading(true);
    try {
      const response = await apiFetch({
        path: "/webba-booking/v1/feature-tour",
      });
      dispatch.setFeatureTour(response);
      return response;
    } finally {
      dispatch.setFeatureTourLoading(false);
    }
  },
  completeFeatureTourStep: (stepId: string) =>
    async ({ dispatch }: { dispatch: any }) => {
      const response: { status?: string; state?: Record<string, unknown> } =
        await apiFetch({
          path: "/webba-booking/v1/feature-tour/complete-step",
          method: "POST",
          data: { step_id: stepId },
        });
      if (response?.state) {
        dispatch.setFeatureTour(response.state);
      }
      return response;
    },
  dismissFeatureTour: () => async ({ dispatch }: { dispatch: any }) => {
    const response: { status?: string; state?: Record<string, unknown> } =
      await apiFetch({
        path: "/webba-booking/v1/feature-tour/dismiss",
        method: "POST",
      });
    if (response?.state) {
      dispatch.setFeatureTour(response.state);
    }
    return response;
  },
  relaunchOnboarding: () => async ({ dispatch }: { dispatch: any }) => {
    const response: {
      status?: string;
      checklist?: Record<string, unknown>;
    } = await apiFetch({
      path: "/webba-booking/v1/onboarding/relaunch",
      method: "POST",
    });

    if (response?.checklist) {
      dispatch.setSetupChecklist(response.checklist);
    }

    dispatch.requestSetupChecklistExpand();

    return response;
  },
  requestSetupChecklistExpand: () => ({
    type: "REQUEST_SETUP_CHECKLIST_EXPAND",
  }),
  clearSetupChecklistExpandRequest: () => ({
    type: "CLEAR_SETUP_CHECKLIST_EXPAND_REQUEST",
  }),
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
    case "SET_ADMIN_THEME": {
      return {
        ...state,
        preset: {
          ...state.preset,
          admin_theme: action.theme,
        },
      };
    }
    case "SET_SETUP_CHECKLIST": {
      return {
        ...state,
        setupChecklist: action.checklist,
      };
    }
    case "SET_SETUP_CHECKLIST_LOADING": {
      return {
        ...state,
        setupChecklistLoading: action.loading,
      };
    }
    case "REQUEST_SETUP_CHECKLIST_EXPAND": {
      return {
        ...state,
        setupChecklistExpandRequest: state.setupChecklistExpandRequest + 1,
      };
    }
    case "CLEAR_SETUP_CHECKLIST_EXPAND_REQUEST": {
      return {
        ...state,
        setupChecklistExpandRequest: 0,
      };
    }
    case "SET_FEATURE_TOUR": {
      return {
        ...state,
        featureTour: action.tour,
      };
    }
    case "SET_FEATURE_TOUR_LOADING": {
      return {
        ...state,
        featureTourLoading: action.loading,
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
    case "SET_SCHEDULE": {
      const key = `${action.serviceId}:${action.month}`;
      return {
        ...state,
        schedule: {
          ...state.schedule,
          [key]: action.data,
        },
      };
    }
    case "SET_SCHEDULE_LOADING": {
      return {
        ...state,
        scheduleLoading: action.loading,
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
  getSchedule: (state, serviceId: number | string, month: string) => {
    if (!serviceId || !month) {
      return null;
    }
    return state.schedule?.[`${serviceId}:${month}`] || null;
  },
  isScheduleLoading: (state) => state.scheduleLoading,
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
  getSetupChecklist: (state: any) => state.setupChecklist,
  isSetupChecklistLoading: (state: any) => state.setupChecklistLoading,
  getSetupChecklistExpandRequest: (state: any) =>
    state.setupChecklistExpandRequest,
  getFeatureTour: (state: any) => state.featureTour,
  isFeatureTourLoading: (state: any) => state.featureTourLoading,
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
