const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing ${key} in environment.`);
  }
  return value;
};

export const appConfig = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: getRequiredEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'user-content',
  stripeSecretKey: getRequiredEnv('STRIPE_SECRET_KEY'),
};

