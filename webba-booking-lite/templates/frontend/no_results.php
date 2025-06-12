<?php
if ( !defined( 'ABSPATH' ) ) exit;

echo esc_html( get_option( 'wbk_book_not_found_message',  'Unfortunately we were unable to meet your search criteria. Please change the criteria and try again.' ) );
?>
