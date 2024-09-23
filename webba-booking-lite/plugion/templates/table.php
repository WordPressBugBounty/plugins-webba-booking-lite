<?php
if ( !defined( 'ABSPATH' ) ) exit;

$slug = $data[0];
$pagination = $data[1];
$search = $data[2];

do_action( 'plugion_before_table', $slug );

if ( false === Plugion()->tables->get_element_at( $slug ) ) {
    return;
    do_action( 'plugion_after_table', $slug );
}
$table = Plugion()->tables->get_element_at( $slug );

if ( 0 === count( $table->get_data( 'fields_to_view' ) ) ) {
    echo __( 'No data available.', 'plugion' );
    do_action( 'plugion_after_table', $slug );
    return;
}
// prepare add button;
if ( $table ->current_user_can_add() ) {
    $add_button = '<a data-table="' . esc_attr( $slug ) . '" class="plugion_table_add_button plugion_button plugion_transparent_dark_button plugion_top_panel_button">' . plugion_translate_string( 'Add' ) . ' ' . esc_html( plugion_translate_string( Plugion()->tables->get_element_at( $slug )->get_single_item_name() ) ) .  '</a>';
} else {
    $add_button = '';
}
// filter add button
$add_button = apply_filters( 'plugion_table_add_button', $add_button, $slug );

// prepare filter button
if( count( $table->get_data( 'filters' ) ) > 0 ){
    $filter_button = '<a data-table="' . esc_attr( $slug ) . '" class="plugion_filter_button plugion_button plugion_transparent_dark_button plugion_top_panel_button">' . plugion_translate_string( 'Filters' ) .  '</a>';
} else {
    $filter_button = '';
}
$filter_button = apply_filters( 'plugion_table_after_default_buttons', $filter_button, $slug );

// prepare table header
$table_start  = '<table class="plugion_table table_' . esc_attr( $slug ) . '" data-table="' . esc_attr( $slug ) . '" data-pagination="' . esc_attr( $pagination ) . '" data-search="' . esc_attr( $search ) . '"
 data-sort_column="' . esc_attr(  $table->get_default_sort_column() ) . '" data-sort_direction= "' . esc_attr(  $table->get_default_sort_direction() )  . '" >';

$table_header = '<thead><tr class="plugion_table_row_item"><th class="plugion_exportable" data-sorttype="">' . plugion_translate_string( 'ID' ) . '</th>';
foreach ( Plugion()->tables->get_element_at( $slug )->get_data( 'fields_to_view' ) as $field_slug => $field ) {
    if ( !$field->get_in_row() ) {
        continue;
    }
    $table_header .= '<th class="plugion_cell plugion_exportable" id="title_'. esc_attr( $field_slug ) . '" data-sorttype="' . esc_attr( $field->get_sort_type() ) . '"  >' . esc_html(  $field->get_title() ) . '</th>';
}

$table_header .= '</tr></thead>';

// filter table header
$table_header = $table_start . apply_filters( 'plugion_table_header', $table_header, $slug );
// prepare table content
$table_content = '<tbody>';
ob_start();
foreach ( Plugion()->tables->get_element_at( $slug )->get_data( 'rows' ) as $row ) {
    Plugion()->renderer->render_table_row( $row, $slug );
}
$table_content .= ob_get_clean() . '</tbody>';

$table_content = apply_filters( 'plugion_table_content', $table_content, $slug );
// prepare table footer
$table_footer = '</table>';
// filter table content
$table_footer = apply_filters( 'plugion_table_footer', $table_footer, $slug );
$table_html = $add_button . $filter_button . $table_header . $table_content . $table_footer;
echo $table_html;
do_action( 'plugion_after_table', $slug );

?>
