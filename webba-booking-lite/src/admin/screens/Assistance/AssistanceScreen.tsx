import {
  FormEvent,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { __, sprintf } from "@wordpress/i18n";
import { ConfigInformationPanel } from "./ConfigInformationPanel";
import {
  applyAssistanceActions,
  AssistanceApplyResponse,
  AssistanceApplyResultEntry,
  createAssistanceSessionId,
  getAssistanceErrorMessage,
  getAssistanceTaskStatus,
  getAssistanceUserMessage,
  mapAssistanceTaskToResponse,
  submitAssistanceTask,
} from "./api";
import {
  createShuffledLoadingPhraseOrder,
  ASSISTANCE_LOADING_PHRASE_INTERVAL_MS,
  AssistanceLoadingPhraseStage,
  getLoadingPhraseAt,
  mapAssistanceTaskPhaseToLoadingStage,
} from "./loadingPhrases";
import {
  AssistanceApiResponse,
  AssistanceBookingPage,
  AssistanceConversationTurn,
  AssistanceScreenHandle,
  AssistanceScreenProps,
  ChatMessage,
  ConfigInformation,
  createEmptyConfigInformation,
} from "./types";
import { normalizeAssistanceSummaryLines, normalizeAssistanceSummaryText } from "./formatSummary";
import { trackAssistanceCompleted, trackAssistanceOpened } from "./assistanceAnalytics";
import "./AssistanceScreen.scss";

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const EMPTY_CONFIG = createEmptyConfigInformation();

const messagesToConversationTurns = (messages: ChatMessage[]): AssistanceConversationTurn[] =>
  messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      ...(m.missing ? { missing: m.missing } : {}),
      ...(m.config_mode !== undefined ? { config_mode: m.config_mode } : {}),
      ...(m.config_information ? { config_information: m.config_information } : {}),
    }));

const getMessageRoleModifier = (role: ChatMessage["role"]): string =>
  role === "assistant" ? "reply" : role;

const INPUT_INVITE = __(
  "Describe your booking requirements, e.g. I run a salon and need 30-minute appointments, working hours, and email reminders…",
  "webba-booking-lite"
);

const TYPEWRITER_CHAR_MS = 45;
const ASSISTANCE_POLL_INTERVAL_MS = 1000;
const ASSISTANCE_POLL_TIMEOUT_MS = 120000;

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

const pollAssistanceTask = async (
  taskId: number,
  onProgress?: (phase: AssistanceLoadingPhraseStage) => void
) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < ASSISTANCE_POLL_TIMEOUT_MS) {
    const statusResponse = await getAssistanceTaskStatus(taskId);
    const status = statusResponse.status ?? "processing";

    onProgress?.(mapAssistanceTaskPhaseToLoadingStage(statusResponse.phase));

    if (status === "completed") {
      return mapAssistanceTaskToResponse(statusResponse);
    }

    if (status === "failed") {
      throw new Error(getAssistanceUserMessage(statusResponse.message, statusResponse.moderation));
    }

    await sleep(ASSISTANCE_POLL_INTERVAL_MS);
  }

  throw new Error(__("Assistance request timed out.", "webba-booking-lite"));
};

const buildClarifyContent = (result: AssistanceApiResponse): string =>
  normalizeAssistanceSummaryText(
    result.question?.trim() ||
      __("What else should I know to set up your booking services?", "webba-booking-lite")
  );

const isSkippedProResult = (entry: AssistanceApplyResultEntry): boolean =>
  Boolean(entry.skipped_pro);

const buildApplyFailureMessage = (applyResult: AssistanceApplyResponse): string => {
  const failureMessages =
    applyResult.errors.length > 0
      ? applyResult.errors
      : applyResult.results
          .filter((entry) => !entry.success && !isSkippedProResult(entry))
          .map((entry) => entry.message);

  if (failureMessages.length === 0) {
    return __("Some changes could not be applied.", "webba-booking-lite");
  }

  return sprintf(__("Applied with errors: %s", "webba-booking-lite"), failureMessages.join("; "));
};

const buildApplySuccessContent = (applyResult: AssistanceApplyResponse): string => {
  if (applyResult.summary && applyResult.summary.length > 0) {
    return __("Your booking setup is ready.", "webba-booking-lite");
  }

  if (applyResult.warnings && applyResult.warnings.length > 0) {
    return "";
  }

  return __("All suggested changes were applied successfully.", "webba-booking-lite");
};

const PRO_UPGRADE_URL = "https://webba-booking.com/pricing/";

