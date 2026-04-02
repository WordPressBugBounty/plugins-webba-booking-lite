<?php
if (!defined("ABSPATH")) {
    exit();
}

// todo: remove $_GET param processings

$container_extra_class = "";
if (isset($_GET["wbk-activation"])) {
    $container_extra_class = " mail-block-wb-wizard ";
}

if (isset($_GET["test"])) {
    wbk_daily();
}
?>

<div class="main-curtain-wb" data-js="main-curtain-wb"></div>
<meta name="format-detection" content="telephone=no">
<div class="main-block-wb <?php echo $container_extra_class; ?>">
    <?php
    global $plugin_page;
    $db_prefix = get_option("wbk_db_prefix", "");
    switch ($plugin_page) {
        case "wbk-services":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-service-categories":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-email-templates":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-appointments":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-calendar":
            if (isset($_GET["tools"])) {
                WBK_Renderer::load_template("backend/backend_page_header", [
                    __("Schedule tools", "webba-booking-lite"),
                    true,
                ]); ?>
                <div style="padding:25px">
                    <?php WBK_Renderer::load_template(
                        "backend/schedule_tools_content",
                        [],
                        true,
                    ); ?>
                </div>
                <?php
            } else {
                WBK_Renderer::load_template("backend/react_app", [], true);
            }
            break;
        case "wbk-connected-calendars":
            if (isset($_GET["clid"]) && isset($_GET["action"]) && $_GET["action"] === "revoke") {
                $clid = absint($_GET["clid"]);
                if ($clid > 0) {
                    $connected_calendar = new WBK_Connected_Calendar($clid);
                    if ($connected_calendar->is_loaded()) {
                        $processor = WBK_Connected_Calendar_Processor::get_processor_for_calendar(
                            $connected_calendar,
                        );
                        if ($processor !== null) {
                            $processor->clear_access_token();
                        }
                    }
                    wp_redirect(admin_url("admin.php?page=wbk-connected-calendars"));
                    exit();
                }
            }
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-coupons":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-pricing-rules":
            if (!WBK_Feature_Gate::have_required_plan("standard", "only_old_users")) {
                WBK_Renderer::load_template("backend/plan_requirement", ["standard"], true);
            }
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;

        case "wbk-options":
            $services = WBK_Model_Utils::get_service_ids();
            if (isset($_GET['wbk-activation'])) {
                WBK_Renderer::load_template('backend/react_app', [], true);
            } else {
                WBK_Renderer::load_template("backend/react_app", [], true);
            }

            break;
        case "wbk-form-builder":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-appearance":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;
        case "wbk-dashboard":
            WBK_Renderer::load_template("backend/react_app", [], true);
            break;

        case "webba-google":
            // Redirect to the options page with Google Calendar settings tab
            wp_redirect(
                admin_url("admin.php?page=wbk-options&tab=wbk_gg_calendar_settings_section"),
            );
            exit();
            break;
        case 'wbk-locations':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;
        case 'wbk-staff-members':
            WBK_Renderer::load_template('backend/react_app', [], true);
            break;

        default:
            break;
    }
    WBK_Renderer::load_template("backend/go_premium_banner", [], true);
    ?>
</div>