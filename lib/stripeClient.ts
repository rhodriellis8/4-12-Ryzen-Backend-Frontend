import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('Missing Stripe publishable key (VITE_STRIPE_PUBLISHABLE_KEY).');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};


