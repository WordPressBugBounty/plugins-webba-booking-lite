<?php
if (!defined('ABSPATH')) {
    exit();
}

if (get_option('wbk_show_go_preimum_1', '') == 'false') {
    return;
}
if (!wbk_fs()->is_free_plan()) {
    return;
}
if (isset($_GET['wbk-activation'])) {
    return;
}
?>
<div style="clear: both">
<a rel="noopener" style="border: none !important;outline: none !important;box-shadow: none !important;" target="_blank" href="https://webba-booking.com/pricing/?source=dash">
<img class="wbk_go_premium_banner" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
    '/public/images/go_premium_banner_1.png'; ?>" width="100%" >
</a>
<p><a class="wbk_not_inter_link"  style="margin-left:46px;" onclick="wbk_hide_admin_notice('wbk_show_go_preimum_1'); jQuery('.wbk_not_inter_link').remove(); jQuery('.wbk_go_premium_banner').remove(); ;return false;" href="#">Not interested</a></p>
</div>