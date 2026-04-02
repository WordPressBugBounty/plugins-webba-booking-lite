import { CellContext } from "@tanstack/react-table";
import "./GoogleAuth.scss";
import { __ } from "@wordpress/i18n";
import classNames from "classnames";
import warningIcon from "../../../../../../public/images/warning-icon.png";
import successIcon from "../../../../../../public/images/succesessful-icon.png";
import { useGgAuth } from "../../hooks/useGgAuth";
import { useState, useEffect, useCallback } from "react";
import TimedLink from "../../../common/TimedLink/TimedLink";
import { useDispatch } from "@wordpress/data";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { store } from "../../../../../store/backend";

// Store creation timestamps for each unique URL
const urlCreationTimes = new Map<string, number>();

// Custom hook for countdown timer - each URL has its own independent timer
const useCountdownTimer = (url: string, initialMinutes: number = 5) => {
  // Get or set the creation time for this specific URL
  const getCreationTime = useCallback(() => {
    if (!urlCreationTimes.has(url)) {
      urlCreationTimes.set(url, Date.now());
    }
    return urlCreationTimes.get(url)!;
  }, [url]);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const creationTime = getCreationTime();
  const expirationTime = creationTime + initialMinutes * 60 * 1000;
  const timeLeft = Math.max(0, Math.floor((expirationTime - currentTime) / 1000));
  const isExpired = timeLeft <= 0;

  useEffect(() => {
    if (isExpired) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [isExpired]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeLeft,
    isExpired,
    formattedTime: formatTime(timeLeft),
  };
};

// TimedLink moved to common component

export const GoogleAuthCell = ({ cell }: CellContext<any, any>) => {
  const calendarId = cell.row.original?.id;
  const easyAuth = cell.row.original?.easy_auth;
  const accessToken = cell.row.original?.access_token;
  const { setGgAuthData } = useDispatch(store);

  useEffect(() => {
    if (calendarId == null) return;
    let cancelled = false;
    apiFetch({
      path: addQueryArgs("/wbk/v2/get-calendar-auth-data/", {
        calendar_id: calendarId,
      }),
    })
      .then((result: any) => {
        if (!cancelled) setGgAuthData(calendarId, result);
      })
      .catch(() => {
        if (!cancelled) setGgAuthData(calendarId, {});
      });
    return () => {
      cancelled = true;
    };
  }, [calendarId, accessToken, setGgAuthData]);

  const { isLoading, isAuthenticated, internalError, authUrl, revokeUrl, authData } =
    useGgAuth(calendarId);

  const controlButton = revokeUrl ? (
    <TimedLink href={revokeUrl} className="wbk_googleAuth__subtitle">
      {__("Revoke", "webba-booking-lite")}
    </TimedLink>
  ) : null;

  if (isLoading || authData === null || authData === undefined) {
    return (
      <div className="wbk_googleAuth__wrapper">
        <div className={classNames("wbk_googleAuth__message", "wbk_googleAuth__message--loading")}>
          <div className="wbk_googleAuth__title">
            <div className="wbk_googleAuth__loader" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wbk_googleAuth__wrapper">
      {easyAuth === "yes" ? (
        <div
          className={classNames("wbk_googleAuth__message", isAuthenticated ? "wbk_googleAuth__message--success" : "wbk_googleAuth__message--failed")}
        >
          <div className="wbk_googleAuth__title">
            <img
              src={isAuthenticated ? successIcon : warningIcon}
              alt={
                isAuthenticated
                  ? __("Success", "webba-booking-lite")
                  : __("Warning", "webba-booking-lite")
              }
              className="wbk_googleAuth__icon"
            />
            {isAuthenticated
              ? __("Authorized", "webba-booking-lite")
              : __("Not authorized", "webba-booking-lite")}
          </div>
          {!isAuthenticated && !internalError && authUrl && (
            <TimedLink href={authUrl} className="wbk_googleAuth__subtitle">
              {__("Authorize", "webba-booking-lite")}
            </TimedLink>
          )}
          {!isAuthenticated && internalError && (
            <div className="wbk_googleAuth__subtitle">
              {__("Internal error occurred. Please try again later.", "webba-booking-lite")}
            </div>
          )}
          {isAuthenticated && revokeUrl && (
            <TimedLink href={revokeUrl} className="wbk_googleAuth__subtitle">
              {__("Revoke", "webba-booking-lite")}
            </TimedLink>
          )}
        </div>
      ) : (
        <>
          {isAuthenticated ? (
            <div className={classNames("wbk_googleAuth__message", "wbk_googleAuth__message--success")}>
              <div className="wbk_googleAuth__title">
                <img
                  src={successIcon}
                  alt={__("Success", "webba-booking-lite")}
                  className="wbk_googleAuth__icon"
                />
                {__("Authorized", "webba-booking-lite")}
              </div>
              <div className="wbk_googleAuth__subtitle">{controlButton}</div>
            </div>
          ) : (
            <div className={classNames("wbk_googleAuth__message", "wbk_googleAuth__message--failed")}>
              <div className="wbk_googleAuth__title">
                <img
                  src={warningIcon}
                  alt={__("Warning", "webba-booking-lite")}
                  className="wbk_googleAuth__icon"
                />
                {internalError
                  ? __("Internal error", "webba-booking-lite")
                  : __("Not authorized", "webba-booking-lite")}
              </div>
              {internalError && (
                <div className="wbk_googleAuth__subtitle">
                  {__(
                    "An internal error occurred. Please check Google API credentials and calendar ID.",
                    "webba-booking-lite"
                  )}
                  . {controlButton}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
