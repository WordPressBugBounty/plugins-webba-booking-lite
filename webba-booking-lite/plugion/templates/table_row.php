<?php
if ( !defined( 'ABSPATH' ) ) exit;

$row = $data[0];
$table = $data[1];
$class = 'class="plugion_table_row_item"';

$row = json_decode( json_encode( $row ), true);

if( Plugion()->tables->get_element_at( $table )->current_user_can_update() ){
    $class = 'class="plugion_editable_row plugion_table_row_item"';
}

if( Plugion()->tables->get_element_at( $table )->current_user_can_duplicate() && Plugion()->tables->get_element_at( $table )->get_duplicatable() ) {
    $block_loader = '<div class="plugion_block_loader hide_element"></div>';
    $block_icon = '<div class="plugion_block_icon plugion_duplicate_btn" title="duplicate"></div>';
} else {
    $block_loader = '<div class="plugion_block_loader hide_element"></div>';
    $block_icon = '';
}

$block_loader = apply_filters( 'plugion_row_controls', $block_loader, $table, $row['id'] );

echo '<tr ' . $class . ' data-id="' . $row['id'] .'" data-category="row_opening"><td class="plugion_exportable cell-2">' . $row['id'] . $block_loader . $block_icon . '</td>';
$fields =  Plugion()->tables->get_element_at( $table )->get_data( 'fields_to_view');
 

$filtered_fields = Plugion\Table::filter_fields_by_dependency( $fields, $row );
$i = 3;
foreach ( $fields as $field_slug => $field ) {
    if ( !$field->get_in_row() ) {
        continue;
    }
    $value =  $row[ $field->get_name() ];
    if( !in_array( $field, $filtered_fields ) ){
        $value = '';
    }
    $ordering = apply_filters( 'plugion_table_column_' . $field->get_type() . '_ordering', null, [ $field, $field_slug, $value, $row ] );
    if( is_null( $ordering ) ){
        $ordering = '';
    } else {
        $ordering = 'data-order="' . esc_attr( $ordering ) . '"';
    }

    echo '<td ' . $ordering . ' class="plugion_cell plugion_exportable cell-' . $i . '  ">';

    if ( !has_action( 'plugion_table_cell_' . $field->get_type() ) ) {
        echo '<p>No action found for the <strong>' . 'plugion_property_field_' . $field->get_type()  . '</strong></p>';
    }
     
    ob_start();
  
    do_action( 'plugion_table_cell_' . $field->get_type(), [ $field, $field_slug, $value, $row ] );
    $cell_value = ob_get_clean();
    $cell_value = apply_filters( 'plugion_table_cell_value', $cell_value, [ $field, $field_slug, $value, $row ]  ); 

    echo $cell_value . '</td>';
    $i++;
}
echo '</tr>';
?>
