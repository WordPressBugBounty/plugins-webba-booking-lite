<?php
if (!defined("ABSPATH")) {
    exit();
}

/**
 * Gift card PDF design variants and HTML builders.
 */
class WBK_Gift_Card_Design
{
    const VARIANT_BOTANICAL_GREEN = "botanical_green";
    const VARIANT_SPA_WELLNESS = "spa_wellness";
    const VARIANT_GOLD_RIBBON = "gold_ribbon";
    const VARIANT_BLACK_GOLD = "black_gold";

    /**
     * Gift card PDF design variants.
     *
     * @return array<string, array{label:string,background:string,width:int,height:int}>
     */
    public static function get_variants(): array
    {
        return [
            self::VARIANT_BOTANICAL_GREEN => [
                "label" => __("Botanical Green", "webba-booking-lite"),
                "background" => "public/images/gift-card-1-background.webp",
                "width" => 1149,
                "height" => 1369,
            ],
            self::VARIANT_SPA_WELLNESS => [
                "label" => __("Spa Wellness", "webba-booking-lite"),
                "background" => "public/images/gift-card-2-background.webp",
                "width" => 1536,
                "height" => 1024,
            ],
            self::VARIANT_GOLD_RIBBON => [
                "label" => __("Gold Ribbon", "webba-booking-lite"),
                "background" => "public/images/gift-card-3-background.webp",
                "width" => 1536,
                "height" => 1024,
            ],
            self::VARIANT_BLACK_GOLD => [
                "label" => __("Black Gold", "webba-booking-lite"),
                "background" => "public/images/gift-card-4-background.webp",
                "width" => 1536,
                "height" => 1024,
            ],
        ];
    }

    /**
     * @param string $variant
     * @return array{label:string,background:string,width:int,height:int}|null
     */
    public static function get_variant($variant)
    {
        $variants = self::get_variants();
        return isset($variants[$variant]) ? $variants[$variant] : null;
    }

    /**
     * Variant ids mapped to translated labels for admin selects.
     *
     * @return array<string, string>
     */
    public static function get_variant_choices()
    {
        $choices = [];
        foreach (self::get_variants() as $id => $config) {
            $choices[$id] = $config["label"];
        }

        return $choices;
    }

    /**
     * Build PDF HTML for a stored gift card, preferring the buyer-selected design.
     *
     * @param mixed  $template_value Email template pdf_attachment value.
     * @param string $variant        Gift card design variant id.
     * @return string
     */
    public static function resolve_delivery_html($template_value, $variant)
    {
        $variant = sanitize_key((string) $variant);
        if (self::get_variant($variant)) {
            return self::build_pdf_document(
                $variant,
                self::get_default_overlay_html($variant),
            );
        }

        return self::resolve_attachment_html($template_value);
    }

    /**
     * Default overlay HTML for a design variant.
     *
     * @param string $variant
     * @return string
     */
    public static function get_default_overlay_html($variant)
    {
        if ($variant === self::VARIANT_SPA_WELLNESS) {
            return self::get_spa_wellness_overlay_html();
        }

        if ($variant === self::VARIANT_GOLD_RIBBON) {
            return self::get_gold_ribbon_overlay_html();
        }

        if ($variant === self::VARIANT_BLACK_GOLD) {
            return self::get_black_gold_overlay_html();
        }

        return self::get_botanical_green_overlay_html();
    }

