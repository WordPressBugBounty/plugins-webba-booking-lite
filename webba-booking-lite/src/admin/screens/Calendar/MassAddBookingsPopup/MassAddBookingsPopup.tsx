import { useCallback, useEffect, useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import DatePicker from "react-datepicker";
import Select from "react-select";
import classNames from "classnames";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import { store_name } from "../../../../store/backend";
import { getAdminSelectStyles } from "../../../utils/adminSelectStyles";
import { formatWbkDate, wbkFormat } from "../../../components/Form/utils/dateTime";
import { Button } from "../../../components/Button/Button";
import { useSidebar } from "../../../components/Sidebar/SidebarContext";
import closeIcon from "../../../../../public/images/icon-close.svg";
import "../../../components/Form/Form.scss";
import "./MassAddBookingsPopup.scss";

type SelectOption = {
  value: string;
  label: string;
  freePlaces?: number;
  minQuantity?: number;
};

type TimeSlotApiItem = {
  start?: number;
  end?: number;
  free_places?: number;
  min_quantity?: number;
  formated_time_backend?: string;
  formatted_time?: string;
  formated_time?: string;
  status?: number | number[] | [number[], number];
};

type MassAddBookingsPopupProps = {
  onSuccess?: () => Promise<void> | void;
};

const selectStyles = getAdminSelectStyles();

const STATUS_OPTIONS: SelectOption[] = [
  { value: "pending", label: __("Pending", "webba-booking-lite") },
  { value: "approved", label: __("Approved", "webba-booking-lite") },
  { value: "rejected", label: __("Rejected", "webba-booking-lite") },
  { value: "cancelled", label: __("Cancelled", "webba-booking-lite") },
  { value: "arrived", label: __("Arrived", "webba-booking-lite") },
  { value: "noshow", label: __("No-Show", "webba-booking-lite") },
];

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const formatSlotLabel = (
  slot: TimeSlotApiItem,
  settings: Record<string, any> | undefined
): string => {
  const start = Number(slot.start);
  if (!Number.isFinite(start) || start <= 0) {
    const raw =
      slot.formated_time_backend ||
      slot.formatted_time ||
      slot.formated_time ||
      "";
    return stripHtml(raw) || String(slot.start || "");
  }

  const timeFormat = settings?.time_format || "g:i a";
  const timezone = settings?.timezone || "";
  const mode = settings?.wbk_date_format_time_slot_schedule || "start-end";
  const startLabel = wbkFormat(start, timeFormat, timezone);

  if (mode === "start") {
    return startLabel;
  }

  const end = Number(slot.end);
  const endTimestamp = Number.isFinite(end) && end > 0 ? end : start;
  return `${startLabel}-${wbkFormat(endTimestamp, timeFormat, timezone)}`;
};

export const MassAddBookingsPopup = ({
  onSuccess,
}: MassAddBookingsPopupProps) => {
  const sidebar = useSidebar();
  const { fetchTimeSlots, createMultipleBookings, setToastNotification } =
    useDispatch(store_name);
  const { services, settings } = useSelect(
    (select) => {
      // @ts-ignore
      const preset = select(store_name).getPreset() || {};
      // @ts-ignore
      const storeServices = select(store_name).getItems("services") || [];

      return {
        services:
          Array.isArray(storeServices) && storeServices.length
            ? storeServices
            : preset.services || [],
        settings: preset.settings || {},
      };
    },
    []
  );

  const [serviceId, setServiceId] = useState<SelectOption | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<SelectOption[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<SelectOption[]>([]);
  const [quantity, setQuantity] = useState<SelectOption | null>(null);
  const [status, setStatus] = useState<SelectOption>(STATUS_OPTIONS[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState("");

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

  const quantityOptions = useMemo<SelectOption[]>(() => {
    if (!selectedTimes.length) {
      return [];
    }

    let freePlaces = Number.POSITIVE_INFINITY;
    let minQuantity = 1;

    selectedTimes.forEach((slot) => {
      const places = Number(slot.freePlaces);
      if (Number.isFinite(places) && places < freePlaces) {
        freePlaces = places;
      }
      const min = Number(slot.minQuantity);
      if (Number.isFinite(min) && min > minQuantity) {
        minQuantity = min;
      }
    });

    if (!Number.isFinite(freePlaces) || freePlaces < minQuantity) {
      return [];
    }

    const options: SelectOption[] = [];
    for (let i = minQuantity; i <= freePlaces; i++) {
      options.push({ value: String(i), label: String(i) });
    }
    return options;
  }, [selectedTimes]);

  useEffect(() => {
    if (!quantityOptions.length) {
      setQuantity(null);
      return;
    }

    setQuantity((prev) => {
      if (prev && quantityOptions.some((option) => option.value === prev.value)) {
        return prev;
      }
      return quantityOptions[0];
    });
  }, [quantityOptions]);

  const resetDependentFields = useCallback(() => {
    setTimeSlots([]);
    setSelectedTimes([]);
    setQuantity(null);
    setErrorMessage("");
  }, []);

  const loadTimeSlots = useCallback(
    async (serviceValue: string, date: Date) => {
      setIsLoadingSlots(true);
      setErrorMessage("");
      setTimeSlots([]);
      setSelectedTimes([]);
      setQuantity(null);

      try {
        const dateKey = format(date, "yyyy-MM-dd");
        const response = (await fetchTimeSlots({
          date: `${dateKey} 00:00:00`,
          services: serviceValue,
          offset: 0,
        })) as { timeslots?: TimeSlotApiItem[] };

        const timeslots = Array.isArray(response?.timeslots)
          ? response.timeslots
          : [];

        const options = timeslots
          .filter((slot) => {
            const start = Number(slot.start);
            const freePlaces = Number(slot.free_places);
            return (
              Number.isFinite(start) &&
              start > 0 &&
              Number.isFinite(freePlaces) &&
              freePlaces > 0
            );
          })
          .map((slot) => ({
            value: String(slot.start),
            label: formatSlotLabel(slot, settings),
            freePlaces: Number(slot.free_places) || 0,
            minQuantity: Number(slot.min_quantity) || 1,
          }));

        setTimeSlots(options);
        if (!options.length) {
          setErrorMessage(
            __("No available time slots for the selected date.", "webba-booking-lite")
          );
        }
      } catch (e) {
        console.error(e);
        setErrorMessage(__("Failed to load time slots.", "webba-booking-lite"));
      } finally {
        setIsLoadingSlots(false);
      }
    },
    [fetchTimeSlots, settings]
  );

  const handleServiceChange = (option: SelectOption | null) => {
    setServiceId(option);
    setSelectedDate(null);
    resetDependentFields();
    setFieldErrors((prev) => ({ ...prev, service: false }));
  };

  const handleDateChange = async (date: Date | null) => {
    setSelectedDate(date);
    setDateOpen(false);
    setFieldErrors((prev) => ({ ...prev, date: false }));

    if (!date) {
      resetDependentFields();
      return;
    }

    if (!serviceId) {
      setSelectedDate(null);
      setFieldErrors((prev) => ({ ...prev, service: true }));
      setErrorMessage(__("Please select a service first.", "webba-booking-lite"));
      return;
    }

    await loadTimeSlots(serviceId.value, date);
  };

  const validate = useCallback(() => {
    const errors: Record<string, boolean> = {};

    if (!serviceId) {
      errors.service = true;
    }
    if (!selectedDate) {
      errors.date = true;
    }
    if (!selectedTimes.length) {
      errors.times = true;
    }
    if (!quantity) {
      errors.quantity = true;
    }
    if (!customerName.trim()) {
      errors.name = true;
    }
    if (!isValidEmail(customerEmail)) {
      errors.email = true;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [serviceId, selectedDate, selectedTimes, quantity, customerName, customerEmail]);

  const handleSubmit = useCallback(async () => {
    setErrorMessage("");
    if (!validate() || isSubmitting || !serviceId || !selectedDate || !quantity) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = (await createMultipleBookings({
        service_id: serviceId.value,
        date: formatWbkDate(selectedDate),
        times: selectedTimes.map((slot) => slot.value),
        quantity: quantity.value,
        status: status.value,
        name: customerName.trim(),
        email: customerEmail.trim(),
        phone: customerPhone.trim(),
        desc: comment.trim(),
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
        message:
          response.message ||
          __("Appointments added successfully.", "webba-booking-lite"),
      });
      await onSuccess?.();
      sidebar.close();
    } catch (e: any) {
      const message =
        e?.message ||
        e?.data?.message ||
        __("Failed to create bookings.", "webba-booking-lite");
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
    serviceId,
    selectedDate,
    quantity,
    createMultipleBookings,
    selectedTimes,
    status,
    customerName,
    customerEmail,
    customerPhone,
    comment,
    setToastNotification,
    onSuccess,
    sidebar,
  ]);

  const showDetails = Boolean(serviceId && selectedDate && !isLoadingSlots);

  return (
    <div className="wbk_form__container wbk_massAddBookingsPopup">
      <div className="wbk_form__header">
        <div className="wbk_form__headerTitle">
          {__("Add multiple bookings", "webba-booking-lite")}
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
      <div className="wbk_massAddBookingsPopup__body">
        <div className="wbk_massAddBookingsPopup__fields">
          <div
            className={classNames("wbk_massAddBookingsPopup__field", {
              "wbk_massAddBookingsPopup__field--error": fieldErrors.service,
            })}
          >
            <label className="wbk_massAddBookingsPopup__label">
              {__("Select service", "webba-booking-lite")}
            </label>
            <Select
              classNamePrefix="wbk_massAddBookingsPopupSelect"
              styles={selectStyles}
              options={serviceOptions}
              value={serviceId}
              onChange={(option) => handleServiceChange(option as SelectOption | null)}
              placeholder={__("Select service", "webba-booking-lite")}
              isClearable
            />
          </div>

          <div
            className={classNames("wbk_massAddBookingsPopup__field", {
              "wbk_massAddBookingsPopup__field--error": fieldErrors.date,
            })}
          >
            <label className="wbk_massAddBookingsPopup__label">
              {__("Select date", "webba-booking-lite")}
            </label>
            <DatePicker
              className="wbk_massAddBookingsPopup__dateInput"
              calendarClassName="wbk_massAddBookingsPopup__calendar"
              selected={selectedDate}
              isClearable
              monthsShown={1}
              dateFormat="MMM d, yyyy"
              placeholderText={__("Select date", "webba-booking-lite")}
              onChange={(date: Date | null) => {
                void handleDateChange(date);
              }}
              open={dateOpen}
              onClickOutside={() => setDateOpen(false)}
              onInputClick={() => setDateOpen(true)}
            />
          </div>

          {isLoadingSlots && (
            <p className="wbk_massAddBookingsPopup__loading">
              {__("Loading time slots...", "webba-booking-lite")}
            </p>
          )}

          {showDetails && (
            <>
              <div
                className={classNames("wbk_massAddBookingsPopup__field", {
                  "wbk_massAddBookingsPopup__field--error": fieldErrors.times,
                })}
              >
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Select time", "webba-booking-lite")}
                </label>
                <Select
                  classNamePrefix="wbk_massAddBookingsPopupSelect"
                  styles={selectStyles}
                  options={timeSlots}
                  value={selectedTimes}
                  onChange={(options) => {
                    setSelectedTimes(Array.isArray(options) ? [...options] : []);
                    setFieldErrors((prev) => ({ ...prev, times: false }));
                  }}
                  placeholder={__("Select time slots", "webba-booking-lite")}
                  isMulti
                  closeMenuOnSelect={false}
                  isDisabled={!timeSlots.length}
                />
                {!timeSlots.length && (
                  <p className="wbk_massAddBookingsPopup__hint">
                    {__(
                      "No available time slots for the selected date.",
                      "webba-booking-lite"
                    )}
                  </p>
                )}
              </div>

              <div
                className={classNames("wbk_massAddBookingsPopup__field", {
                  "wbk_massAddBookingsPopup__field--error": fieldErrors.quantity,
                })}
              >
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Booking items count", "webba-booking-lite")}
                </label>
                <Select
                  classNamePrefix="wbk_massAddBookingsPopupSelect"
                  styles={selectStyles}
                  options={quantityOptions}
                  value={quantity}
                  onChange={(option) => {
                    setQuantity(option as SelectOption | null);
                    setFieldErrors((prev) => ({ ...prev, quantity: false }));
                  }}
                  placeholder={__("Select quantity", "webba-booking-lite")}
                  isDisabled={!quantityOptions.length}
                />
              </div>

              <div className="wbk_massAddBookingsPopup__field">
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Booking status", "webba-booking-lite")}
                </label>
                <Select
                  classNamePrefix="wbk_massAddBookingsPopupSelect"
                  styles={selectStyles}
                  options={STATUS_OPTIONS}
                  value={status}
                  onChange={(option) =>
                    setStatus((option as SelectOption) || STATUS_OPTIONS[0])
                  }
                />
              </div>

              <div
                className={classNames("wbk_massAddBookingsPopup__field", {
                  "wbk_massAddBookingsPopup__field--error": fieldErrors.name,
                })}
              >
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Customer name", "webba-booking-lite")}
                </label>
                <input
                  type="text"
                  className="wbk_massAddBookingsPopup__textInput"
                  value={customerName}
                  onChange={(event) => {
                    setCustomerName(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, name: false }));
                  }}
                />
              </div>

              <div
                className={classNames("wbk_massAddBookingsPopup__field", {
                  "wbk_massAddBookingsPopup__field--error": fieldErrors.email,
                })}
              >
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Customer email", "webba-booking-lite")}
                </label>
                <input
                  type="email"
                  className="wbk_massAddBookingsPopup__textInput"
                  value={customerEmail}
                  onChange={(event) => {
                    setCustomerEmail(event.target.value);
                    setFieldErrors((prev) => ({ ...prev, email: false }));
                  }}
                />
              </div>

              <div className="wbk_massAddBookingsPopup__field">
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Customer phone", "webba-booking-lite")}
                </label>
                <input
                  type="text"
                  className="wbk_massAddBookingsPopup__textInput"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
              </div>

              <div className="wbk_massAddBookingsPopup__field">
                <label className="wbk_massAddBookingsPopup__label">
                  {__("Comment", "webba-booking-lite")}
                </label>
                <textarea
                  className="wbk_massAddBookingsPopup__textarea"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>
            </>
          )}
        </div>

        {errorMessage && (
          <p className="wbk_massAddBookingsPopup__error">{errorMessage}</p>
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
          {__("Create bookings", "webba-booking-lite")}
        </Button>
      </div>
    </div>
  );
};
