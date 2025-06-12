<?php
if (!defined('ABSPATH'))
    exit;

$slug = $data['id'];
$args = $data['args'];
$value = stripslashes(get_option($slug, $args['default']));

if (!empty($args['dependency'])) {
    $dependency = ' data-dependency = \'' . json_encode($args['dependency']) . '\'';
} else {
    $dependency = '';
}

$mcesettings = [];
$mcesettings['valid_elements'] = '*[*]';
$mcesettings['extended_valid_elements'] = '*[*]';

$wp_editor_args = [
    'media_buttons' => false,
    'editor_height' => 300,
    'tinymce' => $mcesettings
];
?>

<div class="field-block-wb editor-block-wb" <?php echo $dependency; ?>>
    <div class="field-block-wb with-toggle-editor-wb">
        <div class="label-wb">
            <label for="message-to-customer-wb">
                <?php echo esc_html($data['title']); ?>
            </label>
            <?php if (!empty($args['popup'])) { ?>
                <div class="help-popover-wb" data-js="help-popover-wb">
                    <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                    <div class="help-popover-box-wb" data-js="help-popover-box-wb">
                        <?php echo $args['popup']; ?>
                    </div>
                </div>
            <?php } ?>
        </div>
        <button type="button" class="button-wbkb button-small-wb wbk_option_toggle_editor">
            <?php echo esc_html__('Toggle editor', 'webba-booking-lite') ?>
        </button>
    </div>
    <?php if (!empty($args['description'])) { ?>
        <div class="hint-wb">
            <?php echo $args['description']; ?>
        </div>
    <?php } ?>
    <div class="visual-editor-wb wbk_option_editor_wrapper" style="display: none;">
        <?php wp_editor($value, $slug, $wp_editor_args); ?>
    </div>
</div>