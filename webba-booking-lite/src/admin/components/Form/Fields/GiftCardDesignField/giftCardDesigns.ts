import { __ } from '@wordpress/i18n'
import {
    GiftCardDesignValue,
    GiftCardDesignVariant,
    GiftCardDesignVariantId,
    GiftCardPlaceholder,
} from './types'

export const GIFT_CARD_DESIGN_VARIANTS: GiftCardDesignVariant[] = [
    {
        id: 'botanical_green',
        label: __('Botanical Green', 'webba-booking-lite'),
        background: 'public/images/gift-card-1-background.webp',
        width: 1149,
        height: 1369,
    },
    {
        id: 'spa_wellness',
        label: __('Spa Wellness', 'webba-booking-lite'),
        background: 'public/images/gift-card-2-background.webp',
        width: 1536,
        height: 1024,
    },
    {
        id: 'gold_ribbon',
        label: __('Gold Ribbon', 'webba-booking-lite'),
        background: 'public/images/gift-card-3-background.webp',
        width: 1536,
        height: 1024,
    },
    {
        id: 'black_gold',
        label: __('Black Gold', 'webba-booking-lite'),
        background: 'public/images/gift-card-4-background.webp',
        width: 1536,
        height: 1024,
    },
]

export const GIFT_CARD_DESIGN_PLACEHOLDERS: GiftCardPlaceholder[] = [
    { text: __('Site URL', 'webba-booking-lite'), content: '#site_url' },
    { text: __('Site name', 'webba-booking-lite'), content: '#site_name' },
    { text: __('Site logo', 'webba-booking-lite'), content: '#site_logo' },
    {
        text: __('Gift card code', 'webba-booking-lite'),
        content: '#gift_card_code',
    },
    {
        text: __('Gift card QR code', 'webba-booking-lite'),
        content: '#qr_gift_code',
    },
    {
        text: __('Buyer name', 'webba-booking-lite'),
        content: '#gift_card_buyer_name',
    },
    {
        text: __('Buyer email', 'webba-booking-lite'),
        content: '#gift_card_buyer_email',
    },
    {
        text: __('Recipient name', 'webba-booking-lite'),
        content: '#gift_card_recipient_name',
    },
    {
        text: __('Recipient email', 'webba-booking-lite'),
        content: '#gift_card_recipient_email',
    },
    {
        text: __('Amount', 'webba-booking-lite'),
        content: '#gift_card_amount',
    },
    {
        text: __('Expiration date', 'webba-booking-lite'),
        content: '#gift_card_expiration_date',
    },
]

export const getGiftCardDesignVariant = (
    variantId: string
): GiftCardDesignVariant => {
    return (
        GIFT_CARD_DESIGN_VARIANTS.find((variant) => variant.id === variantId) ||
        GIFT_CARD_DESIGN_VARIANTS[0]
    )
}

export const getDefaultGiftCardOverlayHtml = (
    variantId: GiftCardDesignVariantId = 'botanical_green'
): string => {
    if (variantId === 'spa_wellness') {
        return getSpaWellnessOverlayHtml()
    }

    if (variantId === 'gold_ribbon') {
        return getGoldRibbonOverlayHtml()
    }

    if (variantId === 'black_gold') {
        return getBlackGoldOverlayHtml()
    }

    return getBotanicalGreenOverlayHtml()
}

const getGiftCardQrOverlayHtml = (
    right: string,
    bottom: string,
    width: string
): string =>
    `<div style="position:absolute;right:${right};bottom:${bottom};width:${width};z-index:2;">#qr_gift_code</div>`

