import { __ } from "@wordpress/i18n";

export const ASSISTANCE_LOADING_PHRASE_INTERVAL_MS = 3500;

export type AssistanceLoadingPhraseStage = "preparing" | "generating";

export const ASSISTANCE_PREPARATION_LOADING_PHRASES = [
  __("Reading what you wrote…", "webba-booking-lite"),
  __("Parsing your business details…", "webba-booking-lite"),
  __("Learning about your services…", "webba-booking-lite"),
  __("Checking your working hours…", "webba-booking-lite"),
  __("Mapping out your booking needs…", "webba-booking-lite"),
  __("Gathering context from the conversation…", "webba-booking-lite"),
  __("Figuring out what matters for your setup…", "webba-booking-lite"),
  __("Connecting the dots in your request…", "webba-booking-lite"),
  __("Reviewing your booking requirements…", "webba-booking-lite"),
  __("Understanding your business type…", "webba-booking-lite"),
  __("Sorting through the details you shared…", "webba-booking-lite"),
  __("Teaching robots about your business hours…", "webba-booking-lite"),
  __("Convincing the calendar to cooperate…", "webba-booking-lite"),
  __("Untangling time zones (hopefully)…", "webba-booking-lite"),
  __("Checking if Tuesday still exists…", "webba-booking-lite"),
  __("Counting chairs and counting minutes…", "webba-booking-lite"),
  __("Whispering sweet nothings to your services list…", "webba-booking-lite"),
];

export const ASSISTANCE_GENERATION_LOADING_PHRASES = [
  __("Cross-referencing your calendar wishlist…", "webba-booking-lite"),
  __("Finding the perfect slot in spacetime…", "webba-booking-lite"),
  __("Brewing up your booking setup…", "webba-booking-lite"),
  __("Massaging the schedule into shape…", "webba-booking-lite"),
  __("Dotting i's and blocking out time slots…", "webba-booking-lite"),
  __("Running calculations at the speed of caffeine…", "webba-booking-lite"),
  __("Negotiating with your future appointments…", "webba-booking-lite"),
  __("Almost there - polishing the booking forms…", "webba-booking-lite"),
  __("Making sure no double-bookings sneak in…", "webba-booking-lite"),
  __("Sketching your perfect customer journey…", "webba-booking-lite"),
  __("Organizing chaos into neat time blocks…", "webba-booking-lite"),
];

const PHRASES_BY_STAGE: Record<AssistanceLoadingPhraseStage, readonly string[]> = {
  preparing: ASSISTANCE_PREPARATION_LOADING_PHRASES,
  generating: ASSISTANCE_GENERATION_LOADING_PHRASES,
};

const shuffleIndices = (length: number): number[] => {
  const indices = Array.from({ length }, (_, index) => index);

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
};

export const createShuffledLoadingPhraseOrder = (
  stage: AssistanceLoadingPhraseStage
): number[] => shuffleIndices(PHRASES_BY_STAGE[stage].length);

export const getLoadingPhraseAt = (
  stage: AssistanceLoadingPhraseStage,
  order: number[],
  position: number
): string => {
  const phrases = PHRASES_BY_STAGE[stage];
  const wrap = (value: number, length: number) => ((value % length) + length) % length;

  // When the order was shuffled for a different stage it may not line up with
  // the current stage's phrase count. Fall back to a direct index so we never
  // resolve to an out-of-range (undefined) phrase and flash a blank message.
  if (order.length !== phrases.length) {
    return phrases[wrap(position, phrases.length)];
  }

  const phraseIndex = order[wrap(position, order.length)];

  return phrases[phraseIndex] ?? phrases[wrap(position, phrases.length)];
};

export const mapAssistanceTaskPhaseToLoadingStage = (
  phase?: string | null
): AssistanceLoadingPhraseStage => (phase === "generating" ? "generating" : "preparing");
