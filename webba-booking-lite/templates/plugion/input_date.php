<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$field = $data[0];
$slug = $data[1];
if( isset( $field->get_extra_data()['date_format'] ) ){
    $date_fomrat =  $field->get_extra_data()['date_format'];
} else {
    $date_fomrat = get_option('date_format');
}
$date_fomrat = str_replace( 'd', 'dd', $date_fomrat );
$date_fomrat = str_replace( 'j', 'd', $date_fomrat );
$date_fomrat = str_replace( 'l', 'dddd', $date_fomrat );
$date_fomrat = str_replace( 'D', 'ddd', $date_fomrat );
$date_fomrat = str_replace( 'm', 'mm', $date_fomrat );
$date_fomrat = str_replace( 'n', 'm', $date_fomrat );
$date_fomrat = str_replace( 'F', 'mmmm', $date_fomrat );
$date_fomrat = str_replace( 'M', 'mmm', $date_fomrat );
$date_fomrat = str_replace( 'y', 'yy', $date_fomrat );
$date_fomrat = str_replace( 'Y', 'yyyy', $date_fomrat );
$date_fomrat = str_replace( 'S', '', $date_fomrat );
$date_fomrat = str_replace( 's', '', $date_fomrat );

$extra = $field->get_extra_data();
?>

<div class="label-wb">
    <label for="<?php echo esc_attr( $slug ); ?>"><?php echo esc_attr( $field->get_title() ); ?></label>
    <?php if ( ! empty( $extra['tooltip']  ) ) { ?>
        <div class="help-popover-wb" data-js="help-popover-wb">
            <span class="help-icon-wb" data-js="help-icon-wb">?</span>
            <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $extra['tooltip'] ; ?></div>
        </div>
    <?php } ?>
</div>
<div class="field-wrapper-wb">
    <input  id="<?php echo esc_attr( $slug ) ?>" name="<?php echo esc_html( $field->get_name() ); ?>" class="plugion_input plugion_input_date plugion_input_text plugion_property_input" type="text" data-default="<?php echo  esc_attr( $field->get_default_value() );?>" data-dateformat="<?php echo esc_attr( $date_fomrat ) ?>"  data-setter="date" data-getter="date" data-validation="date" required data-required="<?php echo esc_attr( $field->get_required() ); ?>">
</div>