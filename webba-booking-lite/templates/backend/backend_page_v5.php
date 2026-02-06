<?php
if (!defined('ABSPATH')) {
    exit();
} ?>

<div class="main-part-wrapper-wb">
	<div class="content-main-wb">
		 
<?php
global $plugin_page;
switch ($plugin_page) {
    case 'wbk-appearance':
        WBK_Renderer::load_template(
            'backend/appearance_page_content',
            [],
            true
        );
        break;

    case 'wbk-dashboard':
        WBK_Renderer::load_template('backend/dashboard', [], true);
        break;
}
?>

	</div>
</div>
