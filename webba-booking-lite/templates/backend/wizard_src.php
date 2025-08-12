<?php
if (!defined('ABSPATH')) {
    exit();
} ?>
<?php WBK_Mixpanel::track_event('setup wizard launched', []); ?>

<style>
    h2:not(.block-heading-wb),
    #adminmenu,
    #adminmenuback,
    #wpadminbar {
        display: none !important;
    }

    #wpcontent,
    #wpfooter {
        margin-left: 0 !important;
        padding: 0 !important;
    }
</style>

<div class="main-block-wb mail-block-wb-wizard">
    <div class="main-part-wrapper-wb">
        <div class="header-main-wb">
            <a href="https://webba-booking.com/" target="_blank" rel="noopener" class="logo-main-wb">
                <img width="200" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/webba_booking_logo_hq.png" alt="webba booking">
            </a><!-- /.logo-main-wb -->
            <span class="vertical-line-wb"></span>
            <div class="page-title-wb">Setup Wizard</div>
        </div><!-- /.header-main-wb -->

        <div class="content-main-wb">
            <div class="setup-area-wb" data-step="1">
                <ul class="setup-steps-block-wb step-1-wb">
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                </ul><!-- /.setup-steps-block-wb -->

                <div class="setup-fields-wb">
                    <form>
                        <div class="wizard-tab-wb wizard-tab-active-wb">
                            <div class="container-small-wb">
                                <h2 class="block-heading-wb">
                                    <?php echo esc_html__(
                                        'Welcome to the Setup Wizard! Create your first service/event:',
                                        'webba-booking-lite'
                                    ); ?>
                                </h2>

                                <div class="field-block-wb">
                                    <div class="label-wb">
                                        <label for="service-name-wb">
                                            <?php echo esc_html__(
                                                'Service name',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                        <div class="help-popover-wb" data-js="help-popover-wb">
                                            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                                            <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                                                <?php echo esc_html__(
                                                    'Enter the name of your service/event/etc. here that will be displayed in the booking form seen by your customers',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </div>
                                        </div><!-- /.help-popover-wb -->
                                    </div><!-- /.label-wb -->
                                    <div class="field-wrapper-wb">
                                        <input type="text" class="wbk-input" name="service_name" 
                                            value="<?php echo esc_html__(
                                                'My first service',
                                                'webba-booking-lite'
                                            ); ?>" 
                                            data-validation="not_empty" id="service-name-wb">
                                    </div><!-- /.field-wrapper-wb -->
                                </div><!-- /.field-block-wb -->

                                <div class="field-block-wb">
                                    <div class="label-wb">
                                        <label for="duration-session-service-wb">
                                            <?php echo esc_html__(
                                                'What is the duration of one session for the service above (in minutes)?',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                        <div class="help-popover-wb" data-js="help-popover-wb">
                                            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                                            <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                                                <?php echo esc_html__(
                                                    'Enter duration of one session in minutes. 1 hour = 60 minutes.',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </div>
                                        </div><!-- /.help-popover-wb -->
                                    </div><!-- /.label-wb -->
                                    <div class="field-wrapper-wb">
                                        <input type="number" name="duration" id="duration-session-service-wb" 
                                            value="60" class="width-50-percent-wb wbk-input" data-validation="positive">
                                    </div><!-- /.field-wrapper-wb -->
                                </div><!-- /.field-block-wb -->

                                <div class="field-block-wb mb-40-wb">
                                    <div class="label-wb">
                                        <label>
                                            <?php echo esc_html__(
                                                'What are your business hours?',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                        <div class="help-popover-wb" data-js="help-popover-wb">
                                            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                                            <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                                                <?php echo esc_html__(
                                                    'Enter your operating hours here. Do not worry - you can change hours and dates in the settings page at any time.',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </div>
                                        </div>
                                    </div>
                                    <input type="text" id="slider-range-working-hours-time-wb" 
                                        value="9:00 AM - 6:00 PM" readonly 
                                        class="slider-range-working-hours-time-wb wbk-input">
                                    <div id="slider-range-working-hours-wb" class="slider-range-working-hours-wb"></div>
                                    <input type="hidden" value="540" name="range_start" class="range_start">
                                    <input type="hidden" value="1080" name="range_end" class="range_end">
                                </div><!-- /.field-block-wb -->

                                <div class="field-block-wb with-slidebox-wb wizard-field-holder-wb mb-40-wb">
                                    <?php
                                    $days = [
                                        1 => 'Mon',
                                        2 => 'Tue',
                                        3 => 'Wed',
                                        4 => 'Thu',
                                        5 => 'Fri',
                                        6 => 'Sat',
                                        7 => 'Sun',
                                    ];
                                    foreach ($days as $value => $day) {
                                        $checked =
                                            $value <= 5 ? 'checked' : ''; ?>
                                        <label class="checkbox-row-w one-row-w">
                                            <span class="checkbox-custom-w">
                                                <input type="checkbox" name="dow[]" value="<?php echo $value; ?>" <?php echo $checked; ?>>
                                                <span class="checkmark-w"></span>
                                            </span>
                                            <span class="checkbox-text-w">
                                                <span class="checkbox-title-w">
                                                    <?php echo esc_html__(
                                                        $day,
                                                        'webba-booking-lite'
                                                    ); ?>
                                                </span>
                                            </span>
                                        </label>
                                    <?php
                                    }
                                    ?>
                                </div>

                                <div class="field-block-wb with-slidebox-wb mb-40-wb">
                                    <div class="label-wb">
                                        <label for="more_services">
                                            <?php echo esc_html__(
                                                'I need more services',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                    </div><!-- /.label-wb -->
                                    <input class="slidebox-wb" type="checkbox" name="more_services" value="yes" id="more_services">
                                </div>

                                <p class="more_services_message_wb" style="position: relative;margin-bottom: 40px;display: none;">
                                    <?php echo esc_html__(
                                        'Great! You will be able to add additional services in the <strong>Services</strong> page after the Setup Wizard.',
                                        'webba-booking-lite'
                                    ); ?>
                                </p>
                            </div>
                        </div>

                        <div class="wizard-tab-wb">
                            <div class="container-small-wb">
                                <h2 class="block-heading-wb">
                                    <?php echo __(
                                        'Booking form settings',
                                        'webba-booking-lite'
                                    ); ?>
                                </h2>

                                <div class="radio-block-wb">
                                    <p class="radio-block-title-wb">
                                        <?php echo esc_html__(
                                            'Do you need to allow users book multiple time slots in one checkout?',
                                            'webba-booking-lite'
                                        ); ?>
                                    </p>
                                    <div class="radio-row-wb">
                                        <label class="custom-radiobutton-wbkb">
                                            <input type="radio" value="no" checked name="allow_multiple_slots">
                                            <span class="checkmark-wb"></span>
                                            <span class="radio-title-wb">
                                                <?php echo esc_html__(
                                                    'No, they need to choose only one time slot',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </span>
                                        </label>
                                    </div><!-- /.radio-row-wb -->
                                    <div class="radio-row-wb">
                                        <label class="custom-radiobutton-wbkb">
                                            <input type="radio" value="yes" name="allow_multiple_slots">
                                            <span class="checkmark-wb"></span>
                                            <span class="radio-title-wb">
                                                <?php echo esc_html__(
                                                    'Yes, allow selection of multiple time slots',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </span>
                                        </label>
                                    </div><!-- /.radio-row-wb -->
                                </div>

                                <div class="radio-block-wb">
                                    <p class="radio-block-title-wb">
                                        <?php echo esc_html__(
                                            'Can user book multiple services at a time?',
                                            'webba-booking-lite'
                                        ); ?>
                                    </p>
                                    <div class="radio-row-wb">
                                        <label class="custom-radiobutton-wbkb">
                                            <input type="radio" value="yes" class="allow_multiple_services" name="allow_multiple_services">
                                            <span class="checkmark-wb"></span>
                                            <span class="radio-title-wb">
                                                <?php echo esc_html__(
                                                    'Yes',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </span>
                                        </label>
                                    </div><!-- /.radio-row-wb -->
                                    <div class="radio-row-wb">
                                        <label class="custom-radiobutton-wbkb">
                                            <input type="radio" value="no" checked name="allow_multiple_services">
                                            <span class="checkmark-wb"></span>
                                            <span class="radio-title-wb">
                                                <?php echo esc_html__(
                                                    'No',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </span>
                                        </label>
                                    </div><!-- /.radio-row-wb -->
                                </div>

                                <div class="field-block-wb">
                                    <div class="label-wb">
                                        <label for="people-same-time-wb">
                                            <?php echo esc_html__(
                                                'How many people can book the same timeslot?',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                        <div class="help-popover-wb" data-js="help-popover-wb">
                                            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                                            <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                                                <?php echo esc_html__(
                                                    'You can change this in the service settings later.',
                                                    'webba-booking-lite'
                                                ); ?>
                                            </div>
                                        </div>
                                    </div><!-- /.label-wb -->
                                    <div class="field-wrapper-wb">
                                        <input type="number" min="1" max="100000" value="1" 
                                            id="people-same-time-wb" name="quantity" 
                                            class="wbk-input" data-validation="positive">
                                    </div><!-- /.field-wrapper-wb -->
                                </div>
                            </div>
                        </div>

                        <div class="wizard-tab-wb" data-request="wbk_wizard_initial_setup">
                            <div class="container-small-wb">
                                <h2 class="block-heading-wb">
                                    <?php echo esc_html__(
                                        'Congrats! You are all set!',
                                        'webba-booking-lite'
                                    ); ?>
                                </h2>
                                <p class="text-center-wb mb-10-wb">
                                    <?php echo esc_html__(
                                        'Add a "Webba Booking Form" block using WordPress Block Editor (Gutenberg).',
                                        'webba-booking-lite'
                                    ); ?>
                                </p>
                                <p class="text-center-wb mb-10-wb">
                                    <label for="shortcode-booking-form-wb">
                                        <?php echo esc_html__(
                                            'Or use a shortcode.',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </p>
                                <p class="text-center-wb mb-10-wb">
                                    <label for="shortcode-booking-form-wb">
                                        <?php echo esc_html__(
                                            'This is a shortcode for the booking form, place it in the page you want it to appear:',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </p>

                                <div class="field-block-wb fieldset-wb">
                                    <fieldset class="field-wrapper-wb" data-js="copy-fieldset-wb">
                                        <input type="text" id="shortcode-booking-form-wb" value="" 
                                            class="input-text-wb" data-js="copy-value-wb">
                                        <button type="button" class="inner-submit-wb" 
                                            onclick="wbk_copy_shortcode()" data-js="copy-button-wbkb">
                                            <span class="inner_copy_wb">Copy </span>
                                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/copy-icon.png" alt="copy">
                                        </button>
                                    </fieldset><!-- /.field-wrapper-wb -->
                                </div>

                                <p class="text-center-wb mb-40-wb">
                                    <label for="shortcode-booking-form-wb">
                                        <?php echo '<a style="color: #000;" target="_blank" rel="noopener" href="https://webba-booking.com/documentation/how-to-add-booking-form/">' .
                                            __(
                                                'How to add the booking from to my website?',
                                                'webba-booking-lite'
                                            ) .
                                            '</a>'; ?>
                                    </label>
                                </p>
                            </div>

                            <div class="container-big-wb">
                                <h3 class="block-subheading-wb">
                                    <?php echo __(
                                        'Here are some additional options you may want to consider:',
                                        'webba-booking-lite'
                                    ); ?>
                                </h3>
                            </div>

                            <div class="container-small-wb">
                                <div class="field-block-wb with-slidebox-wb">
                                    <div class="label-wb">
                                        <label for="enable-email-notification-wb">Enable email notification</label>
                                    </div><!-- /.label-wb -->
                                    <input class="slidebox-wb" type="checkbox" name="enable_emails" id="enable-email-notification-wb">
                                </div>

                                <div class="field-block-wb with-slidebox-wb">
                                    <div class="label-wb">
                                        <label for="enable-sms-notification-wb">
                                            Enable SMS notification <span class="pro-label-wb">PRO</span>
                                        </label>
                                    </div><!-- /.label-wb -->
                                    <input class="slidebox-wb" type="checkbox" name="enable_sms" id="enable-sms-notification-wb">
                                </div>

                                <div class="field-block-wb with-slidebox-wb">
                                    <div class="label-wb">
                                        <label for="enable-online-payments-wb">
                                            Enable online payments <span class="pro-label-wb">PRO</span>
                                        </label>
                                    </div><!-- /.label-wb -->
                                    <input class="slidebox-wb" type="checkbox" name="enable_payments" id="enable-online-payments-wb">
                                </div>

                                <div class="field-block-wb with-slidebox-wb">
                                    <div class="label-wb">
                                        <label for="integrate-google-calendar-wb">
                                            Integrate with Google Calendar <span class="pro-label-wb">PRO</span>
                                        </label>
                                    </div><!-- /.label-wb -->
                                    <input class="slidebox-wb" type="checkbox" name="enable_google" id="integrate-google-calendar-wb">
                                </div>
                            </div>
                        </div>

                        <div class="container-medium-wb">
                            <div class="buttons-block-wb">
                                <a href="https://www.youtube.com/watch?v=dZF0jve7jxE" rel="noopener" target="_blank" 
                                    class="button-wbkb button-light-wb wbk_wizard_youtube_link">
                                    <?php echo esc_html__(
                                        'Watch getting started video',
                                        'webba-booking-lite'
                                    ); ?>
                                </a>
                                <button class="button-wbkb button-light-wb button-prev-wbk wbk_hidden">
                                    <?php echo esc_html__(
                                        'Previous',
                                        'webba-booking-lite'
                                    ); ?>
                                </button>
                                <button class="button-wbkb button-next-wbk" disabled>
                                    <?php echo esc_html__(
                                        'Next',
                                        'webba-booking-lite'
                                    ); ?>
                                    <span class="btn-ring-wbk"></span>
                                </button>
                            </div><!-- /.buttons-block-wb -->
                        </div>

                        <div class="skip-link-wrapper-wb">
                            <a href="<?php echo get_admin_url(); ?>">
                                <?php echo esc_html__(
                                    'Skip the setup wizard',
                                    'webba-booking-lite'
                                ); ?>
                            </a>
                        </div>
                    </form>
                </div>
            </div><!-- /.setup-area-wb -->
        </div><!-- /.content-main-wb -->
    </div><!-- /.main-part-wrapper-wb -->
</div>