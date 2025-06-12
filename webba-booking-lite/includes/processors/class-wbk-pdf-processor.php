<?php

use Dompdf\Dompdf;
use Dompdf\Options;
defined( 'ABSPATH' ) or exit;
if ( wbk_fs()->is__premium_only() && wbk_fs()->can_use_premium_code() && file_exists( WP_WEBBA_BOOKING__PLUGIN_DIR . '/includes/third-parties/api/dompdf/autoload.inc.php' ) ) {
    require_once WP_WEBBA_BOOKING__PLUGIN_DIR . '/includes/third-parties/api/dompdf/autoload.inc.php';
}
/**
 * This class is used to generate PDF from from HTML
 *
 * @package WBK
 */
class WBK_Pdf_Processor {
    /**
     * Convert HTML/CSS to PDF
     *
     * @param string $filename
     * @param string $content
     * @param array $bookings
     * @return void
     */
    public static function process( string $content, $bookings = [] ) : string {
        $file_path = '';
        return $file_path;
    }

    /**
     * Generates random file name
     *
     * @return string
     */
    protected static function get_file_path() : string {
        return get_temp_dir() . wp_generate_password() . '.pdf';
    }

}
