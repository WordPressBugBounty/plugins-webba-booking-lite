<?php
if ( !defined( 'ABSPATH' ) ) exit;
/*
 * This file is part of Webba Booking plugin



 */

$value = $data[2];
$value = strip_tags( $value );
if( strlen( $value ) > 50 ){
    $value = substr($value, 0, 50 ) . ' ...';
}
echo $value;
?>
