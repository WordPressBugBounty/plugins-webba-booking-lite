<?php
if (!defined('ABSPATH'))
    exit;
$timeslots = $data[0];
$day_to_render = $data[1];
$service_id = $data[2];
$offset = $data[3];
$time_after = $data[4];

$service = new WBK_Service($service_id);
if (!$service->is_loaded()) {
    return;
}
$timeslots_html = '';

?>


<?php
$ul_class = '';
for ($i = 0; $i < count($timeslots); $i++) {
    $timeslot = $timeslots[$i];
    if ($timeslot->get_start() < $time_after) {
        continue;
    }
    if ($service->get_quantity($timeslot->get_start()) > 1) {
        $ul_class = 'appontment-time-list-w group-list-w';
        $timeslots_html .= WBK_Renderer::load_template('frontend_v5/group_timeslot', array($day_to_render, $timeslot, $offset, $service, $timeslots, $i), false);
    } else {
        if (get_option('wbk_timeslot_time_string', 'start') == 'start') {
            $ul_class = 'appontment-time-list-w';
            $timeslots_html .= WBK_Renderer::load_template('frontend_v5/short_timeslot', array($day_to_render, $timeslot, $offset, $service, $timeslots, $i), false);
        } else {
            $ul_class = 'appontment-time-list-w group-list-w';
            $timeslots_html .= WBK_Renderer::load_template('frontend_v5/long_timeslot', array($day_to_render, $timeslot, $offset, $service, $timeslots, $i), false);
        }
    }
}
?>

<ul class="<?php echo esc_attr($ul_class); ?>">
    <?php echo $timeslots_html; ?>
</ul>

<?php
?>