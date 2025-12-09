import React, { useState } from 'react';
import { Check, Star, Flame, ChevronDown } from 'lucide-react';
import { getStripe } from '../lib/stripeClient';
import { BorderTrail } from './core/border-trail';

const BASIC_PRICE_ID = 'price_1SZuU38BPSPtN7MgnPFF3AVy';
const PRO_PRICE_ID = 'price_1SZuUH8BPSPtN7MgJX9aRaag';

const PricingView: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const startCheckout = async (priceId: string) => {
    try {
      setLoadingPriceId(priceId);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      }).catch(err => {
        console.error('Network Error:', err);
        throw new Error('Unable to connect to the billing server. If you are in development, ensure the server is running on port 4000.');
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        console.error('Failed to create checkout session', errorBody);
        throw new Error(errorBody?.error || 'Failed to create checkout session.');
      }

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize.');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error(error);
        alert('Unable to start checkout. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      // Show user-friendly error message
      alert(err.message || 'Unable to start checkout. Please try again.');
    } finally {
      setLoadingPriceId(null);
    }
  };

  return (
    <div>
      {/* Container */}
      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 rounded-[28px] relative overflow-hidden bg-transparent dark:bg-transparent">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 relative z-10">
          <div className="max-w-xl">
             <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Pricing</span>
             <h2 className="text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-50 font-light tracking-tighter mb-3 font-geist">
               Start tracking, <span className="font-medium">scale your growth</span>
             </h2>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
               Choose a plan that fits your trading journey. All plans include secure data encryption, trade analytics, and performance tracking.
             </p>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-full">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${billingCycle === 'yearly' ? 'bg-white dark:bg-zinc-800 text-black dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
            >
              Yearly <span className="text-[9px] ml-1 text-zinc-900 dark:text-zinc-100 font-bold">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto relative z-10 items-center">
          {/* Basic Plan */}
            <PricingCard 
            title="Basic"
            price={billingCycle === 'monthly' ? '19' : '15'}
                subtitle="For traders starting their journey."
                icon={<Star size={16} />}
            features={['Up to 100 trades/month', 'Core analytics dashboard']}
            buttonText={loadingPriceId === BASIC_PRICE_ID ? 'Redirecting…' : 'Start Basic'}
                delay="0"
            onClick={() => startCheckout(BASIC_PRICE_ID)}
            loading={loadingPriceId === BASIC_PRICE_ID}
            />

            {/* Pro Plan */}
            <PricingCard 
                title="Pro" 
            price={billingCycle === 'monthly' ? '49' : '39'}
                subtitle="For serious traders scaling their strategy."
                icon={<Flame size={16} />}
            features={['Unlimited trades', 'Advanced analytics + AI insights']}
            buttonText={loadingPriceId === PRO_PRICE_ID ? 'Redirecting…' : 'Get started'}
                popular
                delay="100"
            onClick={() => startCheckout(PRO_PRICE_ID)}
            loading={loadingPriceId === PRO_PRICE_ID}
            />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 relative z-10 max-w-3xl mx-auto">
             <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-white/10 to-transparent mb-12"></div>
             <h3 className="text-lg font-geist font-light text-zinc-900 dark:text-slate-50 mb-8 text-center">Frequently Asked Questions</h3>
             
             <div className="space-y-3">
                <FaqItem 
                    question="Can I switch plans anytime?" 
                    answer="Yes, upgrade or downgrade instantly from your dashboard. Changes take effect immediately."
                    isOpen={openFaq === 0}
                    onClick={() => toggleFaq(0)}
                />
                <FaqItem 
                    question="Do you offer refunds?" 
                    answer="We offer a 14-day money-back guarantee for all new subscriptions. Contact support for any billing questions."
                    isOpen={openFaq === 1}
                    onClick={() => toggleFaq(1)}
                />
                <FaqItem 
                    question="What payment methods do you accept?" 
                    answer="All major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise plans support wire transfer and invoicing."
                    isOpen={openFaq === 2}
                    onClick={() => toggleFaq(2)}
                />
             </div>
        </div>

      </div>
    </div>
  );
};

interface PricingCardProps {
  title: string;
  price: string;
  subtitle: string;
  icon: React.ReactNode;
  features: string[];
  buttonText: string;
  popular?: boolean;
  delay?: string;
  onClick?: () => void;
  loading?: boolean;
}

const PricingCard = ({ title, price, subtitle, icon, features, buttonText, popular, delay, onClick, loading }: PricingCardProps) => {
    // Styling logic for Popular vs Standard cards
    const containerClasses = popular
        ? "group relative flex flex-col rounded-2xl p-6 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-500/5 dark:shadow-[0_20px_60px_rgba(255,255,255,0.05)] transition-all duration-500 hover:scale-[1.02] lg:scale-105 z-10"
        : "group relative flex flex-col bg-white dark:bg-zinc-900/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800 transition-all duration-500 shadow-sm hover:shadow-md";

    return (
        <div className={containerClasses} style={{ animationDelay: `${delay}ms` }}>
            {popular && (
                <>
                <BorderTrail
                    style={{
                        boxShadow:
                            '0px 0px 60px 30px rgb(255 255 255 / 10%), 0 0 100px 60px rgb(0 0 0 / 10%), 0 0 140px 90px rgb(0 0 0 / 10%)',
                    }}
                    size={60}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 border border-zinc-200 dark:border-zinc-700 z-20">
                    <Flame size={10} className="text-zinc-900 dark:text-zinc-100" fill="currentColor" />
                    <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-900 dark:text-zinc-100">Most Popular</span>
                </div>
                </>
            )}
            
            {/* Top Glow Line */}
            <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent ${popular ? 'via-zinc-500/30 dark:via-zinc-400/70' : 'via-zinc-200 dark:via-white/70'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-base font-bold font-geist text-zinc-900 dark:text-zinc-100">{title}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[140px] leading-snug">{subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shadow-inner text-zinc-900 dark:text-white">
                    {icon}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-baseline gap-1">
                    {price !== "Custom" && <span className="text-base font-medium text-zinc-500 dark:text-zinc-500">$</span>}
                    <span className="text-3xl font-light tracking-tighter text-zinc-900 dark:text-zinc-100 font-geist">{price}</span>
                    {price !== "Custom" && <span className="text-xs text-zinc-500 dark:text-zinc-500">/month</span>}
                </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 min-w-[16px]">
                            <Check size={14} className="text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-snug">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Replaced standard button with GlowingButton */}
            <div className="mt-auto">
                <button
                    onClick={onClick}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {buttonText}
                </button>
            </div>
        </div>
    );
};

const FaqItem = ({ question, answer, isOpen, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`group rounded-2xl p-4 cursor-pointer border border-zinc-200 dark:border-zinc-800 transition-colors duration-200 ${isOpen ? 'bg-zinc-50 dark:bg-zinc-900/50' : 'bg-white dark:bg-zinc-900/30 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'}`}
    >
        <div className="flex justify-between items-center relative z-10">
            <h4 className={`text-sm font-medium ${isOpen ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>{question}</h4>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white rotate-180' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-500'}`}>
                <ChevronDown size={14} />
            </div>
        </div>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out relative z-10 ${isOpen ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed pr-8">
                {answer}
            </p>
        </div>
    </div>
);

export default PricingView;