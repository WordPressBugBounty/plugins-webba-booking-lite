import { __ } from "@wordpress/i18n";
import { useSidebar } from "../../../components/Sidebar/SidebarContext";
import { Button } from "../../../components/Button/Button";
import { wbkFormat } from "../../../components/Form/utils/dateTime";
import type { IConnectedCalendarAttendee, IEvent } from "../types";
import "./ConnectedCalendarEventDetails.scss";

type ConnectedCalendarEventDetailsProps = {
  event: IEvent;
  settings?: Record<string, any>;
};

const getProviderLabel = (provider?: string) => {
  if (provider === "google") {
    return __("Google Calendar", "webba-booking-lite");
  }
  if (provider === "outlook") {
    return __("Outlook Calendar", "webba-booking-lite");
  }
  return __("Connected calendar", "webba-booking-lite");
};

const formatAttendeeStatus = (status?: string) => {
  if (!status) {
    return "";
  }

  const labels: Record<string, string> = {
    accepted: __("Accepted", "webba-booking-lite"),
    declined: __("Declined", "webba-booking-lite"),
    tentative: __("Tentative", "webba-booking-lite"),
    needsAction: __("Needs action", "webba-booking-lite"),
  };

  return labels[status] || status;
};

const formatEventDateTime = (
  date: Date | undefined,
  settings?: Record<string, any>
) => {
  if (!date) {
    return "";
  }

  const dateFormat = settings?.date_format || "M j, Y";
  const timeFormat = settings?.time_format || "g:i a";
  const timezone = settings?.timezone || "";
  const unix = Math.floor(date.getTime() / 1000);

  return `${wbkFormat(unix, dateFormat, timezone)} ${wbkFormat(
    unix,
    timeFormat,
    timezone
  )}`;
};

export const ConnectedCalendarEventDetails = ({
  event,
  settings,
}: ConnectedCalendarEventDetailsProps) => {
  const sidebar = useSidebar();
  const attendees = Array.isArray(event.attendees) ? event.attendees : [];
  const description = (event.description || "").trim();

  return (
    <div className="wbk_connectedCalendarEventDetails">
      <div className="wbk_connectedCalendarEventDetails__header">
        <h2 className="wbk_connectedCalendarEventDetails__title">
          {event.title || __("Connected calendar event", "webba-booking-lite")}
        </h2>
        <p className="wbk_connectedCalendarEventDetails__subtitle">
          {getProviderLabel(event.provider)}
        </p>
      </div>

      <div className="wbk_connectedCalendarEventDetails__fields">
        <div className="wbk_connectedCalendarEventDetails__field">
          <span className="wbk_connectedCalendarEventDetails__label">
            {__("Start", "webba-booking-lite")}
          </span>
          <span className="wbk_connectedCalendarEventDetails__value">
            {formatEventDateTime(event.start, settings)}
          </span>
        </div>

        <div className="wbk_connectedCalendarEventDetails__field">
          <span className="wbk_connectedCalendarEventDetails__label">
            {__("End", "webba-booking-lite")}
          </span>
          <span className="wbk_connectedCalendarEventDetails__value">
            {formatEventDateTime(event.end, settings)}
          </span>
        </div>

        {event.calendarName && (
          <div className="wbk_connectedCalendarEventDetails__field">
            <span className="wbk_connectedCalendarEventDetails__label">
              {__("Calendar", "webba-booking-lite")}
            </span>
            <span className="wbk_connectedCalendarEventDetails__value">
              {event.calendarName}
            </span>
          </div>
        )}

        {description && (
          <div className="wbk_connectedCalendarEventDetails__field">
            <span className="wbk_connectedCalendarEventDetails__label">
              {__("Details", "webba-booking-lite")}
            </span>
            <span className="wbk_connectedCalendarEventDetails__value wbk_connectedCalendarEventDetails__value--multiline">
              {description}
            </span>
          </div>
        )}

        {attendees.length > 0 && (
          <div className="wbk_connectedCalendarEventDetails__field">
            <span className="wbk_connectedCalendarEventDetails__label">
              {__("Attendees", "webba-booking-lite")}
            </span>
            <ul className="wbk_connectedCalendarEventDetails__attendees">
              {attendees.map((attendee: IConnectedCalendarAttendee, index) => {
                const name = attendee.displayName || attendee.email;
                const status = formatAttendeeStatus(attendee.responseStatus);
                return (
                  <li key={`${attendee.email}-${index}`}>
                    <span className="wbk_connectedCalendarEventDetails__attendeeName">
                      {name}
                    </span>
                    {attendee.displayName && attendee.email && (
                      <span className="wbk_connectedCalendarEventDetails__attendeeEmail">
                        {attendee.email}
                      </span>
                    )}
                    {status && (
                      <span className="wbk_connectedCalendarEventDetails__attendeeStatus">
                        {status}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="wbk_connectedCalendarEventDetails__actions">
        <Button type="secondary" onClick={() => sidebar.close()}>
          {__("Close", "webba-booking-lite")}
        </Button>
      </div>
    </div>
  );
};