const getBotanicalGreenOverlayHtml = (): string => {
    return (
        '<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#234736;font-family:Ubuntu,Arial,Helvetica,sans-serif;font-size:1em;">' +
        '<div style="position:absolute;top:8.6%;left:18%;right:18%;">' +
        '<a href="#site_url" target="_blank" style="text-decoration:none;color:#2b5a9e;">' +
        '<img src="#site_logo" alt="#site_name" style="max-height:2.8em;max-width:6.5em;height:auto;border:0;vertical-align:middle;">' +
        '<span style="display:inline-block;margin-left:0.5em;font-size:1.15em;font-family:Ubuntu,Arial,Helvetica,sans-serif;color:#2b5a9e;">#site_name</span>' +
        '</a>' +
        '</div>' +
        `<div style="position:absolute;top:15.75%;left:16%;right:16%;font-size:1.05em;letter-spacing:0.38em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'A SPECIAL',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:20.5%;left:12%;right:12%;font-size:3.35em;line-height:1;letter-spacing:0.04em;color:#234736;">${__(
            'GIFT CARD',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:28.55%;left:16%;right:16%;font-size:1.05em;letter-spacing:0.28em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'A GIFT FOR',
            'webba-booking-lite'
        )}</div>` +
        '<div style="position:absolute;top:33.5%;left:14%;right:14%;font-size:2.15em;font-style:italic;line-height:1.15;">#gift_card_recipient_name</div>' +
        '<div style="position:absolute;top:37.7%;left:16%;right:16%;font-size:1.15em;color:#8a9a90;font-family:Ubuntu,Arial,Helvetica,sans-serif;">#gift_card_recipient_email</div>' +
        '<div style="position:absolute;top:47.55%;left:14%;right:14%;font-size:3.15em;line-height:1.1;font-weight:bold;">#gift_card_amount</div>' +
        `<div style="position:absolute;top:57.25%;left:16%;right:16%;font-size:1.25em;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'From #gift_card_buyer_name',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:66.7%;left:18%;right:18%;font-size:0.95em;letter-spacing:0.32em;color:#8a958c;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'YOUR CODE',
            'webba-booking-lite'
        )}</div>` +
        '<div style="position:absolute;top:72.15%;left:30%;right:30%;font-size:1.65em;line-height:1.15;letter-spacing:0.06em;font-weight:bold;font-family:Ubuntu,Arial,Helvetica,sans-serif;">#gift_card_code</div>' +
        `<div style="position:absolute;top:79.5%;left:16%;right:16%;font-size:1.15em;color:#6b7c72;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'Valid until #gift_card_expiration_date',
            'webba-booking-lite'
        )}</div>` +
        '<div style="position:absolute;top:83.9%;left:16%;right:16%;font-size:1.15em;color:#6b7c72;font-family:Ubuntu,Arial,Helvetica,sans-serif;">&#9993; #gift_card_buyer_email</div>' +
        `<div style="position:absolute;top:91.55%;left:16%;right:22%;font-size:1.05em;line-height:1.35;color:#5d6e64;font-family:Ubuntu,Arial,Helvetica,sans-serif;">${__(
            'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
            'webba-booking-lite'
        )}</div>` +
        getGiftCardQrOverlayHtml('6.8%', '5.4%', '13.2%') +
        '</div>'
    )
}

const UBUNTU = 'Ubuntu,Arial,Helvetica,sans-serif'
const SPA_SERIF = UBUNTU
const SPA_SANS = UBUNTU
const SPA_SCRIPT = UBUNTU

