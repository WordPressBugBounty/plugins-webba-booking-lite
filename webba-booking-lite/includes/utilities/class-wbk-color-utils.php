<?php
defined('ABSPATH') or exit;

/**
 * Class WBK_Color_Utils
 *
 * @package WebbaBooking
 */
class WBK_Color_Utils
{
    /**
     * Generates a complete color palette with 11 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950)
     * based on a base color (500 shade) using HSL lightness adjustments.
     *
     * @param string $baseColor The base color in hex format (should be the 500 shade)
     * @return array Array with shade numbers as keys and hex color strings as values
     */
    public static function generateColorShades(string $baseColor): array
    {
        // Remove # if present and convert to uppercase
        $cleanColor = strtoupper(str_replace('#', '', $baseColor));

        // Convert hex to RGB
        $hexToRgb = function (string $hex): array {
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
            return [$r, $g, $b];
        };

        // Convert RGB to hex
        $rgbToHex = function (int $r, int $g, int $b): string {
            $toHex = function (int $n): string {
                return str_pad(dechex(max(0, min(255, round($n)))), 2, '0', STR_PAD_LEFT);
            };
            return '#' . strtoupper($toHex($r) . $toHex($g) . $toHex($b));
        };

        // Convert RGB to HSL
        $rgbToHsl = function (int $r, int $g, int $b): array {
            $r /= 255;
            $g /= 255;
            $b /= 255;
            $max = max($r, $g, $b);
            $min = min($r, $g, $b);
            $h = $s = 0;
            $l = ($max + $min) / 2;

            if ($max != $min) {
                $d = $max - $min;
                $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
                switch ($max) {
                    case $r:
                        $h = ($g - $b) / $d + ($g < $b ? 6 : 0);
                        break;
                    case $g:
                        $h = ($b - $r) / $d + 2;
                        break;
                    case $b:
                        $h = ($r - $g) / $d + 4;
                        break;
                }
                $h /= 6;
            }
            return [round($h * 360), round($s * 100), round($l * 100)];
        };

        // Convert HSL to RGB
        $hslToRgb = function ($h, $s, $l): array {
            $h /= 360;
            $s /= 100;
            $l /= 100;
            $r = $g = $b = 0;

            if ($s == 0) {
                $r = $g = $b = $l; // achromatic
            } else {
                $hue2rgb = function ($p, $q, $t) {
                    if ($t < 0) $t += 1;
                    if ($t > 1) $t -= 1;
                    if ($t < 1/6) return $p + ($q - $p) * 6 * $t;
                    if ($t < 1/2) return $q;
                    if ($t < 2/3) return $p + ($q - $p) * (2/3 - $t) * 6;
                    return $p;
                };
                $q = $l < 0.5 ? $l * (1 + $s) : $l + $s - $l * $s;
                $p = 2 * $l - $q;
                $r = $hue2rgb($p, $q, $h + 1/3);
                $g = $hue2rgb($p, $q, $h);
                $b = $hue2rgb($p, $q, $h - 1/3);
            }
            return [round($r * 255), round($g * 255), round($b * 255)];
        };

        // Blend two colors (as [r, g, b]) by a given ratio (0 = color1, 1 = color2)
        $blend = function(array $color1, array $color2, float $ratio): array {
            return [
                round($color1[0] * (1 - $ratio) + $color2[0] * $ratio),
                round($color1[1] * (1 - $ratio) + $color2[1] * $ratio),
                round($color1[2] * (1 - $ratio) + $color2[2] * $ratio),
            ];
        };

        // Get base color RGB and HSL
        [$baseR, $baseG, $baseB] = $hexToRgb($cleanColor);
        [$h, $s, $l] = $rgbToHsl($baseR, $baseG, $baseB);
        $isGray = ($s <= 2); // More robust grayscale detection

        // Define the shade keys
        $shadeKeys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

        // Define the lightness values for each shade, centered on the base color's lightness for 500
        // These are relative offsets from the base color's lightness
        $lightnessOffsets = [
            50 => 42,
            100 => 34,
            200 => 24,
            300 => 14,
            400 => 6,
            500 => 0,
            600 => -7,
            700 => -17,
            800 => -27,
            900 => -37,
            950 => -44
        ];

        // Blend ratios for lighter shades (like Tailwind)
        $blendRatios = [
            50 => 0.95,
            100 => 0.9,
            200 => 0.8,
            300 => 0.7,
            400 => 0.6
        ];

        // Clamp a value between 0 and 100
        $clamp = function ($val) {
            return max(0, min(100, $val));
        };

        // Generate all shades
        $result = [];
        foreach ($shadeKeys as $shade) {
            if ($shade === 500) {
                $result[$shade] = '#' . $cleanColor;
            } elseif (isset($blendRatios[$shade])) {
                // Blend with white for lighter shades
                $baseRgb = [$baseR, $baseG, $baseB];
                $white = [255, 255, 255];
                $rgb = $blend($baseRgb, $white, $blendRatios[$shade]);
                $result[$shade] = $rgbToHex($rgb[0], $rgb[1], $rgb[2]);
            } else {
                // For grayscale base, always use s = 0 and h = 0 for all shades
                if ($isGray) {
                    $adjS = 0;
                    $adjH = 0;
                } else {
                    $adjS = $s;
                    $adjH = $h;
                    if ($shade <= 200) {
                        $adjS = max(20, $s - 20);
                    } elseif ($shade <= 400) {
                        $adjS = max(40, $s - 10);
                    }
                }
                $newL = $clamp($l + $lightnessOffsets[$shade]);
                [$r, $g, $b] = $hslToRgb($adjH, $adjS, $newL);
                $result[$shade] = $rgbToHex($r, $g, $b);
            }
        }
        return $result;
    }

