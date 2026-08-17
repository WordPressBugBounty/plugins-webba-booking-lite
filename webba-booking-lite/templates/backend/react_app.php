<?php
// check if accessed directly
if (!defined('ABSPATH')) {
    exit();
}

$admin_theme = get_option('wbk_admin_theme', 'light');
$admin_theme = $admin_theme === 'dark' ? 'dark' : 'light';
?>

<div id="wbk_spa_dashboard" data-theme="<?php echo esc_attr($admin_theme); ?>">
    <script>
        (function () {
            var theme = <?php echo wp_json_encode($admin_theme); ?>;
            if (theme !== 'dark' && theme !== 'light') {
                return;
            }

            document.currentScript.parentElement.setAttribute('data-theme', theme);
            document.body.setAttribute('data-wbk-theme', theme);
        })();
    </script>
</div>
