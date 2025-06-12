<?php
if (!defined('ABSPATH'))
    exit;

$slug = $data['id'];
$args = $data['args'];
$value = get_option($slug, $args['default']);
$description = $args['description'];


$redirect_url = get_site_url() . '/?wbk_zoom_auth=true';

if (!empty($args['dependency'])) {
    $dependency = ' data-dependency = \'' . json_encode($args['dependency']) . '\'';
} else {
    $dependency = '';
}
?>
<div class="field-block-wb" <?php echo $dependency; ?>>
    <input data-setmsg="<?php echo esc_attr__('Please, set up Client ID and Client secret', 'webba-booking-lite'); ?>"
        type="hidden" class="wbk_middle_field" id="<?php echo esc_attr($slug); ?>" name="<?php echo esc_attr($slug); ?>"
        value="<?php echo esc_attr($value); ?>">
    <div class="wbk_option_zoom_msg_holder">
        <?php
        if (get_option('wbk_zoom_client_id', '') == '' || get_option('wbk_zoom_client_id', '') == '') {
            echo esc_html__('Please, set up Client ID and Client secret', 'webba-booking-lite');
        } else {
            if (get_option($slug, '') == '') {
                $url = 'https://zoom.us/oauth/authorize?response_type=code&client_id=' . get_option('wbk_zoom_client_id', '') . '&redirect_uri=' . $redirect_url;
                echo '<a class="wbk_zoom_authorize"  rel="noopener" href="' . $url . '">Authorize</a>';
            } else {
                echo '<span style="color:green;" class="wbk_zoom_authorized_label">' . esc_html__('Authorized', 'webba-booking-lite') . '</span><br>' . '<a class="wbk_zoom_remove_auth" href="#">Remove authorization</a>';
            }
        }
        ?>
    </div>
    <p class="description"><?php echo $description; ?></p>
</div>