const getSpaWellnessOverlayHtml = (): string => {
    return (
        `<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;color:#24352c;font-family:${SPA_SERIF};font-size:1em;">` +
        '<div style="position:absolute;top:8.15%;left:7.2%;right:48%;text-align:left;line-height:1;">' +
        '<a href="#site_url" target="_blank" style="text-decoration:none;color:#2f5ebb;">' +
        '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' +
        `<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:${SPA_SANS};color:#2f5ebb;vertical-align:middle;">#site_name</span>` +
        '</a>' +
        '</div>' +
        `<div style="position:absolute;top:13.55%;left:7.2%;right:48%;text-align:left;font-size:1.4em;letter-spacing:0.3em;color:#8a9088;font-family:${SPA_SANS};">${__(
            'RELAX · RECHARGE · FEEL GOOD',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:18.7%;left:5.5%;right:45%;text-align:left;font-size:10.15em;line-height:0.88;letter-spacing:0.015em;white-space:nowrap;color:#24352c;font-family:${SPA_SERIF};">${__(
            'A GIFT CARD',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:30.55%;left:6%;right:48%;text-align:center;font-size:1.45em;letter-spacing:0.52em;color:#8a9088;font-family:${SPA_SANS};">${__(
            'FOR',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:35.05%;left:6%;right:46%;text-align:left;font-size:3.35em;font-style:italic;line-height:1.12;font-weight:400;font-family:${SPA_SERIF};">#gift_card_recipient_name</div>` +
        `<div style="position:absolute;top:43.15%;left:6%;right:48%;text-align:center;font-size:1.5em;color:#747472;font-family:${SPA_SANS};">#gift_card_recipient_email</div>` +
        `<div style="position:absolute;top:51.6%;left:6%;right:48%;text-align:center;font-size:1.45em;letter-spacing:0.14em;color:#4a4a46;font-family:${SPA_SANS};">${__(
            'FROM #gift_card_buyer_name',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:22.55%;left:54%;right:6%;text-align:center;font-size:1.4em;letter-spacing:0.3em;color:#8a9088;font-family:${SPA_SANS};">${__(
            'A SPECIAL GIFT OF',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:31.15%;left:55%;right:5.5%;text-align:center;font-size:6.05em;line-height:1;font-weight:500;color:#b8954a;font-family:${SPA_SERIF};">#gift_card_amount</div>` +
        `<div style="position:absolute;top:44.2%;left:56%;right:7%;text-align:center;font-size:1.4em;letter-spacing:0.34em;color:#8a9088;font-family:${SPA_SANS};">${__(
            'YOUR CODE',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:51.15%;left:58.5%;right:7.5%;text-align:center;font-size:2.4em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#1c1c1c;font-family:${SPA_SANS};">#gift_card_code</div>` +
        `<div style="position:absolute;top:60.45%;left:56%;right:7%;text-align:center;font-size:1.5em;color:#6e6e6a;font-family:${SPA_SANS};">${__(
            'Valid until #gift_card_expiration_date',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:65.45%;left:56%;right:7%;text-align:center;font-size:1.5em;color:#6e6e6a;font-family:${SPA_SANS};">&#9993; #gift_card_buyer_email</div>` +
        `<div style="position:absolute;top:73.9%;left:54%;right:6%;text-align:center;font-size:1.4em;line-height:1.55;color:#5e5e5a;font-family:${SPA_SANS};">${__(
            'Use this code when you book to redeem your gift at<br><a href="#site_url" target="_blank">#site_name</a>.',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:79%;left:58%;right:16%;text-align:right;font-size:2.85em;line-height:1.02;color:#b8954a;font-family:${SPA_SCRIPT};transform:rotate(-11deg);transform-origin:right center;">${__(
            'Wellness<br>is a gift<br><span style="font-size:0.55em;">&#10084;</span>',
            'webba-booking-lite'
        )}</div>` +
        getGiftCardQrOverlayHtml('3.4%', '3.6%', '10.6%') +
        '</div>'
    )
}

