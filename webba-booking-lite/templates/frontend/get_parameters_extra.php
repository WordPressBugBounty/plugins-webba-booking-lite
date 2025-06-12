<?php
if ( !defined( 'ABSPATH' ) ) exit;
?>
<script type='text/javascript'>
var wbk_get_converted = {
<?php
$html_get = '';
foreach ( $_GET as $key => $value ) {
	$value = esc_html( urldecode( WBK_Validator::alfa_numeric( $value ) ) );
	$key = esc_html( urldecode( WBK_Validator::alfa_numeric( $key ) ) );

	if ( $key != 'action' && $key != 'time' && $key != 'service' && $key != 'step' ){
		$html_get .= '"'.$key.'"'. ':"' . $value . '",';
	}
}
$html_get .= '"blank":"blank"';
echo $html_get;
?>
}
</script>
