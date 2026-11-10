# Stripe delayed charge timing

Webba Booking can collect a card at booking time and charge it later (off-session) according to Stripe settings → **Charge timing**.

## Options

| Setting | Behaviour |
|---------|-----------|
| **Immediately** (default) | Unchanged: PaymentIntent + `confirmPayment` at checkout. |
| **X hours before the booking starts** | SetupIntent at checkout; charge at `start − X hours` (UTC). If that time has already passed when the booking is created, payment runs immediately. |
| **When the booking starts** | Charge at booking start. |
| **When the booking ends** | Charge at booking end. |

Existing sites keep **Immediately** until an admin changes the setting. Each booking stores a **snapshot** of timing, amount, and currency so later settings changes do not alter pending jobs.

Booking status stays separate from payment: a saved card does **not** mark the booking paid. Admin-visible **Stripe charge status** values: `card_saved`, `scheduled`, `processing`, `paid`, `failed`.

## Stripe test mode checklist

1. Enable **TEST Mode** and enter sandbox publishable/secret keys.
2. Set **Charge timing** to a delayed option (e.g. 0 hours before, or “when the booking starts” with a near-term slot).
3. Complete a booking with test card `4242 4242 4242 4242`.
4. Confirm SetupIntent succeeds; booking remains unpaid with status `scheduled` / `card_saved`.
5. Trigger the charge:
   - Wait for the scheduled time, or
   - Run WP-Cron / server cron so `wbk_stripe_delayed_charge` fires, or
   - Use a charge_at already in the past to force immediate off-session charge after setup.
6. Decline path: use `4000 0000 0000 0341` (attach succeeds; off-session charge fails). Booking stays unpaid; admin email + customer payment link are sent.
7. Authentication-required path: use Stripe’s off-session SCA test cards; customer receives a recovery link (`?order_payment=`).

Never store raw card numbers or CVC — only Stripe Customer / PaymentMethod IDs.

## Required webhook events

In Stripe Dashboard → Developers → Webhooks, add:

`https://YOUR-SITE/wp-json/webba-booking/v1/stripe-webhook`

Subscribe at least to:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Paste the endpoint signing secret (`whsec_…`) into **Stripe webhook signing secret**.

Webhooks reconcile success/failure if the HTTP request that created the PaymentIntent loses connectivity, and they keep immediate redirect flows in sync.

## Reliable scheduling (do not rely on WP-Cron alone)

Delayed charges use `wp_schedule_single_event` (same approach as Zapier). WP-Cron only runs when the site receives traffic.

For production, configure real system cron, for example every 5 minutes:

```cron
*/5 * * * * curl -s https://YOUR-SITE/wp-cron.php?doing_wp_cron >/dev/null 2>&1
```

Or via WP-CLI:

```cron
*/5 * * * * cd /path/to/wordpress && wp cron event run --due-now >/dev/null 2>&1
```

A daily sweep (`wbk_daily_event`) also picks up due `scheduled` / `card_saved` charges if a single event was missed.

## Duplicate-charge protection

- Stripe **idempotency keys** per booking group + charge window
- Local transient lock while charging
- Reconcile an existing PaymentIntent before creating another
- Declined / authentication-required charges are marked `failed` and are **not** blindly retried
- Transient API/network errors keep the same idempotency key for a safe retry

## Reschedule / cancel

- Reschedule recalculates `charge_at`, replaces the cron job, and updates the snapshot job token.
- Cancel / delete unschedules the pending job.
- Reschedule while `processing` does not start a second charge.

## Notes / limitations

- After successful card setup, `expiration_time` is cleared so “delete unpaid bookings” does not remove delayed-charge bookings before the scheduled charge.
- Amount/currency for the later charge are snapshotted at setup; admin price edits afterward do not change the scheduled charge amount.
- Group bookings share one SetupIntent / one scheduled charge keyed by the first booking’s start/end.
- Google Pay / Apple Pay use the same SetupIntent Elements flow when delayed timing is enabled; wallet availability still depends on device/browser support.
- Frontend assets that include the SetupIntent confirmation path must be rebuilt (`npm run build` or the project’s usual webpack pipeline) for production.
