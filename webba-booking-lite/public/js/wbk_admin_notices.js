function wbk_hide_admin_notice(notice = '') {
    var data = {
        action: 'wbk_backend_hide_notice',
        nonce: jQuery('.' + notice).attr('data-nonce'),
        notice: notice,
    };

    jQuery('.' + notice).remove();
    jQuery.post(ajaxurl, data, function (response) { });
}


jQuery(document).on('click', '.notice.is-dismissible.wbk-admin-notice .notice-dismiss', function () {
    const notice = jQuery(this).closest('.notice');
    const noticeId = notice.attr('id');

    if (!noticeId) return;

    jQuery.post(ajaxurl, {
        action: 'wbk_dismiss_notice',
        notice_id: noticeId,
    });
});
