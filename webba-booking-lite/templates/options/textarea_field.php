<?php
if (!defined('ABSPATH')) {
    exit();
}

$slug = $data['id'];
$args = $data['args'];
$value = stripslashes(get_option($slug, $args['default']));
$placeholder = !empty($args['placeholder']) ? $args['placeholder'] : '';

$limited_option = false;
if (!empty($args['required_plan'])) {
    $old_free_users = false;
    if (!empty($args['available_in_old_free'])) {
        $old_free_users = 'only_old_users';
    }
    if (
        !WBK_Feature_Gate::have_required_plan(
            $args['required_plan'],
            $old_free_users
        )
    ) {
        $limited_option = true;
    }
}

if (!empty($args['dependency'])) {
    $dependency =
        ' data-dependency = \'' . json_encode($args['dependency']) . '\'';
} else {
    $dependency = '';
}
?>
<div class="field-block-wb"<?php echo $dependency; ?>>
    <div class="label-wb mobile-two-rows-wb">
        <label for="<?php echo esc_attr($slug); ?>"><?php
echo esc_html($data['title']);
if ($limited_option) {
    WBK_Renderer::load_template(
        'backend/plan_requirement',
        [$args['required_plan']],
        true
    );
}
?></label>
        <?php if (!empty($args['popup'])) { ?>
            <div class="help-popover-wb" data-js="help-popover-wb">
                <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php echo $args[
                    'popup'
                ]; ?></div>
            </div>
        <?php } ?>
    </div>
    <div class="field-wrapper-wb">
        <textarea <?php if (
            $limited_option
        ) { ?>disabled<?php } ?> name="<?php echo esc_attr(
     $slug
 ); ?>" placeholder="<?php echo esc_attr(
    $placeholder
); ?>" id="<?php echo esc_attr($slug); ?>"><?php echo esc_attr(
    $value
); ?></textarea>
    </div>
    <?php if (!empty($args['description'])) { ?>
        <div class="hint-wb"><?php echo $args['description']; ?></div>
    <?php } ?>
</div>
