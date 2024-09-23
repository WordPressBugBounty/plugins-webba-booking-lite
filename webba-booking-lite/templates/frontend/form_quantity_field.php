<?php
if ( !defined( 'ABSPATH' ) ) exit;
$service_id = $data[0];
$time = $data[1];
$html = '';

$service = new WBK_Service( $service_id );
if( !$service->is_loaded() ){
    echo $html;
    return;
}
 
if ( $service->get_quantity() > 1 ) {
 
    $sp = new WBK_Schedule_Processor();
    if( is_array( $time ) ){    
        
        $avail_count  = 1000000;
        foreach ( $time as $time_this ) {
            $day = strtotime('today midnight', $time_this );
            $sp->get_time_slots_by_day( $day,
                                        $service_id,
                                        array( 'skip_gg_calendar'       => false,
                                               'ignore_preparation'     => true,
                                               'calculate_availability' => true,
                                               'calculate_night_hours'  => false ) );
            $current_avail = $sp->get_available_count( $time_this );
            if( $current_avail < $avail_count ){
                $avail_count = $current_avail;
            }
        }
    } else {
      
        $day = strtotime('today midnight', $time );
        $slots =  $sp->get_time_slots_by_day( $day,
                                    $service_id,
                                    array( 'skip_gg_calendar'       => false,
                                           'ignore_preparation'     => true,
                                           'calculate_availability' => true,
                                           'calculate_night_hours'  => false ) );
        
 

        $avail_count  =  $sp->get_available_count( $time );

    }

    $quantity_label = get_option( 'wbk_book_items_quantity_label', '' );
    $quantity_label = str_replace( '#service', $service->get_name(), $quantity_label );

    $selection_mode = get_option( 'wbk_places_selection_mode', 'normal' );

    if( $selection_mode == 'normal' || $selection_mode == 'normal_no_default'  ){
        $html .= '<label class="wbk-input-label" for="wbk-quantity">' . esc_html( $quantity_label ) . '</label>';
        $html .= '<select name="wbk-book-quantity" autocomplete="disabled" type="text" data-service="' . esc_attr( $service_id ) . '" class="wbk-input wbk-width-100 wbk-mb-10 wbk-book-quantity">';
        if( $selection_mode == 'normal_no_default' ){
            $html .= '<option value="0" >--</option>';
        }
        for ( $i = $service->get_min_quantity(); $i <= $avail_count; $i ++ ) {
            $html .= '<option value="' . $i . '" >' . $i . '</option>';
        }
    } elseif ( $selection_mode == '1'){
        $html .= '<select name="wbk-book-quantity" autocomplete="disabled" type="text" data-service="' . esc_attr( $service_id ) . '" class="wbk-input wbk_hidden wbk-width-100 wbk-mb-10 wbk-book-quantity">';
        $html .= '<option value="1">1</option>';
        $html .= '</select>';

    } elseif ( $selection_mode == 'max' ){
        $html .= '<select name="wbk-book-quantity" autocomplete="disabled" type="text" data-service="' . esc_attr( $service_id ) . '" class="wbk-input wbk_hidden wbk-width-100 wbk-mb-10 wbk-book-quantity">';
        $html .= '<option value="' . esc_attr( $service->get_quantity() ) . '">' . esc_html( $service->get_quantity() ) .'</option>';
        $html .= '</select>';
    }

    $html .= '</select>';
}



echo $html;