    /**
     * Overlay HTML for the botanical green gift card.
     *
     * @return string
     */
    private static function get_botanical_green_overlay_html()
    {
        return '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#234736;font-family:Ubuntu,Arial,Helvetica,sans-serif;font-size:1em;">' .
            '<div style="position:absolute;top:8.6%;left:18%;right:18%;">' .
            '<a href="#site_url" target="_blank" style="text-decoration:none;color:#2b5a9e;">' .
            '<img src="#site_logo" alt="#site_name" style="max-height:2.8em;max-width:6.5em;height:auto;border:0;vertical-align:middle;">' .
            '<span style="display:inline-block;margin-left:0.5em;font-size:1.15em;font-family:Ubuntu,Arial,Helvetica,sans-serif;color:#2b5a9e;">#site_name</span>' .
            "</a>" .
            "</div>" .
            '<div style="position:absolute;top:15.75%;left:16%;right:16%;font-size:1.05em;letter-spacing:0.38em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __("A SPECIAL", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:20.5%;left:12%;right:12%;font-size:3.35em;line-height:1;letter-spacing:0.04em;color:#234736;">' .
            __("GIFT CARD", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:28.55%;left:16%;right:16%;font-size:1.05em;letter-spacing:0.28em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __("A GIFT FOR", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:33.5%;left:14%;right:14%;font-size:2.15em;font-style:italic;line-height:1.15;">#gift_card_recipient_name</div>' .
            '<div style="position:absolute;top:37.7%;left:16%;right:16%;font-size:1.15em;color:#8a9a90;font-family:Ubuntu,Arial,Helvetica,sans-serif;">#gift_card_recipient_email</div>' .
            '<div style="position:absolute;top:47.55%;left:14%;right:14%;font-size:3.15em;line-height:1.1;font-weight:bold;">#gift_card_amount</div>' .
            '<div style="position:absolute;top:57.25%;left:16%;right:16%;font-size:1.25em;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __("From #gift_card_buyer_name", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:66.7%;left:18%;right:18%;font-size:0.95em;letter-spacing:0.32em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __("YOUR CODE", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:72.15%;left:30%;right:30%;font-size:1.65em;line-height:1.15;letter-spacing:0.06em;font-weight:bold;font-family:Ubuntu,Arial,Helvetica,sans-serif;">#gift_card_code</div>' .
            '<div style="position:absolute;top:79.5%;left:16%;right:16%;font-size:1.15em;color:#6b7c72;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __("Valid until #gift_card_expiration_date", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:83.9%;left:16%;right:16%;font-size:1.15em;color:#6b7c72;font-family:Ubuntu,Arial,Helvetica,sans-serif;">&#9993; #gift_card_buyer_email</div>' .
            '<div style="position:absolute;top:91.55%;left:16%;right:22%;font-size:1.05em;line-height:1.35;color:#5d6e64;font-family:Ubuntu,Arial,Helvetica,sans-serif;">' .
            __(
                'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
                "webba-booking-lite",
            ) .
            "</div>" .
            self::get_qr_placeholder_overlay_html_for_variant(self::VARIANT_BOTANICAL_GREEN) .
            "</div>";
    }

    /**
     * Overlay HTML for the spa wellness gift card.
     *
     * @return string
     */
    private static function get_spa_wellness_overlay_html()
    {
        $serif = "Ubuntu,Arial,Helvetica,sans-serif";
        $sans = "Ubuntu,Arial,Helvetica,sans-serif";
        $script = "Ubuntu,Arial,Helvetica,sans-serif";

        return '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;color:#24352c;font-family:' .
            $serif .
            ';font-size:1em;">' .
            '<div style="position:absolute;top:8.15%;left:7.2%;right:48%;text-align:left;line-height:1;">' .
            '<a href="#site_url" target="_blank" style="text-decoration:none;color:#2f5ebb;">' .
            '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' .
            '<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:' .
            $sans .
            ';color:#2f5ebb;vertical-align:middle;">#site_name</span>' .
            "</a>" .
            "</div>" .
            '<div style="position:absolute;top:13.55%;left:7.2%;right:48%;text-align:left;font-size:1.4em;letter-spacing:0.3em;color:#8a9088;font-family:' .
            $sans .
            ';">' .
            __("RELAX · RECHARGE · FEEL GOOD", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:18.7%;left:5.5%;right:45%;text-align:left;font-size:10.15em;line-height:0.88;letter-spacing:0.015em;white-space:nowrap;color:#24352c;font-family:' .
            $serif .
            ';">' .
            __("A GIFT CARD", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:30.55%;left:6%;right:48%;text-align:center;font-size:1.45em;letter-spacing:0.52em;color:#8a9088;font-family:' .
            $sans .
            ';">' .
            __("FOR", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:35.05%;left:6%;right:46%;text-align:left;font-size:3.35em;font-style:italic;line-height:1.12;font-weight:400;font-family:' .
            $serif .
            ';">#gift_card_recipient_name</div>' .
            '<div style="position:absolute;top:43.15%;left:6%;right:48%;text-align:center;font-size:1.5em;color:#747472;font-family:' .
            $sans .
            ';">#gift_card_recipient_email</div>' .
            '<div style="position:absolute;top:51.6%;left:6%;right:48%;text-align:center;font-size:1.45em;letter-spacing:0.14em;color:#4a4a46;font-family:' .
            $sans .
            ';">' .
            __("FROM #gift_card_buyer_name", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:22.55%;left:54%;right:6%;text-align:center;font-size:1.4em;letter-spacing:0.3em;color:#8a9088;font-family:' .
            $sans .
            ';">' .
            __("A SPECIAL GIFT OF", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:31.15%;left:55%;right:5.5%;text-align:center;font-size:6.05em;line-height:1;font-weight:500;color:#b8954a;font-family:' .
            $serif .
            ';">#gift_card_amount</div>' .
            '<div style="position:absolute;top:44.2%;left:56%;right:7%;text-align:center;font-size:1.4em;letter-spacing:0.34em;color:#8a9088;font-family:' .
            $sans .
            ';">' .
            __("YOUR CODE", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:51.15%;left:58.5%;right:7.5%;text-align:center;font-size:2.4em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#1c1c1c;font-family:' .
            $sans .
            ';">#gift_card_code</div>' .
            '<div style="position:absolute;top:60.45%;left:56%;right:7%;text-align:center;font-size:1.5em;color:#6e6e6a;font-family:' .
            $sans .
            ';">' .
            __("Valid until #gift_card_expiration_date", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:65.45%;left:56%;right:7%;text-align:center;font-size:1.5em;color:#6e6e6a;font-family:' .
            $sans .
            ';">&#9993; #gift_card_buyer_email</div>' .
            '<div style="position:absolute;top:73.9%;left:54%;right:6%;text-align:center;font-size:1.4em;line-height:1.55;color:#5e5e5a;font-family:' .
            $sans .
            ';">' .
            __(
                'Use this code when you book to redeem your gift at<br><a href="#site_url" target="_blank">#site_name</a>.',
                "webba-booking-lite",
            ) .
            "</div>" .
            '<div style="position:absolute;top:79%;left:58%;right:16%;text-align:right;font-size:2.85em;line-height:1.02;color:#b8954a;font-family:' .
            $script .
            ';transform:rotate(-11deg);transform-origin:right center;">' .
            __(
                'Wellness<br>is a gift<br><span style="font-size:0.55em;">&#10084;</span>',
                "webba-booking-lite",
            ) .
            "</div>" .
            self::get_qr_placeholder_overlay_html_for_variant(self::VARIANT_SPA_WELLNESS) .
            "</div>";
    }

    /**
     * Overlay HTML for the gold ribbon gift card.
     *
     * @return string
     */
    private static function get_gold_ribbon_overlay_html()
    {
        $serif = "Ubuntu,Arial,Helvetica,sans-serif";
        $sans = "Ubuntu,Arial,Helvetica,sans-serif";
        $rule =
            '<span style="display:inline-block;width:3.2em;border-top:0.09em solid #c4a574;vertical-align:middle;margin:0 0.75em 0.18em;"></span>';
        $column = "left:34%;right:17.3%;text-align:center;";

        return '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#1c1c16;font-family:' .
            $serif .
            ';font-size:1em;">' .
            '<div style="position:absolute;top:8.5%;' .
            $column .
            'line-height:1;">' .
            '<a href="#site_url" target="_blank" style="display:inline-block;text-decoration:none;color:#2f5ebb;">' .
            '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' .
            '<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:' .
            $sans .
            ';color:#2f5ebb;vertical-align:middle;">#site_name</span>' .
            "</a>" .
            "</div>" .
            '<div style="position:absolute;top:16.55%;' .
            $column .
            "font-size:8.55em;line-height:0.9;letter-spacing:0.06em;white-space:nowrap;color:#b08940;font-family:" .
            $serif .
            ';">' .
            __("GIFT CARD", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:27.35%;' .
            $column .
            "font-size:1.4em;letter-spacing:0.28em;color:#8a8278;font-family:" .
            $sans .
            ';">' .
            $rule .
            __("A GIFT FOR", "webba-booking-lite") .
            $rule .
            "</div>" .
            '<div style="position:absolute;top:31.55%;' .
            $column .
            "font-size:2.45em;line-height:1.15;font-weight:500;color:#1c1c16;font-family:" .
            $serif .
            ';">#gift_card_recipient_name</div>' .
            '<div style="position:absolute;top:37.55%;' .
            $column .
            "font-size:1.5em;color:#7a7a74;font-family:" .
            $sans .
            ';">#gift_card_recipient_email</div>' .
            '<div style="position:absolute;top:43.5%;' .
            $column .
            "font-size:6.05em;line-height:1;font-weight:500;color:#b08940;font-family:" .
            $serif .
            ';">#gift_card_amount</div>' .
            '<div style="position:absolute;top:52.55%;' .
            $column .
            "font-size:1.5em;color:#6e6e68;font-family:" .
            $sans .
            ';">' .
            __("From #gift_card_buyer_name", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:63.9%;' .
            $column .
            "font-size:1.4em;letter-spacing:0.32em;color:#8a8278;font-family:" .
            $sans .
            ';">' .
            __("YOUR CODE", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:68.85%;left:41.8%;right:24.3%;text-align:center;font-size:2.75em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#1c1c1c;font-family:' .
            $sans .
            ';">#gift_card_code</div>' .
            '<div style="position:absolute;top:77.25%;' .
            $column .
            "font-size:1.5em;color:#6e6e68;font-family:" .
            $sans .
            ';">' .
            __("Valid until #gift_card_expiration_date", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:82.55%;' .
            $column .
            "font-size:1.5em;color:#6e6e68;font-family:" .
            $sans .
            ';">&#9993; #gift_card_buyer_email</div>' .
            '<div style="position:absolute;top:88.9%;' .
            $column .
            "font-size:1.4em;line-height:1.4;color:#5e5e5a;font-family:" .
            $sans .
            ';">' .
            __(
                'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
                "webba-booking-lite",
            ) .
            "</div>" .
            self::get_qr_placeholder_overlay_html_for_variant(self::VARIANT_GOLD_RIBBON) .
            "</div>";
    }

    /**
     * Overlay HTML for the black gold gift card.
     *
     * @return string
     */
    private static function get_black_gold_overlay_html()
    {
        $serif = "Ubuntu,Arial,Helvetica,sans-serif";
        $sans = "Ubuntu,Arial,Helvetica,sans-serif";
        $rule =
            '<span style="display:inline-block;width:3.2em;border-top:0.09em solid #c4a574;vertical-align:middle;margin:0 0.75em 0.18em;"></span>';

        return '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#f4f1ea;font-family:' .
            $serif .
            ';font-size:1em;">' .
            '<div style="position:absolute;top:47.2%;left:16.6%;width:11.4%;font-size:1.35em;letter-spacing:0.28em;line-height:1.55;color:#c4a574;font-family:' .
            $sans .
            ';">' .
            __("A<br>GIFT<br>FOR<br>YOU", "webba-booking-lite") .
            '<div style="width:2.5em;border-top:0.08em solid #c4a574;margin:0.75em auto 0;"></div>' .
            "</div>" .
            '<div style="position:absolute;top:5.35%;left:42%;right:8%;line-height:1;">' .
            '<a href="#site_url" target="_blank" style="text-decoration:none;color:#6ea0ff;">' .
            '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' .
            '<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:' .
            $sans .
            ';color:#6ea0ff;vertical-align:middle;">#site_name</span>' .
            "</a>" .
            "</div>" .
            '<div style="position:absolute;top:12.15%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.42em;color:#c5b8a4;font-family:' .
            $sans .
            ';">' .
            __("A SPECIAL", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:15.7%;left:41%;right:7%;font-size:8.55em;line-height:0.9;letter-spacing:0.06em;white-space:nowrap;color:#d4b48a;font-family:' .
            $serif .
            ';">' .
            __("GIFT CARD", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:27.2%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.28em;color:#c5b8a4;font-family:' .
            $sans .
            ';">' .
            $rule .
            __("A GIFT FOR", "webba-booking-lite") .
            $rule .
            "</div>" .
            '<div style="position:absolute;top:31.35%;left:42%;right:8%;font-size:2.4em;line-height:1.15;font-weight:500;color:#f4f1ea;font-family:' .
            $serif .
            ';">#gift_card_recipient_name</div>' .
            '<div style="position:absolute;top:37.4%;left:42%;right:8%;font-size:1.5em;color:#b8b4ac;font-family:' .
            $sans .
            ';">#gift_card_recipient_email</div>' .
            '<div style="position:absolute;top:44.55%;left:42%;right:8%;font-size:5.45em;line-height:1;font-weight:500;color:#1a120c;font-family:' .
            $serif .
            ';">#gift_card_amount</div>' .
            '<div style="position:absolute;top:55.15%;left:42%;right:8%;font-size:1.45em;letter-spacing:0.12em;color:#d8d4cc;font-family:' .
            $sans .
            ';">' .
            __("FROM #gift_card_buyer_name", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:61.55%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.32em;color:#c5b8a4;font-family:' .
            $sans .
            ';">' .
            __("YOUR CODE", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:64.5%;left:47.8%;right:16.6%;height:7.95%;border:0.13em solid #c4a574;box-sizing:border-box;"></div>' .
            '<div style="position:absolute;top:66.65%;left:47.8%;right:16.6%;font-size:2.55em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#f4f1ea;font-family:' .
            $sans .
            ';">#gift_card_code</div>' .
            '<div style="position:absolute;top:75.35%;left:42%;right:8%;font-size:1.5em;color:#c8c4bc;font-family:' .
            $sans .
            ';">' .
            __("Valid until #gift_card_expiration_date", "webba-booking-lite") .
            "</div>" .
            '<div style="position:absolute;top:80.85%;left:42%;right:8%;font-size:1.5em;color:#c8c4bc;font-family:' .
            $sans .
            ';">&#9993; #gift_card_buyer_email</div>' .
            '<div style="position:absolute;top:87.85%;left:42%;right:17%;font-size:1.4em;line-height:1.4;color:#c8c4bc;font-family:' .
            $sans .
            ';">' .
            __(
                'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
                "webba-booking-lite",
            ) .
            "</div>" .
            '<div style="position:absolute;top:92.9%;left:42%;right:17%;border-top:0.08em solid #c4a574;"></div>' .
            self::get_qr_placeholder_overlay_html_for_variant(self::VARIANT_BLACK_GOLD) .
            "</div>";
    }

    /**
     * Bottom-right QR placeholder block for a gift card variant.
     *
     * @param string $variant
     * @return string
     */
    private static function get_qr_placeholder_overlay_html_for_variant($variant)
    {
        if ($variant === self::VARIANT_SPA_WELLNESS) {
            return self::get_qr_placeholder_overlay_html("3.4%", "3.6%", "10.6%");
        }

        if ($variant === self::VARIANT_GOLD_RIBBON) {
            return self::get_qr_placeholder_overlay_html("5.2%", "5%", "11.2%");
        }

        if ($variant === self::VARIANT_BLACK_GOLD) {
            return self::get_qr_placeholder_overlay_html("4.6%", "4.6%", "11%");
        }

        return self::get_qr_placeholder_overlay_html("6.8%", "5.4%", "13.2%");
    }

    /**
     * Bottom-right QR placeholder block for gift card overlays.
     *
     * @param string $right
     * @param string $bottom
     * @param string $width
     * @return string
     */
    private static function get_qr_placeholder_overlay_html($right, $bottom, $width)
    {
        return '<div style="position:absolute;right:' .
            $right .
            ";bottom:" .
            $bottom .
            ";width:" .
            $width .
            ';z-index:2;">#qr_gift_code</div>';
    }

    /**
     * Default stored value for the PDF attachment field.
     *
     * @param string $variant
     * @return string
     */
    public static function get_default_payload($variant = self::VARIANT_BOTANICAL_GREEN)
    {
        if (!self::get_variant($variant)) {
            $variant = self::VARIANT_BOTANICAL_GREEN;
        }

        return wp_json_encode([
            "variant" => $variant,
            "html" => self::get_default_overlay_html($variant),
        ]);
    }

    /**
     * Normalize a PDF attachment value into stored gift-card JSON.
     *
     * @param mixed $value
     * @return string|null JSON payload, or null when the value is not a gift-card design.
     */
    public static function sanitize_stored_payload($value)
    {
        $design = self::parse($value);
        if (!$design) {
            return null;
        }

        $html = $design["html"];
        if (!self::overlay_html_is_unusable($html)) {
            $sanitized = self::sanitize_overlay_html($html);
            if (!self::overlay_html_is_unusable($sanitized)) {
                $html = $sanitized;
            }
        }

        return wp_json_encode(
            [
                "variant" => $design["variant"],
                "html" => $html,
            ],
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
    }

    /**
     * @param mixed $value
     * @return array{variant:string,html:string}|null
     */
    public static function parse($value)
    {
        if (!is_string($value) || trim($value) === "") {
            return null;
        }

        $decoded = self::decode_payload($value);
        $variant = "";
        $html = "";

        if (is_array($decoded) && !empty($decoded["variant"])) {
            $variant = sanitize_key((string) $decoded["variant"]);
            $html = isset($decoded["html"]) ? (string) $decoded["html"] : "";
        } else {
            $variant = self::extract_variant_id($value);
        }

        if ($variant === "" || !self::get_variant($variant)) {
            return null;
        }

        if (self::overlay_html_is_unusable($html)) {
            $html = self::get_default_overlay_html($variant);
        }

        return [
            "variant" => $variant,
            "html" => $html,
        ];
    }

    /**
     * Turn a stored PDF attachment value into HTML for Dompdf.
     *
     * @param mixed $value
     * @return string
     */
    public static function resolve_attachment_html($value)
    {
        $design = self::parse($value);
        if ($design) {
            return self::build_pdf_document($design["variant"], $design["html"]);
        }

        if (!is_string($value)) {
            return "";
        }

        $trimmed = trim($value);
        if (
            $trimmed === "" ||
            self::extract_variant_id($trimmed) !== "" ||
            strpos($trimmed, '"html"') !== false
        ) {
            return "";
        }

        return $trimmed;
    }

    /**
     * @param mixed $value
     * @return array<string, mixed>|null
     */
    private static function decode_payload($value)
    {
        $trimmed = trim((string) $value);
        $candidates = [
            $trimmed,
            wp_unslash($trimmed),
            html_entity_decode($trimmed, ENT_QUOTES, "UTF-8"),
            wp_unslash(html_entity_decode($trimmed, ENT_QUOTES, "UTF-8")),
        ];

        $without_p = preg_replace("#^<p>(.*)</p>$#s", "$1", $trimmed);
        if (is_string($without_p) && $without_p !== $trimmed) {
            $candidates[] = $without_p;
        }

        foreach (array_unique($candidates) as $candidate) {
            $decoded = json_decode($candidate, true);
            if (is_array($decoded) && !empty($decoded["variant"])) {
                return $decoded;
            }
        }

        return null;
    }

    /**
     * @param mixed $value
     * @return string
     */
    private static function extract_variant_id($value)
    {
        if (!is_string($value)) {
            return "";
        }

        if (!preg_match('/"variant"\s*:\s*"([a-z0-9_]+)"/i', $value, $matches)) {
            return "";
        }

        $variant = sanitize_key($matches[1]);
        return self::get_variant($variant) ? $variant : "";
    }

    /**
     * Gift card overlays are positioned HTML. Plain text means tags were stripped.
     *
     * @param string $html
     * @return bool
     */
    private static function overlay_html_is_unusable($html)
    {
        $html = trim((string) $html);
        return $html === "" || strpos($html, "<") === false;
    }

    /**
     * Sanitize overlay markup without running KSES on the JSON envelope.
     *
     * @param string $html
     * @return string
     */
    private static function sanitize_overlay_html($html)
    {
        $allow_styles = function ($styles) {
            $styles[] = "transform";
            $styles[] = "transform-origin";
            $styles[] = "white-space";
            $styles[] = "box-sizing";
            $styles[] = "border-radius";
            $styles[] = "overflow";
            return $styles;
        };

        add_filter("safe_style_css", $allow_styles);
        $html = WBK_Validator::wbk_kses($html);
        remove_filter("safe_style_css", $allow_styles);

        return $html;
    }

    /**
     * Load Ubuntu from the plugin font files for Dompdf.
     *
     * @return string
     */
    private static function get_ubuntu_font_face_css()
    {
        $directory = WP_WEBBA_BOOKING__PLUGIN_DIR . "/src/fonts/ubuntu";
        $faces = [
            ["Ubuntu-Light.ttf", "normal", "300"],
            ["Ubuntu-LightItalic.ttf", "italic", "300"],
            ["Ubuntu-Regular.ttf", "normal", "400"],
            ["Ubuntu-Italic.ttf", "italic", "400"],
            ["Ubuntu-Medium.ttf", "normal", "500"],
            ["Ubuntu-MediumItalic.ttf", "italic", "500"],
            ["Ubuntu-Bold.ttf", "normal", "600"],
            ["Ubuntu-Bold.ttf", "normal", "700"],
            ["Ubuntu-BoldItalic.ttf", "italic", "600"],
            ["Ubuntu-BoldItalic.ttf", "italic", "700"],
        ];

        $css = "";
        foreach ($faces as $face) {
            $path = $directory . "/" . $face[0];
            if (!file_exists($path)) {
                continue;
            }

            $uri = "file://" . str_replace("\\", "/", realpath($path));
            $css .=
                "@font-face{font-family:'Ubuntu';src:url('" .
                $uri .
                "') format('truetype');font-weight:" .
                $face[2] .
                ";font-style:" .
                $face[1] .
                ";}";
        }

        return $css;
    }

    /**
     * @param string $variant
     * @param string $overlay_html
     * @return string
     */
    public static function build_pdf_document($variant, $overlay_html)
    {
        $config = self::get_variant($variant);
        if (!$config) {
            $config = self::get_variants()[self::VARIANT_BOTANICAL_GREEN];
        }

        $background_path = WP_WEBBA_BOOKING__PLUGIN_DIR . "/" . $config["background"];
        $background_uri = "";
        if (file_exists($background_path)) {
            $absolute = str_replace("\\", "/", realpath($background_path));
            $background_uri = "file://" . $absolute;
        }

        $width = (int) $config["width"];
        $height = (int) $config["height"];

        if (strpos($overlay_html, "#qr_gift_code") === false) {
            $overlay_html .= self::get_qr_placeholder_overlay_html_for_variant($variant);
        }

        $font_css = self::get_ubuntu_font_face_css();

        return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>@page{margin:0}html,body{margin:0;padding:0;}' .
            $font_css .
            "</style></head><body>" .
            '<div style="width:' .
            $width .
            "px;height:" .
            $height .
            "px;font-size:" .
            round($height / 100, 2) .
            "px;position:relative;overflow:hidden;background-image:url('" .
            esc_attr($background_uri) .
            "');background-repeat:no-repeat;background-size:" .
            $width .
            "px " .
            $height .
            'px;">' .
            $overlay_html .
            "</div></body></html>";
    }
}
