import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = "024800e3f670d30172ed941a6bec2ada";

let initialized = false;
let userContext: {
  site_url?: string;
  is_pro?: boolean;
} = {};

const getPlanLabel = (isPro: boolean) => (isPro ? "pro" : "free");

const getUserEventProperties = () => {
  const properties: Record<string, unknown> = {};

  if (userContext.site_url) {
    properties.site_url = userContext.site_url;
  }

  if (userContext.is_pro !== undefined) {
    properties.is_pro = userContext.is_pro;
    properties.plan = getPlanLabel(userContext.is_pro);
  }

  return properties;
};

export const initAnalytics = () => {
  if (initialized) return;

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: false,
    record_sessions_percent: 0,
  });

  initialized = true;
};

export const identifySite = (siteUrl: string, options?: { is_pro?: boolean }) => {
  if (!initialized || !siteUrl) return;

  userContext = {
    site_url: siteUrl,
    is_pro: options?.is_pro ?? userContext.is_pro,
  };

  mixpanel.identify(siteUrl);
  mixpanel.register(getUserEventProperties());
};

export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>,
  callback?: () => void
) => {
  if (!initialized) {
    initAnalytics();
  }

  const payload = {
    ...getUserEventProperties(),
    ...properties,
  };

  mixpanel.track(event, payload, (response) => {
    callback?.();
  });
};
