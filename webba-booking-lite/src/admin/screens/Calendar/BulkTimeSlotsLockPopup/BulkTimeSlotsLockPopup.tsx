import { useCallback, useEffect, useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import DatePicker from "react-datepicker";
import Select from "react-select";
import classNames from "classnames";
import "react-datepicker/dist/react-datepicker.css";
import { store_name } from "../../../../store/backend";
import { getAdminSelectStyles } from "../../../utils/adminSelectStyles";
import {
  formatWbkDate,
  getReadableTime,
} from "../../../components/Form/utils/dateTime";
import { Button } from "../../../components/Button/Button";
import { useSidebar } from "../../../components/Sidebar/SidebarContext";
import closeIcon from "../../../../../public/images/icon-close.svg";
import "../../../components/Form/Form.scss";
import "./BulkTimeSlotsLockPopup.scss";

type SelectOption = {
  value: string;
  label: string;
};

type BulkTimeSlotsLockPopupProps = {
  onSuccess?: () => Promise<void> | void;
};

const DAYS_OF_WEEK: SelectOption[] = [
  { value: "1", label: __("Monday", "webba-booking-lite") },
  { value: "2", label: __("Tuesday", "webba-booking-lite") },
  { value: "3", label: __("Wednesday", "webba-booking-lite") },
  { value: "4", label: __("Thursday", "webba-booking-lite") },
  { value: "5", label: __("Friday", "webba-booking-lite") },
  { value: "6", label: __("Saturday", "webba-booking-lite") },
  { value: "7", label: __("Sunday", "webba-booking-lite") },
];

const TIME_STEP_SECONDS = 900;
const TIME_MAX_SECONDS = 86400;

const selectStyles = getAdminSelectStyles();

const buildTimeOptions = (timeFormat: string): SelectOption[] => {
  const options: SelectOption[] = [];
  for (let time = 0; time <= TIME_MAX_SECONDS; time += TIME_STEP_SECONDS) {
    options.push({
      value: String(time),
      label: getReadableTime(time, timeFormat),
    });
  }
  return options;
};

export const BulkTimeSlotsLockPopup = ({
  onSuccess,
}: BulkTimeSlotsLockPopupProps) => {
  const sidebar = useSidebar();
  const { scheduleToolsAction, setToastNotification } = useDispatch(store_name);
  const { services, categories, settings } = useSelect(
    (select) => {
      // @ts-ignore
      const preset = select(store_name).getPreset() || {};
      // @ts-ignore
      const storeServices = select(store_name).getItems("services") || [];
      // @ts-ignore
      const storeCategories =
        select(store_name).getItems("service_categories") || [];

      return {
        services:
          Array.isArray(storeServices) && storeServices.length
            ? storeServices
            : preset.services || [],
        categories:
          Array.isArray(storeCategories) && storeCategories.length
            ? storeCategories
            : preset.categories || [],
        settings: preset.settings || {},
      };
    },
    []
  );

  const timeFormat = settings?.time_format || "g:i a";
  const timeOptions = useMemo(
    () => buildTimeOptions(timeFormat),
    [timeFormat]
  );
  const defaultTimeFrom = useMemo(
    () =>
      timeOptions.find((option) => Number(option.value) >= 900) ||
      timeOptions[0] ||
      null,
    [timeOptions]
  );
  const defaultTimeTo = useMemo(
    () => timeOptions[timeOptions.length - 1] || null,
    [timeOptions]
  );

  const [action, setAction] = useState<"lock" | "unlock">("lock");
  const [serviceId, setServiceId] = useState<SelectOption | null>(null);
  const [categoryId, setCategoryId] = useState<SelectOption | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [timeFrom, setTimeFrom] = useState<SelectOption | null>(null);
  const [timeTo, setTimeTo] = useState<SelectOption | null>(null);
  const [daysOfWeek, setDaysOfWeek] = useState<SelectOption[]>(DAYS_OF_WEEK);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!timeFrom && defaultTimeFrom) {
      setTimeFrom(defaultTimeFrom);
    }
    if (!timeTo && defaultTimeTo) {
      setTimeTo(defaultTimeTo);
    }
  }, [defaultTimeFrom, defaultTimeTo, timeFrom, timeTo]);

  const serviceOptions = useMemo<SelectOption[]>(
    () =>
      (services || [])
        .map((service: any) => ({
          value: String(service.id ?? service.value ?? ""),
          label: String(service.name ?? service.label ?? ""),
        }))
        .filter((option: SelectOption) => option.value && option.label),
    [services]
  );

  const categoryOptions = useMemo<SelectOption[]>(
    () =>
      (categories || [])
        .map((category: any) => ({
          value: String(category.id ?? category.value ?? ""),
          label: String(category.name ?? category.label ?? ""),
        }))
        .filter((option: SelectOption) => option.value && option.label),
    [categories]
  );

  const validate = useCallback(() => {
    const errors: Record<string, boolean> = {};

    if (!serviceId && !categoryId) {
      errors.service = true;
      errors.category = true;
    }
    if (!dateRange[0] || !dateRange[1]) {
      errors.dateRange = true;
    }
    if (!timeFrom) {
      errors.timeFrom = true;
    }
    if (!timeTo) {
      errors.timeTo = true;
    }
    if (
      timeFrom &&
      timeTo &&
      Number(timeFrom.value) >= Number(timeTo.value)
    ) {
      errors.timeFrom = true;
      errors.timeTo = true;
    }
    if (!daysOfWeek.length) {
      errors.daysOfWeek = true;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [serviceId, categoryId, dateRange, timeFrom, timeTo, daysOfWeek]);

  const handleSubmit = useCallback(async () => {
    setErrorMessage("");
    if (!validate() || isSubmitting || !timeFrom || !timeTo) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = (await scheduleToolsAction({
        lock_action: action,
        lock_target: "timeslots",
        service: serviceId?.value || "0",
        category: categoryId?.value || "0",
        date_range: `${formatWbkDate(dateRange[0]!)} - ${formatWbkDate(dateRange[1]!)}`,
        days_of_week: daysOfWeek.map((day) => day.value).join(","),
        from: timeFrom.value,
        to: timeTo.value,
      })) as { status?: number; message?: string };

      if (!response?.status) {
        const message =
          response?.message || __("Something went wrong.", "webba-booking-lite");
        setErrorMessage(message);
        setToastNotification({
          type: "error",
          message,
        });
        return;
      }

      setToastNotification({
        type: "success",
        message: response.message || __("Done.", "webba-booking-lite"),
      });
      await onSuccess?.();
      sidebar.close();
    } catch (e: any) {
      const message =
        e?.message ||
        e?.data?.message ||
        __("Failed to update time slots.", "webba-booking-lite");
      setErrorMessage(String(message));
      setToastNotification({
        type: "error",
        message: String(message),
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validate,
    isSubmitting,
    timeFrom,
    timeTo,
    scheduleToolsAction,
    action,
    serviceId,
    categoryId,
    dateRange,
    daysOfWeek,
    onSuccess,
    sidebar,
    setToastNotification,
  ]);

  return (
    <div className="wbk_form__container wbk_bulkTimeSlotsLockPopup">
      <div className="wbk_form__header">
        <div className="wbk_form__headerTitle">
          {__("Lock / Unlock multiple time slots", "webba-booking-lite")}
        </div>
        <div>
          <button
            type="button"
            onClick={sidebar.close}
            className="wbk_form__closeBtn"
          >
            <img src={closeIcon} alt={__("Close", "webba-booking-lite")} />
            <span className="wbk_form__closeBtnText">
              {__("Close", "webba-booking-lite")}
            </span>
          </button>
        </div>
      </div>
      <div className="wbk_bulkTimeSlotsLockPopup__body">
        <div className="wbk_bulkTimeSlotsLockPopup__fields">
          <div className="wbk_bulkTimeSlotsLockPopup__field">
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("Choose an action", "webba-booking-lite")}
            </label>
            <div className="wbk_bulkTimeSlotsLockPopup__radioGroup">
              <label
                className={classNames("wbk_bulkTimeSlotsLockPopup__radio", {
                  "wbk_bulkTimeSlotsLockPopup__radio--checked": action === "lock",
                })}
              >
                <input
                  type="radio"
                  name="bulk-time-slots-lock-action"
                  checked={action === "lock"}
                  onChange={() => setAction("lock")}
                />
                <span>{__("Lock time slots", "webba-booking-lite")}</span>
              </label>
              <label
                className={classNames("wbk_bulkTimeSlotsLockPopup__radio", {
                  "wbk_bulkTimeSlotsLockPopup__radio--checked":
                    action === "unlock",
                })}
              >
                <input
                  type="radio"
                  name="bulk-time-slots-lock-action"
                  checked={action === "unlock"}
                  onChange={() => setAction("unlock")}
                />
                <span>{__("Unlock time slots", "webba-booking-lite")}</span>
              </label>
            </div>
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.service,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("Select service", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_bulkTimeSlotsLockPopupSelect"
              styles={selectStyles}
              options={serviceOptions}
              value={serviceId}
              onChange={(option) => {
                setServiceId(option as SelectOption | null);
                setFieldErrors((prev) => ({
                  ...prev,
                  service: false,
                  category: false,
                }));
              }}
              placeholder={__("Select service", "webba-booking-lite")}
              isClearable
            />
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.category,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("Or category", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_bulkTimeSlotsLockPopupSelect"
              styles={selectStyles}
              options={categoryOptions}
              value={categoryId}
              onChange={(option) => {
                setCategoryId(option as SelectOption | null);
                setFieldErrors((prev) => ({
                  ...prev,
                  service: false,
                  category: false,
                }));
              }}
              placeholder={__("Select category", "webba-booking-lite")}
              isClearable
            />
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.dateRange,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("Lock time slots in the range", "webba-booking-lite")}
            </label>
            <DatePicker
              className={classNames("wbk_bulkTimeSlotsLockPopup__dateInput", {
                "wbk_bulkTimeSlotsLockPopup__dateInput--focused": dateRangeOpen,
              })}
              calendarClassName="wbk_bulkTimeSlotsLockPopup__calendar"
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              selectsRange
              isClearable
              monthsShown={2}
              dateFormat="MMM d, yyyy"
              placeholderText={__("Select date range", "webba-booking-lite")}
              onChange={(range: [Date | null, Date | null]) => {
                setDateRange(range);
                if (range[0] && range[1]) {
                  setDateRangeOpen(false);
                  setFieldErrors((prev) => ({ ...prev, dateRange: false }));
                }
              }}
              open={dateRangeOpen}
              onClickOutside={() => setDateRangeOpen(false)}
              onInputClick={() => setDateRangeOpen(true)}
            />
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.timeFrom,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("From", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_bulkTimeSlotsLockPopupSelect"
              styles={selectStyles}
              options={timeOptions}
              value={timeFrom}
              onChange={(option) => {
                setTimeFrom(option as SelectOption | null);
                setFieldErrors((prev) => ({
                  ...prev,
                  timeFrom: false,
                  timeTo: false,
                }));
              }}
              placeholder={__("From", "webba-booking-lite")}
            />
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.timeTo,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("To", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_bulkTimeSlotsLockPopupSelect"
              styles={selectStyles}
              options={timeOptions}
              value={timeTo}
              onChange={(option) => {
                setTimeTo(option as SelectOption | null);
                setFieldErrors((prev) => ({
                  ...prev,
                  timeFrom: false,
                  timeTo: false,
                }));
              }}
              placeholder={__("To", "webba-booking-lite")}
            />
          </div>

          <div
            className={classNames("wbk_bulkTimeSlotsLockPopup__field", {
              "wbk_bulkTimeSlotsLockPopup__field--error": fieldErrors.daysOfWeek,
            })}
          >
            <label className="wbk_bulkTimeSlotsLockPopup__label">
              {__("Apply only for the next days of the week", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_bulkTimeSlotsLockPopupSelect"
              styles={selectStyles}
              options={DAYS_OF_WEEK}
              value={daysOfWeek}
              onChange={(options) => {
                setDaysOfWeek(Array.isArray(options) ? [...options] : []);
                setFieldErrors((prev) => ({ ...prev, daysOfWeek: false }));
              }}
              placeholder={__("Select days", "webba-booking-lite")}
              isMulti
              closeMenuOnSelect={false}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="wbk_bulkTimeSlotsLockPopup__error">{errorMessage}</p>
        )}
      </div>
      <div className="wbk_form__buttons">
        <div className="wbk_form__editButtons" />
        <Button
          className="wbk_form__buttonCancel"
          type="secondary"
          onClick={sidebar.close}
          disabled={isSubmitting}
        >
          {__("Cancel", "webba-booking-lite")}
        </Button>
        <Button onClick={handleSubmit} isLoading={isSubmitting}>
          {action === "lock"
            ? __("Lock time slots", "webba-booking-lite")
            : __("Unlock time slots", "webba-booking-lite")}
        </Button>
      </div>
    </div>
  );
};