const getGoldRibbonOverlayHtml = (): string => {
    const serif = UBUNTU
    const sans = UBUNTU
    const rule =
        '<span style="display:inline-block;width:3.2em;border-top:0.09em solid #c4a574;vertical-align:middle;margin:0 0.75em 0.18em;"></span>'
    const column =
        'left:34%;right:17.3%;text-align:center;'

    return (
        `<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#1c1c16;font-family:${serif};font-size:1em;">` +
        `<div style="position:absolute;top:8.5%;${column}line-height:1;">` +
        '<a href="#site_url" target="_blank" style="display:inline-block;text-decoration:none;color:#2f5ebb;">' +
        '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' +
        `<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:${sans};color:#2f5ebb;vertical-align:middle;">#site_name</span>` +
        '</a>' +
        '</div>' +
        `<div style="position:absolute;top:16.55%;${column}font-size:8.55em;line-height:0.9;letter-spacing:0.06em;white-space:nowrap;color:#b08940;font-family:${serif};">${__(
            'GIFT CARD',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:27.35%;${column}font-size:1.4em;letter-spacing:0.28em;color:#8a8278;font-family:${sans};">${rule}${__(
            'A GIFT FOR',
            'webba-booking-lite'
        )}${rule}</div>` +
        `<div style="position:absolute;top:31.55%;${column}font-size:2.45em;line-height:1.15;font-weight:500;color:#1c1c16;font-family:${serif};">#gift_card_recipient_name</div>` +
        `<div style="position:absolute;top:37.55%;${column}font-size:1.5em;color:#7a7a74;font-family:${sans};">#gift_card_recipient_email</div>` +
        `<div style="position:absolute;top:43.5%;${column}font-size:6.05em;line-height:1;font-weight:500;color:#b08940;font-family:${serif};">#gift_card_amount</div>` +
        `<div style="position:absolute;top:52.55%;${column}font-size:1.5em;color:#6e6e68;font-family:${sans};">${__(
            'From #gift_card_buyer_name',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:63.9%;${column}font-size:1.4em;letter-spacing:0.32em;color:#8a8278;font-family:${sans};">${__(
            'YOUR CODE',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:68.85%;left:41.8%;right:24.3%;text-align:center;font-size:2.75em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#1c1c1c;font-family:${sans};">#gift_card_code</div>` +
        `<div style="position:absolute;top:77.25%;${column}font-size:1.5em;color:#6e6e68;font-family:${sans};">${__(
            'Valid until #gift_card_expiration_date',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:82.55%;${column}font-size:1.5em;color:#6e6e68;font-family:${sans};">&#9993; #gift_card_buyer_email</div>` +
        `<div style="position:absolute;top:88.9%;${column}font-size:1.4em;line-height:1.4;color:#5e5e5a;font-family:${sans};">${__(
            'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
            'webba-booking-lite'
        )}</div>` +
        getGiftCardQrOverlayHtml('5.2%', '5%', '11.2%') +
        '</div>'
    )
}

