import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import Stripe from 'stripe';
import exportRouter from './routes/exportRoutes.js';
import privacyRouter from './routes/privacyRoutes.js';
import { appConfig } from './config/env.js';

const stripe = new Stripe(appConfig.stripeSecretKey, {
  apiVersion: '2024-06-20',
});

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));

app.post('/api/create-checkout-session', async (req, res) => {
  const { priceId } = req.body as { priceId?: string };

  if (!priceId) {
    return res.status(400).json({ error: 'Missing priceId in request body.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'http://localhost:3000?checkout=success',
      cancel_url: 'http://localhost:3000?checkout=cancelled',
    });

    return res.json({ sessionId: session.id });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Error creating Stripe checkout session', error);
    return res.status(500).json({
      error: 'Unable to create checkout session.',
      message: error?.message,
    });
  }
});

app.use('/api/export', exportRouter);
app.use('/api/privacy', privacyRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled server error', err);
  res.status(500).json({ error: 'server_error', message: 'An unexpected server error occurred.' });
});

app.listen(appConfig.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${appConfig.port}`);
});




