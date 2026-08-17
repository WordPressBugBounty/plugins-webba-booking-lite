import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {
  format,
  parse,
  startOfWeek as dateFnsStartOfWeek,
  getDay,
  fromUnixTime,
  getUnixTime,
  addMinutes,
  startOfMonth,
  endOfWeek,
  endOfMonth,
} from "date-fns";
import * as locales from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarScreen.scss";
import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react";
import { createFormFromModel } from "../../components/Form/lib/createForm";
import { useSidebar } from "../../components/Sidebar/SidebarContext";
import { Form } from "../../components/Form/Form";
import { dispatch, select, useDispatch, useSelect } from "@wordpress/data";
import { store_name } from "../../../store/backend";
import { createFormMenuSectionsFromModel } from "../../components/Form/utils/utils";
import { removePrefixesFromModelFields } from "../../components/WebbaDataTable/utils";
import BookingsModel from "../../../schemas/appointments.json";
import { stripIncompleteBookingExtrasForSubmit } from "../../components/Form/Fields/ExtrasSelectorField/ExtrasSelectorField";
import { FilterForm } from "../../components/Filter/FilterForm";
import { getFilterFields } from "./FilterConfigs";
import { __ } from "@wordpress/i18n";
import { toZonedTime } from "date-fns-tz";
import { formatWbkDate } from "../../components/Filter/utils";
import { Button } from "../../components/Button/Button";
import { Toggle } from "../../components/Toggle/Toggle";
import metadata from "../../../schemas/appointments.json";
import { TAllowedFilterValue } from "../../components/Filter/types";
import { increaseOpacity } from "../../components/Form/Fields/ColorField/utils";
import classNames from "classnames";
import { weekDaysSlugs, wbkFormat } from "../../components/Form/utils/dateTime";
import lockedIcon from "../../../../public/images/icon-lock.png";
import unlockIcon from "../../../../public/images/icon-lock-open.png";
import clockIcon from "../../../../public/images/icon-clock.svg";
import closeIcon from "../../../../public/images/icon-close.svg";
import infoIcon from "../../../../public/images/info-blue.svg";
import { TimeSlotsLockPopup } from "./TimeSlotsLockPopup/TimeSlotsLockPopup";
import type {
  IEvent,
  TCalendarRememberedServiceSelection,
  TCalendarServiceFilterValue,
} from "./types";
import { BulkDateLockPopup } from "./BulkDateLockPopup/BulkDateLockPopup";
import { BulkTimeSlotsLockPopup } from "./BulkTimeSlotsLockPopup/BulkTimeSlotsLockPopup";
import { MassAddBookingsPopup } from "./MassAddBookingsPopup/MassAddBookingsPopup";

type DayLockStatus = "locked" | "unlocked";

type DayLockInfo = {
  status: DayLockStatus;
  day: number;
  serviceId: string;
};

const formatLockedSlotTime = (
  startUnix: number,
  endUnix: number,
  settings: Record<string, any> | undefined
): string => {
  const timeFormat = settings?.time_format || "g:i a";
  const timezone = settings?.timezone || "";
  const mode = settings?.wbk_date_format_time_slot_schedule || "start-end";
  const startLabel = wbkFormat(startUnix, timeFormat, timezone);

  if (mode === "start") {
    return startLabel;
  }

  return `${startLabel}-${wbkFormat(endUnix, timeFormat, timezone)}`;
};

const bookingsModel = removePrefixesFromModelFields(BookingsModel, "appointment_");

const form = createFormFromModel(bookingsModel);

const sanitizeBookingFormPayload = (data: Record<string, unknown>) => {
  const payload = { ...data };
  if (typeof payload.booking_extra === "string") {
    payload.booking_extra = stripIncompleteBookingExtrasForSubmit(payload.booking_extra);
  }
  return payload;
};

const menuSections = createFormMenuSectionsFromModel({
  model: bookingsModel,
  form,
  modelName: "appointments",
});

