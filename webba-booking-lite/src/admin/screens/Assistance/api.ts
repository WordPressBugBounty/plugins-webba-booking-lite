import apiFetch from "@wordpress/api-fetch";
import { __ } from "@wordpress/i18n";
import { normalizeAssistanceActions } from "./actionsJson";
import { normalizeAssistanceSummaryLines } from "./formatSummary";
import {
  AssistanceAction,
  AssistanceApiResponse,
  AssistanceBookingPage,
  AssistanceModerationInfo,
  ConfigInformation,
} from "./types";

export interface AssistanceConversationPayload {
  role: "user" | "assistant";
  content: string;
  missing?: AssistanceApiResponse["missing"];
  config_mode?: AssistanceApiResponse["config_mode"];
  config_information?: ConfigInformation;
}

export interface AssistanceSubmitResponse {
  success: boolean;
  task_id?: number;
  status?: string;
  message?: string;
  moderation?: AssistanceModerationInfo;
}

export interface AssistanceTaskStatusResponse {
  success: boolean;
  task_id?: number;
  status?: string;
  phase?: string | null;
  mode?: AssistanceApiResponse["mode"];
  actions?: AssistanceApiResponse["actions"];
  question?: string;
  collected_summary?: string[];
  missing?: AssistanceApiResponse["missing"];
  config_mode?: AssistanceApiResponse["config_mode"];
  config_information?: ConfigInformation;
  message?: string;
  moderation?: AssistanceModerationInfo;
}

export const ASSISTANCE_BLOCKED_USER_MESSAGE = __(
  "Your account has been blocked and can no longer use the assistance feature.",
  "webba-booking-lite"
);

export function isAssistanceBlockedResponse(
  message?: string,
  moderation?: AssistanceModerationInfo | null
): boolean {
  if (moderation?.blocked || moderation?.failed) {
    return true;
  }

  return (
    message === "Your account has been blocked" ||
    message === "Content failed moderation check" ||
    message === ASSISTANCE_BLOCKED_USER_MESSAGE
  );
}

export function getAssistanceUserMessage(
  message?: string,
  moderation?: AssistanceModerationInfo | null
): string {
  if (isAssistanceBlockedResponse(message, moderation)) {
    return ASSISTANCE_BLOCKED_USER_MESSAGE;
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  return __("Request failed.", "webba-booking-lite");
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const errorObject = error as {
      message?: string;
      data?: { moderation?: AssistanceModerationInfo };
    };

    if (errorObject.data?.moderation || errorObject.message) {
      return getAssistanceUserMessage(errorObject.message, errorObject.data?.moderation);
    }
  }

  if (error instanceof Error && error.message) {
    return getAssistanceUserMessage(error.message);
  }

  return __("Request failed.", "webba-booking-lite");
}

export function getAssistanceErrorMessage(error: unknown): string {
  return getErrorMessage(error);
}

export const createAssistanceSessionId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

export async function submitAssistanceTask(
  request: string,
  conversation: AssistanceConversationPayload[] = [],
  configInformation?: ConfigInformation | null,
  sessionId?: string
): Promise<number> {
  const response = await apiFetch<AssistanceSubmitResponse>({
    path: "/wbk/v2/assistance/",
    method: "POST",
    data: {
      request,
      ...(conversation.length > 0 ? { messages: conversation } : {}),
      ...(configInformation ? { config_information: configInformation } : {}),
      ...(sessionId ? { session_id: sessionId } : {}),
    },
  });

  if (!response?.success || !response.task_id) {
    throw new Error(
      getAssistanceUserMessage(response?.message, response?.moderation)
    );
  }

  return response.task_id;
}

export async function getAssistanceTaskStatus(
  taskId: number
): Promise<AssistanceTaskStatusResponse> {
  return apiFetch<AssistanceTaskStatusResponse>({
    path: `/wbk/v2/assistance/task/${taskId}`,
    method: "GET",
  });
}

export function mapAssistanceTaskToResponse(
  response: AssistanceTaskStatusResponse
): AssistanceApiResponse {
  if (!response?.success) {
    throw new Error(getAssistanceUserMessage(response?.message, response?.moderation));
  }

  return {
    success: true,
    mode: response.mode ?? "actions",
    actions: normalizeAssistanceActions(response.actions),
    question: response.question,
    collected_summary: normalizeAssistanceSummaryLines(response.collected_summary ?? []),
    missing: response.missing,
    config_mode: response.config_mode ?? null,
    config_information: response.config_information,
  };
}

export interface AssistanceApplyResultEntry {
  action: string;
  success: boolean;
  message: string;
  table?: string;
  id?: number;
  ref?: string | null;
  slug?: string;
  invalid_fields?: unknown;
  skipped_pro?: boolean;
  skipped_pro_fields?: string[];
}

export interface AssistanceApplyResponse {
  success: boolean;
  results: AssistanceApplyResultEntry[];
  errors: string[];
  refs: Record<string, number>;
  summary?: string[];
  warnings?: string[];
  booking_page?: AssistanceBookingPage | null;
}

export function getBrowserTimezone(): string {
  if (typeof Intl !== "undefined" && typeof Intl.DateTimeFormat === "function") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  }

  return "UTC";
}

export async function applyAssistanceActions(
  actions: AssistanceAction[],
  options?: { timezone?: string; sessionId?: string }
): Promise<AssistanceApplyResponse> {
  const timezone = options?.timezone?.trim() || getBrowserTimezone();
  const sessionId = options?.sessionId?.trim() || "";

  try {
    const response = await apiFetch<AssistanceApplyResponse>({
      path: "/wbk/v2/assistance/apply/",
      method: "POST",
      data: {
        actions,
        timezone,
        ...(sessionId ? { session_id: sessionId } : {}),
      },
    });

    return {
      success: Boolean(response?.success),
      results: response?.results ?? [],
      errors: response?.errors ?? [],
      refs: response?.refs ?? {},
      summary: normalizeAssistanceSummaryLines(response?.summary ?? []),
      warnings: normalizeAssistanceSummaryLines(response?.warnings ?? []),
      booking_page: response?.booking_page ?? null,
    };
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
