<?php
if (!defined('ABSPATH'))
    exit;

$row = $data[0];
$table = $data[1];
$class = 'class="wbkdata_table_row_item"';

$row = json_decode(json_encode($row), true);

if (WbkData()->tables->get_element_at($table)->current_user_can_update()) {
    $class = 'class="wbkdata_editable_row wbkdata_table_row_item"';
}

if (WbkData()->tables->get_element_at($table)->current_user_can_duplicate() && WbkData()->tables->get_element_at($table)->get_duplicatable()) {
    $block_loader = '<div class="wbkdata_block_loader hide_element"></div>';
    $block_icon = '<div class="wbkdata_block_icon wbkdata_duplicate_btn" title="duplicate"></div>';
} else {
    $block_loader = '<div class="wbkdata_block_loader hide_element"></div>';
    $block_icon = '';
}

$block_loader = apply_filters('wbkdata_row_controls', $block_loader, $table, $row['id']);

echo '<tr ' . $class . ' data-id="' . $row['id'] . '" data-category="row_opening"><td class="wbkdata_exportable cell-2">' . $row['id'] . $block_loader . $block_icon . '</td>';
$fields = WbkData()->tables->get_element_at($table)->get_data('fields_to_view');


$filtered_fields = WbkData\Table::filter_fields_by_dependency($fields, $row);
$i = 3;
foreach ($fields as $field_slug => $field) {
    if (!$field->get_in_row()) {
        continue;
    }
    $value = $row[$field->get_name()];
    if (!in_array($field, $filtered_fields)) {
        $value = '';
    }
    $ordering = apply_filters('wbkdata_table_column_' . $field->get_type() . '_ordering', null, [$field, $field_slug, $value, $row]);
    if (is_null($ordering)) {
        $ordering = '';
    } else {
        $ordering = 'data-order="' . esc_attr($ordering) . '"';
    }

    echo '<td ' . $ordering . ' class="wbkdata_cell wbkdata_exportable cell-' . $i . '  ">';

    if (!has_action('wbkdata_table_cell_' . $field->get_type())) {
        echo '<p>No action found for the <strong>' . 'wbkdata_property_field_' . $field->get_type() . '</strong></p>';
    }

    ob_start();

    do_action('wbkdata_table_cell_' . $field->get_type(), [$field, $field_slug, $value, $row]);
    $cell_value = ob_get_clean();
    $cell_value = apply_filters('wbkdata_table_cell_value', $cell_value, [$field, $field_slug, $value, $row]);

    echo $cell_value . '</td>';
    $i++;
}
echo '</tr>';
?>