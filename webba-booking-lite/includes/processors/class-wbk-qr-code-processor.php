<?php

use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\ImagickImageBackEnd;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

defined('ABSPATH') or exit;

/**
 * This class is used to generate QR codes from strings
 *
 * @package WBK
 */
class WBK_Qr_Code_Processor
{
    /**
     * Generate a QR code image for the given string and return its public URL
     *
     * @param string $content Content to encode in the QR code
     * @param int    $size    QR code size in pixels
     * @return string Public URL of the saved QR code image, or empty string on failure
     */
    public static function process(string $content, int $size = 200): string
    {
        if ($content === '') {
            return '';
        }

        try {
            $use_png = class_exists('Imagick');
            $extension = $use_png ? 'png' : 'svg';
            $backend = $use_png
                ? new ImagickImageBackEnd()
                : new SvgImageBackEnd();

            $renderer = new ImageRenderer(
                new RendererStyle($size),
                $backend
            );
            $writer = new Writer($renderer);
            $image = $writer->writeString($content);

            $upload_dir = wp_upload_dir();
            if (!empty($upload_dir['error'])) {
                return '';
            }

            $qr_dir = $upload_dir['basedir'] . '/webba-booking/qr-codes/';
            $qr_url = $upload_dir['baseurl'] . '/webba-booking/qr-codes';
            if (is_ssl()) {
                $qr_url = str_replace('http://', 'https://', $qr_url);
            }

            if (!file_exists($qr_dir)) {
                wp_mkdir_p($qr_dir);
            }

            $filename = wp_generate_password(16, false) . '.' . $extension;
            $file_path = $qr_dir . $filename;

            if (file_put_contents($file_path, $image) === false) {
                return '';
            }

            return $qr_url . '/' . $filename;
        } catch (Exception $e) {
            return '';
        }
    }
}
