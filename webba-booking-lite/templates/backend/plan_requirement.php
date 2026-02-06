<?php
if (!defined('ABSPATH')) {
    exit();
}

$required_plan = $data[0];

if (empty($required_plan)) {
    return;
}
?>

<div class="plan-requirement-wb">
    <a href="<?php echo esc_url(
        admin_url('admin.php?page=wbk-main-pricing')
    ); ?>" class="plan-requirement-upgrade-buton-wb">
        <span>
            <?php echo esc_html(WBK_Feature_Gate::get_plan_limit_message($required_plan)); ?>
        </span>
        <img class="plan-requirement-icon" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/icon-lock.png" />
        <img class="plan-requirement-icon-hover" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/icon-lock-open.png" />
    </a>
</div>

