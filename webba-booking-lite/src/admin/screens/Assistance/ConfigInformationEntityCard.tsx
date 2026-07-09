import { __ } from "@wordpress/i18n";
import { ConfigPreviewProperty } from "./types";

interface ConfigInformationEntityCardProps {
  title: string;
  badge?: string;
  properties: ConfigPreviewProperty[];
}

export const ConfigInformationEntityCard = ({
  title,
  badge,
  properties,
}: ConfigInformationEntityCardProps) => {
  const isComplete = properties.length > 0 && properties.every((property) => property.isSet);

  return (
    <article
      className={`wbk-assistance__config-entityCard${
        isComplete ? " wbk-assistance__config-entityCard--complete" : ""
      }`}
    >
      <header className="wbk-assistance__config-entityCard-header">
        {badge ? (
          <span className="wbk-assistance__config-entityCard-badge">{badge}</span>
        ) : null}
        <h4 className="wbk-assistance__config-entityCard-title">{title}</h4>
      </header>
      <dl className="wbk-assistance__config-entityCard-properties">
        {properties.map((property) => (
          <div
            key={property.label}
            className={`wbk-assistance__config-entityCard-row${
              property.isSet
                ? " wbk-assistance__config-entityCard-row--set"
                : " wbk-assistance__config-entityCard-row--missing"
            }`}
          >
            <dt className="wbk-assistance__config-entityCard-label">{property.label}</dt>
            <dd className="wbk-assistance__config-entityCard-value">
              {property.value ?? __("Not set yet", "webba-booking-lite")}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
};
