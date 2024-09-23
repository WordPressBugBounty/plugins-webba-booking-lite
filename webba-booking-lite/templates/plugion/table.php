<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data[0];
$pagination = $data[1];
$search = $data[2];

do_action( 'plugion_before_table', $slug );

$table = Plugion()->tables->get_element_at( $slug );
if ( ! $table ) {
    do_action( 'plugion_after_table', $slug );
    return;
}

if ( 0 === count( $table->get_data( 'fields_to_view' ) ) ) {
    echo __( 'No data available.', 'plugion' );
    do_action( 'plugion_after_table', $slug );
    return;
}

// prepare table header
$table_start  = '<table class="plugion_table table_' . esc_attr( $slug ) . '" data-table="' . esc_attr( $slug ) . '" data-pagination="' . esc_attr( $pagination ) . '" data-search="' . esc_attr( $search ) . '"
 data-order=\'[[' . esc_attr(  $table->get_default_sort_column() ) . ', "' . esc_attr(  $table->get_default_sort_direction() )  . '"]]\' >';

$table_header = '<thead><tr class="plugion_table_row_item"><th class="plugion_exportable" data-sorttype="">' . plugion_translate_string( 'ID' ) . '</th>';
foreach ( $table->get_data( 'fields_to_view' ) as $field_slug => $field ) {
    if ( !$field->get_in_row() ) {
        continue;
    }
    $table_header .= '<th class="plugion_cell plugion_exportable" id="title_'. esc_attr( $field_slug ) . '>' . esc_html(  $field->get_title() ) . '</th>';
}

$table_header .= '</tr></thead>';

// filter table header
$table_header = $table_start . apply_filters( 'plugion_table_header', $table_header, $slug );
// prepare table content
$table_content = '<tbody>';
ob_start();
foreach ( $table->get_data( 'rows' ) as $row ) {
    Plugion()->renderer->render_table_row( $row, $slug );
}
$table_content .= ob_get_clean() . '</tbody>';

$table_content = apply_filters( 'plugion_table_content', $table_content, $slug );
// prepare table footer
$table_footer = '</table>';
// filter table content
$table_footer = apply_filters( 'plugion_table_footer', $table_footer, $slug );
$table_html = $table_header . $table_content . $table_footer;
echo $table_html;
do_action( 'plugion_after_table', $slug );

?>
