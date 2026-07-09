import { __, sprintf } from "@wordpress/i18n";
import {
  ConfigBusinessHours,
  ConfigDailyInformation,
  ConfigDailyUnitEntry,
  ConfigHourlyExtraEntry,
  ConfigHourlyInformation,
  ConfigHourlyServiceEntry,
  ConfigInformation,
  ConfigPreviewEntityCard,
  ConfigPreviewProperty,
} from "./types";

const HOURLY_CONFIG_FIELDS = [
  { key: "description" as const, label: __("Service description", "webba-booking-lite") },
  { key: "duration" as const, label: __("Duration", "webba-booking-lite") },
  { key: "attendees" as const, label: __("Simultaneous bookings", "webba-booking-lite") },
  { key: "business_hours" as const, label: __("Business hours", "webba-booking-lite") },
  { key: "price" as const, label: __("Price", "webba-booking-lite") },
  { key: "currency" as const, label: __("Currency", "webba-booking-lite") },
];

const DAILY_CONFIG_FIELDS = [
  { key: "description" as const, label: __("Unit description", "webba-booking-lite") },
  { key: "min_booking_days" as const, label: __("Minimum stay (days)", "webba-booking-lite") },
  { key: "quantity" as const, label: __("Units available", "webba-booking-lite") },
  { key: "price" as const, label: __("Price", "webba-booking-lite") },
  { key: "currency" as const, label: __("Currency", "webba-booking-lite") },
];

const NOT_SET_LABEL = __("Not set yet", "webba-booking-lite");

function createPreviewProperty(label: string, value: string | null): ConfigPreviewProperty {
  return {
    label,
    value,
    isSet: value !== null && value.trim().length > 0,
  };
}