    /**
     * Generates a contrasting text color (black or white) for each color shade.
     * For lighter shades, returns black; for darker shades, returns white.
     * Uses luminance to determine contrast.
     *
     * @param string $baseColor The base color in hex format (should be the 500 shade)
     * @return array Array with shade numbers as keys and hex color strings as values
     */
    public static function generateTextColors(string $baseColor): array
    {
        $shades = self::generateColorShades($baseColor);
        $textColors = [];

        $getLuminance = function($hex) {
            $hex = ltrim($hex, '#');
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
            return (0.299 * $r + 0.587 * $g + 0.114 * $b) / 255;
        };

        foreach ($shades as $shade => $hex) {
            $lum = $getLuminance($hex);
            $textColors[$shade] = $lum > 0.55 ? '#22292F' : '#FFFFFF';
        }
        return $textColors;
    }

    /**
     * Generates CSS variables from the given color shades array.
     *
     * @param array $colorShades Array with color types as keys and shade arrays as values.
     *
     * @return string CSS code with variables.
     */
    public static function generateCssVariables(array $colorShades): string
    {
        $cssVariables = '';

        foreach ($colorShades as $colorType => $shades) {
            // Generate text colors for this colorType
            $textColors = self::generateTextColors($shades[500] ?? reset($shades));
            foreach ($shades as $shade => $color) {
                $cssVariables .= "\t--wbk-{$colorType}-{$shade}: {$color};\n";
                // Add text color variable for this shade
                if (isset($textColors[$shade])) {
                    $cssVariables .= "\t--wbk-{$colorType}-text-{$shade}: {$textColors[$shade]};\n";
                }
            
            }
            $imageFilter = self::generateImageColorFilter('#15B8A9', $colorShades[$colorType][500]);
            $cssVariables .= "\t--wbk-{$colorType}-filter-500: {$imageFilter};\n";
        }

        return sprintf(":root {\n%s}", $cssVariables);
    }

