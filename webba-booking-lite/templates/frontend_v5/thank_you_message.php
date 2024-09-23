<?php
if (!defined('ABSPATH'))
    exit;

$prev_time_zone = date_default_timezone_get();
date_default_timezone_set(get_option('wbk_timezone', 'UTC'));

$booking_ids = $data[0];
$thanks_message = trim(get_option('wbk_book_thanks_message', ''));
if ($thanks_message != '') {
    if (get_option('wbk_multi_booking') != 'enabled' && count($booking_ids) > 0) {
        $thanks_message = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_book_thanks_message', ''), $booking_ids[0]);
    } else {
        $thanks_message = WBK_Placeholder_Processor::process_placeholders(get_option('wbk_book_thanks_message', ''), $booking_ids);
    }
    ?>
    <div class="thank-you-block-w">
        <div class="thank-you-content-w">
            <?php echo stripslashes($thanks_message); ?>
        </div>
    </div>
    <?php
    date_default_timezone_set($prev_time_zone);
    return;
}


$time_format = WBK_Format_Utils::get_time_format();
$date_format = WBK_Format_Utils::get_date_format();

$payment_details = WBK_Price_Processor::get_payment_items_post_booked($booking_ids);


?>

<div class="thank-you-block-w">
    <div class="thank-you-content-w">
        <div class="image-wrapper-w">
            <img class="wb-thank-you-image"
                src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/thank_you.gif' ?>" alt="thank you">
        </div><!-- /.image-wrapper-w -->
        <h2 class="thank-you-title-w"><?php echo __('Thank you for your booking!', 'webba-booking-lite'); ?> </h2>
        <div class="thank-you-mobile-w">

            <?php
            if (get_option('wbk_email_customer_book_status') == 'true' || get_option('wbk_email_customer_paymentrcvd_status') == 'true') {
                ?>
                <div class="thank-you-subtitle-mobile-w">
                    <?php echo __('Booking confirmation<br>  has been sent to your email address.', 'webba-booking-lite'); ?>
                </div>
                <?php
            }
            ?>
        </div>
        <?php
        foreach ($booking_ids as $booking_id) {
            $booking = new WBK_Booking($booking_id);
            if (!$booking->is_loaded()) {
                continue;
            }
            $service = new WBK_Service($booking->get_service());
            if (!$service->is_loaded()) {
                continue;
            }
            ?>
            <ul class="thank-you-list-w">
                <li>
                    <span class="list-icon-w">
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/star-icon.png' ?>" alt="star">
                    </span>
                    <?php echo esc_html($service->get_name()) ?>
                </li>
                <li>
                    <span class="list-icon-w">
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/clock-black-icon.png' ?>"
                            alt="star">
                    </span>
                    <?php echo wp_date($time_format, $booking->get_start(), new DateTimeZone(date_default_timezone_get())); ?>
                </li>
                <li>
                    <span class="list-icon-w">
                        <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/calendar-icon.png' ?>"
                            alt="star">
                    </span>
                    <?php echo wp_date($date_format, $booking->get_start(), new DateTimeZone(date_default_timezone_get())); ?>
                </li>
            </ul>
            <?php


        }

        if ($payment_details['total'] > 0) {
            ?>
            <ul class="thank-you-list-w">
                <li>
                    <span class="list-icon-w"><img
                            src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/dollar-icon.png' ?>"
                            alt="$"></span>
                    <?php echo __('Total amount:', 'webba-booking-lite') . ' ' . WBK_Format_Utils::format_price($payment_details['total']); ?>
                </li>
            </ul>
            <?php
        }
        ?>

        <?php
        if (get_option('wbk_email_customer_book_status', '') == 'true' || get_option('wbk_email_customer_paymentrcvd_status', 'true') == 'true') {
            ?>
            <p class="text-sent-w">
                <b><?php echo __('Booking confirmation  has been sent to your email address.', 'webba-booking-lite') ?></b>
            </p>
            <?php
        }

        ?>
    </div>
</div>
<?php
date_default_timezone_set($prev_time_zone);

?>