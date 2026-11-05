const { getStripe } = require('../config/stripe');
const { markOrderPaid, markPaymentFailed, cancelUnpaidOrder, syncRefunds, handleDispute } = require('../services/orderPayments');

// Events to enable on the webhook in the Stripe Dashboard:
//   payment_intent.succeeded, payment_intent.payment_failed, payment_intent.canceled,
//   charge.refunded, charge.dispute.created

// POST /api/payments/stripe/webhook — needs the raw request body for signature checks
exports.stripeWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).send('Stripe is not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('[Stripe webhook] Signature verification failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    const object = event.data.object;
    switch (event.type) {
      case 'payment_intent.succeeded':
        await markOrderPaid(object);
        break;
      case 'payment_intent.payment_failed':
        await markPaymentFailed(object);
        break;
      case 'payment_intent.canceled':
        await cancelUnpaidOrder(object);
        break;
      case 'charge.refunded':
        await syncRefunds(object);
        break;
      case 'charge.dispute.created':
        await handleDispute(object);
        break;
      default:
        break;
    }
    res.json({ received: true });
  } catch (error) {
    // A 500 makes Stripe retry the event later
    console.error(`[Stripe webhook] Failed to handle ${event.type}:`, error);
    res.status(500).send('Webhook handler failed');
  }
};
