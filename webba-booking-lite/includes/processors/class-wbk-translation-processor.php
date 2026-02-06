<?php
if (!defined('ABSPATH')) {
    exit();
}
class WBK_Translation_Processor
{
    public function __construct()
    {
        // regstter strings for services
        $service_ids = WBK_Model_Utils::get_service_ids();
        foreach ($service_ids as $id) {
            $service = new WBK_Service($id);
            if (!$service->is_loaded()) {
                continue;
            }
            $this->register_strings(
                'webba_service_' . $id,
                $service->get_name()
            );
            $this->register_strings(
                'webba_service_description_' . $id,
                $service->get_description()
            );
        }

        $category_ids = WBK_Model_Utils::get_service_category_ids();
        foreach ($category_ids as $id) {
            $category = new WBK_Service_Category($id);
            if (!$category->is_loaded()) {
                continue;
            }
            $this->register_strings(
                'webba_service_category_' . $id,
                $category->get_name()
            );
        }

        $template_ids = WBK_Model_Utils::get_all_email_templates();
        foreach ($template_ids as $id => $name) {
            $template = new WBK_Email_Template($id);
            if (!$template->is_loaded()) {
                continue;
            }
            $this->register_strings(
                'webba_email_template_subject_' . $id,
                $template->get('subject')
            );
            $this->register_strings(
                'webba_email_template_message_' . $id,
                $template->get('template')
            );
            $this->register_strings(
                'webba_email_template_pdf_' . $id,
                $template->get('pdf_attachment')
            );
        }

        $form_ids = WBK_Model_Utils::get_forms();
        $forms = [];
        foreach ($form_ids as $id => $name) {
            $form = new WBK_Form($id);
            if (!$form->is_loaded()) {
                continue;
            }

            $forms[$id]['fields'] = $form->get_fields();
        }

        $forms['default'][
            'fields'
        ] = WBK_Form_Builder_Utils::get_default_fields();

        foreach ($forms as $id => $props) {
            if (
                !isset($props['fields']) ||
                !is_array($props['fields']) ||
                count($props['fields']) === 0
            ) {
                continue;
            }

            $fields = $props['fields'];
            foreach ($fields as $field) {
                if (isset($field['placeholder'])) {
                    $this->register_strings(
                        'webba_form_field_' . $id . '_' . $field['slug'],
                        $field['placeholder']
                    );
                }
                if (isset($field['defaultValue'])) {
                    $this->register_strings(
                        '   ' . $id . '_' . $field['slug'] . '_default',
                        $field['defaultValue']
                    );
                }
                if (isset($field['checkboxText'])) {
                    $this->register_strings(
                        'webba_form_field_' .
                            $id .
                            '_' .
                            $field['slug'] .
                            '_checkbox',
                        $field['checkboxText']
                    );
                }
            }
        }
    }

    public function register_strings($name, $value)
    {
        if (function_exists('pll_register_string')) {
            pll_register_string($name, $value, 'webba-booking-lite');
        } else {
            do_action(
                'wpml_register_single_string',
                'webba-booking-lite',
                $name,
                $value
            );
        }
    }
    public static function translate_string($name, $value)
    {
        if (function_exists('pll__')) {
            $value = pll__($value);
            return $value;
        }
        $value = apply_filters(
            'wpml_translate_single_string',
            $value,
            'webba-booking-lite',
            $name
        );
        return $value;
    }
    public static function get_local_by_lang($lang)
    {
        if (function_exists('pll_get_locale')) {
            return pll_get_locale($lang);
        }
        $locale_map = [
            'af' => 'af',
            'ar' => 'ar',
            'ary' => 'ar_MA',
            'as' => 'as',
            'az' => 'az',
            'azb' => 'az_AZ',
            'bel' => 'be_BY',
            'bg' => 'bg_BG',
            'bn' => 'bn_BD',
            'bo' => 'bo',
            'bs' => 'bs_BA',
            'ca' => 'ca',
            'ceb' => 'ceb',
            'cs' => 'cs_CZ',
            'cy' => 'cy',
            'da' => 'da_DK',
            'de' => 'de_DE',
            'de_CH' => 'de_CH',
            'el' => 'el',
            'en' => 'en_US',
            'en_AU' => 'en_AU',
            'en_CA' => 'en_CA',
            'en_GB' => 'en_GB',
            'en_NZ' => 'en_NZ',
            'en_ZA' => 'en_ZA',
            'eo' => 'eo',
            'es' => 'es_ES',
            'es_AR' => 'es_AR',
            'es_CL' => 'es_CL',
            'es_CO' => 'es_CO',
            'es_GT' => 'es_GT',
            'es_MX' => 'es_MX',
            'es_PE' => 'es_PE',
            'es_PR' => 'es_PR',
            'es_VE' => 'es_VE',
            'et' => 'et',
            'eu' => 'eu',
            'fa' => 'fa_IR',
            'fi' => 'fi',
            'fr' => 'fr_FR',
            'fr_CA' => 'fr_CA',
            'fur' => 'fur',
            'gd' => 'gd',
            'gl' => 'gl_ES',
            'gu' => 'gu',
            'haz' => 'haz',
            'he' => 'he_IL',
            'hi' => 'hi_IN',
            'hr' => 'hr',
            'hu' => 'hu_HU',
            'hy' => 'hy',
            'id' => 'id_ID',
            'is' => 'is_IS',
            'it' => 'it_IT',
            'ja' => 'ja',
            'jv' => 'jv_ID',
            'ka' => 'ka_GE',
            'kab' => 'kab',
            'kk' => 'kk',
            'km' => 'km',
            'kn' => 'kn',
            'ko' => 'ko_KR',
            'ckb' => 'ckb',
            'lo' => 'lo',
            'lt' => 'lt_LT',
            'lv' => 'lv',
            'mk' => 'mk_MK',
            'ml' => 'ml_IN',
            'mn' => 'mn',
            'mr' => 'mr',
            'ms' => 'ms_MY',
            'my' => 'my_MM',
            'nb' => 'nb_NO',
            'ne' => 'ne_NP',
            'nl' => 'nl_NL',
            'nl_BE' => 'nl_BE',
            'nn' => 'nn_NO',
            'oci' => 'oci',
            'pa' => 'pa_IN',
            'pl' => 'pl_PL',
            'ps' => 'ps',
            'pt' => 'pt_PT',
            'pt_BR' => 'pt_BR',
            'ro' => 'ro_RO',
            'ru' => 'ru_RU',
            'sa_IN' => 'sa_IN',
            'si' => 'si_LK',
            'sk' => 'sk_SK',
            'sl' => 'sl_SI',
            'sq' => 'sq',
            'sr' => 'sr_RS',
            'sv' => 'sv_SE',
            'sw' => 'sw',
            'ta' => 'ta_IN',
            'te' => 'te',
            'th' => 'th',
            'tl' => 'tl',
            'tr' => 'tr_TR',
            'tt' => 'tt_RU',
            'ug' => 'ug_CN',
            'uk' => 'uk',
            'ur' => 'ur',
            'uz' => 'uz_UZ',
            'vi' => 'vi',
            'zh_CN' => 'zh_CN',
            'zh_HK' => 'zh_HK',
            'zh_TW' => 'zh_TW',
        ];

        return isset($locale_map[$lang]) ? $locale_map[$lang] : $lang;
        return $lang;
    }
    public static function switch_to_locale_from_get_param()
    {
        $lang = isset($_GET['lang'])
            ? sanitize_text_field($_GET['lang'])
            : null;
        if ($lang) {
            $locale = self::get_local_by_lang($lang);
            switch_to_locale($locale);
        }
    }
}
