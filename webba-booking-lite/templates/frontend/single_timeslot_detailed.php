    <?php
    if ( !defined( 'ABSPATH' ) ) exit;

    $day_to_render = $data[0];
    $timeslot = $data[1];
    $offset = $data[2];
    $service = $data[3];
    $timeslots = $data[4];

    $time = $timeslot->get_formated_time();
    $local_time_str = $timeslot->get_formated_time_local();

    
    // *** Free time slot or multiple booking per slot
    $timeslot_html = '';

    if( $timeslot->get_end() < time() ){
        return;
    }
    
    if ( ( $timeslot->get_status() == 0 && $timeslot->get_free_places() != 0 ) || is_array( $timeslot->get_status() ) ) {
        $slot_html = '';
        $available_html = '';
        $available_count = '';
        if ( $service->get_quantity( $timeslot->get_start() ) > 1 ){

            $available_lablel = get_option( 'wbk_time_slot_available_text', __( 'available', 'webba-booking-lite' ) );
            $available_count = $timeslot->get_free_places();
            if ( $available_count < $service->get_min_quantity() && get_option( 'wbk_show_booked_slots', 'disabled' ) == 'disabled' ) {
                return;
            }
            $available_html = '<div class="wbk-slot-available"><span class="wbk-abailable-container">' .esc_html( $available_count ) . '</span> ' . esc_html( $available_lablel ) .'</div>';
            if( get_option( 'wbk_show_details_prev_booking', 'disabled' ) == 'enabled' ){
                $booking_ids =  WBK_Model_Utils::get_booking_ids_by_service_and_time( $service->get_id(), $timeslot->get_start() );
                foreach ( $booking_ids as $booking_id ) {
                    $booking = new WBK_Booking( $booking_id );
                    if ( !$booking->is_loaded() ) {

                        continue;
                    };

                    $slot_button_text = get_option ( 'wbk_booked_text', '' );
                    $slot_button_text = str_replace( '#username', $booking->get_name(), $slot_button_text );
                    $slot_button_text = WBK_Placeholder_Processor::process_placeholders( $slot_button_text, $booking_id );
                    $available_html .= '<div class="wbk-slot-available">' . WBK_Validator::kses( $slot_button_text ) . '</div>';
                }
            }

        }
        $book_text = WBK_Validator::alfa_numeric( get_option( 'wbk_book_text_timeslot', '' ) );
        if( $available_count > 0 || $service->get_quantity() == 1   ){
            $book_button = '<input type="button" data-end="' . esc_attr( $timeslot->get_end() ) . '"  data-start="' . esc_attr( $timeslot->get_start() ) . '"  value="' . esc_attr( $book_text ) .'" id="wbk-timeslot-btn_' . esc_attr( $timeslot->get_start() ) . '" data-available="' . esc_attr( $available_count ) . '"  data-service="' . esc_attr( $service->get_id() ) . '"  class="wbk-slot-button" />';
        } else {

            $slot_button =  get_option ( 'wbk_booked_text', '' );
            if ( get_option( 'wbk_show_details_prev_booking', 'disabled' ) == 'disabled' ){
                $book_button = '<input type="button"  data-start="' . esc_attr( $timeslot->get_start() ) . '" data-service="' . esc_attr( $service->get_id() ) . '" value="' . esc_attr( $slot_button ) .'" class="wbk-slot-button wbk-slot-booked" />';
            } else {
                $book_button = '';
            }
        }
        $pre_time = get_option( 'wbk_server_time_format', '' );
        if( $pre_time != '' ){
            $time = $pre_time . ' ' . $time;
        }
        $post_time = get_option( 'wbk_server_time_format2', '' );
        if( $post_time != '' ){
            $time = $time . ' ' . $post_time;
        }
        if( get_option( 'wbk_show_local_time', 'disabled' ) == 'enabled_only' ){
            $time = '';
        } else {
            $time .= '<br>';
        }
        $availability = '';

        if( count( $timeslots ) == 1 ){
            $timeslot_html .= '<li class="wbk-col-12-12-12">';
        } else {
            $timeslot_html .= '<li class="wbk-col-4-6-12">';
        }

        $timeslot_html .= '<div class="wbk-slot-inner">
                <div class="wbk-slot-time">' . $time  . $local_time_str . '</div>'. $available_html . $book_button.'
            </div>
        </li>';


    };



    if( $timeslot->get_status() == -2 && get_option( 'wbk_show_locked_as_booked', 'no' ) == 'yes' ){
        $slot_button =  get_option ( 'wbk_booked_text', '' );

        if( count( $timeslots ) == 1 ){
            $timeslot_html .= '<li class="wbk-col-12-12-12">';
        } else {
            $timeslot_html .= '<li class="wbk-col-4-6-12">';
        }

        $timeslot_html .=        
                '<div class="wbk-slot-inner">
                    <div class="wbk-slot-time">' .
                        $time .
                    '</div>
                    <input data-start="' . esc_attr( $timeslot->get_start() ) . '" data-service="' . esc_attr( $service->get_id() ) . '" type="button" value="' . $slot_button .'" class="wbk-slot-button wbk-slot-booked" />
                </div>
            </li>';
    }

    // End of Booked time slot

    // single booked time slot

    if( ( $timeslot->get_status() > 0 || ( $timeslot->get_free_places() == 0 && $timeslot->get_status() != -2 ) ) && !is_array( $timeslot->get_status() ) ) {
        $show_booked_slots = get_option( 'wbk_show_booked_slots', 'disabled' );
        if( $show_booked_slots == 'enabled'){
        
            $slot_button = get_option ( 'wbk_booked_text', '' );
            
            $slot_button = str_replace( '#time', $time, $slot_button );

            if( get_option( 'wbk_show_details_prev_booking', 'disabled' ) == 'enabled' ){
                if( $timeslot->get_status() > 0  ){
                    $booking = new WBK_Booking( $timeslot->get_status() );
                    if( $booking->is_loaded() ){
                        $slot_button = str_replace( '#username', $booking->get_name(), $slot_button );
                    }
                    $slot_button = WBK_Placeholder_Processor::process_placeholders( $slot_button, $timeslot->get_status()  );
                }
            }
            
            $pre_time = get_option( 'wbk_server_time_format', '' );
            if( $pre_time != '' ){
                $time = $pre_time . ' ' . $time;
            }
            $post_time = get_option( 'wbk_server_time_format2', '' );
            if( $post_time != '' ){
                $time = $time . ' ' . $post_time;
            }
            if( get_option( 'wbk_show_local_time', 'disabled' ) == 'enabled_only' ){
                $time = '';
            } else {
                $time .=  '<br>';
            }
            $slot_html = '
                <div class="wbk-slot-time">
                    ' . $time .  $local_time_str . '
                </div>
                <input data-start="' . esc_attr( $timeslot->getStart() ) .'"  type="button" value="' . $slot_button . '" class="wbk-slot-button wbk-slot-booked" />';

            if( count( $timeslots ) == 1 ){
                $timeslot_html .= '<li class="wbk-col-12-12-12">';
            } else {
                $timeslot_html .= '<li class="wbk-col-4-6-12">';
            }

            $timeslot_html .=
                '<div class="wbk-slot-inner">' .
                        $slot_html
                    .'</div>
                </li>';
        }
    }

    echo $timeslot_html;