const getBlackGoldOverlayHtml = (): string => {
    const serif = UBUNTU
    const sans = UBUNTU
    const rule =
        '<span style="display:inline-block;width:3.2em;border-top:0.09em solid #c4a574;vertical-align:middle;margin:0 0.75em 0.18em;"></span>'

    return (
        `<div style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:hidden;text-align:center;color:#f4f1ea;font-family:${serif};font-size:1em;">` +
        `<div style="position:absolute;top:47.2%;left:16.6%;width:11.4%;font-size:1.35em;letter-spacing:0.28em;line-height:1.55;color:#c4a574;font-family:${sans};">${__(
            'A<br>GIFT<br>FOR<br>YOU',
            'webba-booking-lite'
        )}<div style="width:2.5em;border-top:0.08em solid #c4a574;margin:0.75em auto 0;"></div></div>` +
        '<div style="position:absolute;top:5.35%;left:42%;right:8%;line-height:1;">' +
        '<a href="#site_url" target="_blank" style="text-decoration:none;color:#6ea0ff;">' +
        '<img src="#site_logo" alt="#site_name" style="max-height:2.15em;max-width:5.4em;height:auto;border:0;vertical-align:middle;">' +
        `<span style="display:inline-block;margin-left:0.5em;font-size:1.45em;font-family:${sans};color:#6ea0ff;vertical-align:middle;">#site_name</span>` +
        '</a>' +
        '</div>' +
        `<div style="position:absolute;top:12.15%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.42em;color:#c5b8a4;font-family:${sans};">${__(
            'A SPECIAL',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:15.7%;left:41%;right:7%;font-size:8.55em;line-height:0.9;letter-spacing:0.06em;white-space:nowrap;color:#d4b48a;font-family:${serif};">${__(
            'GIFT CARD',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:27.2%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.28em;color:#c5b8a4;font-family:${sans};">${rule}${__(
            'A GIFT FOR',
            'webba-booking-lite'
        )}${rule}</div>` +
        `<div style="position:absolute;top:31.35%;left:42%;right:8%;font-size:2.4em;line-height:1.15;font-weight:500;color:#f4f1ea;font-family:${serif};">#gift_card_recipient_name</div>` +
        `<div style="position:absolute;top:37.4%;left:42%;right:8%;font-size:1.5em;color:#b8b4ac;font-family:${sans};">#gift_card_recipient_email</div>` +
        `<div style="position:absolute;top:44.55%;left:42%;right:8%;font-size:5.45em;line-height:1;font-weight:500;color:#1a120c;font-family:${serif};">#gift_card_amount</div>` +
        `<div style="position:absolute;top:55.15%;left:42%;right:8%;font-size:1.45em;letter-spacing:0.12em;color:#d8d4cc;font-family:${sans};">${__(
            'FROM #gift_card_buyer_name',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:61.55%;left:42%;right:8%;font-size:1.4em;letter-spacing:0.32em;color:#c5b8a4;font-family:${sans};">${__(
            'YOUR CODE',
            'webba-booking-lite'
        )}</div>` +
        '<div style="position:absolute;top:64.5%;left:47.8%;right:16.6%;height:7.95%;border:0.13em solid #c4a574;box-sizing:border-box;"></div>' +
        `<div style="position:absolute;top:66.65%;left:47.8%;right:16.6%;font-size:2.55em;line-height:1.1;letter-spacing:0.04em;font-weight:600;color:#f4f1ea;font-family:${sans};">#gift_card_code</div>` +
        `<div style="position:absolute;top:75.35%;left:42%;right:8%;font-size:1.5em;color:#c8c4bc;font-family:${sans};">${__(
            'Valid until #gift_card_expiration_date',
            'webba-booking-lite'
        )}</div>` +
        `<div style="position:absolute;top:80.85%;left:42%;right:8%;font-size:1.5em;color:#c8c4bc;font-family:${sans};">&#9993; #gift_card_buyer_email</div>` +
        `<div style="position:absolute;top:87.85%;left:42%;right:17%;font-size:1.4em;line-height:1.4;color:#c8c4bc;font-family:${sans};">${__(
            'Use this code when you book to redeem your gift at <a href="#site_url" target="_blank">#site_name</a>.',
            'webba-booking-lite'
        )}</div>` +
        '<div style="position:absolute;top:92.9%;left:42%;right:17%;border-top:0.08em solid #c4a574;"></div>' +
        getGiftCardQrOverlayHtml('4.6%', '4.6%', '11%') +
        '</div>'
    )
}

export const getDefaultGiftCardDesign = (
    variantId: GiftCardDesignVariantId = 'botanical_green'
): GiftCardDesignValue => ({
    variant: variantId,
    html: getDefaultGiftCardOverlayHtml(variantId),
})

export const parseGiftCardDesign = (
    value: unknown
): GiftCardDesignValue | null => {
    if (typeof value !== 'string' || !value.trim()) {
        return null
    }

    const restoreFromVariant = (): GiftCardDesignValue | null => {
        const match = value.match(/"variant"\s*:\s*"([a-z0-9_]+)"/i)
        if (!match) {
            return null
        }

        const variant = getGiftCardDesignVariant(match[1])
        return getDefaultGiftCardDesign(variant.id)
    }

    try {
        const parsed = JSON.parse(value)
        if (!parsed || typeof parsed !== 'object' || !parsed.variant) {
            return restoreFromVariant()
        }

        const variant = getGiftCardDesignVariant(String(parsed.variant))
        const html =
            typeof parsed.html === 'string' && parsed.html.includes('<')
                ? parsed.html
                : getDefaultGiftCardOverlayHtml(variant.id)

        return {
            variant: variant.id,
            html,
        }
    } catch {
        return restoreFromVariant()
    }
}

export const serializeGiftCardDesign = (design: GiftCardDesignValue): string =>
    JSON.stringify(design)
