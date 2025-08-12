<?php
if (!defined('ABSPATH')) {
    exit();
} ?>
<?php WBK_Mixpanel::track_event('setup wizard launched', []); ?>

<div class="main-block-wb mail-block-wb-wizard">
    <div class="main-part-wrapper-wb">
        <div class="header-main-wb">
            <div class="header-title-wrapper">
                <a href="https://webba-booking.com/" target="_blank" rel="noopener" class="logo-main-wb">
                    <img width="200" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/webba-icon.svg" alt="webba booking">
                </a>
                <div class="page-subtitle-wb"><?php echo esc_html__(
                    'Setup Wizard',
                    'webba-booking-lite'
                ); ?></div>
            </div>
            <div class="page-title-wb page-title-current"><?php echo esc_html__(
                'Welcome',
                'webba-booking-lite'
            ); ?></div>
        </div>
        <div class="progress-wrapper">
            <!-- Progress Bar -->
            <ul class="setup-steps-block-wb step-1-wb">
                <li>1</li>
                <li>2</li>
                <li>3</li>
                <li>4</li>
                <?php if (wbk_fs()->is_free_plan()): ?>
                <li>5</li>
                <?php endif; ?>
            </ul>
        </div>
        <div class="content-main-wb" data-step="1">
            <form class="setup-area-wb setup-fields-wb">
                <!-- Step 1 (Welcome Screen) -->
                <div class="wizard-tab-wb welcome-screen-wrapper-wb  wizard-tab-active-wb"
                    data-title="<?php _e('Welcome', 'webba-booking-lite'); ?>">
                    <div class="inner-wrapper-wb plain-panel">
                        <div class="setup-welcome-wb">
                            <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/logo-main.svg" alt="logo main">
                            <h1 class="welcome-title-wb"><?php echo esc_html__(
                                'Welcome to Webba Booking!',
                                'webba-booking-lite'
                            ); ?></h1>
                            <p class="welcome-description-wb"><?php echo esc_html__(
                                'Use our Setup Wizard to be ready to take bookings in minutes.',
                                'webba-booking-lite'
                            ); ?></p>
                        </div>
                        <div class="wizard-welcome-buttons">
                            <button class="button-wbkb-wizard primary button-next-wbk"
                                data-launch-text="<?php echo esc_attr__(
                                    'Launch wizard',
                                    'webba-booking-lite'
                                ); ?>" data-next-text="<?php echo esc_attr__(
    'Next',
    'webba-booking-lite'
); ?>">
                                <?php echo esc_html__(
                                    'Launch wizard',
                                    'webba-booking-lite'
                                ); ?>
                                <span class="btn-ring-wbk"></span>
                            </button>
                            <div class="skip-link-wrapper-wb">
                                <a href="<?php echo get_admin_url() .
                                    'admin.php?page=wbk-dashboard&tab=dashboard'; ?>">
                                    <?php echo esc_html__(
                                        "Skip wizard, I'll configure later",
                                        'webba-booking-lite'
                                    ); ?>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 2 (General Information) -->
                <div class="wizard-tab-wb" data-title="<?php _e(
                    'Step 1 / Business Info',
                    'webba-booking-lite'
                ); ?>">
                    <div class="container-small-wb">    
                        <h2 class="block-heading-wb">
                            <?php echo esc_html__(
                                'General information',
                                'webba-booking-lite'
                            ); ?>
                        </h2>

                        <div class="fields-wrapper-wb">
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="notification-email-wb">
                                        <?php echo esc_html__(
                                            'Main notifications email',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb">
                                    <input type="email" name="email" id="notification-email-wb" class="wbk-input"
                                        data-validation="email" value="info@webba-booking.com">
                                    <span class="field-description-wb">
                                        <?php echo esc_html__(
                                            'We\'ll send booking alerts and notifications here',
                                            'webba-booking-lite'
                                        ); ?>
                                    </span>
                                </div>
                            </div>

                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="timezone-wb">
                                        <?php echo esc_html__(
                                            'Time-zone',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb">
                                    <select name="timezone" id="timezone-wb" class="wbk-input"
                                        data-validation="must_have_items">
                                        <?php
                                        $timezones = timezone_identifiers_list();
                                        foreach ($timezones as $timezone) {
                                            echo '<option value="' .
                                                esc_attr($timezone) .
                                                '">' .
                                                esc_html($timezone) .
                                                '</option>';
                                        }
                                        ?>
                                    </select>
                                    <span class="field-description-wb">
                                        <?php echo esc_html__(
                                            'All booking times will be shown in this timezone',
                                            'webba-booking-lite'
                                        ); ?>
                                    </span>
                                </div>
                            </div>

                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="currency-wb">
                                        <?php echo esc_html__(
                                            'Currency',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb">
                                    <select name="currency" id="currency-wb" class="wbk-input"
                                        data-validation="must_have_items">
                                        <option value="EUR"><?php echo esc_html__(
                                            'EUR - Euro',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="USD"><?php echo esc_html__(
                                            'USD - U.S. Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="AED"><?php echo esc_html__(
                                            'AED - United Arab Emirates Dirham',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="AUD"><?php echo esc_html__(
                                            'AUD - Australian Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="BGN"><?php echo esc_html__(
                                            'BGN - Bulgarian Lev',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="BRL"><?php echo esc_html__(
                                            'BRL - Brazilian Real',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="CAD"><?php echo esc_html__(
                                            'CAD - Canadian Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="CHF"><?php echo esc_html__(
                                            'CHF - Swiss Franc',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="CNY"><?php echo esc_html__(
                                            'CNY - Chinese Yuan',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="CZK"><?php echo esc_html__(
                                            'CZK - Czech Koruna',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="DKK"><?php echo esc_html__(
                                            'DKK - Danish Krone',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="GBP"><?php echo esc_html__(
                                            'GBP - British Pound',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="HKD"><?php echo esc_html__(
                                            'HKD - Hong Kong Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="HRK"><?php echo esc_html__(
                                            'HRK - Croatian Kuna',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="HUF"><?php echo esc_html__(
                                            'HUF - Hungarian Forint',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="IDR"><?php echo esc_html__(
                                            'IDR - Indonesian Rupiah',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="ILS"><?php echo esc_html__(
                                            'ILS - Israeli New Shekel',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="INR"><?php echo esc_html__(
                                            'INR - Indian Rupee',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="ISK"><?php echo esc_html__(
                                            'ISK - Icelandic Króna',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="JPY"><?php echo esc_html__(
                                            'JPY - Japanese Yen',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="KRW"><?php echo esc_html__(
                                            'KRW - South Korean Won',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="MXN"><?php echo esc_html__(
                                            'MXN - Mexican Peso',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="MYR"><?php echo esc_html__(
                                            'MYR - Malaysian Ringgit',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="NOK"><?php echo esc_html__(
                                            'NOK - Norwegian Krone',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="NZD"><?php echo esc_html__(
                                            'NZD - New Zealand Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="PHP"><?php echo esc_html__(
                                            'PHP - Philippine Peso',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="PLN"><?php echo esc_html__(
                                            'PLN - Polish Złoty',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="RON"><?php echo esc_html__(
                                            'RON - Romanian Leu',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="RUB"><?php echo esc_html__(
                                            'RUB - Russian Ruble',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="SEK"><?php echo esc_html__(
                                            'SEK - Swedish Krona',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="SGD"><?php echo esc_html__(
                                            'SGD - Singapore Dollar',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="THB"><?php echo esc_html__(
                                            'THB - Thai Baht',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="TRY"><?php echo esc_html__(
                                            'TRY - Turkish Lira',
                                            'webba-booking-lite'
                                        ); ?></option>
                                        <option value="ZAR"><?php echo esc_html__(
                                            'ZAR - South African Rand',
                                            'webba-booking-lite'
                                        ); ?></option>
                                    </select>
                                    <span class="field-description-wb">
                                        <?php echo esc_html__(
                                            'Used for services pricing. You will be able to set the currency symbol location (before or after) in General Settings',
                                            'webba-booking-lite'
                                        ); ?>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 3 (Service Setup) -->
                <div class="wizard-tab-wb" data-title="<?php _e(
                    'Step 2 / First Service',
                    'webba-booking-lite'
                ); ?>">
                    <div class="container-small-wb">
                        <h2 class="block-heading-wb">
                            <?php echo esc_html__(
                                'Setup your first service',
                                'webba-booking-lite'
                            ); ?>
                        </h2>

                        <div class="fields-wrapper-wb">
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="service-name-wb">
                                        <?php echo esc_html__(
                                            'Service name',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div><!-- /.label-wb -->
                                <div class="field-wrapper-wb">
                                    <input type="text" class="wbk-input" name="service_name"
                                        placeholder="<?php echo esc_attr__(
                                            'Enter service name',
                                            'webba-booking-lite'
                                        ); ?>" data-validation="not_empty"
                                        id="service-name-wb" value="<?php echo esc_attr__(
                                            'Consultation',
                                            'webba-booking-lite'
                                        ); ?>">
                                </div><!-- /.field-wrapper-wb -->
                            </div><!-- /.field-block-wb -->

                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="service-description-wb">
                                        <?php echo esc_html__(
                                            'Description',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div><!-- /.label-wb -->
                                <div class="field-wrapper-wb">
                                    <textarea class="wbk-input" name="service_description" id="service-description-wb"
                                        placeholder="<?php echo esc_attr__(
                                            'Enter service description',
                                            'webba-booking-lite'
                                        ); ?>" rows="4"><?php echo esc_html__(
    'Initial consultation session',
    'webba-booking-lite'
); ?></textarea>
                                </div><!-- /.field-wrapper-wb -->
                            </div><!-- /.field-block-wb -->

                            <div class="field-block-wb two-fields-row-wb">
                                <div class="field-half-wb">
                                    <div class="label-wb">
                                        <label for="service-price-wb">
                                            <?php echo esc_html__(
                                                'Price',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                    </div>
                                    <div class="field-wrapper-wb price-field-wrapper-wb">
                                        <span class="currency-symbol">$</span>
                                        <input type="text" class="wbk-input" name="service_price"
                                            placeholder="<?php echo esc_attr__(
                                                'Enter price',
                                                'webba-booking-lite'
                                            ); ?>" data-validation="positive"
                                            id="service-price-wb" inputmode="decimal" pattern="[0-9]*[.]?[0-9]{0,2}"
                                            title="Please enter a valid price (up to 2 decimal places)"
                                            value="50">
                                    </div>
                                </div>
                                <div class="field-half-wb">
                                    <div class="label-wb">
                                        <label for="service-duration-wb">
                                            <?php echo esc_html__(
                                                'Duration',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                    </div>
                                    <div class="field-wrapper-wb duration-field-wrapper-wb">
                                        <input type="text" class="wbk-input" name="service_duration"
                                            placeholder="<?php echo esc_attr__(
                                                'Enter duration',
                                                'webba-booking-lite'
                                            ); ?>" data-validation="positive"
                                            id="service-duration-wb" inputmode="numeric" pattern="[0-9]*"
                                            title="Please enter a whole number" value="60">
                                        <span class="minutes-label"><?php echo esc_html__(
                                            'minutes',
                                            'webba-booking-lite'
                                        ); ?></span>
                                    </div>
                                </div>
                            </div>

                            <!-- Timeslot intervals -->
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="service-interval-wb">
                                        <?php echo esc_html__(
                                            'What are timeslot intervals you\'d like show for your customers',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb duration-field-wrapper-wb">
                                    <input type="text" class="wbk-input" name="service_interval"
                                        placeholder="<?php echo esc_attr__(
                                            'Enter interval',
                                            'webba-booking-lite'
                                        ); ?>" data-validation="positive"
                                        id="service-interval-wb" inputmode="numeric" pattern="[0-9]*"
                                        title="Please enter a whole number" value="30">
                                    <span class="minutes-label"><?php echo esc_html__(
                                        'minutes',
                                        'webba-booking-lite'
                                    ); ?></span>
                                </div>
                                <span class="field-description-wb">
                                    <?php echo esc_html__(
                                        'For example, every 30 minutes means customers can book at 9:00, 9:30, 10:00, etc.',
                                        'webba-booking-lite'
                                    ); ?>
                                </span>
                            </div>

                            <!-- Buffer time -->
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="service-buffer-wb">
                                        <?php echo esc_html__(
                                            'Break time between appointments (buffer time)',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb duration-field-wrapper-wb">
                                    <input type="text" class="wbk-input" name="service_buffer"
                                        placeholder="<?php echo esc_attr__(
                                            'Enter buffer time',
                                            'webba-booking-lite'
                                        ); ?>" data-validation="positive"
                                        id="service-buffer-wb" inputmode="numeric" pattern="[0-9]*"
                                        title="Please enter a whole number" value="15">
                                    <span class="minutes-label"><?php echo esc_html__(
                                        'minutes',
                                        'webba-booking-lite'
                                    ); ?></span>
                                </div>
                                <span class="field-description-wb">
                                    <?php echo esc_html__(
                                        'Time between appointments to prepare, clean up, or have a quick break.',
                                        'webba-booking-lite'
                                    ); ?>
                                </span>
                            </div>

                            <!-- Advance booking time -->
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="service-advance-wb">
                                        <?php echo esc_html__(
                                            'How far in advance customers must book',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                                <div class="field-wrapper-wb duration-field-wrapper-wb">
                                    <input type="text" class="wbk-input" name="service_advance"
                                        placeholder="<?php echo esc_attr__(
                                            'Enter advance time',
                                            'webba-booking-lite'
                                        ); ?>" data-validation="positive"
                                        id="service-advance-wb" inputmode="numeric" pattern="[0-9]*"
                                        title="Please enter a whole number" value="120">
                                    <span class="minutes-label"><?php echo esc_html__(
                                        'minutes',
                                        'webba-booking-lite'
                                    ); ?></span>
                                </div>
                                <span class="field-description-wb">
                                    <?php echo esc_html__(
                                        'Prevents last-minute bookings. 120 minutes means customers can\'t book within 2 hours of the appointment. Put 1440 for 24-hour preparation time.',
                                        'webba-booking-lite'
                                    ); ?>
                                </span>
                            </div>

                            <!-- Min/Max people -->
                            <div class="field-block-wb two-fields-row-wb">
                                <div class="field-half-wb">
                                    <div class="label-wb">
                                        <label for="service-min-people-wb">
                                            <?php echo esc_html__(
                                                'Min people for same slot',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                    </div>
                                    <div class="field-wrapper-wb">
                                        <input type="text" class="wbk-input" name="service_min_people"
                                            placeholder="<?php echo esc_attr__(
                                                'Enter minimum',
                                                'webba-booking-lite'
                                            ); ?>" data-validation="positive"
                                            id="service-min-people-wb" inputmode="numeric" pattern="[0-9]*"
                                            title="Please enter a whole number" value="1">
                                    </div>
                                </div>
                                <div class="field-half-wb">
                                    <div class="label-wb">
                                        <label for="service-max-people-wb">
                                            <?php echo esc_html__(
                                                'Max people for same slot',
                                                'webba-booking-lite'
                                            ); ?>
                                        </label>
                                    </div>
                                    <div class="field-wrapper-wb">
                                        <input type="text" class="wbk-input" name="service_max_people"
                                            placeholder="<?php echo esc_attr__(
                                                'Enter maximum',
                                                'webba-booking-lite'
                                            ); ?>" data-validation="positive"
                                            id="service-max-people-wb" inputmode="numeric" pattern="[0-9]*"
                                            title="Please enter a whole number" value="1">
                                    </div>
                                </div>
                            </div>

                            <!-- Info block -->
                            <div class="field-block-wb info-block-wb">
                                <div class="info-message-wb">
                                    <?php echo esc_html__(
                                        'Additional service settings like buffer times, custom fields, and payment options are available in the Services page. You can also add more services and organize them into categories there.',
                                        'webba-booking-lite'
                                    ); ?>
                                </div>
                            </div>

                            <p class="more_services_message_wb"
                                style="position: relative;margin-bottom: 40px;display: none;">
                                <?php echo esc_html__(
                                    'Great! You will be able to add additional services in the <strong>Services</strong> page after the Setup Wizard.',
                                    'webba-booking-lite'
                                ); ?>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Step 4 (Business Hours) -->
                <div class="wizard-tab-wb" data-title="<?php _e(
                    'Step 3 / Availability',
                    'webba-booking-lite'
                ); ?>">
                    <div class="container-small-wb">
                        <h2 class="block-heading-wb">
                            <?php echo esc_html__(
                                'General availability',
                                'webba-booking-lite'
                            ); ?>
                        </h2>
                        <p class="intro-text-wb">
                            <?php echo esc_html__(
                                'Set your general working hours. You\'ll be able to lock/unlock specific time slots in the schedule tools and connect to your calendar (PRO feature) to manage availability automatically.',
                                'webba-booking-lite'
                            ); ?>
                        </p>

                        <div class="fields-wrapper-wb">
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
                                <span class="field-description-wb">
                                    <?php echo esc_html__(
                                        'You will be able to adjust and add additional intervals for different weekdays in the Service settings.',
                                        'webba-booking-lite'
                                    ); ?>
                                </span>
                                <input type="text" id="slider-range-working-hours-time-wb"
                                    value="<?php echo esc_attr__(
                                        '9:00 AM - 6:00 PM',
                                        'webba-booking-lite'
                                    ); ?>" readonly
                                    class="slider-range-working-hours-time-wb wbk-input">
                                <div id="slider-range-working-hours-wb" class="slider-range-working-hours-wb">
                                </div>

                                <input type="hidden" value="540" name="range_start" class="range_start">
                                <input type="hidden" value="1080" name="range_end" class="range_end">
                            </div>

                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label>
                                        <?php echo esc_html__(
                                            'Which days are you open?',
                                            'webba-booking-lite'
                                        ); ?>
                                    </label>
                                </div>
                            </div>

                            <div class="field-block-wb with-slidebox-wb wizard-field-holder-wb mb-40-wb">
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="1" checked="">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Mon',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="2" checked="">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Tue',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="3" checked="">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Wed',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="4" checked="">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Thu',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="5" checked="">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Fri',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="6">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Sat',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                                <label class="checkbox-row-w one-row-w">
                                    <span class="checkbox-custom-w">
                                        <input type="checkbox" name="dow[]" value="7">
                                        <span class="checkmark-w"></span>
                                    </span>
                                    <span class="checkbox-text-w">
                                        <span class="checkbox-title-w">
                                            <?php echo esc_html__(
                                                'Sun',
                                                'webba-booking-lite'
                                            ); ?>
                                        </span>
                                    </span>
                                </label>
                            </div>

                            <!-- Closed Dates Section -->
                            <div class="field-block-wb">
                                <h3 class="block-subheading-wb">
                                    <?php echo esc_html__(
                                        'Closed Dates / Holidays',
                                        'webba-booking-lite'
                                    ); ?>
                                </h3>
                                <p class="description-text-wb">
                                    <?php echo esc_html__(
                                        'Add specific dates when you\'re unavailable',
                                        'webba-booking-lite'
                                    ); ?>
                                </p>

                                <div class="date-ranges-container-wb">
                                    <div class="date-range-repeater-wb">
                                        <!-- Template for date range -->
                                        <div class="date-range-row-wb" data-row="0">
                                            <div class="date-inputs-wb">
                                                <input type="text" class="wbk-input date-start"
                                                    placeholder="Start date">
                                                <span class="date-separator">-</span>
                                                <input type="text" class="wbk-input date-end"
                                                    placeholder="End date">
                                            </div>
                                            <button type="button" class="remove-date-range-wb"
                                                title="Remove">×</button>
                                        </div>
                                    </div>
                                    <button type="button" class="add-date-range-wb button-light-wb">
                                        <?php echo esc_html__(
                                            'Add Date Range',
                                            'webba-booking-lite'
                                        ); ?>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Step 5 (Free Version Info) -->
                <?php if (wbk_fs()->is_free_plan()): ?>
                <div class="wizard-tab-wb" data-title="<?php _e(
                    'Step 4 / Payments, SMS & Calendar',
                    'webba-booking-lite'
                ); ?>">
                    <div class="pro-features-wrapper-wb">
                        <!-- Pro Banner -->
                        <div class="pro-banner-wb">
                            <div class="pro-banner-text-wb">
                                <?php echo esc_html__(
                                    'Upgrade to Webba Booking PRO to unlock premium features.',
                                    'webba-booking-lite'
                                ); ?>
                            </div>
                            <a href="<?php echo esc_url(
                                'https://webba-booking.com/pricing/'
                            ); ?>" target="_blank" class="button-wbkb-wizard tertiary">
                                <?php echo esc_html__(
                                    'Upgrade to Webba PRO',
                                    'webba-booking-lite'
                                ); ?>
                            </a>
                        </div>

                        <!-- First Row of Features -->
                        <div class="pro-features-grid-wb">
                            <!-- Feature 1 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb payment-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-online-payments.svg"
                                            alt="Payments Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'Online Payments',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Enable online payments to collect fees at booking time.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'Stripe & PayPal',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'Multiple methods',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>

                            <!-- Feature 2 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb form-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-custom-fields.svg"
                                            alt="Form Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'Custom Form Fields',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Create custom booking form fields and layouts.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'Custom fields',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'Form builder',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>

                            <!-- Feature 3 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb calendar-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-google-calendar.svg"
                                            alt="Calendar Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'Calendar Sync',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Sync appointments with Google Calendar.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'Two-way sync',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'Auto updates',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>

                            <!-- Feature 4 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb sms-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-sms.svg"
                                            alt="SMS Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'SMS Reminders',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Send automated SMS reminders to reduce no-shows.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'Auto reminders',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'Reduce no-shows',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>

                            <!-- Feature 5 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb zoom-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-zoom.svg"
                                            alt="Zoom Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'Zoom Integration',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Auto-attach Zoom meeting links to bookings.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'Auto meetings',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'Seamless setup',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>

                            <!-- Feature 6 -->
                            <div class="pro-feature-card-wb">
                                <div class="pro-features-heading-wb">
                                    <div class="feature-icon-wb pdf-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-pdf.svg"
                                            alt="PDF Icon">
                                    </div>
                                    <h3 class="pro-feature-title-wb"><?php echo esc_html__(
                                        'PDF & iCal',
                                        'webba-booking-lite'
                                    ); ?></h3>
                                    <div class="lock-icon-wb">
                                        <img src="<?php echo esc_url(
                                            WP_WEBBA_BOOKING__PLUGIN_URL
                                        ); ?>/public/images/icon-pro-locked.svg"
                                            alt="Lock Icon">
                                    </div>
                                </div>
                                <p class="pro-feature-description-wb"><?php echo esc_html__(
                                    'Generate PDFs and iCal attachments for bookings.',
                                    'webba-booking-lite'
                                ); ?></p>
                                <ul class="pro-feature-list-wb">
                                    <li><?php echo esc_html__(
                                        'PDF confirmations',
                                        'webba-booking-lite'
                                    ); ?></li>
                                    <li><?php echo esc_html__(
                                        'iCal attachments',
                                        'webba-booking-lite'
                                    ); ?></li>
                                </ul>

                            </div>
                        </div>

                        <!-- Footer with more features link and upgrade button -->
                        <div class="pro-features-footer-wb">
                            <a href="https://webba-booking.com/features/" target="_blank"
                                class="more-features-link-wb">
                                <?php echo esc_html__(
                                    'And many other PRO features!',
                                    'webba-booking-lite'
                                ); ?>
                            </a>
                            <a href="<?php echo esc_url(
                                'https://webba-booking.com/pricing/'
                            ); ?>" target="_blank" class="button-wbkb-wizard tertiary">
                                <?php echo esc_html__(
                                    'Upgrade to Webba PRO',
                                    'webba-booking-lite'
                                ); ?>
                            </a>
                        </div>
                    </div>
                </div>
                <?php endif; ?>

                <!-- Step 6 (Final) -->
                <div class="wizard-tab-wb" data-request="wbk_wizard_initial_setup"
                    data-title="<?php _e('Summary', 'webba-booking-lite'); ?>">
                    <div class="container-small-wb wizard-success-container-wb">
                        <div class="setup-welcome-wb wizard-success-top">
                            <div class="wizard-success-icon-wrapper-wb">
                                <img src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL; ?>/public/images/icon-check-nobg.svg" alt="success"
                                    class="welcome-logo-wb">
                            </div>
                            <h1 class="welcome-title-wb"><?php echo esc_html__(
                                'Great!',
                                'webba-booking-lite'
                            ); ?></h1>
                            <h2 class="welcome-title-wb"><?php echo esc_html__(
                                'Now add the booking form to your website',
                                'webba-booking-lite'
                            ); ?></h2>
                            <p class="welcome-description-wb"><?php echo esc_html__(
                                'Your initial setup is configured and ready to go. Just embed the form below on your website.',
                                'webba-booking-lite'
                            ); ?></p>
                        </div>
                        <div class="wizard-panel-highlight-wb">
                            <h3 class="block-subheading-wb text-center-wb"><?php echo esc_html__(
                                'Embed your booking form',
                                'webba-booking-lite'
                            ); ?></h3>
                            <div class="field-block-wb">
                                <div class="field-wrapper-wb">
                                    <input type="text" class="wbk-input wbk-input-shortcode"
                                        value="[webba_booking]" readonly>
                                    <!-- <button type="button" class="copy-button-wb" onclick="wbk_copy_shortcode()">
                                        <img src="<?php
//echo WP_WEBBA_BOOKING__PLUGIN_URL;
?>/public/images/icon-clipboard.svg"
                                            alt="copy">
                                    </button> -->
                                </div>
                                <p class="field-description-wb text-center-wb">
                                    <?php echo esc_html__(
                                        'Paste this shortcode into any Page or Post where you want the form to appear.',
                                        'webba-booking-lite'
                                    ); ?>
                                </p>
                                <p class="field-description-wb text-center-wb">
                                    <a href="https://webba-booking.com/documentation/how-to-add-booking-form/"
                                        target="_blank" class="how-to-link-wb">
                                        <?php echo esc_html__(
                                            'How to add Webba Booking form',
                                            'webba-booking-lite'
                                        ); ?>
                                    </a>
                                </p>
                            </div>
                        </div>
                        <a href="<?php echo get_admin_url() .
                            'admin.php?page=wbk-dashboard&tab=dashboard'; ?>" class="button-wbkb-wizard primary close-setup-wb">
                            <?php echo esc_html__(
                                'Close Setup Wizard',
                                'webba-booking-lite'
                            ); ?>
                        </a>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="container-medium-wb navigation-wrapper">
                    <div class="buttons-block-wb">
                        <button class="button-wbkb-wizard secondary button-light-wb button-prev-wbk wbk_hidden">
                            <?php echo esc_html__(
                                'Previous',
                                'webba-booking-lite'
                            ); ?>
                        </button>
                        <button class="button-wbkb-wizard primary button-next-wbk"
                            data-launch-text="<?php echo esc_attr__(
                                'Launch wizard',
                                'webba-booking-lite'
                            ); ?>" data-next-text="<?php echo esc_attr__(
    'Next',
    'webba-booking-lite'
); ?>">
                            <?php echo esc_html__(
                                'Launch wizard',
                                'webba-booking-lite'
                            ); ?>
                            <span class="btn-ring-wbk"></span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
