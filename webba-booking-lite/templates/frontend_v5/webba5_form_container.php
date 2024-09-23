<?php
if (!defined('ABSPATH')) {
    exit();
}
$message = '';
if (isset($data[1])) {
    $message = $data[1];
} else {
    $scenario = $data[0];
    if (count($scenario) == 0) {
        return;
    }
}
$appearance_data = get_option('wbk_apperance_data');
if (isset($appearance_data['wbk_appearance_field_2'])) {
    $circle_color = $appearance_data['wbk_appearance_field_2'];
} else {
    $circle_color = '#213f5b';
}
?>
<div class="main-block-w">
    <div class="appointment-box-w">             
        <?php if ($message == '') { ?>
                <div class="appointment-status-wrapper-w">
                    <ul class="appointment-status-list-w">           
                    </ul>
                    <div class="circle-chart-wb" data-circle-color="<?php echo esc_attr(
                        $circle_color
                    ); ?>" data-percent="25"><span class="circle-chart-text-wb"></span></div>
                    
                    <div class="appointment-status-text-mobile-w">
                        <p class="current-step-w"></p>
                        <p class="next-step-w"></p>
                    </div>      
                </div>    
        <?php } ?>
        <div class="appointment-content-w">            
            <?php if ($message != '') { ?>
                    <div class="thank-you-block-w">
                        <div class="thank-you-content-w">
                            <p style="text-align:center;">
                        <?php echo $message; ?>
                            </p>
                        </div>
                    </div>
                <?php } else { ?>
            <form>
                <div class="appointment-content-scroll-w" data-scrollbar="true" tabindex="-1" style="overflow: hidden; outline: none;">
                    
                        <?php
                        $i = 0;
                        foreach ($scenario as $screen) {

                            $final_request_attr = '';
                            if ($screen['slug'] == 'payment_optional') {
                                $class = 'appointment-content-payment-optional';
                            } else {
                                $class = 'appointment-content-screen-w';
                            }
                            if ($i == 0) {
                                $class .=
                                    ' appointment-content-screen-active-w ';
                            }
                            $title = '';
                            if (isset($screen['title'])) {
                                $title = $screen['title'];
                            }
                            ?>
                            <div class=" <?php echo esc_attr(
                                $class
                            ); ?>"  <?php echo $final_request_attr; ?>  data-slug="<?php echo esc_attr(
      $screen['slug']
  ); ?>"  data-title="<?php echo $title; ?>"  data-request="<?php echo esc_attr(
    $screen['request']
); ?>">
                            <?php if (
                                isset($screen['templates']) &&
                                is_array($screen['templates'])
                            ) {
                                foreach (
                                    $screen['templates']
                                    as $template => $args
                                ) {
                                    WBK_Renderer::load_template(
                                        $template,
                                        $args
                                    );
                                }
                            } ?>                             
                            </div>
                        <?php $i++;
                        }
                        ?>               
                     
                <div class="scrollbar-track scrollbar-track-x show" style="display: none;"><div class="scrollbar-thumb scrollbar-thumb-x" style="width: 480px; transform: translate3d(0px, 0px, 0px);"></div></div><div class="scrollbar-track scrollbar-track-y show" style="display: none;"><div class="scrollbar-thumb scrollbar-thumb-y" style="height: 500px; transform: translate3d(0px, 0px, 0px);"></div></div></div><!-- /.appointent-content-scroll-w -->
                
                <div class="button-block-w two-buttons-w">
                    <button type="button" class="button-w button-prev-w"><?php echo esc_html(
                        get_option('wbk_back_button_text', __('Back'))
                    ); ?></button>
                    <button type="button" class="button-w button-next-w"><?php echo esc_html(
                        get_option('wbk_next_button_text', __('Next'))
                    ); ?><span class="btn-ring-wb"></span></button>
                </div><!-- /.button-block-w -->
                <div class="form-error-w" style="display: none;">
                    <img class="warning-img-w" src="<?php echo WP_WEBBA_BOOKING__PLUGIN_URL .
                        '/public/images/error-icon.png'; ?>" alt="error">
                    <span class="form-error-message-w"></span>  
                </div>
            </form>
            <?php } ?>
        </div><!-- /.appointment-content-w -->
        
    </div>
</div>
