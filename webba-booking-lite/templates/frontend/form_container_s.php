<?php
if ( !defined( 'ABSPATH' ) ) exit;

$get_processing = WBK_Renderer::load_template( 'frontend/get_parameters_processing', array(), false );
if( $get_processing != '' ){
	echo $get_processing;
	return;
}
$html = WBK_Renderer::load_template( 'frontend/get_parameters_extra', array() );

$service = $data[0];
$category = $data[1];
$category_list = $data[2];

if( isset( $_GET['service'] ) && is_numeric( $_GET['service'] ) ){
	$service = $_GET['service'];
}

?>
<div class="wbk-outer-container wbk_booking_form_container">
	<div class="wbk-inner-container">
<?php
		do_action('webba_before_booking_form');
?>
     	<img src=<?php echo  WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/loading.svg' ?> style="display:block;width:0px;height:0px;">
        <img src=<?php echo  WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/loading_small.svg' ?> style="display:block;width:0px;height:0px;">
		<div class="wbk-frontend-row" id="wbk-service-container" >
			<div class="wbk-col-12-12" >
<?php
			if ( $service <> 0 ){
				WBK_Renderer::load_template( 'frontend/single_service_input', array( $service ) );
			}
			if( $category_list == 1 ){
				WBK_Renderer::load_template( 'frontend/category_dropdown', array( WBK_Model_Utils::get_service_categories() ) );
				WBK_Renderer::load_template( 'frontend/service_dropdown', array( WBK_Model_Utils::get_service_ids(), true ) );
?>
				<div style="display: none;" id="wbk_service_list_holder">
<?php
		 			WBK_Renderer::load_template( 'frontend/service_dropdown', array( WBK_Model_Utils::get_service_ids(), false ) );
?>
				</div>
				<?php
			}
			if( $category_list <> 1 and $service == 0 ){
				if( $category == 0 ){
					WBK_Renderer::load_template( 'frontend/service_dropdown', array( WBK_Model_Utils::get_service_ids(), false ) );
				} else {
					WBK_Renderer::load_template( 'frontend/service_dropdown', array( WBK_Model_Utils::get_services_in_category( $category ), false ) );
				}

			}
?>
			</div>
		</div>
		<div class="wbk-frontend-row wbk_date_container" id="wbk-date-container">
		</div>
<?php
		if( get_option( 'wbk_mode', 'extended' ) == 'extended' ){
?>
	        <div class="wbk-frontend-row wbk_time_container" id="wbk-time-container">
	        </div>
<?php
		}
?>
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
