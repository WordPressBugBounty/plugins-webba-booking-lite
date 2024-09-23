<?php
if ( !defined( 'ABSPATH' ) ) exit;

$field = $data[0];
$slug = $data[1];

if( isset( $field->get_extra_data()['date_format'] ) ){
    $date_format =  $field->get_extra_data()['date_format'];
} else {
    $date_format = get_option('date_format');
}
$date_format = str_replace( 'y', 'Y', $date_format );
$date_format_js = str_replace( 'd', 'dd', $date_format );
$date_format_js = str_replace( 'j', 'd', $date_format_js );
$date_format_js = str_replace( 'l', 'dddd', $date_format_js );
$date_format_js = str_replace( 'D', 'ddd', $date_format_js );
$date_format_js = str_replace( 'm', 'mm', $date_format_js );
$date_format_js = str_replace( 'n', 'm', $date_format_js );
$date_format_js = str_replace( 'F', 'mmmm', $date_format_js );
$date_format_js = str_replace( 'M', 'mmm', $date_format_js );
$date_format_js = str_replace( 'y', 'yy', $date_format_js );
$date_format_js = str_replace( 'Y', 'yyyy', $date_format_js );
$date_format_js = str_replace( 'S', '', $date_format_js );
$date_format_js = str_replace( 's', '', $date_format_js );

$data_default = $field->get_filter_value();

?>

<li>
    <div class="custom-select-wb"> 
        <input name="<?php echo esc_attr( $slug ); ?>" data-formated-date="<?php echo esc_attr( date( 'm/d/Y', $data_default[0] ) ); ?>"  value="<?php echo esc_attr( date($date_format, $data_default[0] ) ); ?>" data-dateformat="<?php echo esc_attr( $date_format_js ); ?>" class="plugion_input_date_range_start plugion_input_text plugion_filter_daterange plugion_filter_input" placeholder="Start date">
    </div>
</li>
<li>
    <div class="custom-select-wb">
        <input name="<?php echo esc_attr( $slug ); ?>" data-formated-date="<?php echo esc_attr( date( 'm/d/Y', $data_default[1] ) ); ?>"  value="<?php echo esc_attr( date($date_format, $data_default[1] ) ); ?>" data-dateformat="<?php echo esc_attr( $date_format_js ); ?>" class="plugion_input_date_range_end plugion_input_text plugion_filter_daterange plugion_filter_input" placeholder="End date">
    </div>
</li>