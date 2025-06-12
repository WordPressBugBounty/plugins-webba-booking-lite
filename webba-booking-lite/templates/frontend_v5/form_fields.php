<?php
if (!defined('ABSPATH'))
    exit;
$service_ids = $data[0];
$times = $data[1];
$times_by_service = array();
?>
<select class="wbk_hidden wbk_quantities" name="quantities[]" multiple></select>
<?php

$forms = array();
$i = 0;
foreach ($service_ids as $service_id) {
    $service = new WBK_Service($service_id);
    if (!$service->is_loaded()) {
        continue;
    }
    $forms[] = $service->get_form();
    $times_by_service[$service_id][] = $times[$i];
    $i++;
}
$forms = array_unique($forms);
if (count($forms) == 1) {
    $form = $forms[0];
} else {
    $form = 0;
}
$service_ids = array_unique($service_ids);
$html = '';


foreach ($service_ids as $service_id) {

    ?>
    <div class="field-row-w ">
        <?php
        WBK_Renderer::load_template('frontend_v5/form_quantity_field', array($service_id, $times_by_service[$service_id]));
        ?>
    </div>
    <?php
}

if ($form == 0) {

    $name_label = esc_html(get_option('wbk_name_label', ''));
    $email_label = esc_html(get_option('wbk_email_label', ''));
    $phone_label = esc_html(get_option('wbk_phone_label', ''));
    $comment_label = esc_html(get_option('wbk_comment_label', ''));

    ?>
    <div class="field-row-w ">
        <label>
            <?php echo $name_label; ?>
        </label>
        <input type="text"
            data-validationmsg="<?php echo esc_attr(__('Please, enter customer name'), 'webba-booking-lite') ?>"
            class="input-text-w wbk-input " data-validation="not_empty" name="custname">
    </div>
    <div class="field-row-w">
        <label>
            <?php echo $email_label; ?>
        </label>
        <input type="text" data-validationmsg="<?php echo esc_attr(__('Please, enter email'), 'webba-booking-lite') ?>"
            class="input-text-w wbk-input" data-validation="email" name="email">
    </div>
    <div class="field-row-w">
        <label>
            <?php echo $phone_label; ?>
        </label>
        <input type="text"
            data-validationmsg="<?php echo esc_attr(__('Please, enter phone number'), 'webba-booking-lite') ?>"
            class="input-text-w wbk-input" data-validation="phone" name="phone">
    </div>
    <div class="field-row-w">
        <label>
            <?php echo $comment_label; ?>
        </label>
        <textarea class="wbk-input input-textarea-w" name="comment"></textarea>
    </div>
    <textarea style="display:none" name="extra" class="wbk-input wbk-extra"></textarea>
    <?php
} else {

    if (class_exists('Cf7_Polylang_Public')) {
        $cf7_polylang = new Cf7_Polylang_Public('1', '1');
        if (method_exists($cf7_polylang, 'translate_form_id')) {
            $form = $cf7_polylang->translate_form_id($form, null);
        }
    }
    $form = apply_filters('wpml_object_id', $form, 'wpcf7_contact_form', true);
    $cf7_form = do_shortcode('[contact-form-7 id="' . $form . '"]');
    $cf7_form = apply_filters('wbk_after_cf7_rendered', $cf7_form);

    $cf7_form = str_replace('<form', '<div', $cf7_form);
    $cf7_form = str_replace('/form', '/div', $cf7_form);


    $cf7_form = str_replace('<p>', '', $cf7_form);
    $cf7_form = str_replace('</p>', '', $cf7_form);
    $cf7_form = str_replace('<label', '<label class="input-label-wbk" ', $cf7_form);
    $cf7_form = str_replace('type="checkbox"', 'type="checkbox" class="wbk-checkbox" ', $cf7_form);
    $cf7_form = str_replace('wbk-checkbox', ' wbk-checkbox wbk-checkbox-custom ', $cf7_form);
    $cf7_form = str_replace('wpcf7-list-item-label', 'wbk-checkbox-label', $cf7_form);
    $cf7_form = str_replace('wpcf7-list-item', 'wbk-checkbox-span-holder', $cf7_form);
    $cf7_form = str_replace('wpcf7-list-item-label', 'wbk-checkbox-label', $cf7_form);
    $cf7_form = str_replace(
        'name="wbk-acceptance"',
        'name="wbk-acceptance" value="1" id="wbk-acceptance" aria-invalid="false"><span class="wbk-checkbox-label"></span> <input type="hidden"',
        $cf7_form
    );
    $cf7_form = str_replace('type="file"', 'type="file" accept="application/pdf,image/png,image/jpeg,.doc, .docx"', $cf7_form);
    $cf7_form .= '<textarea style="display:none;" name="extra" class="wbk-input wbk-extra"></textarea>';
    $html .= $cf7_form;
}


echo $html;

?>