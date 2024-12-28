<?php
if (!defined('ABSPATH'))
    exit;
$title = $data[0];
$class = '';
if (isset($data[1]) && $data[1] == true) {
    $class = 'wb_backend_header_margin';
}
$url = '';
if (isset($data[2])) {
    $url = $data[2];
}

?>

<div class="header-main-wb <?php echo $class; ?>">
    <a href="https://webba-booking.com/" rel="noopener" target="_blank" class="logo-main-wb">
        <img width="250" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL ?>/public/images/webba_booking_logo_hq.png"
            alt="webba booking">
    </a>

    <span class="vertical-line-wb"></span>

    <div class="page-title-wb"><?php echo $title; ?>
        <?php
        if ($url != '') {
            ?>
            <a href="<?php echo esc_url($url); ?>" rel="noopener" target="_blank" class="wbk_question_sign"></a>
            <?php
        }
        ?>
    </div>
    <nav class="main-menu-wb">
        <a
            href="<?php echo get_admin_url(); ?>admin.php?page=wbk-dashboard"><?php echo esc_html__('Dashboard', 'webba-booking-lite'); ?></a>
        <a
            href="<?php echo get_admin_url(); ?>admin.php?page=wbk-appointments"><?php echo esc_html__('Bookings', 'webba-booking-lite'); ?></a>
        <a
            href="<?php echo get_admin_url(); ?>admin.php?page=wbk-services"><?php echo esc_html__('Services', 'webba-booking-lite'); ?></a>
        <a
            href="<?php echo get_admin_url(); ?>admin.php?page=wbk-schedule"><?php echo esc_html__('Calendar', 'webba-booking-lite'); ?></a>
        <a
            href="<?php echo get_admin_url(); ?>admin.php?page=wbk-options"><?php echo esc_html__('Settings', 'webba-booking-lite'); ?></a>
    </nav>

</div>