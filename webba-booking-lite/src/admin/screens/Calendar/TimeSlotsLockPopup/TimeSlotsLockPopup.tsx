import { useCallback, useEffect, useMemo, useState } from "react";
import { __ } from "@wordpress/i18n";
import { useDispatch, useSelect } from "@wordpress/data";
import classNames from "classnames";
import { store_name } from "../../../../store/backend";
import {
  parseCalendarDateString,
  wbkFormat,
} from "../../../components/Form/utils/dateTime";
import { Button } from "../../../components/Button/Button";
import { useSidebar } from "../../../components/Sidebar/SidebarContext";
import closeIcon from "../../../../../public/images/icon-close.svg";
import lockedIcon from "../../../../../public/images/icon-lock.png";
import unlockIcon from "../../../../../public/images/icon-lock-open.png";
import "../../../components/Form/Form.scss";
import "./TimeSlotsLockPopup.scss";

export type TimeSlotApiItem = {
  start?: number;
  end?: number;
  status?: number | number[] | [number[], number];
  free_places?: number;
  formated_time?: string;
  formated_time_backend?: string;
  formatted_time?: string;
};

type LockableSlot = {
  start: number;
  end: number;
  label: string;
  isLocked: boolean;
};

type TimeSlotsLockPopupProps = {
  dateKey: string;
  serviceId: string;
  lockedTimes: number[];
  onChanged: () => Promise<void> | void;
};

const hasBookings = (slot: TimeSlotApiItem): boolean => {
  const status = slot.status;
  if (Array.isArray(status)) {
    return true;
  }
  return typeof status === "number" && status > 0;
};

const stripHtml = (value: string): string =>
  value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

const resolveBackendDateFormat = (settings: Record<string, any> | undefined): string => {
  const backendFormat = settings?.wbk_date_format_backend;
  if (!backendFormat || backendFormat === "inherit" || backendFormat === "wordpress") {
    return settings?.date_format || "m/d/y";
  }
  return backendFormat;
};

const formatPopupDate = (
  dateKey: string,
  settings: Record<string, any> | undefined
): string => {
  const date = parseCalendarDateString(dateKey);
  if (!date) {
    return dateKey;
  }

  return wbkFormat(
    date,
    resolveBackendDateFormat(settings),
    settings?.timezone || ""
  );
};

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
  const endLabel = wbkFormat(endTimestamp, timeFormat, timezone);

  return `${startLabel}-${endLabel}`;
};

export const TimeSlotsLockPopup = ({
  dateKey,
  serviceId,
  lockedTimes,
  onChanged,
}: TimeSlotsLockPopupProps) => {
  const sidebar = useSidebar();
  const { fetchTimeSlots, lockTime, unlockTime } = useDispatch(store_name);
  const { settings } = useSelect(
    // @ts-ignore
    (select) => select(store_name).getPreset(),
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [slots, setSlots] = useState<LockableSlot[]>([]);
  const [lockingTimes, setLockingTimes] = useState<Record<number, boolean>>({});
  const [error, setError] = useState("");

  const formattedDate = useMemo(
    () => formatPopupDate(dateKey, settings),
    [dateKey, settings]
  );

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = (await fetchTimeSlots({
        date: `${dateKey} 00:00:00`,
        services: serviceId,
        offset: 0,
      })) as { timeslots?: TimeSlotApiItem[] };

      const timeslots = Array.isArray(response?.timeslots) ? response.timeslots : [];
      const currentLocked = new Set(lockedTimes.map(Number));
      const lockable = timeslots
        .filter((slot) => !hasBookings(slot) && Number(slot.start) > 0)
        .map((slot) => {
          const start = Number(slot.start);
          return {
            start,
            end: Number(slot.end) || start,
            label: formatSlotLabel(slot, settings),
            isLocked: currentLocked.has(start) || Number(slot.status) === -2,
          };
        });

      setSlots(lockable);
    } catch (e) {
      console.error(e);
      setError(__("Failed to load time slots.", "webba-booking-lite"));
      setSlots([]);
    } finally {
      setIsLoading(false);
    }
    // Intentionally omit lockedTimes so lock/unlock refresh does not re-open loading state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, serviceId, fetchTimeSlots, settings]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const handleToggle = useCallback(
    async (slot: LockableSlot) => {
      if (lockingTimes[slot.start]) {
        return;
      }

      setLockingTimes((prev) => ({ ...prev, [slot.start]: true }));
      try {
        const action = slot.isLocked ? unlockTime : lockTime;
        await action(serviceId, slot.start);
        setSlots((prev) =>
          prev.map((item) =>
            item.start === slot.start ? { ...item, isLocked: !item.isLocked } : item
          )
        );
        await onChanged();
      } catch (e) {
        console.error(e);
      } finally {
        setLockingTimes((prev) => {
          const next = { ...prev };
          delete next[slot.start];
          return next;
        });
      }
    },
    [lockingTimes, lockTime, unlockTime, serviceId, onChanged]
  );

  return (
    <div className="wbk_form__container wbk_timeSlotsLockPopup">
      <div className="wbk_form__header">
        <div className="wbk_form__headerTitle">
          {__("Lock time slots", "webba-booking-lite")}
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
      <div className="wbk_timeSlotsLockPopup__body">
        <p className="wbk_timeSlotsLockPopup__subtitle">{formattedDate}</p>

        {isLoading && (
          <div className="wbk_timeSlotsLockPopup__loading">
            <span className="wbk_timeSlotsLockPopup__loader" />
          </div>
        )}

        {!isLoading && error && (
          <p className="wbk_timeSlotsLockPopup__error">{error}</p>
        )}

        {!isLoading && !error && slots.length === 0 && (
          <p className="wbk_timeSlotsLockPopup__empty">
            {__("No lockable time slots for this day.", "webba-booking-lite")}
          </p>
        )}

        {!isLoading && !error && slots.length > 0 && (
          <ul className="wbk_timeSlotsLockPopup__list">
            {slots.map((slot) => {
              const isLocking = Boolean(lockingTimes[slot.start]);
              return (
                <li key={slot.start} className="wbk_timeSlotsLockPopup__item">
                  <span className="wbk_timeSlotsLockPopup__time">{slot.label}</span>
                  <button
                    type="button"
                    className={classNames("wbk_timeSlotsLockPopup__lockButton", {
                      "wbk_timeSlotsLockPopup__lockButton--locked": slot.isLocked,
                      "wbk_timeSlotsLockPopup__lockButton--loading": isLocking,
                    })}
                    onClick={() => handleToggle(slot)}
                    disabled={isLocking}
                    aria-busy={isLocking}
                    aria-label={
                      slot.isLocked
                        ? __("Unlock time slot", "webba-booking-lite")
                        : __("Lock time slot", "webba-booking-lite")
                    }
                    title={
                      slot.isLocked
                        ? __("Unlock time slot", "webba-booking-lite")
                        : __("Lock time slot", "webba-booking-lite")
                    }
                  >
                    {isLocking ? (
                      <span className="wbk_timeSlotsLockPopup__slotLoader" />
                    ) : (
                      <img
                        src={slot.isLocked ? lockedIcon : unlockIcon}
                        alt={
                          slot.isLocked
                            ? __("Locked", "webba-booking-lite")
                            : __("Unlocked", "webba-booking-lite")
                        }
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="wbk_form__buttons">
        <div className="wbk_form__editButtons" />
        <Button
          className="wbk_form__buttonCancel"
          type="secondary"
          onClick={sidebar.close}
        >
          {__("Close", "webba-booking-lite")}
        </Button>
      </div>
    </div>
  );
};
