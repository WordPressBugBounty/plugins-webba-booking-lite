<?php
if ( ! defined( 'ABSPATH' ) ) exit;
?>

<div id="dialog-appointment" height="500px" >
   	<div id="appointment_dialog_content">
   		<div id="appointment_dialog_left">
	   		<label for="wbk-appointment-time"><?php echo __( 'Time', 'webba-booking-lite') ?> <span class="input-error-wb" id="error-name"></span></label><br/>
            <input id="wbk-appointment-time" class="wbk-long-input" type="text" value="" /><br/>
            <input id="wbk-appointment-timestamp" type="hidden" value="" />
			<label for="wbk-appointment-name"><?php echo __( 'Name', 'webba-booking-lite') ?> <span class="input-error-wb" id="error-name"></span></label><br/>
            <input id="wbk-appointment-name" class="wbk-long-input" type="text" value="" /><br/>
            <label for="wbk-appointment-email"><?php echo __( 'Email', 'webba-booking-lite') ?></label><br/>
            <input id="wbk-appointment-email" class="wbk-long-input" type="text" value="" /><br/>
            <label for="wbk-appointment-phone"><?php echo __( 'Phone', 'webba-booking-lite') ?></label><br/>
            <input id="wbk-appointment-phone" class="wbk-long-input" type="text" value="" /><br/>
            <label id="wbk-appointment-quantity-label" for="wbk-appointment-quantity"><?php echo __( 'Items count', 'webba-booking-lite') ?></label><br/>
            <input id="wbk-appointment-quantity" class="wbk-long-input" type="text" value="1" /><br/>
            <input id="wbk-appointment-quantity-max"  type="hidden" value="" />

            <?php
                $ids = get_option( 'wbk_custom_fields_columns', '' );
                if( $ids != ''  ){
                    $ids = explode( ',', $ids );
                    $html = '';
                    foreach( $ids as $id ){
                        $col_title = '';
                        preg_match("/\[[^\]]*\]/", $id, $matches);
                        if( is_array( $matches ) && count( $matches ) > 0 ){
                            $col_title = rtrim( ltrim( $matches[0], '[' ), ']' );

                        }
                        $id = explode( '[', $id );
                        $id = $id[0];
                        if( $col_title == '' ){
                            $col_title =  $id;
                        }
                        $html .= '<label for="' . esc_attr( $id )  . '" class="slf_table_component_label" > ' . esc_html( $col_title  ). '</label><br>';
                        $html .= '<input type="text"  data-id="' . esc_attr( $id ) . '"  data-label="' . esc_attr( $id ) . '" class="wbk-long-input wbk_table_custom_field_part"  value=""  /><br>';
                    }
                    echo $html;
                }

            ?>
        </div>
        <div id="appointment_dialog_right">
			<label style="display:none" for="wbk-appointment-extra"><?php echo __( 'Custom data', 'webba-booking-lite') ?></label>
        	<textarea  style="display:none" class="wbk-full-width-control" id="wbk-appointment-extra" rows="7" class="wbk-long-input" readonly="readonly"></textarea>
			<label id="wbk-quantity-label" for="wbk-appointment-desc"><?php echo __( 'Comment', 'webba-booking-lite') ?></label><br/>
            <textarea  class="wbk-full-width-control" id="wbk-appointment-desc" rows="5" class="wbk-long-input">
            </textarea>
        </div>
   	</div>
</div>