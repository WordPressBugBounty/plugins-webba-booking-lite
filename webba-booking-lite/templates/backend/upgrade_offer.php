<?php
if ( !defined( 'ABSPATH' ) ) exit;
$banner_url = WP_WEBBA_BOOKING__PLUGIN_URL . '/public/images/webba_upgrade_banner_1.png';

$output = '<img src="' . $banner_url . '">';
$output .= '<p><a class="button button-primary" style="margin-left:3px;" onclick="wbk_hide_admin_notice(\'wbk_show_w5_release_notice\')" href="#">Not interested</a></p>';
      
 

?>
<div style="margin-top:25px;" class="notice notice-info is-dismissible wbk_notice wbk_show_w5_release_notice" data-nonce="<?php echo wp_create_nonce( 'wbkb_nonce' ); ?>">
 
     
        <?php echo $output ?>
     
     
    <div style="clear:both"></div>
</div>