    /**
     * Generates a CSS filter that transforms an image from one color to another.
     * This is useful for converting icon colors to match your color palette.
     *
     * @param string $fromColor Original color in hex format (e.g., '#15B8A9')
     * @param string $toColor Target color in hex format (e.g., the 500 shade of your palette)
     * @return string CSS filter property value
     */
    public static function generateImageColorFilter(string $fromColor, string $toColor): string
    {
        // Remove # and convert to RGB
        $hexToRgb = function(string $hex): array {
            $hex = ltrim($hex, '#');
            return [
                hexdec(substr($hex, 0, 2)),
                hexdec(substr($hex, 2, 2)),
                hexdec(substr($hex, 4, 2))
            ];
        };

        [$fromR, $fromG, $fromB] = $hexToRgb($fromColor);
        [$toR, $toG, $toB] = $hexToRgb($toColor);

        // Convert to 0-1 range
        $fromR /= 255; $fromG /= 255; $fromB /= 255;
        $toR /= 255; $toG /= 255; $toB /= 255;

        // Calculate the transformation needed
        // We'll use a combination of filters to achieve the color change
        
        // First, we need to make the image grayscale to remove existing color
        $grayscale = 100;
        
        // Then we'll use sepia to add a base tone
        $sepia = 100;
        
        // Calculate hue rotation needed
        $fromHue = self::rgbToHue($fromR, $fromG, $fromB);
        $toHue = self::rgbToHue($toR, $toG, $toB);
        $hueRotate = $toHue - $fromHue;
        
        // Normalize hue rotation to -180 to 180 range
        while ($hueRotate > 180) $hueRotate -= 360;
        while ($hueRotate < -180) $hueRotate += 360;
        
        // Calculate saturation adjustment
        $fromSat = self::rgbToSaturation($fromR, $fromG, $fromB);
        $toSat = self::rgbToSaturation($toR, $toG, $toB);
        $saturation = $fromSat > 0 ? ($toSat / $fromSat) * 100 : 100;
        $saturation = max(0, min(200, $saturation)); // Clamp between 0% and 200%
        
        // Calculate brightness adjustment
        $fromBrightness = ($fromR + $fromG + $fromB) / 3;
        $toBrightness = ($toR + $toG + $toB) / 3;
        $brightness = $fromBrightness > 0 ? ($toBrightness / $fromBrightness) * 100 : 100;
        $brightness = max(0, min(200, $brightness)); // Clamp between 0% and 200%
        
        // Build the filter string
        $filters = [];
        
        // For better color transformation, we'll use a specific approach
        if (abs($hueRotate) > 5) {
            $filters[] = "hue-rotate({$hueRotate}deg)";
        }
        
        if (abs($saturation - 100) > 5) {
            $filters[] = "saturate(" . round($saturation) . "%)";
        }
        
        if (abs($brightness - 100) > 5) {
            $filters[] = "brightness(" . round($brightness) . "%)";
        }
        
        return empty($filters) ? 'none' : implode(' ', $filters);
    }

    /**
     * Generates CSS filter variables for color transformations.
     *
     * @param array $colorShades Array with color types as keys and shade arrays as values
     * @param string $originalColor The original color that images have (e.g., '#15B8A9')
     * @return string CSS code with filter variables
     */
    public static function generateImageFilterVariables(array $colorShades, string $originalColor): string
    {
        $cssVariables = '';

        foreach ($colorShades as $colorType => $shades) {
            foreach ($shades as $shade => $color) {
                $filter = self::generateImageColorFilter($originalColor, $color);
                $cssVariables .= "\t--wbk-{$colorType}-filter-{$shade}: {$filter};\n";
            }
        }

        return sprintf(":root {\n%s}", $cssVariables);
    }

    /**
     * Helper function to convert RGB to HSL hue component
     */
    private static function rgbToHue(float $r, float $g, float $b): float
    {
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $diff = $max - $min;
        
        if ($diff == 0) return 0;
        
        switch ($max) {
            case $r:
                $hue = (($g - $b) / $diff) * 60;
                if ($hue < 0) $hue += 360;
                break;
            case $g:
                $hue = ((($b - $r) / $diff) + 2) * 60;
                break;
            case $b:
                $hue = ((($r - $g) / $diff) + 4) * 60;
                break;
            default:
                $hue = 0;
        }
        
        return $hue;
    }

    /**
     * Helper function to get saturation from RGB
     */
    private static function rgbToSaturation(float $r, float $g, float $b): float
    {
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $diff = $max - $min;
        $sum = $max + $min;
        
        if ($diff == 0) return 0;
        
        $lightness = $sum / 2;
        
        if ($lightness < 0.5) {
            return $diff / $sum;
        } else {
            return $diff / (2 - $sum);
        }
    }
}