const splitSummaryLineLabel = (line: string): { label: string; rest: string } | null => {
  const colonIndex = line.indexOf(": ");
  if (colonIndex !== -1) {
    return {
      label: line.slice(0, colonIndex),
      rest: line.slice(colonIndex),
    };
  }

  if (line.endsWith(".")) {
    return {
      label: line.slice(0, -1),
      rest: ".",
    };
  }

  return null;
};

const SummaryLineItem = ({ line }: { line: string }) => {
  const parts = splitSummaryLineLabel(line);

  if (!parts) {
    return <li>{line}</li>;
  }

  return (
    <li>
      <strong>{parts.label}</strong>
      {parts.rest}
    </li>
  );
};

const ProSkippedWarningsSection = ({ lines }: { lines: string[] }) => {
  const [expanded, setExpanded] = useState(false);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="wbk-assistance__pro-skipped">
      <p className="wbk-assistance__pro-skipped-intro">
        <SummaryWarningIcon />
        <span>
          {__(
            "Some actions were not applied because they require the Pro version.",
            "webba-booking-lite"
          )}{" "}
          <button
            type="button"
            className="wbk-assistance__pro-skipped-toggle"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            {__("See details", "webba-booking-lite")}
          </button>
        </span>
      </p>
      {expanded && (
        <>
          <ul className="wbk-assistance__pro-skipped-list">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="wbk-assistance__pro-skipped-upgrade">
            <a href={PRO_UPGRADE_URL} target="_blank" rel="noopener noreferrer">
              {__("Upgrade now", "webba-booking-lite")}
            </a>
          </p>
        </>
      )}
    </div>
  );
};

const SummaryWarningIcon = () => (
  <span className="wbk-assistance__summary-warning-icon" aria-hidden="true">
    <svg viewBox="0 0 20 20" focusable="false">
      <path
        fill="currentColor"
        d="M8.257 3.099c.765-1.36 2.672-1.36 3.436 0l6.518 11.594c.75 1.335-.213 2.807-1.718 2.807H3.457c-1.505 0-2.468-1.472-1.718-2.807L8.257 3.1zM10 7a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1zm0 8a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5z"
      />
    </svg>
  </span>
);

const BookingPageLink = ({ bookingPage }: { bookingPage: AssistanceBookingPage }) => {
  const pageUrl = bookingPage.page_url?.trim() || "";

  if (!pageUrl) {
    return null;
  }

  return (
    <p className="wbk-assistance__booking-page-link">
      <a href={pageUrl} target="_blank" rel="noopener noreferrer">
        {__("Open booking page", "webba-booking-lite")}
      </a>
    </p>
  );
};

