<?php
if (!defined('ABSPATH'))
    exit;
$service_ids = $data[0];
$times = $data[1];
$times_by_service = array();
?>
<?php
$forms = array();
$i = 0;
foreach ($service_ids as $service_id) {
    $times_by_service[$service_id] = $times[$i];
    $service = new WBK_Service($service_id);
    if (!$service->is_loaded()) {
        continue;
    }
    $forms[] = $service->get_form();
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
    $html .= WBK_Renderer::load_template('frontend/form_quantity_field', array($service_id, $times_by_service[$service_id]));
}


if ($form == 0) {

    $name_label = get_option('wbk_name_label', '');
    $email_label = get_option('wbk_email_label', '');
    $phone_label = get_option('wbk_phone_label', '');
    $comment_label = get_option('wbk_comment_label', '');

    $html .= '<label class="input-label-wbk" for="wbk-name">' . esc_html($name_label) . '</label>';
    $html .= '<input name="wbk-name" autocomplete="disabled" type="text" class="wbk-input wbk-width-100 wbk-mb-10" id="wbk-name" />';
    $html .= '<label class="input-label-wbk" for="wbk-email">' . esc_html($email_label) . '</label>';
    $html .= '<input name="wbk-email" autocomplete="disabled" type="text" class="wbk-input wbk-width-100 wbk-mb-10" id="wbk-email" />';
    $html .= '<label class="input-label-wbk" for="wbk-phone">' . esc_html($phone_label) . '</label>';
    $html .= '<input name="wbk-phone" autocomplete="disabled" autocomplete="disabled" type="text" class="wbk-input wbk-width-100 wbk-mb-10" id="wbk-phone" />';
    $html .= '<label class="input-label-wbk" for="wbk-comment">' . esc_html($comment_label) . '</label>';
    $html .= '<textarea name="wbk-comment" rows="3" class="wbk-input wbk-textarea wbk-width-100 wbk-mb-10" id="wbk-comment"></textarea> ';

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

    if (get_option('wbk_mode') != 'webba5') {
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
        $html .= $cf7_form;
    } else {
        $cf7_form = str_replace('<p>', '<div class="field-row-w">', $cf7_form);
        $cf7_form = str_replace('</p>', '</div>', $cf7_form);
        $cf7_form = str_replace('id="wbk-name"', '', $cf7_form);
        $cf7_form = str_replace('id="wbk-email"', '', $cf7_form);
        $cf7_form = str_replace('id="wbk-phone"', '', $cf7_form);
        $cf7_form = str_replace('id="wbk-comment"', '', $cf7_form);

        $cf7_form = str_replace('name="wbk-name"', 'name="custname"', $cf7_form);
        $cf7_form = str_replace('name="wbk-email"', 'name="email"', $cf7_form);
        $cf7_form = str_replace('name="wbk-phone"', 'name="phone"', $cf7_form);
        $cf7_form = str_replace('name="wbk-comment"', 'name="desc"', $cf7_form);
        $html .= $cf7_form;

    }
}

if (get_option('wbk_mode') != 'webba5') {
    $html .= '<input type="button" class="wbk-button wbk-width-100 wbk-mt-10-mb-10" id="wbk-book_appointment" value="' . esc_html(get_option('wbk_book_text_form', '')) . '">';
    if (get_option('wbk_show_cancel_button', 'disabled') == 'enabled') {
        $html .= '<input class="wbk-button wbk-width-100 wbk-cancel-button"  value="' . esc_html(get_option('wbk_cancel_button_text', '')) . '" type="button">';
    }

}
echo $html;

?>