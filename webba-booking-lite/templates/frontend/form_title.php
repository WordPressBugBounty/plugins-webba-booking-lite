<?php
if ( !defined( 'ABSPATH' ) ) exit;
$sevices_ids = $data[0];
$times = $data[1];
$category_id = $data[2];
?>
<?php
    $html = WBK_Placeholder_Processor::process_not_booked_item_placeholders( $sevices_ids, $times, $category_id );
    if( get_option ('wbk_mode', 'webba5' ) !=  'webba5' ){
          $html .= '<hr class="wbk-form-separator">';

    } else {
        $html = '<p class="first-text-w">' . $html . '<p>';
    }
    echo $html;

?>
