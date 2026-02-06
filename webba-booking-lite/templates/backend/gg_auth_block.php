<?php
if (!defined('ABSPATH')) {
    exit();
}
$auth_status = $data[0];
$calendar_id = $data[1];
$auth_url = $data[2];
$html = '<div style="padding:20px;">';
switch ($auth_status[0]) {
    case 0:
        $html .=
            '<p>' .
            __('Status', 'webba-booking-lite') .
            ': <span class="slf_table_warning">' .
            __('authorization required', 'webba-booking-lite') .
            '</span></p>';
        $html .=
            '<label class="wbk_authorization_message" style="clear:both;display: block;" for="redirect_url">' .
            __(
                'IMPORTANT NOTICE: add the following URL in the Google Cloud Console or contact administrator before authorization:',
                'webba-booking-lite'
            ) .
            '</label>';
        $redirect_url = esc_url(
            get_admin_url() .
                'admin.php?page=wbk-gg-calendars&clid=' .
                $calendar_id
        );
        $html .=
            '<input  class="wbk_authorization_url" type="text" value="' .
            $redirect_url .
            '" style="width:700px;clear:both;">';
        $html .=
            '<p><a class="button" href="' .
            esc_url($auth_url) .
            '">' .
            __('Authorize', 'webba-booking-lite') .
            '</a></p>';
        break;
    case 2:
        $html .=
            '<span class="slf_table_desc">' .
            __(
                'Please ensure that proper calendar is selected in the celandar sidebar on the following page:',
                'webba-booking-lite'
            );
        $html .= '</span>';
        $calendars_url = esc_url(
            get_admin_url() . 'admin.php?page=wbk-gg-calendars&tab=calendars'
        );
        $html .=
            '<p><a href="' .
            $calendars_url .
            '">' .
            __('Google Calendars', 'webba-booking-lite') .
            '</a></p>';

        break;
    case 1:
        $html .= '<p>' . __('Authorized', 'webba-booking-lite') . '</p>';

        $html .= '<br>Details: ' . esc_html($auth_status[1]) . '</span>';
        $revoke_url = esc_url(
            get_admin_url() .
                'admin.php?page=wbk-gg-calendars&clid=' .
                $calendar_id .
                '&action=revoke'
        );
        $html .=
            '<p><a class="button-wbkb" href="' .
            $revoke_url .
            '">' .
            __('Remove authorization', 'webba-booking-lite') .
            '</a></p>';
        break;
}
$html .= '</div>';
echo $html;
?>
