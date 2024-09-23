<?php
if ( !defined( 'ABSPATH' ) ) exit;

 

$get_processing = WBK_Renderer::load_template( 'frontend/get_parameters_processing', array(), false );
if( $get_processing != '' ){
	echo $get_processing;
	return;
}
$html = WBK_Renderer::load_template( 'frontend/get_parameters_extra', array() );

$category = $data[0];
$skip_services = $data[1];
$category_list = $data[2];
$start_btn_class = '';

?>
<div class="wbk-outer-container wbk_booking_form_container">
	<div class="wbk-inner-container">
 	<img src=<?php echo  WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/loading.svg' ?>  style="display:block;width:0px;height:0px;">
		<div class="wbk-frontend-row" id="wbk-service-container" >
			<div class="wbk-col-12-12" >
<?php
				if( $skip_services == '1' ){
					$start_btn_class = 'wbk_hidden';
?>
					<div class="wbk_multiserv_hidden_services" style="display:none">
<?php
				}

				if( $category == 0 ){
					$services = WBK_Model_Utils::get_services();
				} else {
					$services = WBK_Model_Utils::get_services_in_category( $category, true );
				}
				if( !is_array( $services ) ){
					$services = array();
				}

				$temp = '';
				$filter_used = FALSE;
				if( isset( $_GET['service'] ) ){
					$arr_from_url = explode( '-', $_GET['service']  );
					$filter_used = TRUE;
				}
				$item_class = '';
				if( $category_list == '1' ){
					$item_class = 'wbk_hidden';
					WBK_Renderer::load_template( 'frontend/category_dropdown', array( WBK_Model_Utils::get_service_categories() ) );
				}
				if( $skip_services != '1'){
?>
					<label class="wbk-input-label wbk-service-category-label <?php echo $item_class; ?>"><?php echo esc_html( get_option( 'wbk_service_label', 'Select service' ) ); ?></label>
<?php
				}
				foreach ( $services as $service_id => $service_name ){
					if( $filter_used ){
						if( !in_array( $service_id, $arr_from_url ) ){
							continue;
						}
					}
					if( $skip_services == '1' ){
?>
					    <input type="checkbox" value="<?php echo esc_html( $service_id ) ?>" class="wbk-checkbox wbk-service-checkbox" id="wbk-service_chk_<?php echo esc_html( $service_id ) ?>" checked />
<?php
					} else {
?>
					    <input type="checkbox" value="<?php echo esc_html( $service_id ) ?>" class="wbk-checkbox wbk-service-checkbox" id="wbk-service_chk_<?php echo esc_html( $service_id ) ?>" />
<?php
					}
?>
					<label for="wbk-service_chk_<?php echo esc_html( $service_id ) ?>" class="wbk_service_chk_label_<?php echo esc_html( $service_id ) ?> wbk-checkbox-label wbk_service_chk_label <?php echo ' ' . esc_html( $item_class ) . ' '; ?>  wbk-dayofweek-label"><?php echo esc_html( $service_name ); ?></label>
					<div class="wbk_chk_clear_<?php echo esc_html( $service_id ) ?> wbk-clear <?php echo esc_html( $item_class ) ?>"></div>
<?php
				}
 				if( $skip_services == '1' ){
?>
					 </div>
<?php
				}
?>
			</div>
		</div>
        <div class="wbk-frontend-row">
            <input type="button" disabled="disabled" class="<?php echo $start_btn_class;?> wbk-button wbk-width-100 wbk-mt-10-mb-10" id="wbk-confirm-services" value="<?php echo __( 'Start booking', 'webba-booking-lite' ); ?>">
        </div>
		<div class="wbk-frontend-row wbk_date_container" id="wbk-date-container">
		</div>
		<div class="wbk-frontend-row wbk_slots_container" id="wbk-slots-container">
		</div>
		<div class="wbk-frontend-row wbk_booking_form_container" id="wbk-booking-form-container">
		</div>
		<div class="wbk-frontend-row wbk_booking_done" id="wbk-booking-done">
		</div>
		<div class="wbk-frontend-row wbk_payment" id="wbk-payment">
		</div>
	</div>
</div>