function formatDayName(day: string): string {
  const trimmed = day.trim();
  if (!trimmed) {
    return day;
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function formatBusinessHours(hours: ConfigBusinessHours): string {
  if (hours.schedule?.length > 0) {
    return hours.schedule
      .map((entry) => `${formatDayName(entry.day)} ${entry.start}-${entry.end}`)
      .join(", ");
  }

  const daysLabel = hours.days.map(formatDayName).join(", ");
  if (hours.start && hours.end) {
    return daysLabel ? `${daysLabel} · ${hours.start}-${hours.end}` : `${hours.start}-${hours.end}`;
  }

  if (daysLabel) {
    return `${daysLabel} (${NOT_SET_LABEL})`;
  }

  return NOT_SET_LABEL;
}

function formatPriceUnitLabel(unit: string | null): string {
  if (!unit) {
    return "";
  }

  return unit.replace(/_/g, " ");
}

function formatPrice(price: number | Record<string, number>, unit: string | null = null): string {
  const unitLabel = formatPriceUnitLabel(unit);
  const suffix = unitLabel ? ` ${unitLabel}` : "";

  if (typeof price === "number") {
    return `${price}${suffix}`;
  }

  return Object.entries(price)
    .map(([name, amount]) => `${name}: ${amount}${suffix}`)
    .join(", ");
}

function formatServicePrice(
  price: number | null | undefined,
  priceUnit: string | null | undefined,
  fallbackUnit: string | null
): string | null {
  if (price === null || price === undefined) {
    return null;
  }

  const unitLabel = formatPriceUnitLabel(priceUnit ?? fallbackUnit);
  return unitLabel ? `${price} ${unitLabel}` : String(price);
}

function hasHourlyDescription(config: ConfigHourlyInformation): boolean {
  if (config.description) {
    return true;
  }

  return config.services.some((service) => service.name.trim().length > 0);
}

function hasHourlyDuration(config: ConfigHourlyInformation): boolean {
  if (config.duration !== null) {
    return true;
  }

  if (config.services.length === 0) {
    return false;
  }

  return config.services.every(
    (service) => service.duration !== null && service.duration !== undefined
  );
}

function hasHourlyAttendees(config: ConfigHourlyInformation): boolean {
  return config.attendees !== null;
}

function hasHourlyBusinessHours(config: ConfigHourlyInformation): boolean {
  const hours = config.business_hours;
  if (!hours) {
    return false;
  }

  if (hours.schedule?.length > 0) {
    return hours.schedule.every((entry) => entry.day && entry.start && entry.end);
  }

  if (hours.days.length === 0) {
    return false;
  }

  return Boolean(hours.start && hours.end);
}

function hasHourlyPrice(config: ConfigHourlyInformation): boolean {
  if (config.price !== null) {
    return true;
  }

  if (config.services.length === 0) {
    return false;
  }

  return config.services.every((service) => service.price !== null && service.price !== undefined);
}

function hasCurrency(currency: string | null): boolean {
  return currency !== null && currency.trim().length > 0;
}

function hasDailyDescription(config: ConfigDailyInformation): boolean {
  if (config.description) {
    return true;
  }

  return config.units.some((unit) => unit.name.trim().length > 0);
}

function hasDailyMinBookingDays(config: ConfigDailyInformation): boolean {
  if (config.min_booking_days !== null) {
    return true;
  }

  if (config.units.length === 0) {
    return false;
  }

  return config.units.every(
    (unit) => unit.min_booking_days !== null && unit.min_booking_days !== undefined
  );
}

function getNamedDailyUnits(config: ConfigDailyInformation): ConfigDailyUnitEntry[] {
  return config.units.filter((unit) => unit.name.trim());
}

function hasDailyQuantity(config: ConfigDailyInformation): boolean {
  const namedUnits = getNamedDailyUnits(config);
  const unitsForCheck = namedUnits.length > 0 ? namedUnits : config.units;

  if (unitsForCheck.length >= 2) {
    return unitsForCheck.every(
      (unit) => unit.quantity !== null && unit.quantity !== undefined
    );
  }

  if (config.quantity !== null) {
    return true;
  }

  if (unitsForCheck.length === 1) {
    return unitsForCheck[0].quantity !== null && unitsForCheck[0].quantity !== undefined;
  }

  return false;
}

function hasDailyPrice(config: ConfigDailyInformation): boolean {
  if (config.price !== null) {
    return true;
  }

  if (config.units.length === 0) {
    return false;
  }

  return config.units.every((unit) => unit.price !== null && unit.price !== undefined);
}

function isHourlyFieldSet(
  config: ConfigHourlyInformation,
  key: (typeof HOURLY_CONFIG_FIELDS)[number]["key"]
): boolean {
  switch (key) {
    case "description":
      return hasHourlyDescription(config);
    case "duration":
      return hasHourlyDuration(config);
    case "attendees":
      return hasHourlyAttendees(config);
    case "business_hours":
      return hasHourlyBusinessHours(config) || Boolean(config.business_hours?.days.length);
    case "price":
      return hasHourlyPrice(config);
    case "currency":
      return hasCurrency(config.currency);
    default:
      return false;
  }
}

function isDailyFieldSet(
  config: ConfigDailyInformation,
  key: (typeof DAILY_CONFIG_FIELDS)[number]["key"]
): boolean {
  switch (key) {
    case "description":
      return hasDailyDescription(config);
    case "min_booking_days":
      return hasDailyMinBookingDays(config);
    case "quantity":
      return hasDailyQuantity(config);
    case "price":
      return hasDailyPrice(config);
    case "currency":
      return hasCurrency(config.currency);
    default:
      return false;
  }
}

function getHourlyServicePrice(
  service: ConfigHourlyServiceEntry,
  config: ConfigHourlyInformation
): number | null {
  if (service.price !== null && service.price !== undefined) {
    return service.price;
  }

  if (config.price && typeof config.price === "object") {
    const amount = config.price[service.name];
    if (amount !== undefined) {
      return amount;
    }
  }

  return null;
}

function getServiceDescription(
  service: ConfigHourlyServiceEntry,
  config: ConfigHourlyInformation,
  namedServiceCount: number
): string | null {
  if (service.description) {
    return service.description;
  }

  if (namedServiceCount === 1 && config.description) {
    return config.description;
  }

  return null;
}

function getServiceBusinessHoursValue(config: ConfigHourlyInformation): string | null {
  if (
    !config.business_hours ||
    (config.business_hours.days.length === 0 && (config.business_hours.schedule?.length ?? 0) === 0)
  ) {
    return null;
  }

  return formatBusinessHours(config.business_hours);
}

function buildHourlyServiceProperties(
  service: ConfigHourlyServiceEntry,
  config: ConfigHourlyInformation,
  namedServiceCount: number
): ConfigPreviewProperty[] {
  const duration =
    service.duration !== null && service.duration !== undefined
      ? `${service.duration} min`
      : config.duration !== null && namedServiceCount === 1
        ? `${config.duration} min`
        : null;

  return [
    createPreviewProperty(
      __("Description", "webba-booking-lite"),
      getServiceDescription(service, config, namedServiceCount)
    ),
    createPreviewProperty(__("Duration", "webba-booking-lite"), duration),
    createPreviewProperty(
      __("Business hours", "webba-booking-lite"),
      getServiceBusinessHoursValue(config)
    ),
    createPreviewProperty(
      __("Price", "webba-booking-lite"),
      formatServicePrice(
        getHourlyServicePrice(service, config),
        service.price_unit,
        config.price_unit
      )
    ),
  ];
}

function buildHourlyExtraProperties(extra: ConfigHourlyExtraEntry): ConfigPreviewProperty[] {
  return [
    createPreviewProperty(__("Description", "webba-booking-lite"), extra.description ?? null),
    createPreviewProperty(
      __("Price", "webba-booking-lite"),
      formatServicePrice(extra.price, extra.price_unit, null)
    ),
  ];
}

function buildImplicitHourlyServiceCard(config: ConfigHourlyInformation): ConfigPreviewEntityCard | null {
  const properties: ConfigPreviewProperty[] = [
    createPreviewProperty(__("Description", "webba-booking-lite"), config.description),
    createPreviewProperty(
      __("Duration", "webba-booking-lite"),
      config.duration !== null ? `${config.duration} min` : null
    ),
    createPreviewProperty(
      __("Business hours", "webba-booking-lite"),
      getServiceBusinessHoursValue(config)
    ),
    createPreviewProperty(
      __("Price", "webba-booking-lite"),
      config.price !== null
        ? typeof config.price === "number"
          ? formatServicePrice(config.price, null, config.price_unit)
          : formatPrice(config.price, config.price_unit)
        : null
    ),
  ];

  if (!properties.some((property) => property.isSet)) {
    return null;
  }

  return {
    key: "service-default",
    title: __("Service", "webba-booking-lite"),
    properties,
  };
}

export function buildHourlyServiceCards(config: ConfigHourlyInformation): ConfigPreviewEntityCard[] {
  const cards: ConfigPreviewEntityCard[] = [];
  const namedServices = config.services.filter((service) => service.name.trim());

  if (namedServices.length > 0) {
    namedServices.forEach((service) => {
      cards.push({
        key: `service-${service.name}`,
        title: service.name,
        properties: buildHourlyServiceProperties(service, config, namedServices.length),
      });
    });
  } else {
    const implicitCard = buildImplicitHourlyServiceCard(config);
    if (implicitCard) {
      cards.push(implicitCard);
    }
  }

  config.extras
    .filter((extra) => extra.name.trim())
    .forEach((extra) => {
      cards.push({
        key: `extra-${extra.name}`,
        title: extra.name,
        badge: __("Extra", "webba-booking-lite"),
        properties: buildHourlyExtraProperties(extra),
      });
    });

  return cards;
}

function formatHourlySettingsValue(
  config: ConfigHourlyInformation,
  key: "attendees" | "currency"
): string | null {
  switch (key) {
    case "attendees":
      return config.attendees !== null ? String(config.attendees) : null;
    case "currency":
      return config.currency;
    default:
      return null;
  }
}

export function buildHourlySettingsProperties(
  config: ConfigHourlyInformation
): ConfigPreviewProperty[] {
  const settingKeys = ["attendees", "currency"] as const;

  return settingKeys
    .map((key) => {
      const field = HOURLY_CONFIG_FIELDS.find((entry) => entry.key === key);
      const value = formatHourlySettingsValue(config, key);
      const isSet = isHourlyFieldSet(config, key);

      return {
        label: field?.label ?? key,
        value: isSet ? value : null,
        isSet,
      };
    })
    .filter((property) => property.isSet);
}

function getUnitDescription(
  unit: ConfigDailyUnitEntry,
  config: ConfigDailyInformation,
  namedUnitCount: number
): string | null {
  if (unit.description) {
    return unit.description;
  }

  if (namedUnitCount === 1 && config.description) {
    return config.description;
  }

  return null;
}

function buildDailyUnitProperties(
  unit: ConfigDailyUnitEntry,
  config: ConfigDailyInformation,
  namedUnitCount: number
): ConfigPreviewProperty[] {
  const properties: ConfigPreviewProperty[] = [
    createPreviewProperty(
      __("Description", "webba-booking-lite"),
      getUnitDescription(unit, config, namedUnitCount)
    ),
  ];

  if (unit.min_booking_days !== null && unit.min_booking_days !== undefined) {
    properties.push(
      createPreviewProperty(
        __("Minimum stay", "webba-booking-lite"),
        sprintf(__("%d days", "webba-booking-lite"), unit.min_booking_days)
      )
    );
  } else if (config.min_booking_days !== null && config.min_booking_days !== undefined) {
    properties.push(
      createPreviewProperty(
        __("Minimum stay", "webba-booking-lite"),
        sprintf(__("%d days", "webba-booking-lite"), config.min_booking_days)
      )
    );
  } else {
    properties.push(
      createPreviewProperty(__("Minimum stay", "webba-booking-lite"), null)
    );
  }

  if (unit.quantity !== null && unit.quantity !== undefined) {
    properties.push(
      createPreviewProperty(__("Units available", "webba-booking-lite"), String(unit.quantity))
    );
  } else if (config.quantity !== null && config.quantity !== undefined) {
    properties.push(
      createPreviewProperty(__("Units available", "webba-booking-lite"), String(config.quantity))
    );
  } else {
    properties.push(createPreviewProperty(__("Units available", "webba-booking-lite"), null));
  }

  if (unit.capacity !== null && unit.capacity !== undefined) {
    properties.push(
      createPreviewProperty(__("Capacity", "webba-booking-lite"), String(unit.capacity))
    );
  }

  properties.push(
    createPreviewProperty(
      __("Price", "webba-booking-lite"),
      formatServicePrice(unit.price, unit.price_unit, config.price_unit)
    )
  );

  return properties;
}

function buildImplicitDailyUnitCard(config: ConfigDailyInformation): ConfigPreviewEntityCard | null {
  const properties: ConfigPreviewProperty[] = [
    createPreviewProperty(__("Description", "webba-booking-lite"), config.description),
    createPreviewProperty(
      __("Minimum stay", "webba-booking-lite"),
      config.min_booking_days !== null
        ? sprintf(__("%d days", "webba-booking-lite"), config.min_booking_days)
        : null
    ),
    createPreviewProperty(
      __("Units available", "webba-booking-lite"),
      config.quantity !== null ? String(config.quantity) : null
    ),
    createPreviewProperty(
      __("Price", "webba-booking-lite"),
      config.price !== null
        ? formatServicePrice(config.price, null, config.price_unit)
        : null
    ),
  ];

  if (!properties.some((property) => property.isSet)) {
    return null;
  }

  return {
    key: "unit-default",
    title: __("Unit", "webba-booking-lite"),
    properties,
  };
}

export function buildDailyUnitCards(config: ConfigDailyInformation): ConfigPreviewEntityCard[] {
  const namedUnits = getNamedDailyUnits(config);

  if (namedUnits.length > 0) {
    return namedUnits.map((unit) => ({
      key: `unit-${unit.name}`,
      title: unit.name,
      properties: buildDailyUnitProperties(unit, config, namedUnits.length),
    }));
  }

  const implicitCard = buildImplicitDailyUnitCard(config);
  return implicitCard ? [implicitCard] : [];
}

export function buildDailySettingsProperties(
  config: ConfigDailyInformation
): ConfigPreviewProperty[] {
  const isSet = isDailyFieldSet(config, "currency");

  if (!isSet || !config.currency) {
    return [];
  }

  const field = DAILY_CONFIG_FIELDS.find((entry) => entry.key === "currency");

  return [
    {
      label: field?.label ?? "currency",
      value: config.currency,
      isSet: true,
    },
  ];
}

export function getConfigProgress(config: ConfigInformation): {
  collectedCount: number;
  totalFields: number;
} {
  if (config.mode === "daily") {
    return {
      collectedCount: DAILY_CONFIG_FIELDS.filter((field) =>
        isDailyFieldSet(config.daily, field.key)
      ).length,
      totalFields: DAILY_CONFIG_FIELDS.length,
    };
  }

  if (config.mode === "hourly") {
    return {
      collectedCount: HOURLY_CONFIG_FIELDS.filter((field) =>
        isHourlyFieldSet(config.hourly, field.key)
      ).length,
      totalFields: HOURLY_CONFIG_FIELDS.length,
    };
  }

  return { collectedCount: 0, totalFields: 0 };
}
