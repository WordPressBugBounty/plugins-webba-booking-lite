<?php
if (!defined('ABSPATH')) {
    exit();
}

$appearance_data = get_option('wbk_apperance_data');

if (isset($appearance_data['wbk_appearance_field_1'])) {
    $field_value_1 = $appearance_data['wbk_appearance_field_1'];
} else {
    $field_value_1 = '#14B8A9';
}

if (isset($appearance_data['wbk_appearance_field_2'])) {
    $field_value_2 = $appearance_data['wbk_appearance_field_2'];
} else {
    $field_value_2 = '#F9FAFB';
}

if (isset($appearance_data['wbk_appearance_field_3'])) {
    $field_value_3 = $appearance_data['wbk_appearance_field_3'];
} else {
    $field_value_3 = '#ffffff';
}

if (isset($appearance_data['wbk_appearance_field_4'])) {
    $field_value_4 = $appearance_data['wbk_appearance_field_4'];
} else {
    $field_value_4 = '0';
}
?>
<div class="main-part-wrapper-wb">
    <?php WBK_Renderer::load_template('backend/backend_page_header', [
        __('Appearance', 'webba-booking-lite'),
    ]); ?>
    <div class="content-main-wb">
        <div class="appearance-block-wrapper-wb">
            <div class="appearance-block-wb">
                <div class="left-part-wb">
                    <div class="appearance-tabs-wb" data-js="appearance-tabs-wb">
                        <div class="single-tab-wb active-wb" data-js="single-tab-wb" data-name="borders">
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="input-text-color-wb"><b>
                                            <?php echo esc_html__(
                                                'Color 1',
                                                'webba-booking-lite'
                                            ); ?>
                                        </b></label>
                                </div><!-- /.label-wb -->
                                <div class="field-wrapper-wb" data-js-block="color-picker-wrapper-wb">
                                    <input type="color" value="<?php echo esc_attr(
                                        $field_value_1
                                    ); ?>"
                                        class="color-picker-wb input-wb"
                                        data-class="appointment-status-wrapper-w,circle-chart-wbk"
                                        data-property="background-color,border-color">
                                    <input type="text" class="input-text-color-wb input-text-wb input-wb"
                                        value="<?php echo esc_attr(
                                            $field_value_1
                                        ); ?>"
                                        data-class="appointment-status-wrapper-w,circle-chart-wbk"
                                        id="wbk_appearance_field_1" data-property="background-color,border-color">
                                </div><!-- /.field-wrapper-wb -->
                            </div><!-- /.field-block-wb -->
                            <div class="field-block-wb">
                                <div class="label-wb">
                                    <label for="input-text-color-wb"><b>
                                            <?php echo esc_html__(
                                                'Color 2',
                                                'webba-booking-lite'
                                            ); ?>
                                        </b></label>
                                </div><!-- /.label-wb -->
                                <div class="field-wrapper-wb" data-js-block="color-picker-wrapper-wb">
                                    <input type="color" value="<?php echo esc_attr(
                                        $field_value_2
                                    ); ?>"
                                        class="color-picker-wb input-wb"
                                        data-class="button-wbk,wb_slot_checked,middleDay,checkmark-w,checkbox-subtitle-w,wbk_service_item_active"
                                        data-property="background-color,border-color">
                                    <input type="text" class="input-text-color-wb input-text-wb input-wb"
                                        value="<?php echo esc_attr(
                                            $field_value_2
                                        ); ?>"
                                        data-class="button-wbk,wb_slot_checked,middleDay,checkmark-w,checkbox-subtitle-w,wbk_service_item_active"
                                        id="wbk_appearance_field_2" data-property="background-color,border-color">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="buttons-block-wb">
                        <button type="submit" class="button-wbkb button-wbkb-appearance-save">
                            <?php echo __(
                                'Save',
                                'webba-booking-lite'
                            ); ?><span class="btn-ring-wbk"></span>
                        </button>
                    </div>
                </div><!-- /.left-part-wb -->
                <div class="right-part-wb">
                    <label for="shortcode-booking-form-wb">
                        <?php echo '<a style="display: block;color: #000; margin: 0px auto; text-align: center; margin-bottom: 30px;" target="_blank" rel="noopener" href="https://webba-booking.com/documentation/how-to-add-booking-form/">' .
                            __(
                                'How to add the booking form to my website?',
                                'webba-booking-lite'
                            ) .
                            '</a>'; ?>
                    </label>
                    <div class="appearance-result-block-wb">
                         
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>