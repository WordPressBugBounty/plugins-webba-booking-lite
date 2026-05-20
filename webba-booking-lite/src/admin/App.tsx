import { Header } from "./components/Header/Header";
import { Router, RouterConfig } from "./components/Router/Router";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { SidebarProvider } from "./components/Sidebar/SidebarContext";
import { ServicesScreen } from "./screens/Services/ServicesScreen";
import { CouponsScreen } from "./screens/Coupons/CouponsScreen";
import { ConnectedCalendarsScreen } from "./screens/ConnectedCalendars/ConnectedCalendars";
import { EmailTemplateScreen } from "./screens/EmailTemplates/EmailTemplates";
import { PricingRulesScreen } from "./screens/PricingRules/PricingRules";
import { Page } from "./components/Router/types";
import { usePage } from "./components/Router/usePage";
import { BookingsScreen } from "./screens/Bookings/BookingsScreen";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { SettingsProvider } from "./providers/SettingsProvider";
import { useSelect } from "@wordpress/data";
import { store_name } from "../store/backend";
import { CanecelledBookingsScreen } from "./screens/Bookings/CanecelledBookingsScreen";
import { FormBuilderScreen } from "./screens/FormBuilder/FormBuilderScreen";
import { AppearanceEditorScreen } from "./screens/AppearanceEditor/AppearanceEditorScreen";
import { OptionsScreen } from "./screens/OptionsScreen/OptionsScreen";
import { ConfirmationPopupProvider } from "./components/ConfirmationPopup/ConfirmationPopupContext";
import { ConfirmationPopup } from "./components/ConfirmationPopup/ConfirmationPopup";
import { useSearchParams } from "wouter";
import { SetupWizard } from "./screens/SetupWizard/SetupWizard";
import { CalendarScreen } from "./screens/Calendar/CalendarScreen";
import { StaffMembersScreen } from "./screens/StaffMembers/StaffMembersScreen";
import { LocationsScreen } from "./screens/Locations/LocationsScreen";
import { ExtrasScreen } from "./screens/Extras/ExtrasScreen";

const tabToScreenMap: RouterConfig = {
  services: <ServicesScreen />,
  extras: <ExtrasScreen />,
  "service-categories": <ServicesScreen />,
  locations: <LocationsScreen />,
  'staff-members': <StaffMembersScreen />,
  "pricing-rules": <PricingRulesScreen />,
  "email-templates": <EmailTemplateScreen />,
  coupons: <CouponsScreen />,
  bookings: <BookingsScreen />,
  calendar: <CalendarScreen />,
  "cancelled-bookings": <CanecelledBookingsScreen />,
  dashboard: <Dashboard />,
  settings: "settings",
  "form-builder": <FormBuilderScreen />,
  appearance: <AppearanceEditorScreen />,
  options: <OptionsScreen />,
  "connected-calendars": <ConnectedCalendarsScreen />,
};

const pageToRoutesMap: Record<Page, RouterConfig> = {
  "wbk-services": {
    services: <ServicesScreen />,
    ...tabToScreenMap,
  },
  'wbk-locations': {
    locations: <LocationsScreen />,
    ...tabToScreenMap,
  },
  'wbk-staff-members': {
    'staff-members': <StaffMembersScreen />,
    ...tabToScreenMap,
  },
  "wbk-pricing-rules": {
    "pricing-rules": <PricingRulesScreen />,
    ...tabToScreenMap,
  },
  "wbk-email-templates": {
    "email-templates": <EmailTemplateScreen />,
    ...tabToScreenMap,
  },
  "wbk-coupons": {
    coupons: <CouponsScreen />,
    ...tabToScreenMap,
  },
  "wbk-connected-calendars": {
    "connected-calendars": <ConnectedCalendarsScreen />,
    ...tabToScreenMap,
  },
  "wbk-service-categories": {
    services: <ServicesScreen />,
    ...tabToScreenMap,
  },
  "wbk-appointments": {
    bookings: <BookingsScreen />,
    ...tabToScreenMap,
  },
  "wbk-calendar": {
    calendar: <CalendarScreen />,
    ...tabToScreenMap,
  },
  "wbk-canecelled-appointments": {
    "cancelled-bookings": <CanecelledBookingsScreen />,
    ...tabToScreenMap,
  },
  "wbk-dashboard": {
    dashboard: <Dashboard />,
    ...tabToScreenMap,
  },
  "wbk-settings": {
    settings: "settings",
    ...tabToScreenMap,
  },
  "wbk-form-builder": {
    "form-builder": <FormBuilderScreen />,
    ...tabToScreenMap,
  },
  "wbk-appearance": {
    appearance: <AppearanceEditorScreen />,
    ...tabToScreenMap,
  },
  "wbk-options": {
    options: <OptionsScreen />,
    ...tabToScreenMap,
  },
};

export const App = () => {
  const { page } = usePage();
  const [params] = useSearchParams();
  const isActivationPage = params.get('wbk-activation') === 'true'
  if (isActivationPage) {
    return <SetupWizard />;
  }
  const { settings } = useSelect(
    // @ts-ignore
    (select) => select(store_name).getPreset(),
    []
  );

  return (
    <SidebarProvider>
      <ConfirmationPopupProvider>
        <SettingsProvider settings={settings}>
          {!isActivationPage && <Header />}
          {!isActivationPage && <Router config={pageToRoutesMap[page]} />}
          {!isActivationPage && <Sidebar />}
          {!isActivationPage && <ConfirmationPopup />}
        </SettingsProvider>
      </ConfirmationPopupProvider>
    </SidebarProvider>
  );
};