const MessageContent = ({ message }: { message: ChatMessage }) => {
  const hasCollectedSummary = Boolean(message.collected_summary?.length);
  const hasSummaryLines = Boolean(message.summaryLines?.length);
  const hasWarningLines = Boolean(message.warningLines?.length);

  if (hasCollectedSummary || hasSummaryLines || hasWarningLines) {
    const summaryLines = normalizeAssistanceSummaryLines(
      hasCollectedSummary ? (message.collected_summary ?? []) : (message.summaryLines ?? [])
    );
    const warningLines = normalizeAssistanceSummaryLines(message.warningLines ?? []);

    return (
      <div className="wbk-assistance__message-formatted">
        {hasCollectedSummary && (
          <p className="wbk-assistance__summary-heading">
            {__("Collected so far:", "webba-booking-lite")}
          </p>
        )}
        {!hasCollectedSummary && message.content && (hasSummaryLines || hasWarningLines) && (
          <p className="wbk-assistance__summary-heading">{message.content}</p>
        )}
        {summaryLines.length > 0 && (
          <ul className="wbk-assistance__summary-list">
            {summaryLines.map((line) => (
              <SummaryLineItem key={line} line={line} />
            ))}
          </ul>
        )}
        {warningLines.length > 0 && <ProSkippedWarningsSection lines={warningLines} />}
        {message.bookingPage && <BookingPageLink bookingPage={message.bookingPage} />}
        {hasCollectedSummary && message.content && (
          <p className="wbk-assistance__summary-question wbk-assistance__clarify-question">
            {normalizeAssistanceSummaryText(message.content)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`wbk-assistance__message-text${
        message.isClarify ? " wbk-assistance__clarify-question" : ""
      }`}
    >
      {normalizeAssistanceSummaryText(message.content)}
    </div>
  );
};

export const AssistanceScreen = forwardRef<AssistanceScreenHandle, AssistanceScreenProps>(
  function AssistanceScreen(
    { variant = "standalone", onSetupComplete }: AssistanceScreenProps = {},
    ref
  ) {
    const isWizardVariant = variant === "wizard";
    const isEmbeddedVariant = variant === "wizard" || variant === "checklist";
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [configInformation, setConfigInformation] = useState<ConfigInformation>(EMPTY_CONFIG);
    const [input, setInput] = useState("");
    const [typedInvite, setTypedInvite] = useState("");
    const [inputFocused, setInputFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingPhraseStage, setLoadingPhraseStage] =
      useState<AssistanceLoadingPhraseStage>("preparing");
    const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
    const loadingPhraseOrder = useMemo(
      () => createShuffledLoadingPhraseOrder(loadingPhraseStage),
      [loadingPhraseStage]
    );
    const sessionIdRef = useRef(createAssistanceSessionId());
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const submittingRef = useRef(false);
    const messagesRef = useRef(messages);
    const configInformationRef = useRef(configInformation);

    messagesRef.current = messages;
    configInformationRef.current = configInformation;

    useImperativeHandle(
      ref,
      () => ({
        getSkipTrackingPayload: () => ({
          conversation: messagesToConversationTurns(messagesRef.current),
          config_information: configInformationRef.current,
        }),
      }),
      []
    );

    useEffect(() => {
      trackAssistanceOpened(variant);
    }, [variant]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
      const container = messagesContainerRef.current;
      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    }, []);

    useLayoutEffect(() => {
      if (messages.length === 0 && !loading) {
        return;
      }

      scrollToBottom(messages.length <= 1 ? "auto" : "smooth");

      const frame = requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (!container) {
          return;
        }

        container.scrollTop = container.scrollHeight;
      });

      return () => cancelAnimationFrame(frame);
    }, [messages, loading, scrollToBottom]);

    const showTypewriterInvite = messages.length === 0 && !input && !inputFocused;

    useEffect(() => {
      if (!loading) {
        setLoadingPhraseStage("preparing");
        setLoadingPhraseIndex(0);
        return;
      }

      setLoadingPhraseIndex(0);

      const timerId = window.setInterval(() => {
        setLoadingPhraseIndex((prev) => prev + 1);
      }, ASSISTANCE_LOADING_PHRASE_INTERVAL_MS);

      return () => window.clearInterval(timerId);
    }, [loading, loadingPhraseStage]);

    useEffect(() => {
      if (!showTypewriterInvite) {
        setTypedInvite("");
        return;
      }

      let index = 0;
      let timeoutId: ReturnType<typeof setTimeout>;

      const typeNext = () => {
        index += 1;
        setTypedInvite(INPUT_INVITE.slice(0, index));
        if (index < INPUT_INVITE.length) {
          timeoutId = setTimeout(typeNext, TYPEWRITER_CHAR_MS);
        }
      };

      timeoutId = setTimeout(typeNext, TYPEWRITER_CHAR_MS);

      return () => clearTimeout(timeoutId);
    }, [showTypewriterInvite]);

    const handleSubmit = async (event: FormEvent) => {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || loading || submittingRef.current) {
        return;
      }

      submittingRef.current = true;

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
      };

      const priorConversation = messagesToConversationTurns(messages);

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setLoadingPhraseStage("preparing");
      setLoadingPhraseIndex(0);
      setLoading(true);

      try {
        const taskId = await submitAssistanceTask(
          trimmed,
          priorConversation,
          configInformation,
          sessionIdRef.current
        );
        const result = await pollAssistanceTask(taskId, setLoadingPhraseStage);
        const isClarify = result.mode === "clarify";

        if (result.config_information) {
          setConfigInformation(result.config_information);
        }

        if (isClarify) {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: buildClarifyContent(result),
              isClarify: true,
              missing: result.missing,
              config_mode: result.config_mode,
              config_information: result.config_information,
              collected_summary: normalizeAssistanceSummaryLines(result.collected_summary ?? []),
            },
          ]);
        } else if (result.actions.length === 0) {
          setMessages((prev) => [
            ...prev,
            {
              id: createId(),
              role: "assistant",
              content: __(
                "No configuration changes suggested yet. Try adding more detail about your services, hours, or pricing.",
                "webba-booking-lite"
              ),
            },
          ]);
        } else {
          setLoadingPhraseStage("generating");
          const applyResult = await applyAssistanceActions(result.actions, {
            sessionId: sessionIdRef.current,
          });

          trackAssistanceCompleted(variant, {
            success: applyResult.success,
            actions_count: result.actions.length,
            has_booking_page: Boolean(applyResult.booking_page?.page_url),
            warnings_count: applyResult.warnings?.length ?? 0,
            errors_count: applyResult.errors?.length ?? 0,
          });

          if (applyResult.success) {
            setMessages((prev) => [
              ...prev,
              {
                id: createId(),
                role: "assistant",
                content: buildApplySuccessContent(applyResult),
                summaryLines: normalizeAssistanceSummaryLines(applyResult.summary ?? []),
                warningLines: normalizeAssistanceSummaryLines(applyResult.warnings ?? []),
                bookingPage: applyResult.booking_page ?? null,
                config_mode: result.config_mode,
                config_information: result.config_information,
                actions: result.actions,
              },
            ]);

            if (isEmbeddedVariant && onSetupComplete) {
              onSetupComplete(applyResult.booking_page?.page_url ?? undefined);
            }
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: createId(),
                role: "error",
                content: buildApplyFailureMessage(applyResult),
                summaryLines:
                  applyResult.summary && applyResult.summary.length > 0
                    ? normalizeAssistanceSummaryLines(applyResult.summary)
                    : undefined,
                warningLines:
                  applyResult.warnings && applyResult.warnings.length > 0
                    ? normalizeAssistanceSummaryLines(applyResult.warnings)
                    : undefined,
              },
            ]);
          }
        }
      } catch (error) {
        const message = getAssistanceErrorMessage(error);

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "error",
            content: message,
          },
        ]);
      } finally {
        submittingRef.current = false;
        setLoading(false);
      }
    };

    return (
      <div className={`wbk-assistance${isEmbeddedVariant ? " wbk-assistance--wizard" : ""}`}>
        {!isEmbeddedVariant && (
          <header className="wbk-assistance__header">
            <h1>{__("Assistance", "webba-booking-lite")}</h1>
          </header>
        )}

        <div className="wbk-assistance__content">
          <div className="wbk-assistance__main">
            {isWizardVariant && (
              <div className="wbk-assistance__wizardIntro">
                <h2 className="wbk-assistance__wizardTitle">
                  {__("Welcome to Webba Booking!", "webba-booking-lite")}
                </h2>
                <p className="wbk-assistance__wizardDescription">
                  {__(
                    "Tell us about your business and we will configure your booking setup for you.",
                    "webba-booking-lite"
                  )}
                </p>
              </div>
            )}
            <section
              className="wbk-assistance__chat"
              aria-label={__("Conversation", "webba-booking-lite")}
            >
              <div
                ref={messagesContainerRef}
                className="wbk-assistance__messages"
                role="log"
                aria-live="polite"
              >
                {messages.length === 0 && (
                  <div className="wbk-assistance__empty">
                    <p>
                      {__(
                        "Start with your business type and location. The assistant may ask about services, duration, capacity, hours, and pricing before suggesting setup changes.",
                        "webba-booking-lite"
                      )}
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`wbk-assistance__message wbk-assistance__message--${getMessageRoleModifier(message.role)}${
                      message.isClarify ? " wbk-assistance__message--clarify" : ""
                    }`}
                  >
                    {message.isClarify && (
                      <span className="wbk-assistance__clarify-label">
                        {__("Question", "webba-booking-lite")}
                      </span>
                    )}
                    <MessageContent message={message} />
                  </div>
                ))}

                {loading && (
                  <div className="wbk-assistance__loading" aria-live="polite">
                    <span
                      key={`${loadingPhraseStage}-${loadingPhraseIndex}`}
                      className="wbk-assistance__loading-phrase"
                    >
                      {getLoadingPhraseAt(
                        loadingPhraseStage,
                        loadingPhraseOrder,
                        loadingPhraseIndex
                      )}
                    </span>
                  </div>
                )}
              </div>

              <form className="wbk-assistance__composer" onSubmit={handleSubmit}>
                <div className="wbk-assistance__input-wrap">
                  {showTypewriterInvite && (
                    <div className="wbk-assistance__input-typewriter" aria-hidden="true">
                      <span>{typedInvite}</span>
                      <span className="wbk-assistance__input-typewriter-cursor" />
                    </div>
                  )}
                  <textarea
                    className="wbk-assistance__input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    aria-label={INPUT_INVITE}
                    rows={2}
                    disabled={loading}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="wbk-assistance__send"
                  disabled={loading || !input.trim()}
                >
                  {loading
                    ? __("Sending…", "webba-booking-lite")
                    : __("Send", "webba-booking-lite")}
                </button>
              </form>
            </section>
          </div>

          <aside className="wbk-assistance__sidebar">
            <ConfigInformationPanel config={configInformation} />
          </aside>
        </div>
      </div>
    );
  }
);
