function wbk_hide_admin_notice(notice = '') {
    var data = {
        action: 'wbk_backend_hide_notice',
        nonce: jQuery('.' + notice).attr('data-nonce'),
        notice: notice,
    };

    jQuery('.' + notice).remove();
    jQuery.post(ajaxurl, data, function (response) {});
}
