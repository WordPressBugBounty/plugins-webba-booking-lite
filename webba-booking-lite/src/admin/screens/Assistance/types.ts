export type AssistanceActionType = "create_entity" | "update_entity" | "set_option";

export interface CreateEntityAction {
  action: "create_entity";
  table: string;
  fields: Record<string, unknown>;
  ref?: string;
  service_id?: string;
  unit_id?: string;
}

export interface UpdateEntityAction {
  action: "update_entity";
  table: string;
  id: number;
  fields: Record<string, unknown>;
}

export interface SetOptionAction {
  action: "set_option";
  slug: string;
  value: unknown;
}

export type AssistanceAction = CreateEntityAction | UpdateEntityAction | SetOptionAction;

export type AssistanceResponseMode = "actions" | "clarify";

export type ConfigMode = "hourly" | "daily";

export type HourlyMissingInfoKey =
  | "service_description"
  | "service_duration"
  | "service_attendees"
  | "business_days"
  | "business_hours_times"
  | "service_price"
  | "currency";

export type DailyMissingInfoKey =
  | "unit_description"
  | "min_booking_days"
  | "unit_quantity"
  | "unit_price"
  | "currency";

export type AssistanceMissingInfoKey = HourlyMissingInfoKey | DailyMissingInfoKey | "config_mode";

export interface ConfigHourlyServiceEntry {
  name: string;
  description?: string | null;
  duration?: number | null;
  price?: number | null;
  price_unit?: string | null;
}

export interface ConfigHourlyExtraEntry {
  name: string;
  description?: string | null;
  price?: number | null;
  price_unit?: string | null;
}

export interface ConfigDailyUnitEntry {
  name: string;
  description?: string | null;
  quantity?: number | null;
  capacity?: number | null;
  min_booking_days?: number | null;
  max_booking_days?: number | null;
  price?: number | null;
  price_unit?: string | null;
}

export interface ConfigBusinessDaySchedule {
  day: string;
  start: string;
  end: string;
}

export interface ConfigBusinessHours {
  days: string[];
  start: string | null;
  end: string | null;
  schedule: ConfigBusinessDaySchedule[];
}

export interface ConfigHourlyInformation {
  description: string | null;
  duration: number | null;
  attendees: number | null;
  business_hours: ConfigBusinessHours | null;
  price: number | Record<string, number> | null;
  price_unit: string | null;
  currency: string | null;
  services: ConfigHourlyServiceEntry[];
  extras: ConfigHourlyExtraEntry[];
}

export interface ConfigDailyInformation {
  description: string | null;
  quantity: number | null;
  capacity: number | null;
  min_booking_days: number | null;
  max_booking_days: number | null;
  availability_ranges: { start: string; end: string }[];
  price: number | null;
  price_unit: string | null;
  currency: string | null;
  units: ConfigDailyUnitEntry[];
}

export interface ConfigInformation {
  mode: ConfigMode | null;
  hourly: ConfigHourlyInformation;
  daily: ConfigDailyInformation;
}

export interface AssistanceConversationTurn {
  role: "user" | "assistant";
  content: string;
  missing?: AssistanceMissingInfoKey;
  config_mode?: ConfigMode | null;
  config_information?: ConfigInformation;
}

export interface AssistanceModerationInfo {
  blocked?: boolean;
  warning_created?: boolean;
  failed?: boolean;
}

export interface AssistanceApiResponse {
  success: boolean;
  mode?: AssistanceResponseMode;
  actions: AssistanceAction[];
  question?: string;
  collected_summary?: string[];
  missing?: AssistanceMissingInfoKey;
  config_mode?: ConfigMode | null;
  config_information?: ConfigInformation;
  model?: string;
  message?: string;
}

export type ChatRole = "user" | "assistant" | "error";

export interface AssistanceBookingPage {
  created?: boolean;
  page_id?: number;
  page_title?: string;
  page_url?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  isClarify?: boolean;
  missing?: AssistanceMissingInfoKey;
  config_mode?: ConfigMode | null;
  config_information?: ConfigInformation;
  actions?: AssistanceAction[];
  collected_summary?: string[];
  summaryLines?: string[];
  warningLines?: string[];
  bookingPage?: AssistanceBookingPage | null;
}

export const createEmptyHourlyConfig = (): ConfigHourlyInformation => ({
  description: null,
  duration: null,
  attendees: null,
  business_hours: null,
  price: null,
  price_unit: null,
  currency: null,
  services: [],
  extras: [],
});

export const createEmptyDailyConfig = (): ConfigDailyInformation => ({
  description: null,
  quantity: null,
  capacity: null,
  min_booking_days: null,
  max_booking_days: null,
  availability_ranges: [],
  price: null,
  price_unit: null,
  currency: null,
  units: [],
});

export const createEmptyConfigInformation = (): ConfigInformation => ({
  mode: null,
  hourly: createEmptyHourlyConfig(),
  daily: createEmptyDailyConfig(),
});

export interface ConfigPreviewProperty {
  label: string;
  value: string | null;
  isSet: boolean;
}

export interface ConfigPreviewEntityCard {
  key: string;
  title: string;
  badge?: string;
  properties: ConfigPreviewProperty[];
}

export type AssistanceScreenVariant = "standalone" | "wizard" | "checklist";

export interface AssistanceScreenProps {
  variant?: AssistanceScreenVariant;
  onSetupComplete?: (bookingPageUrl?: string) => void;
}

export interface AssistanceSkipTrackingPayload {
  conversation: AssistanceConversationTurn[];
  config_information: ConfigInformation;
}

export interface AssistanceScreenHandle {
  getSkipTrackingPayload: () => AssistanceSkipTrackingPayload;
}
