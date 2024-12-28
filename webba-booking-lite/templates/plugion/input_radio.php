<?php
if (!defined('ABSPATH'))
    exit;

$field = $data[0];
$extra = $field->get_extra_data();

switch ($field->get_name()) {

    case 'action':
        $tooltip = __('Specify what action should be performed on the price.', 'webba-booking-lite');
        break;
    case 'fixed_percent':
        $tooltip = __('Specify whether the amount is a fixed value or a percentage of the price.', 'webba-booking-lite');
        break;
    case 'custom_field_operator':
        $tooltip = __('Choose the comparison operator to determine how to evaluate the field\'s value.', 'webba-booking-lite');
        break;
    default:
        $tooltip = '';
        break;
}
?>
<div class="label-wb">
    <label><?php echo esc_html($field->get_title()); ?></label>

    <div class="help-popover-wb" data-js="help-popover-wb">
        <span class="help-icon-wb" data-js="help-icon-wb">?</span>
        <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $tooltip; ?></div>
    </div>

</div>
<div class="field-wrapper-wb">
    <div class="custom-radio-list-wb">
        <?php foreach ($field->get_extra_data() as $slug => $title) { ?>
            <label class="radiobutton-block-wbkb">
                <input class="plugion_property_input plugion_input plugion_input_radio" type="radio"
                    name="<?php echo esc_attr($field->get_name()); ?>" value="<?php echo esc_attr($slug); ?>" <?php checked($slug, $field->get_default_value()); ?> data-setter="radio" data-getter="radio"
                    data-validation="radio" />
                <span class="name-wb"><?php echo esc_html($title) ?></span>
            </label>
        <?php } ?>
    </div>
</div>