const getServiceIds = (services: any[]): string[] => {
  if (!Array.isArray(services) || !services.length) {
    return [];
  }

  return services
    .map((service: any) => service?.id)
    .filter((id: unknown) => id != null && id !== "")
    .map(String);
};

const getServiceFilterValues = (filters: TAllowedFilterValue<any>[]): string[] => {
  const serviceFilter = filters.find(
    (filter) => filter.name === "appointment_service_id"
  );

  if (!serviceFilter?.value && serviceFilter?.value !== 0) {
    return [];
  }

  return Array.isArray(serviceFilter.value)
    ? serviceFilter.value.map(String).filter(Boolean)
    : [String(serviceFilter.value)].filter(Boolean);
};

const calendarModalOptions = {
  view: "modal" as const,
  width: "small" as const,
  height: "auto" as const,
  position: "center" as const,
};

export const CalendarScreen = () => {
  const sidebar = useSidebar();
  const { filterItems, fetchSchedule, lockDay, unlockDay, unlockTime } =
    useDispatch(store_name);
  const [currentView, setCurrentView] = useState<string>("month");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [lockingDates, setLockingDates] = useState<Record<string, boolean>>({});
  const [unlockingTimes, setUnlockingTimes] = useState<Record<number, boolean>>({});
  const [advanceScheduleToolsEnabled, setAdvanceScheduleToolsEnabled] =
    useState(false);
  const [pendingServiceFilterValue, setPendingServiceFilterValue] = useState<
    TCalendarServiceFilterValue | undefined
  >(undefined);
  const [rememberedServiceSelection, setRememberedServiceSelection] =
    useState<TCalendarRememberedServiceSelection>({
      singleServiceId: null,
      multiServiceIds: null,
    });
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const selectedMonth = useMemo(() => format(calendarDate, "yyyy-MM"), [calendarDate]);
  const allStatus: Record<string, string> = useMemo(
    () => metadata.properties?.appointment_status.misc?.options,
    []
  );

  const { settings } = useSelect(
    // @ts-ignore
    (select) => select(store_name).getPreset(),
    []
  );

  const weekStart = useMemo(() => {
    const weekStartValue = settings?.week_start;
    if (weekStartValue === undefined || weekStartValue === null) {
      return 0;
    }

    const valueStr = String(weekStartValue).toLowerCase();
    if (weekDaysSlugs.hasOwnProperty(valueStr)) {
      return weekDaysSlugs[valueStr];
    }

    const parsed = parseInt(String(weekStartValue), 10);
    const result = isNaN(parsed) ? 0 : parsed;
    return result;
  }, [settings?.week_start]);

  const customStartOfWeek = useCallback(
    (date: Date, locale?: any) => {
      return dateFnsStartOfWeek(date, {
        weekStartsOn: weekStart as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        locale,
      });
    },
    [weekStart]
  );

  const customEndOfWeek = useCallback(
    (date: Date, locale?: any) => {
      return endOfWeek(date, {
        weekStartsOn: weekStart as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        locale,
      });
    },
    [weekStart]
  );

  const localizer = useMemo(
    () =>
      dateFnsLocalizer({
        format,
        parse,
        startOfWeek: customStartOfWeek,
        getDay,
        locales,
      }),
    [customStartOfWeek]
  );

  const bookings = useSelect(
    (select) =>
      // @ts-ignore
      select(store_name).getItems("appointments", [
        {
          name: "appointment_day",
          value: formatWbkDate(customStartOfWeek(startOfMonth(new Date()))),
        },
        {
          name: "appointment_day",
          value: formatWbkDate(customEndOfWeek(endOfMonth(new Date()))),
        },
        {
          name: "appointment_status",
          value: Object.keys(allStatus).filter((status) => status === "approved"),
        },
      ]),
    [customStartOfWeek, customEndOfWeek, allStatus]
  );
  const services = useSelect(
    // @ts-ignore
    (select) => select(store_name).getItems("services"),
    []
  );
  const serviceIds = useMemo(() => getServiceIds(services), [services]);
  const firstServiceId = serviceIds[0] || "";
  const serviceIdsKey = useMemo(() => serviceIds.slice().sort().join(","), [serviceIds]);
  const scheduleByService = useSelect(
    (select) => {
      // @ts-ignore
      const store = select(store_name);
      if (!serviceIdsKey || !selectedMonth) {
        return {};
      }

      return serviceIdsKey.split(",").reduce((acc: Record<string, unknown>, serviceId) => {
        // @ts-ignore
        acc[serviceId] = store.getSchedule(serviceId, selectedMonth);
        return acc;
      }, {});
    },
    [serviceIdsKey, selectedMonth]
  );

  useEffect(() => {
    if (!serviceIdsKey || !selectedMonth) {
      return;
    }

    serviceIdsKey.split(",").forEach((serviceId) => {
      fetchSchedule(serviceId, selectedMonth);
    });
  }, [serviceIdsKey, selectedMonth]);

  const [customFilter, setCustomFilter] = useState<TAllowedFilterValue<any>[]>([
    {
      name: "appointment_day",
      value: formatWbkDate(customStartOfWeek(startOfMonth(new Date()))),
    },
    {
      name: "appointment_day",
      value: formatWbkDate(customEndOfWeek(endOfMonth(new Date()))),
    },
  ]);

  const calendarFilterFields = useMemo(() => {
    const [serviceField, statusField] = getFilterFields(
      !advanceScheduleToolsEnabled,
      advanceScheduleToolsEnabled
    );

    if (pendingServiceFilterValue === undefined) {
      return [serviceField, statusField];
    }

    return [
      {
        ...serviceField,
        value: pendingServiceFilterValue,
      },
      statusField,
    ];
  }, [advanceScheduleToolsEnabled, pendingServiceFilterValue]);

  const selectedServiceId = useMemo(() => {
    if (!advanceScheduleToolsEnabled) {
      return null;
    }

    const serviceFilter = customFilter.find(
      (filter) => filter.name === "appointment_service_id"
    );
    if (!serviceFilter?.value) {
      return null;
    }

    const values = Array.isArray(serviceFilter.value)
      ? serviceFilter.value.map(String).filter(Boolean)
      : [String(serviceFilter.value)].filter(Boolean);

    return values.length === 1 ? values[0] : null;
  }, [advanceScheduleToolsEnabled, customFilter]);

  useEffect(() => {
    if (pendingServiceFilterValue === undefined) {
      return;
    }

    setPendingServiceFilterValue(undefined);
  }, [pendingServiceFilterValue]);

  useEffect(() => {
    if (!isModeSwitching) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsModeSwitching(false);
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [isModeSwitching, advanceScheduleToolsEnabled]);

  const handleAdvanceScheduleToolsChange = (enabled: boolean) => {
    const currentValues = getServiceFilterValues(customFilter);
    const validCurrentValues = currentValues.filter((serviceId) =>
      serviceIds.includes(serviceId)
    );

    setIsModeSwitching(true);
    setAdvanceScheduleToolsEnabled(enabled);

    if (enabled) {
      if (validCurrentValues.length) {
        setRememberedServiceSelection((previous) => ({
          ...previous,
          multiServiceIds: validCurrentValues,
        }));
      }

      const rememberedSingleId = rememberedServiceSelection.singleServiceId;
      const nextSingleId =
        rememberedSingleId && serviceIds.includes(rememberedSingleId)
          ? rememberedSingleId
          : firstServiceId;

      if (nextSingleId) {
        setPendingServiceFilterValue(nextSingleId);
      }
      return;
    }

    if (validCurrentValues[0]) {
      setRememberedServiceSelection((previous) => ({
        ...previous,
        singleServiceId: validCurrentValues[0],
      }));
    }

    const rememberedMultiIds = (
      rememberedServiceSelection.multiServiceIds || []
    ).filter((serviceId) => serviceIds.includes(serviceId));

    setPendingServiceFilterValue(
      rememberedMultiIds.length ? rememberedMultiIds : serviceIds
    );
  };

  const dayLockInfoByDate = useMemo(() => {
    const infoByDate: Record<string, DayLockInfo> = {};
    if (!selectedServiceId) {
      return infoByDate;
    }

    const schedule = scheduleByService[selectedServiceId] as { days?: any[] } | null;
    const days = schedule?.days;
    if (!Array.isArray(days)) {
      return infoByDate;
    }

    days.forEach((day) => {
      if (!day?.date) {
        return;
      }

      const isLocked =
        Boolean(day.is_locked) ||
        (!Boolean(day.is_unlocked) && Number(day.day_status) === 0);

      infoByDate[day.date] = {
        status: isLocked ? "locked" : "unlocked",
        day: Number(day.day),
        serviceId: selectedServiceId,
      };
    });

    return infoByDate;
  }, [scheduleByService, selectedServiceId]);

  const handleToggleDayLock = useCallback(
    async (dateKey: string) => {
      const lockInfo = dayLockInfoByDate[dateKey];
      if (!lockInfo || lockingDates[dateKey] || !selectedServiceId) {
        return;
      }

      setLockingDates((prev) => ({ ...prev, [dateKey]: true }));

      try {
        const toggleAction = lockInfo.status === "locked" ? unlockDay : lockDay;
        await toggleAction(selectedServiceId, lockInfo.day);
        await fetchSchedule(selectedServiceId, selectedMonth);
      } catch (error) {
        console.error(error);
      } finally {
        setLockingDates((prev) => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
      }
    },
    [
      dayLockInfoByDate,
      lockingDates,
      selectedServiceId,
      lockDay,
      unlockDay,
      fetchSchedule,
      selectedMonth,
    ]
  );

  const handleUnlockLockedSlot = useCallback(
    async (event: MouseEvent, lockedTime: number) => {
      event.preventDefault();
      event.stopPropagation();

      if (!selectedServiceId || unlockingTimes[lockedTime]) {
        return;
      }

      setUnlockingTimes((prev) => ({ ...prev, [lockedTime]: true }));
      try {
        await unlockTime(selectedServiceId, lockedTime);
        await fetchSchedule(selectedServiceId, selectedMonth);
      } catch (error) {
        console.error(error);
      } finally {
        setUnlockingTimes((prev) => {
          const next = { ...prev };
          delete next[lockedTime];
          return next;
        });
      }
    },
    [selectedServiceId, unlockingTimes, unlockTime, fetchSchedule, selectedMonth]
  );

  const lockedTimesByDate = useMemo(() => {
    const byDate: Record<string, number[]> = {};
    if (!selectedServiceId) {
      return byDate;
    }

    const schedule = scheduleByService[selectedServiceId] as {
      days?: Array<{
        date?: string;
        day?: number;
        time_slots?: Array<{ start_time?: number }>;
      }>;
      locked_time_slots?: number[];
    } | null;

    const days = Array.isArray(schedule?.days) ? schedule.days : [];
    days.forEach((day) => {
      if (!day?.date) {
        return;
      }
      byDate[day.date] = [];
      if (Array.isArray(day.time_slots)) {
        day.time_slots.forEach((slot) => {
          const start = Number(slot.start_time);
          if (start) {
            byDate[day.date as string].push(start);
          }
        });
      }
    });

    const lockedTimes = Array.isArray(schedule?.locked_time_slots)
      ? schedule.locked_time_slots.map(Number)
      : [];

    lockedTimes.forEach((time) => {
      if (!time) {
        return;
      }
      const matchingDay = days.find((day) => {
        const dayStart = Number(day.day);
        return dayStart > 0 && time >= dayStart && time < dayStart + 86400;
      });
      const dateKey = matchingDay?.date;
      if (!dateKey) {
        return;
      }
      if (!byDate[dateKey]) {
        byDate[dateKey] = [];
      }
      if (!byDate[dateKey].includes(time)) {
        byDate[dateKey].push(time);
      }
    });

    return byDate;
  }, [scheduleByService, selectedServiceId]);

  const handleOpenTimeSlotsPopup = useCallback(
    (dateKey: string) => {
      if (!selectedServiceId) {
        return;
      }
      sidebar.open(
        <TimeSlotsLockPopup
          dateKey={dateKey}
          serviceId={selectedServiceId}
          lockedTimes={lockedTimesByDate[dateKey] || []}
          onChanged={async () => {
            await fetchSchedule(selectedServiceId, selectedMonth);
          }}
        />,
        calendarModalOptions
      );
    },
    [selectedServiceId, lockedTimesByDate, fetchSchedule, selectedMonth]
  );

  const { deleteItems, setItem, addItem }: any = dispatch(store_name);

  const getBookingFromEvent = useCallback(
    (event: IEvent) => {
      return bookings.find((booking: any) => booking.id == event.id);
    },
    [bookings]
  );

  const onDelete = useCallback(async (id: number) => {
    await deleteItems("appointments", [id]);
    sidebar.close();
  }, []);

  const onSubmit = useCallback(async (update: any, id: number) => {
    const cleaned = sanitizeBookingFormPayload(update);
    await setItem("appointments", { ...cleaned, id });
  }, []);

  const onDuplicate = useCallback(async (data: any) => {
    const newId = Number(data.id) + 1;
    const update = {
      ...data,
      name: `Copy of ${data.name}`,
      id: String(newId),
    };
    await addItem("appointments", update);
    sidebar.close();
  }, []);

  const handleEventClick = useCallback(
    (event: IEvent & { isLockedSlot?: boolean }) => {
      if (event.isLockedSlot) {
        return;
      }
      sidebar.open(
        <Form
          id="edit-booking-form"
          name="Edit Booking"
          defaultValue={getBookingFromEvent(event)}
          form={form}
          sections={menuSections}
          onSubmit={(data) => onSubmit(data, event.id)}
          onDelete={() => onDelete(event.id)}
          onDuplicate={() => onDuplicate(getBookingFromEvent(event))}
        />
      );
    },
    [bookings]
  );
  const addBooking = async (data: any) => {
    try {
      return await addItem("appointments", data);
    } catch (e) {
      console.error(e);
    }
  };
  const handleAddBookingClick = () => {
    sidebar.open(
      <Form
        id="add-booking-form"
        name={__("Add Booking", "webba-booking-lite")}
        form={form}
        sections={menuSections}
        onSubmit={async (data) => {
          return await addBooking(sanitizeBookingFormPayload(data));
        }}
      />
    );
  };

  const handleOpenMassAddBookings = () => {
    sidebar.open(
      <MassAddBookingsPopup
        onSuccess={async () => {
          await filterItems("appointments", customFilter);
          if (selectedServiceId) {
            await fetchSchedule(selectedServiceId, selectedMonth);
          }
        }}
      />,
      calendarModalOptions
    );
  };

  const handleOpenBulkDateLock = () => {
    sidebar.open(
      <BulkDateLockPopup
        onSuccess={async () => {
          if (!selectedServiceId) {
            return;
          }
          await fetchSchedule(selectedServiceId, selectedMonth);
        }}
      />,
      calendarModalOptions
    );
  };

  const handleOpenBulkTimeSlotsLock = () => {
    sidebar.open(
      <BulkTimeSlotsLockPopup
        onSuccess={async () => {
          if (!selectedServiceId) {
            return;
          }
          await fetchSchedule(selectedServiceId, selectedMonth);
        }}
      />,
      calendarModalOptions
    );
  };

  const messages = useMemo(() => {
    return {
      allDay: __("All Day", "webba-booking-lite"),
      previous: "<",
      next: ">",
      today: __("Today", "webba-booking-lite"),
      month: __("Month", "webba-booking-lite"),
      week: __("Week", "webba-booking-lite"),
      day: __("Day", "webba-booking-lite"),
      agenda: __("Agenda", "webba-booking-lite"),
      date: __("Date", "webba-booking-lite"),
      time: __("Time", "webba-booking-lite"),
      event: __("Event", "webba-booking-lite"),
      showMore: (total: number) => __(`+ (${total}) Events`, "webba-booking-lite"),
    };
  }, []);

  const events = useMemo(() => {
    const timezone =
      settings?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

    const bookingEvents = bookings.map((booking: any) => {
      let calculatedEnd = null;

      if (!booking?.end) {
        const duration = select(store_name)
          .getItems("services", [])
          .find((service: any) => service.id === booking.service_id)?.duration;

        calculatedEnd = getUnixTime(addMinutes(fromUnixTime(booking.time), duration));
      }
      return {
        id: booking?.id.toString(),
        title: booking?.extra_data?.dynamic_title || booking.name,
        start: toZonedTime(fromUnixTime(booking.time), timezone),
        end: toZonedTime(
          fromUnixTime(booking?.end ? booking?.end : calculatedEnd),
          timezone
        ),
        status: booking?.status,
        color:
          services.find((service: any) => service?.id == booking?.service_id)?.color ||
          "transparent",
        isLockedSlot: false,
      };
    });

    if (!selectedServiceId) {
      return bookingEvents;
    }

    const service = services.find((item: any) => String(item?.id) === String(selectedServiceId));
    const durationMinutes = Number(service?.duration) || 60;
    const lockedTimes = Object.values(lockedTimesByDate).flat();

    const lockedEvents = lockedTimes.map((time) => {
      const endUnix = time + durationMinutes * 60;
      return {
        id: `locked-slot-${time}`,
        title: formatLockedSlotTime(time, endUnix, settings),
        start: toZonedTime(fromUnixTime(time), timezone),
        end: toZonedTime(fromUnixTime(endUnix), timezone),
        status: "locked_slot",
        color: "rgba(254, 6, 6, 0.25)",
        isLockedSlot: true,
        lockedTime: time,
      };
    });

    return [...bookingEvents, ...lockedEvents];
  }, [
    bookings,
    services,
    settings,
    selectedServiceId,
    lockedTimesByDate,
  ]);

  const updateRange = useCallback(
    (fullRange: Date[] | Record<"start" | "end", Date>) => {
      const formattedRange: [Date, Date] = Array.isArray(fullRange)
        ? [fullRange[0], fullRange[fullRange.length - 1]]
        : [fullRange.start, fullRange.end];

      const query = generateFilterFromDateRange(formattedRange);
      setCustomFilter(query);

      filterItems("appointments", query);
    },
    [customFilter]
  );

  const generateFilterFromDateRange = useCallback(
    (formattedRange: [Date, Date]) => {
      return [
        {
          name: "appointment_day",
          value: formatWbkDate(formattedRange[0]),
        },
        {
          name: "appointment_day",
          value: formatWbkDate(formattedRange[1]),
        },
        ...customFilter.filter(
          (filter: TAllowedFilterValue<any>) => filter.name !== "appointment_day"
        ),
      ];
    },
    [customFilter]
  );

  const EventWrapper = useCallback(
    ({ event, children }: any) => (
      <div
        className={classNames(
          "wbk_calendar__eventWrapper",
          event.status && `wbk_calendar__eventWrapper--${event.status}`,
          { "wbk_calendar__eventWrapper--lockedSlot": event.isLockedSlot }
        )}
        style={{
          backgroundColor: event.isLockedSlot
            ? "rgba(254, 6, 6, 0.22)"
            : increaseOpacity(event.color, 0.5),
        }}
      >
        {children}
      </div>
    ),
    []
  );

  const MonthDateHeader = useCallback(
    ({ label, date, isOffRange }: { label: string; date: Date; isOffRange?: boolean }) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const lockInfo = !isOffRange ? dayLockInfoByDate[dateKey] : undefined;
      const isLocked = lockInfo?.status === "locked";
      const isLocking = Boolean(lockingDates[dateKey]);
      const showTimeLock = Boolean(lockInfo && selectedServiceId);

      return (
        <div className="wbk_calendar__dateHeader">
          <span className="wbk_calendar__dateLabel">{label}</span>
          {lockInfo && (
            <div className="wbk_calendar__dayActions">
              <button
                type="button"
                className={classNames("wbk_calendar__dayLock", {
                  "wbk_calendar__dayLock--locked": isLocked,
                  "wbk_calendar__dayLock--unlocked": !isLocked,
                  "wbk_calendar__dayLock--loading": isLocking,
                })}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleToggleDayLock(dateKey);
                }}
                disabled={isLocking}
                aria-busy={isLocking}
                aria-label={
                  isLocked
                    ? __("Unlock day", "webba-booking-lite")
                    : __("Lock day", "webba-booking-lite")
                }
                title={
                  isLocked
                    ? __("Unlock day", "webba-booking-lite")
                    : __("Lock day", "webba-booking-lite")
                }
              >
                {isLocking ? (
                  <span className="wbk_calendar__dayLockLoader" />
                ) : (
                  <img
                    src={isLocked ? lockedIcon : unlockIcon}
                    alt={
                      isLocked
                        ? __("Locked", "webba-booking-lite")
                        : __("Unlocked", "webba-booking-lite")
                    }
                  />
                )}
              </button>
              {showTimeLock && (
                <button
                  type="button"
                  className="wbk_calendar__timeLock"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleOpenTimeSlotsPopup(dateKey);
                  }}
                  aria-label={__("Lock time slots", "webba-booking-lite")}
                  title={__("Lock time slots", "webba-booking-lite")}
                >
                  <img
                    src={clockIcon}
                    alt={__("Lock time slots", "webba-booking-lite")}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      );
    },
    [
      dayLockInfoByDate,
      lockingDates,
      handleToggleDayLock,
      handleOpenTimeSlotsPopup,
      selectedServiceId,
    ]
  );

  const dayPropGetter = useCallback(
    (date: Date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      if (dayLockInfoByDate[dateKey]?.status !== "locked") {
        return {};
      }

      return {
        className: "wbk_calendar__day--locked",
      };
    },
    [dayLockInfoByDate]
  );

  return (
    <div className="wbk_calendar__wrapper">
      <div className="wbk_calendar__toolWrapper">
        <FilterForm
          fields={calendarFilterFields}
          model="appointments"
          columnCount={2}
          customQuery={customFilter}
          setCustomQuery={setCustomFilter}
          classes={classNames("wbk_calendar__filterWrapper", {
            "wbk_calendar__filterWrapper--switching": isModeSwitching,
          })}
        />
        <div className="wbk_calendar__actions">
          <Button onClick={handleAddBookingClick} className="wbk_calendar__addButton">
            {__("Add booking +", "webba-booking-lite")}
          </Button>
          <Button
            onClick={handleOpenMassAddBookings}
            className="wbk_calendar__addButton"
          >
            {__("Add multiple bookings", "webba-booking-lite")}
          </Button>
          <Button
            onClick={handleOpenBulkDateLock}
            type="secondary-green"
          >
            {__("Lock / Unlock multiple dates", "webba-booking-lite")}
          </Button>
          <Button
            onClick={handleOpenBulkTimeSlotsLock}
            type="secondary-green"
          >
            {__("Lock / Unlock multiple time slots", "webba-booking-lite")}
          </Button>
          <Toggle
            name="wbk-advance-schedule-tools"
            label={__("Enable Advance Schedule Tools", "webba-booking-lite")}
            value={advanceScheduleToolsEnabled}
            onChange={handleAdvanceScheduleToolsChange}
            disabled={!firstServiceId}
            className="wbk_calendar__scheduleToolsToggle"
          />
        </div>
        <div
          className={classNames("wbk_calendar__scheduleNotice", {
            "wbk_calendar__scheduleNotice--visible": advanceScheduleToolsEnabled,
          })}
          aria-hidden={!advanceScheduleToolsEnabled}
        >
          <div className="wbk_calendar__scheduleNoticeInner">
            <img
              src={infoIcon}
              className="wbk_calendar__scheduleNoticeIcon"
              alt=""
            />
            <div className="wbk_calendar__scheduleNoticeContent">
              {__(
                "Control your schedules for each services separately, you can switch between services from above filter",
                "webba-booking-lite"
              )}
            </div>
          </div>
        </div>
      </div>
      <Calendar
        key={`calendar-${weekStart}`}
        events={events}
        startAccessor="start"
        endAccessor="end"
        className="wbk_calendar__calendar"
        style={{
          height: "1000px",
        }}
        localizer={localizer}
        onSelectEvent={handleEventClick}
        culture={settings?.locale.split("_")[0] || "en"}
        messages={messages}
        step={15}
        popup
        date={calendarDate}
        onNavigate={(date) => setCalendarDate(date)}
        onRangeChange={(fullRange, view) => {
          updateRange(fullRange);
          if (view) {
            setCurrentView(view as string);
          }
        }}
        dayPropGetter={dayPropGetter}
        components={{
          month: {
            dateHeader: MonthDateHeader,
          },
          eventWrapper: EventWrapper,
          event: (props: any) => {
            const isLockedSlot = Boolean(props.event.isLockedSlot);
            const lockedTime = Number(props.event.lockedTime);
            const isUnlocking = Boolean(unlockingTimes[lockedTime]);

            if (isLockedSlot) {
              return (
                <div className="wbk_calendar__lockedSlotEvent">
                  <span className="wbk_calendar__lockedSlotTime">{props.title}</span>
                  <button
                    type="button"
                    className={classNames("wbk_calendar__lockedSlotUnlock", {
                      "wbk_calendar__lockedSlotUnlock--loading": isUnlocking,
                    })}
                    onClick={(clickEvent) =>
                      handleUnlockLockedSlot(clickEvent, lockedTime)
                    }
                    disabled={isUnlocking || !lockedTime}
                    aria-busy={isUnlocking}
                    aria-label={__("Unlock time slot", "webba-booking-lite")}
                    title={__("Unlock time slot", "webba-booking-lite")}
                  >
                    {isUnlocking ? (
                      <span className="wbk_calendar__dayLockLoader" />
                    ) : (
                      <img
                        src={closeIcon}
                        alt={__("Unlock time slot", "webba-booking-lite")}
                      />
                    )}
                  </button>
                </div>
              );
            }

            // Only customize booking events for day view
            if (props.isAllDay || props.view !== "day") {
              return <span>{props.title}</span>;
            }

            const bgColor = props.event.color
              ? increaseOpacity(props.event.color, 0.5)
              : undefined;
            return (
              <div
                className={classNames(
                  "wbk_calendar__eventWrapper",
                  props.event.status && `wbk_calendar__eventWrapper--${props.event.status}`
                )}
                style={{
                  backgroundColor: bgColor,
                  marginTop: 2,
                  marginBottom: 2,
                  width: "98%",
                  left: "1%",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 600 }}>{props.event.title}</div>
              </div>
            );
          },
        }}
        dayLayoutAlgorithm="no-overlap"
        // Track current view to help with event rendering
        view={currentView as any}
        onView={(view) => setCurrentView(view)}
      />
    </div>
  );
};
