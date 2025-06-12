<?php
if (!defined('ABSPATH'))
    exit;

$slug = $data[0];
$pagination = $data[1];
$search = $data[2];

do_action('wbkdata_before_table', $slug);

if (false === WbkData()->tables->get_element_at($slug)) {
    return;
    do_action('wbkdata_after_table', $slug);
}
$table = WbkData()->tables->get_element_at($slug);

if (0 === count($table->get_data('fields_to_view'))) {
    echo __('No data available.', 'wbkdata');
    do_action('wbkdata_after_table', $slug);
    return;
}
// prepare add button;
if ($table->current_user_can_add()) {
    $add_button = '<a data-table="' . esc_attr($slug) . '" class="wbkdata_table_add_button wbkdata_button wbkdata_transparent_dark_button wbkdata_top_panel_button">' . wbkdata_translate_string('Add') . ' ' . esc_html(wbkdata_translate_string(WbkData()->tables->get_element_at($slug)->get_single_item_name())) . '</a>';
} else {
    $add_button = '';
}
// filter add button
$add_button = apply_filters('wbkdata_table_add_button', $add_button, $slug);

// prepare filter button
if (count($table->get_data('filters')) > 0) {
    $filter_button = '<a data-table="' . esc_attr($slug) . '" class="wbkdata_filter_button wbkdata_button wbkdata_transparent_dark_button wbkdata_top_panel_button">' . wbkdata_translate_string('Filters') . '</a>';
} else {
    $filter_button = '';
}
$filter_button = apply_filters('wbkdata_table_after_default_buttons', $filter_button, $slug);

// prepare table header
$table_start = '<table class="wbkdata_table table_' . esc_attr($slug) . '" data-table="' . esc_attr($slug) . '" data-pagination="' . esc_attr($pagination) . '" data-search="' . esc_attr($search) . '"
 data-sort_column="' . esc_attr($table->get_default_sort_column()) . '" data-sort_direction= "' . esc_attr($table->get_default_sort_direction()) . '" >';

$table_header = '<thead><tr class="wbkdata_table_row_item"><th class="wbkdata_exportable" data-sorttype="">' . wbkdata_translate_string('ID') . '</th>';
foreach (WbkData()->tables->get_element_at($slug)->get_data('fields_to_view') as $field_slug => $field) {
    if (!$field->get_in_row()) {
        continue;
    }
    $table_header .= '<th class="wbkdata_cell wbkdata_exportable" id="title_' . esc_attr($field_slug) . '" data-sorttype="' . esc_attr($field->get_sort_type()) . '"  >' . esc_html($field->get_title()) . '</th>';
}

$table_header .= '</tr></thead>';

// filter table header
$table_header = $table_start . apply_filters('wbkdata_table_header', $table_header, $slug);
// prepare table content
$table_content = '<tbody>';
ob_start();
foreach (WbkData()->tables->get_element_at($slug)->get_data('rows') as $row) {
    WbkData()->renderer->render_table_row($row, $slug);
}
$table_content .= ob_get_clean() . '</tbody>';

$table_content = apply_filters('wbkdata_table_content', $table_content, $slug);
// prepare table footer
$table_footer = '</table>';
// filter table content
$table_footer = apply_filters('wbkdata_table_footer', $table_footer, $slug);
$table_html = $add_button . $filter_button . $table_header . $table_content . $table_footer;
echo $table_html;
do_action('wbkdata_after_table', $slug);

?>