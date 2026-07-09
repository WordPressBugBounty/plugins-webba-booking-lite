import { __, sprintf } from "@wordpress/i18n";
import { ConfigInformationEntityCard } from "./ConfigInformationEntityCard";
import {
  buildDailySettingsProperties,
  buildDailyUnitCards,
  buildHourlyServiceCards,
  buildHourlySettingsProperties,
  getConfigProgress,
} from "./buildConfigPreview";
import { ConfigInformation, ConfigMode } from "./types";

function getModeLabel(mode: ConfigMode | null): string {
  if (mode === "hourly") {
    return __("Hourly services", "webba-booking-lite");
  }
  if (mode === "daily") {
    return __("Daily services / rentals", "webba-booking-lite");
  }
  return __("Not determined yet", "webba-booking-lite");
}

interface ConfigInformationPanelProps {
  config: ConfigInformation;
}

export const ConfigInformationPanel = ({ config }: ConfigInformationPanelProps) => {
  const isDaily = config.mode === "daily";
  const { collectedCount, totalFields } = getConfigProgress(config);

  const entityCards = isDaily
    ? buildDailyUnitCards(config.daily)
    : config.mode === "hourly"
      ? buildHourlyServiceCards(config.hourly)
      : [];

  const settingsProperties = isDaily
    ? buildDailySettingsProperties(config.daily)
    : config.mode === "hourly"
      ? buildHourlySettingsProperties(config.hourly)
      : [];

  const entitySectionTitle = isDaily
    ? __("Units", "webba-booking-lite")
    : __("Services", "webba-booking-lite");

  return (
    <section
      className="wbk-assistance__config-panel"
      aria-label={__("Setup progress", "webba-booking-lite")}
    >
      <div className="wbk-assistance__config-header">
        <h2>{__("Setup progress", "webba-booking-lite")}</h2>
        <span className="wbk-assistance__config-progress">
          {config.mode
            ? sprintf(__("%1$d of %2$d collected", "webba-booking-lite"), collectedCount, totalFields)
            : __("Awaiting mode", "webba-booking-lite")}
        </span>
      </div>

      <p className="wbk-assistance__config-mode">
        {sprintf(__("Booking mode: %s", "webba-booking-lite"), getModeLabel(config.mode))}
      </p>

      <p className="wbk-assistance__config-intro">
        {__(
          "Details you share in the chat are tracked here so you can see what is still needed before setup suggestions are ready.",
          "webba-booking-lite"
        )}
      </p>

      {!config.mode ? (
        <p className="wbk-assistance__config-pending">
          {__(
            "Send your first message to detect whether setup is for hourly appointments or daily rentals.",
            "webba-booking-lite"
          )}
        </p>
      ) : (
        <>
          {entityCards.length > 0 ? (
            <div className="wbk-assistance__config-section">
              <h3 className="wbk-assistance__config-sectionTitle">{entitySectionTitle}</h3>
              <div className="wbk-assistance__config-cards">
                {entityCards.map((card) => (
                  <ConfigInformationEntityCard
                    key={card.key}
                    title={card.title}
                    badge={card.badge}
                    properties={card.properties}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {settingsProperties.length > 0 ? (
            <div className="wbk-assistance__config-section">
              <h3 className="wbk-assistance__config-sectionTitle">
                {__("Settings", "webba-booking-lite")}
              </h3>
              <ul className="wbk-assistance__config-fields">
                {settingsProperties.map((property) => (
                  <li
                    key={property.label}
                    className="wbk-assistance__config-field wbk-assistance__config-field--set"
                  >
                    <span className="wbk-assistance__config-field-label">{property.label}</span>
                    <span className="wbk-assistance__config-field-value">{property.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
};
