# Product Requirements Document (PRD)
## Ryzen - Trading Journal Platform

---

# 1. EXECUTIVE SUMMARY

## Product Name & Tagline
**Ryzen** — *"Track Your Edge. Master Your Psychology."*

## Vision and Mission
**Vision:** To become the most intuitive and powerful trading journal platform that helps traders of all levels transform raw trade data into actionable insights, ultimately improving their performance and profitability.

**Mission:** Empower traders with automated trade imports, comprehensive analytics, and psychological tracking tools to identify behavioral patterns, optimize strategies, and achieve consistent profitability.

## UI & Aesthetic
Ryzen features a **premium, modern, minimalist design** with the following characteristics:

| Aspect | Implementation |
|--------|----------------|
| **Typography** | Inter (primary), Manrope (body), JetBrains Mono (monospace) |
| **Color Palette** | Zinc-based neutral scale with emerald accents for wins, rose for losses |
| **Theme Support** | Full dark/light mode with smooth transitions |
| **Visual Effects** | Glass morphism panels, gradient borders, Vanta.js 3D backgrounds |
| **Custom Cursor** | Branded dot + ring cursor with hover states |
| **Animations** | Subtle fade-ins, scale transitions, shimmer effects on CTAs |
| **Layout** | Fixed sidebar navigation, responsive grid layouts |

Reference: `index.html` lines 16-271 (CSS variables, custom cursor, glass panels, gradient effects)

## Core Value Proposition
1. **Automated Trade Sync** — Connect MT4/MT5 and other brokers to auto-import trades
2. **Visual Analytics** — Equity curves, calendar heat maps, performance metrics
3. **Psychological Tracking** — Correlate emotional state with trading outcomes
4. **Strategy Playbooks** — Codify trading rules as executable checklists
5. **Professional Journal** — Rich text journaling with multi-notebook organization

## Key Differentiators from Competitors

| Feature | Ryzen | TradeZella | Edgewonk | Myfxbook |
|---------|-------|------------|----------|----------|
| Modern UI/UX | ✅ Premium | ✅ Good | ⚠️ Dated | ⚠️ Basic |
| Free Tier | ✅ Planned | ❌ | ❌ | ✅ Limited |
| Strategy Playbooks | ✅ Built-in | ⚠️ Basic | ❌ | ❌ |
| Rich Text Journal | ✅ Full WYSIWYG | ⚠️ Basic | ⚠️ Basic | ❌ |
| Multi-Notebook | ✅ Notion-style | ❌ | ❌ | ❌ |
| Calendar Heatmap | ✅ | ✅ | ✅ | ⚠️ |
| TradingView Integration | ✅ Embedded | ❌ | ❌ | ⚠️ |
| Psychology Metrics | 🚧 Planned | ✅ | ✅ | ❌ |

---

# 2. CURRENT STATE AUDIT

## ✅ What's Built (Implemented Features)

### Frontend Application
| Component | File | Status | Description |
|-----------|------|--------|-------------|
| **Login Screen** | `LoginView.tsx` | ✅ UI Complete | Vanta.js background, email/password form |
| **Dashboard** | `DashboardView.tsx`, `Hero.tsx` | ✅ UI Complete | Stats widgets, equity curve chart |
| **Calendar Widget** | `CalendarWidget.tsx` | ✅ UI Complete | Monthly view with P&L overlay |
| **Trades View** | `TradesView.tsx` | ✅ UI Complete | Trade list + TradingView chart |
| **Journal** | `JournalView.tsx` | ✅ UI Complete | Entry list + rich text editor |
| **Notebooks** | `NotebookView.tsx` | ✅ UI Complete | Multi-notebook with pages & resources |
| **Playbooks** | `PlaybooksView.tsx` | ✅ UI Complete | Strategy cards with rule checklists |
| **Settings** | `SettingsView.tsx` | ✅ UI Complete | Theme toggle, profile form |
| **Pricing** | `PricingView.tsx` | ✅ UI Complete | 3-tier pricing cards with FAQ |
| **Account Manager** | `AccountManagerModal.tsx` | ✅ UI Complete | Broker connection wizard |
| **Rich Text Editor** | `RichTextEditor.tsx` | ✅ UI Complete | Full formatting toolbar |
| **Header** | `Header.tsx` | ✅ UI Complete | Breadcrumbs, notifications, theme toggle |
| **Sidebar** | `Sidebar.tsx` | ✅ UI Complete | Navigation with user profile |

### Working UI Features
- ✅ Dark/Light theme switching with localStorage persistence
- ✅ Responsive sidebar navigation between all views
- ✅ Journal entry CRUD (create, read, update, delete)
- ✅ Notebook/Page CRUD with resources
- ✅ Playbook CRUD with rule management
- ✅ Trade list display with TradingView widget embedding
- ✅ Calendar navigation between months
- ✅ Notification dropdown with read states
- ✅ Account manager modal with wizard steps
- ✅ Animated pricing cards with billing toggle
- ✅ Custom cursor effects

### Third-Party Integrations (Client-Side Only)
- ✅ **TradingView Widget** — Embedded chart display (`TradesView.tsx:39-66`)
- ✅ **Vanta.js** — 3D net background effect (`LoginView.tsx:33-64`)
- ✅ **Recharts** — Equity curve and bar charts (`Hero.tsx:72-84`, `DashboardCard.tsx`)

---

## ⚠️ What's Partially Built

### Account Manager Modal (`AccountManagerModal.tsx`)
| Feature | Status | Gap |
|---------|--------|-----|
| Broker selection UI | ✅ Complete | — |
| Import method selection | ✅ Complete | — |
| Connection form UI | ✅ Complete | — |
| Actual API connection | ❌ Missing | No MetaApi integration |
| Error handling | ❌ Missing | No connection failure states |
| Loading states | ⚠️ Basic | Only "Connecting..." text |

```typescript
// AccountManagerModal.tsx:42-63 - Simulated connection (no real API)
const handleConnect = (e: React.FormEvent) => {
  e.preventDefault();
  setIsConnecting(true);
  // Simulate API call
  setTimeout(() => {
    const newAccount = { /* ... */ };
    onAddAccount(newAccount);
    setIsConnecting(false);
    // ...
  }, 2000);
};
```

### Settings View (`SettingsView.tsx`)
| Feature | Status | Gap |
|---------|--------|-----|
| Theme toggle | ✅ Working | — |
| Profile form UI | ✅ Complete | No save functionality |
| Notification toggles | ⚠️ UI Only | No backend, hardcoded states |

### Trade Data Management
| Feature | Status | Gap |
|---------|--------|-----|
| Display dummy trades | ✅ Working | — |
| Search trades | ⚠️ UI Only | No filtering logic |
| Filter by criteria | ⚠️ UI Only | Filter button present, no modal |
| Manual trade entry | ❌ Missing | No add trade form |
| Edit trades | ❌ Missing | No edit capability |
| Delete trades | ❌ Missing | No delete capability |

### Authentication (`LoginView.tsx`)
| Feature | Status | Gap |
|---------|--------|-----|
| Login form UI | ✅ Complete | — |
| Form validation | ❌ Missing | No input validation |
| Actual authentication | ❌ Missing | `onLogin()` just sets state |
| OAuth providers | ❌ Missing | No Google/GitHub SSO |
| Registration | ❌ Missing | No signup flow |
| Password reset | ❌ Missing | "Forgot Key?" link non-functional |

---

## ❌ What's Missing (Critical Gaps)

### Backend Infrastructure
| Component | Status | Priority |
|-----------|--------|----------|
| Backend server | ❌ Not started | **Critical** |
| REST API endpoints | ❌ Not started | **Critical** |
| Database | ❌ Not started | **Critical** |
| Authentication service | ❌ Not started | **Critical** |
| Session management | ❌ Not started | **Critical** |

### Data Persistence
- ❌ No database — all data stored in React state (lost on refresh)
- ❌ No API calls — all operations are client-side only
- ❌ No user data — hardcoded "John Doe" profile
- ❌ No trade import — dummy data only

### Payment Processing
| Component | Status | Priority |
|-----------|--------|----------|
| Stripe integration | ❌ Not started | High |
| Subscription management | ❌ Not started | High |
| Webhook handling | ❌ Not started | High |
| Free tier limits | ❌ Not started | High |

### Broker Integration
| Component | Status | Priority |
|-----------|--------|----------|
| MetaApi SDK | ❌ Not started | **Critical** |
| Trade sync logic | ❌ Not started | **Critical** |
| Account provisioning | ❌ Not started | **Critical** |
| Real-time updates | ❌ Not started | Medium |

### Analytics Engine
| Component | Status | Priority |
|-----------|--------|----------|
| Performance calculations | ❌ Not started | High |
| Win rate computation | ❌ Not started | High |
| Profit factor | ❌ Not started | High |
| Drawdown analysis | ❌ Not started | Medium |
| AI-powered insights | ❌ Not started | Future |

---

# 3. FEATURE SPECIFICATIONS

## 3.1 Authentication & User Management

### Current State
```typescript
// App.tsx:80-81 - Simple boolean state
const [isLoggedIn, setIsLoggedIn] = useState(false);
```

### Required Implementation

#### Registration Flow
1. **Email + Password**
   - Email validation (format, uniqueness)
   - Password requirements (min 8 chars, 1 number, 1 special)
   - Email verification via magic link
   
2. **OAuth Providers**
   - Google OAuth 2.0
   - GitHub OAuth
   - Discord OAuth (trading community integration)

#### Session Management
| Requirement | Implementation |
|-------------|----------------|
| Token type | JWT (access + refresh) |
| Access token expiry | 15 minutes |
| Refresh token expiry | 7 days (30 if "Remember me") |
| Storage | HttpOnly cookies |
| CSRF protection | Double-submit cookie pattern |

#### User Profile Schema
```typescript
interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  timezone: string;
  currency: 'USD' | 'EUR' | 'GBP';
  subscriptionTier: 'free' | 'starter' | 'pro' | 'elite';
  subscriptionStatus: 'active' | 'past_due' | 'canceled';
  createdAt: Date;
  lastLoginAt: Date;
}
```

#### Security Requirements
- [ ] Password hashing with bcrypt (cost factor 12)
- [ ] Rate limiting on auth endpoints (5 attempts/15 min)
- [ ] Account lockout after 10 failed attempts
- [ ] 2FA via TOTP (optional for Pro+ users)
- [ ] Audit log for sensitive actions

---

## 3.2 Subscription & Payments

### Pricing Tiers (from `PricingView.tsx:48-80`)

| Tier | Monthly | Yearly | Features |
|------|---------|--------|----------|
| **Starter** | $19 | $15/mo | 100 trades/mo, basic analytics |
| **Pro** | $49 | $39/mo | Unlimited trades, AI insights |
| **Elite** | Custom | Custom | Multi-account, API access |

### Feature Access Matrix

| Feature | Free | Starter | Pro | Elite |
|---------|------|---------|-----|-------|
| Manual trade entry | ✅ | ✅ | ✅ | ✅ |
| Journal entries | 10/mo | Unlimited | Unlimited | Unlimited |
| Broker connections | 0 | 1 | 3 | Unlimited |
| Trade sync | ❌ | 100/mo | Unlimited | Unlimited |
| Basic analytics | ✅ | ✅ | ✅ | ✅ |
| Advanced analytics | ❌ | ❌ | ✅ | ✅ |
| AI insights | ❌ | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ❌ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| Custom integrations | ❌ | ❌ | ❌ | ✅ |

### Stripe Integration Requirements

#### Checkout Flow
1. User selects plan → Create Stripe Checkout Session
2. Redirect to Stripe hosted checkout
3. Handle success/cancel redirects
4. Process webhook for payment confirmation

#### Webhook Events to Handle
- `checkout.session.completed` — Activate subscription
- `invoice.payment_succeeded` — Record payment
- `invoice.payment_failed` — Notify user, retry logic
- `customer.subscription.updated` — Sync plan changes
- `customer.subscription.deleted` — Handle cancellation

#### Billing Management
- [ ] View current plan and usage
- [ ] Upgrade/downgrade flow
- [ ] Payment method management
- [ ] Invoice history
- [ ] Cancel subscription (with feedback survey)
- [ ] Refund requests (14-day guarantee)

---

## 3.3 Broker Integration

### Supported Brokers (from `AccountManagerModal.tsx:66-75`)

| Broker | Platform | Priority | Method |
|--------|----------|----------|--------|
| MetaTrader 4 | MT4 | **P0** | MetaApi |
| MetaTrader 5 | MT5 | **P0** | MetaApi |
| cTrader | cTrader | P1 | API TBD |
| TradeLocker | TradeLocker | P2 | API TBD |
| Interactive Brokers | IBKR | P2 | TWS API |
| TopstepX | Prop Firm | P1 | File upload |
| Thinkorswim | TD | P2 | File upload |
| Tradovate | Tradovate | P2 | API TBD |

### MetaApi Integration Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User UI   │────▶│  Backend    │────▶│  MetaApi    │
│  (Modal)    │     │  Service    │     │  Cloud      │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │ 1. Enter creds     │                   │
      ├───────────────────▶│                   │
      │                    │ 2. Provision acc  │
      │                    ├──────────────────▶│
      │                    │                   │
      │                    │ 3. Wait deploy    │
      │                    │◀──────────────────┤
      │ 4. Confirm sync    │                   │
      │◀───────────────────┤                   │
      │                    │ 5. Fetch history  │
      │                    ├──────────────────▶│
      │                    │                   │
      │                    │ 6. Store trades   │
      │                    │◀──────────────────┤
      │ 7. Display trades  │                   │
      │◀───────────────────┤                   │
```

#### Connection Flow Details
1. **Account Provisioning** — Create MetaApi account via REST API
2. **Deployment Wait** — Poll for server deployment (can take 2-10 min)
3. **Credential Validation** — Verify investor password works
4. **Initial Sync** — Fetch all historical deals
5. **Ongoing Sync** — Webhook or polling for new trades

#### Data Schema for Synced Trades
```typescript
interface SyncedTrade {
  id: string;
  externalId: string; // MetaApi deal ID
  accountId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  volume: number;
  openTime: Date;
  openPrice: number;
  closeTime?: Date;
  closePrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  commission: number;
  swap: number;
  profit: number;
  status: 'OPEN' | 'CLOSED';
  syncedAt: Date;
}
```

#### Error Handling
| Error | User Message | Recovery |
|-------|--------------|----------|
| Invalid credentials | "Server or password incorrect" | Retry form |
| Server timeout | "Broker server unavailable" | Retry later |
| Deployment failed | "Setup failed, contact support" | Manual support |
| Rate limited | "Too many requests, wait 1 min" | Auto retry |
| Connection lost | "Sync paused, reconnecting..." | Auto reconnect |

---

## 3.4 Trade Journal Features

### Manual Trade Entry (Not Implemented)

#### Required Fields
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Symbol | string | ✅ | Autocomplete from watchlist |
| Direction | enum | ✅ | Long/Short |
| Entry Date/Time | datetime | ✅ | Default to now |
| Entry Price | number | ✅ | — |
| Position Size | number | ✅ | Lots or contracts |
| Exit Date/Time | datetime | ⚠️ | Required if closed |
| Exit Price | number | ⚠️ | Required if closed |
| Stop Loss | number | ❌ | Optional |
| Take Profit | number | ❌ | Optional |
| Commission | number | ❌ | Default 0 |
| Tags | string[] | ❌ | Custom labels |
| Playbook | reference | ❌ | Link to strategy |
| Notes | text | ❌ | Rich text |
| Screenshots | file[] | ❌ | Chart images |

### Auto-Sync Features
- [ ] Real-time trade updates (via MetaApi webhook)
- [ ] Historical import (all past trades)
- [ ] Duplicate detection (by external ID)
- [ ] Trade pairing (match entries with exits)
- [ ] Multi-account aggregation

### Trade Editing
- [ ] Edit entry/exit prices (manual override)
- [ ] Add/edit tags after sync
- [ ] Attach journal notes to trades
- [ ] Link trade to playbook
- [ ] Upload post-trade screenshots

### Trade Deletion
- [ ] Soft delete (mark as hidden)
- [ ] Hard delete (permanent removal)
- [ ] Bulk delete option
- [ ] Confirmation dialog

### Tags & Categories
Predefined tags:
- Setup type: `A+ Setup`, `B Setup`, `Revenge Trade`, `FOMO`
- Emotion: `Confident`, `Anxious`, `Impatient`, `Disciplined`
- Session: `London`, `New York`, `Asian`, `Overlap`
- Custom user-defined tags

---

## 3.5 Analytics & Insights

### Current State (`Hero.tsx:26-53`)
Static dummy data displayed:
- Net P&L (Monthly): +$12,450
- Win Rate: 68.4%
- Profit Factor: 2.41
- Avg R:R: 1:2.8

### Required Calculations

#### Core Metrics
| Metric | Formula | Current |
|--------|---------|---------|
| Net P&L | Σ(profit - commission - swap) | ❌ Static |
| Win Rate | (Winning trades / Total trades) × 100 | ❌ Static |
| Profit Factor | Gross profits / Gross losses | ❌ Static |
| Average R:R | Avg(profit) / Avg(loss) | ❌ Static |
| Expectancy | (Win% × Avg Win) - (Loss% × Avg Loss) | ❌ Missing |
| Max Drawdown | Max peak-to-trough decline | ❌ Missing |
| Sharpe Ratio | (Avg Return - Risk Free) / Std Dev | ❌ Missing |

#### Time-Based Analysis
- Daily P&L breakdown
- Weekly performance summary
- Monthly/Quarterly reports
- Day-of-week analysis (best trading days)
- Hour-of-day analysis (best trading times)

#### Chart Types Needed
1. **Equity Curve** — Cumulative P&L over time (✅ UI exists)
2. **Calendar Heatmap** — Daily P&L color-coded (✅ UI exists)
3. **Win/Loss Distribution** — Histogram of trade outcomes
4. **Symbol Performance** — P&L by instrument
5. **Session Analysis** — Performance by market session
6. **Drawdown Chart** — Underwater equity analysis

#### Filtering & Date Ranges
- [ ] Custom date range picker
- [ ] Preset ranges (Today, This Week, This Month, YTD, All Time)
- [ ] Filter by symbol
- [ ] Filter by tags
- [ ] Filter by playbook
- [ ] Filter by account

#### Export Capabilities
- [ ] CSV export of trades
- [ ] PDF report generation
- [ ] Excel export with formatting
- [ ] API access for custom integrations (Elite tier)

#### AI-Powered Insights (Future)
- Pattern recognition in losing streaks
- Optimal position sizing recommendations
- Strategy correlation analysis
- Behavioral pattern detection

---

## 3.6 Dashboard & UI

### Current Dashboard Layout (`DashboardView.tsx`)
```
┌──────────────────────────────────────────────────────────┐
│  Welcome back, John                                      │
│  Here's what's happening in your trading workspace...    │
├──────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │Net P&L │  │Win Rate│  │ProfFact│  │Avg R:R │        │
│  │+$12,450│  │ 68.4%  │  │  2.41  │  │ 1:2.8  │        │
│  └────────┘  └────────┘  └────────┘  └────────┘        │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┐  ┌───────────────────┐ │
│  │     Equity Curve Chart      │  │  Focus Playbook   │ │
│  │                             │  │  Gap & Go - 75%   │ │
│  │                             │  ├───────────────────┤ │
│  │                             │  │  Recent Log       │ │
│  │                             │  │  • Trade: ES Long │ │
│  └─────────────────────────────┘  └───────────────────┘ │
├──────────────────────────────────────────────────────────┤
│                   Trading Calendar                       │
│  ┌────┬────┬────┬────┬────┬────┬────┐                  │
│  │Sun │Mon │Tue │Wed │Thu │Fri │Sat │                  │
│  ├────┼────┼────┼────┼────┼────┼────┤                  │
│  │    │ +$ │    │ -$ │    │ +$ │    │  ...             │
│  └────┴────┴────┴────┴────┴────┴────┘                  │
└──────────────────────────────────────────────────────────┘
```

### Navigation Structure (`Sidebar.tsx`)
```
┌─────────────────┐
│  [R] Ryzen      │  ← Logo
├─────────────────┤
│  ◉ Dashboard    │  ← Views
│  ◉ Trades       │
│  ◉ Journal      │
│  ◉ Notebooks    │
│  ◉ Playbooks    │
├─────────────────┤
│  ⚙ Settings     │  ← Bottom section
│  ↪ Log Out      │
├─────────────────┤
│  [JD] John Doe  │  ← User profile
│       Pro Plan  │
└─────────────────┘
```

### Mobile Responsiveness
| Breakpoint | Behavior | Status |
|------------|----------|--------|
| Desktop (>1024px) | Full sidebar + main content | ✅ Works |
| Tablet (768-1024px) | Collapsed sidebar | ⚠️ Partial |
| Mobile (<768px) | Bottom navigation | ❌ Missing |

### Dark/Light Themes
```typescript
// App.tsx:93-110 - Theme persistence
const [isDarkMode, setIsDarkMode] = useState(() => {
  const storedTheme = localStorage.getItem('theme');
  return storedTheme === 'light' ? false : true;
});

useEffect(() => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}, [isDarkMode]);
```

---

# 4. TECHNICAL ARCHITECTURE

## Tech Stack (Current vs. Required)

### Frontend (Current)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI framework |
| TypeScript | 5.8.2 | Type safety |
| Vite | 6.2.0 | Build tool |
| Tailwind CSS | CDN | Styling |
| Recharts | 3.5.0 | Charts |
| Lucide React | 0.555.0 | Icons |

### Backend (Required - Not Implemented)
| Technology | Recommendation | Purpose |
|------------|----------------|---------|
| Node.js + Express | or Next.js API | API server |
| PostgreSQL | or MongoDB | Primary database |
| Redis | — | Session cache, rate limiting |
| JWT | — | Authentication tokens |
| Stripe SDK | — | Payments |
| MetaApi SDK | — | Broker integration |

### Infrastructure (Required)
| Service | Recommendation | Purpose |
|---------|----------------|---------|
| Vercel | or Railway | Frontend hosting |
| Railway | or Render | Backend hosting |
| Supabase | or PlanetScale | Managed database |
| Upstash | — | Serverless Redis |
| Cloudflare R2 | or S3 | File storage |

---

## API Design

### Proposed Endpoints

#### Authentication
```
POST   /api/auth/register        Create account
POST   /api/auth/login           Email/password login
POST   /api/auth/logout          Invalidate session
POST   /api/auth/refresh         Refresh access token
GET    /api/auth/me              Get current user
POST   /api/auth/forgot-password Send reset email
POST   /api/auth/reset-password  Set new password
POST   /api/auth/oauth/:provider OAuth callback
```

#### Users
```
GET    /api/users/profile        Get profile
PATCH  /api/users/profile        Update profile
DELETE /api/users/account        Delete account
```

#### Accounts (Broker Connections)
```
GET    /api/accounts             List connected accounts
POST   /api/accounts             Add new account
GET    /api/accounts/:id         Get account details
DELETE /api/accounts/:id         Remove account
POST   /api/accounts/:id/sync    Trigger manual sync
```

#### Trades
```
GET    /api/trades               List trades (paginated)
POST   /api/trades               Create manual trade
GET    /api/trades/:id           Get trade details
PATCH  /api/trades/:id           Update trade
DELETE /api/trades/:id           Delete trade
```

#### Journal
```
GET    /api/journal/entries      List journal entries
POST   /api/journal/entries      Create entry
GET    /api/journal/entries/:id  Get entry
PATCH  /api/journal/entries/:id  Update entry
DELETE /api/journal/entries/:id  Delete entry
```

#### Notebooks
```
GET    /api/notebooks            List notebooks
POST   /api/notebooks            Create notebook
PATCH  /api/notebooks/:id        Update notebook
DELETE /api/notebooks/:id        Delete notebook
GET    /api/notebooks/:id/pages  List pages
POST   /api/notebooks/:id/pages  Create page
```

#### Playbooks
```
GET    /api/playbooks            List playbooks
POST   /api/playbooks            Create playbook
PATCH  /api/playbooks/:id        Update playbook
DELETE /api/playbooks/:id        Delete playbook
```

#### Analytics
```
GET    /api/analytics/summary    Get dashboard summary
GET    /api/analytics/equity     Get equity curve data
GET    /api/analytics/calendar   Get calendar data
GET    /api/analytics/breakdown  Get performance breakdown
```

#### Subscriptions
```
GET    /api/subscription         Get current subscription
POST   /api/subscription/checkout Create checkout session
POST   /api/subscription/portal   Get billing portal URL
POST   /api/webhooks/stripe       Stripe webhook handler
```

### Authentication Flow
```
┌─────────┐                ┌─────────┐               ┌─────────┐
│ Client  │                │ Server  │               │   DB    │
└────┬────┘                └────┬────┘               └────┬────┘
     │  1. POST /auth/login     │                        │
     │  {email, password}       │                        │
     ├─────────────────────────▶│                        │
     │                          │  2. Verify credentials │
     │                          ├───────────────────────▶│
     │                          │                        │
     │                          │  3. User data          │
     │                          │◀───────────────────────┤
     │                          │                        │
     │  4. Set-Cookie:          │                        │
     │     access_token (15m)   │                        │
     │     refresh_token (7d)   │                        │
     │◀─────────────────────────┤                        │
     │                          │                        │
     │  5. GET /api/trades      │                        │
     │  Cookie: access_token    │                        │
     ├─────────────────────────▶│                        │
     │                          │  6. Verify JWT         │
     │                          │  7. Fetch trades       │
     │                          ├───────────────────────▶│
     │  8. Response             │◀───────────────────────┤
     │◀─────────────────────────┤                        │
```

### Rate Limiting
| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Auth endpoints | 5 requests | 15 min |
| API reads | 100 requests | 1 min |
| API writes | 30 requests | 1 min |
| File uploads | 10 requests | 1 hour |
| Webhooks | 1000 requests | 1 min |

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "received": "invalid-email"
    }
  }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency CHAR(3) DEFAULT 'USD',
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  stripe_customer_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);
```

### Broker Accounts Table
```sql
CREATE TABLE broker_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  broker_type VARCHAR(50) NOT NULL, -- 'mt4', 'mt5', etc.
  account_name VARCHAR(100),
  external_account_id VARCHAR(100), -- MetaApi account ID
  server VARCHAR(100),
  login VARCHAR(50),
  is_demo BOOLEAN DEFAULT false,
  balance DECIMAL(15,2),
  currency CHAR(3),
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, error
  last_sync_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, broker_type, login, server)
);
```

### Trades Table
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES broker_accounts(id) ON DELETE SET NULL,
  external_id VARCHAR(100), -- Broker's deal ID
  symbol VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL, -- 'LONG' or 'SHORT'
  volume DECIMAL(15,4) NOT NULL,
  open_time TIMESTAMP NOT NULL,
  open_price DECIMAL(20,8) NOT NULL,
  close_time TIMESTAMP,
  close_price DECIMAL(20,8),
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  commission DECIMAL(10,2) DEFAULT 0,
  swap DECIMAL(10,2) DEFAULT 0,
  profit DECIMAL(15,2),
  status VARCHAR(10) DEFAULT 'OPEN', -- OPEN, CLOSED
  source VARCHAR(20) DEFAULT 'manual', -- manual, sync
  playbook_id UUID REFERENCES playbooks(id),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(account_id, external_id)
);
```

### Journal Entries Table
```sql
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  trade_ids UUID[], -- Linked trades
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Notebooks Table
```sql
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT,
  position INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notebook_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID REFERENCES notebooks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Playbooks Table
```sql
CREATE TABLE playbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE playbook_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id UUID REFERENCES playbooks(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  position INT DEFAULT 0
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(100) UNIQUE,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_trades_user_time ON trades(user_id, close_time DESC);
CREATE INDEX idx_trades_symbol ON trades(user_id, symbol);
CREATE INDEX idx_trades_status ON trades(user_id, status);
CREATE INDEX idx_journal_user ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_accounts_user ON broker_accounts(user_id);
```

---

## Security Requirements

### Authentication Security
- [x] Password hashing with bcrypt (cost 12)
- [ ] JWT with RS256 algorithm
- [ ] Token rotation on security-sensitive actions
- [ ] IP-based session validation

### Data Encryption
| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| Passwords | bcrypt hash | HTTPS |
| API keys | AES-256 encryption | HTTPS |
| PII (email, name) | Database encryption | HTTPS |
| Trade data | Standard storage | HTTPS |
| File uploads | S3 SSE | HTTPS |

### API Security
- [ ] HTTPS only (HSTS header)
- [ ] CORS restricted to app domains
- [ ] Rate limiting (per-user and per-IP)
- [ ] Request validation with Zod/Joi
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (content sanitization)

### PII Handling
- Store minimum necessary PII
- Allow users to export their data (GDPR)
- Allow users to delete their account
- Audit log for data access
- Data retention policy (deleted after 30 days)

### Compliance Considerations
- [ ] GDPR compliance (EU users)
- [ ] CCPA compliance (California users)
- [ ] Cookie consent banner
- [ ] Privacy policy
- [ ] Terms of service

---

# 5. USER FLOWS

## 5.1 New User Onboarding

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NEW USER ONBOARDING                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Visit   │────▶│  Sign    │────▶│  Verify  │────▶│  Select  │
│  Landing │     │  Up      │     │  Email   │     │  Plan    │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                   │
                      ▼                                   ▼
               ┌──────────┐                        ┌──────────┐
               │  OAuth   │                        │  Enter   │
               │  Option  │                        │  Payment │
               └──────────┘                        └──────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  View    │◀────│  Sync    │◀────│  Enter   │◀────│  Select  │
│  Dash    │     │  Trades  │     │  Creds   │     │  Broker  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘

STEPS:
1. User lands on marketing page
2. Clicks "Get Started" → Registration form
3. Enters email + password OR uses OAuth
4. Receives verification email, clicks link
5. Redirected to pricing page to select plan
6. Free: Skip payment → Dashboard
   Paid: Enter card → Stripe checkout → Dashboard
7. Dashboard prompts to connect first broker
8. User selects broker (MT4/MT5)
9. Enters server, login, investor password
10. System provisions MetaApi account
11. Waits for deployment (loading state)
12. Syncs historical trades
13. Displays trades in dashboard with stats
```

## 5.2 Daily Journal Entry Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DAILY JOURNAL WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Open    │────▶│  Review  │────▶│  Click   │────▶│  Write   │
│  App     │     │  Trades  │     │  Journal │     │  Entry   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Review  │◀────│  Auto    │◀────│  Add     │◀────│  Link    │
│  Entry   │     │  Save    │     │  Tags    │     │  Trades  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘

TYPICAL FLOW:
1. Trader opens Ryzen at end of trading day
2. Dashboard shows day's P&L summary
3. Clicks "Journal" in sidebar
4. Clicks "+ New Entry" button
5. Title auto-fills with date: "Sep 24, 2024 - Daily Review"
6. Rich text editor opens
7. Trader writes analysis:
   - Market conditions
   - Trades taken and reasoning
   - Emotional state
   - Lessons learned
8. Links relevant trades using @ mention
9. Adds tags: #psychology, #overtrading
10. Content auto-saves every 30 seconds
11. Trader can review past entries in list
```

## 5.3 Payment Upgrade Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        UPGRADE TO PRO FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Hit     │────▶│  See     │────▶│  Click   │────▶│  Review  │
│  Limit   │     │  Upgrade │     │  Upgrade │     │  Plans   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Access  │◀────│  Return  │◀────│  Enter   │◀────│  Select  │
│  Pro     │     │  to App  │     │  Payment │     │  Pro     │
└──────────┘     └──────────┘     └──────────┘     └──────────┘

DECISION POINTS:
• User at 90 trades (Starter limit 100): Warning banner
• User at 100 trades: Sync paused, upgrade prompt
• User tries AI feature: Paywall modal
• User clicks Pricing in nav: Views comparison
```

## 5.4 Broker Disconnection/Reconnection

```
┌─────────────────────────────────────────────────────────────────────┐
│                   BROKER RECONNECTION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

┌──────────┐     ┌──────────┐     ┌──────────┐
│  Sync    │────▶│  Error   │────▶│  Notify  │
│  Fails   │     │  Logged  │     │  User    │
└──────────┘     └──────────┘     └──────────┘
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
               ┌──────────┐                      ┌──────────┐
               │  Auto    │                      │  Manual  │
               │  Retry   │                      │  Reauth  │
               └──────────┘                      └──────────┘
                      │                                 │
                      ▼                                 ▼
               ┌──────────┐                      ┌──────────┐
               │  Success │                      │  Update  │
               │  Resume  │                      │  Creds   │
               └──────────┘                      └──────────┘
                                                        │
                                                        ▼
                                                 ┌──────────┐
                                                 │  Resync  │
                                                 │  Trades  │
                                                 └──────────┘

ERROR SCENARIOS:
1. Password changed at broker → Prompt for new password
2. Account disabled → Show error, suggest contact broker
3. Server unavailable → Auto-retry with exponential backoff
4. MetaApi service down → Show status, auto-retry
5. Rate limited → Wait and retry automatically
```

---

# 6. INTEGRATION REQUIREMENTS

## 6.1 MetaApi Integration

### Account Provisioning Flow
```javascript
// Pseudocode for MetaApi integration

// Step 1: Create MetaApi account
const createMetaApiAccount = async (credentials) => {
  const metaApi = new MetaApi(process.env.METAAPI_TOKEN);
  
  const account = await metaApi.metatraderAccountApi.createAccount({
    name: `Ryzen-${userId}`,
    type: 'cloud-g2',
    login: credentials.login,
    password: credentials.password,
    server: credentials.server,
    platform: credentials.platform, // 'mt4' or 'mt5'
    magic: 0
  });
  
  return account;
};

// Step 2: Wait for deployment
const waitForDeployment = async (accountId) => {
  const account = await metaApi.metatraderAccountApi.getAccount(accountId);
  await account.waitDeployed(); // Can take 2-10 minutes
  return account;
};

// Step 3: Fetch deal history
const syncDeals = async (account, startDate) => {
  const connection = account.getRPCConnection();
  await connection.connect();
  
  const deals = await connection.getDealsByTimeRange(startDate, new Date());
  return deals;
};
```

### Deployment Wait Times
| Scenario | Expected Wait |
|----------|---------------|
| First connection | 2-10 minutes |
| Reconnection | 30 seconds - 2 minutes |
| Server change | 2-5 minutes |

### Sync Frequency
| Tier | Sync Type | Frequency |
|------|-----------|-----------|
| Free | Manual | On demand |
| Starter | Batch | Every 1 hour |
| Pro | Near real-time | Every 5 minutes |
| Elite | Real-time | WebSocket stream |

### Credit/Usage Monitoring
- Monitor MetaApi credit usage
- Alert at 80% usage threshold
- Pause sync at 95% to prevent overages
- Show usage in user dashboard

### Fallback Strategies
1. **MetaApi unavailable:** Queue sync requests, retry later
2. **Invalid credentials:** Prompt user to re-authenticate
3. **Broker server down:** Notify user, auto-retry
4. **Rate limited:** Implement exponential backoff

---

## 6.2 Stripe Integration

### Checkout Session Creation
```javascript
// Pseudocode for Stripe checkout

const createCheckoutSession = async (userId, priceId) => {
  const session = await stripe.checkout.sessions.create({
    customer: user.stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1
    }],
    mode: 'subscription',
    success_url: `${APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/pricing`,
    metadata: {
      userId: userId
    }
  });
  
  return session.url;
};
```

### Webhook Handling
```javascript
// Required webhook handlers

const webhookHandlers = {
  'checkout.session.completed': async (event) => {
    // Activate subscription
    const session = event.data.object;
    const userId = session.metadata.userId;
    await activateSubscription(userId, session.subscription);
  },
  
  'invoice.payment_succeeded': async (event) => {
    // Record successful payment
    const invoice = event.data.object;
    await recordPayment(invoice);
  },
  
  'invoice.payment_failed': async (event) => {
    // Handle failed payment
    const invoice = event.data.object;
    await handleFailedPayment(invoice);
    await sendPaymentFailedEmail(invoice.customer);
  },
  
  'customer.subscription.updated': async (event) => {
    // Sync subscription changes
    const subscription = event.data.object;
    await syncSubscription(subscription);
  },
  
  'customer.subscription.deleted': async (event) => {
    // Handle cancellation
    const subscription = event.data.object;
    await handleCancellation(subscription);
  }
};
```

### Payment Retry Logic
| Attempt | Delay | Action |
|---------|-------|--------|
| 1 | 0 days | Initial charge |
| 2 | 3 days | Retry, send email |
| 3 | 5 days | Retry, warning email |
| 4 | 7 days | Final retry, downgrade to free |

---

## 6.3 Other Integrations

### TradingView Widget (Current)
Reference: `TradesView.tsx:37-66`
- Widget loads dynamically
- Symbol passed from selected trade
- Theme syncs with app dark/light mode

### Vanta.js Background (Current)
Reference: `LoginView.tsx:33-64`
- 3D net animation on login screen
- Color matches accent theme
- Performance-optimized for mobile

### Future Integrations
| Service | Purpose | Priority |
|---------|---------|----------|
| Discord OAuth | Community login | P1 |
| Telegram Bot | Trade alerts | P2 |
| Email (SendGrid) | Notifications | P1 |
| Sentry | Error tracking | P1 |
| PostHog | Analytics | P2 |
| OpenAI API | AI insights | P3 |

---

# 7. UI/UX REQUIREMENTS

## Design System

### Colors (from `index.html` CSS variables)
```css
:root {
  /* Light Mode */
  --color-accent: #18181b;      /* Dark cursor */
  --bg-main: #fafafa;           /* Zinc 50 */
  --text-primary: #18181b;      /* Zinc 900 */
  --btn-bg: #ffffff;
  --btn-text: #1e1b4b;          /* Dark Indigo */
}

.dark {
  /* Dark Mode */
  --color-accent: #ffffff;       /* White cursor */
  --bg-main: #000000;           /* Pure black */
  --text-primary: #e4e4e7;      /* Zinc 200 */
  --btn-bg: #101010;
  --btn-text: #ffffff;
}

/* Semantic Colors */
--color-success: #10b981;       /* Emerald 500 - Wins */
--color-error: #f43f5e;         /* Rose 500 - Losses */
--color-warning: #f59e0b;       /* Amber 500 */
--color-info: #3b82f6;          /* Blue 500 */
```

### Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings | Inter | 400-600 | 24-32px |
| Body | Manrope | 400 | 14-16px |
| Labels | Manrope | 600 | 10-12px |
| Monospace | JetBrains Mono | 400-500 | 12-14px |

### Spacing Scale
```
4px  - xs (gap-1)
8px  - sm (gap-2)
12px - md (gap-3)
16px - base (gap-4)
24px - lg (gap-6)
32px - xl (gap-8)
48px - 2xl (gap-12)
```

### Component Library
Using custom components built with Tailwind:
- `glass-panel` — Frosted glass effect cards
- `border-gradient` — Animated gradient borders
- `shiny-cta` — Animated CTA buttons
- `btn` — Glowing button with layered shadows

## Accessibility Standards (WCAG 2.1)
- [ ] Color contrast ratio ≥ 4.5:1 (AA)
- [ ] Focus indicators on all interactive elements
- [ ] Keyboard navigation support
- [ ] Screen reader labels (aria-label)
- [ ] Reduced motion preference support
- [ ] Skip-to-content link

## Mobile-First Considerations
- [ ] Touch targets ≥ 44x44px
- [ ] Swipe gestures for navigation
- [ ] Bottom navigation bar on mobile
- [ ] Collapsible sidebar on tablet
- [ ] Responsive typography scaling

## Loading States
| State | Implementation |
|-------|----------------|
| Page load | Skeleton screens |
| Data fetch | Spinner with text |
| Button action | Disabled + spinner |
| Trade sync | Progress bar with percentage |
| Long operation | Toast notifications |

## Error Messages
| Error Type | Display |
|------------|---------|
| Validation | Inline below field |
| API error | Toast notification |
| Connection | Banner at top |
| 404 | Full page |
| 500 | Full page with retry |

## Empty States
| View | Empty State Message |
|------|---------------------|
| Trades | "No trades yet. Connect a broker or add manually." |
| Journal | "Start your journaling journey. Create your first entry." |
| Playbooks | "Define your edge. Create your first strategy." |
| Notebooks | "Organize your research. Create a notebook." |

---

# 8. SUCCESS METRICS & KPIs

## User Acquisition
| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| Website visitors | 5,000 | 25,000 |
| Sign-ups | 500 | 3,000 |
| Sign-up rate | 10% | 12% |

## Activation
| Metric | Definition | Target |
|--------|------------|--------|
| Broker connection rate | % users who connect a broker | 60% |
| First trade logged | % users with ≥1 trade | 80% |
| Journal started | % users with ≥1 entry | 50% |
| Activation (composite) | Broker + 5 trades + 1 journal | 40% |

## Retention
| Metric | Definition | Target |
|--------|------------|--------|
| D1 retention | % returning day after signup | 60% |
| D7 retention | % returning within 7 days | 40% |
| D30 retention | % returning within 30 days | 25% |
| MAU | Monthly active users | Track |

## Conversion
| Metric | Definition | Target |
|--------|------------|--------|
| Free → Paid | % free users upgrading | 5% |
| Trial → Paid | % trial users converting | 20% |
| Upgrade to Pro | % Starter → Pro | 15% |

## Revenue
| Metric | Definition | Target (Month 3) |
|--------|------------|------------------|
| MRR | Monthly recurring revenue | $5,000 |
| ARPU | Avg revenue per user | $25 |
| Churn | % subscribers canceling/mo | <5% |
| LTV | Lifetime value | $300 |

## Engagement
| Metric | Definition | Target |
|--------|------------|--------|
| DAU | Daily active users | Track |
| Trades logged/user/mo | Avg trades per user | 50 |
| Journal entries/user/mo | Avg entries per user | 8 |
| Session duration | Avg time in app | 15 min |

---

# 9. RISK ASSESSMENT

## Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| MetaApi downtime | High | Medium | Queue system, status page |
| MetaApi pricing changes | High | Low | Budget buffer, alternative APIs |
| Broker connection failures | Medium | High | Robust retry logic, clear errors |
| Data loss | Critical | Low | Daily backups, redundancy |
| Security breach | Critical | Low | Audits, encryption, monitoring |
| Scaling issues | High | Medium | Load testing, auto-scaling |

## Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Strong competition | High | High | Focus on UX, unique features |
| Low conversion rate | High | Medium | Optimize onboarding, pricing |
| Churn rate too high | High | Medium | Feature stickiness, support |
| Regulatory changes | Medium | Low | Monitor regulations, legal review |

## Security/Compliance Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| GDPR violation | Critical | Medium | Data handling review, DPO |
| PCI non-compliance | Critical | Low | Stripe handles card data |
| Credential theft | Critical | Low | Encryption, security audits |

## Third-Party Dependencies

| Dependency | Risk | Mitigation |
|------------|------|------------|
| MetaApi | Service disruption | Alternative brokers, manual entry |
| Stripe | Payment issues | Backup processor evaluation |
| Vercel/Railway | Hosting outage | Multi-region deployment |
| Supabase | Database issues | Regular backups, failover |

---

# 10. DEVELOPMENT ROADMAP

## Phase 1: MVP (Weeks 1-4)
**Goal:** Launch with core functionality to validate market demand

### Week 1-2: Backend Foundation
- [ ] Set up Node.js/Express backend
- [ ] PostgreSQL database with schema
- [ ] User authentication (email + JWT)
- [ ] Basic API endpoints (users, trades, journal)
- [ ] Environment setup (dev, staging, prod)

### Week 3: Broker Integration
- [ ] MetaApi SDK integration
- [ ] Account provisioning flow
- [ ] Trade sync (batch mode)
- [ ] Error handling and retry logic

### Week 4: Frontend Integration
- [ ] Connect frontend to real API
- [ ] Replace dummy data with real data
- [ ] Implement loading/error states
- [ ] Fix any UI bugs from integration

### MVP Success Criteria
- [ ] User can register and login
- [ ] User can connect MT4/MT5 account
- [ ] Trades sync automatically
- [ ] Journal entries persist
- [ ] Basic analytics display correctly

---

## Phase 2: Growth (Weeks 5-8)
**Goal:** Features that drive retention and conversion

### Week 5-6: Payments & Subscriptions
- [ ] Stripe integration
- [ ] Checkout flow
- [ ] Webhook handlers
- [ ] Feature gating by tier
- [ ] Billing management page

### Week 7: Enhanced Analytics
- [ ] Real-time metric calculations
- [ ] Additional chart types
- [ ] Date range filtering
- [ ] Symbol/tag filtering
- [ ] CSV export

### Week 8: Polish & Optimization
- [ ] Performance optimization
- [ ] Mobile responsiveness fixes
- [ ] Error handling improvements
- [ ] User feedback implementation
- [ ] Documentation

### Phase 2 Success Criteria
- [ ] Users can subscribe to paid plans
- [ ] Payments process correctly
- [ ] Analytics reflect real trade data
- [ ] App performs well (< 3s load time)

---

## Phase 3: Scale (Weeks 9-12)
**Goal:** Advanced features and enterprise readiness

### Week 9-10: Advanced Features
- [ ] Manual trade entry form
- [ ] Trade editing/deletion
- [ ] Screenshot uploads
- [ ] Trade tagging system
- [ ] Trade-to-journal linking

### Week 11: Additional Brokers
- [ ] cTrader integration
- [ ] File upload import (CSV)
- [ ] Broker selection expansion

### Week 12: Enterprise Features
- [ ] Multi-account aggregation
- [ ] Team/organization support
- [ ] API access for integrations
- [ ] Custom branding options

### Phase 3 Success Criteria
- [ ] 3+ broker integrations
- [ ] Enterprise customers onboarded
- [ ] API documentation published
- [ ] 95% uptime maintained

---

## Future Considerations (v2.0+)

### AI Features
- AI-powered trade analysis
- Pattern recognition
- Psychology insights from journal
- Automated tagging

### Social Features
- Trade sharing (optional)
- Community leaderboards
- Strategy marketplace

### Platform Expansion
- iOS/Android apps
- Desktop app (Electron)
- Browser extension

### Integrations
- TradingView alerts
- Discord bot
- Telegram notifications
- Webhook support

---

# 11. COMPETITIVE ANALYSIS

## Feature Comparison Matrix

| Feature | Ryzen | TradeZella | Edgewonk | Myfxbook | Tradervue |
|---------|-------|------------|----------|----------|-----------|
| **Pricing** | $0-49/mo | $49-99/mo | $169 one-time | Free-$39/mo | $0-49/mo |
| **Free Tier** | ✅ Yes | ❌ No | ❌ No | ✅ Yes | ✅ Yes |
| **Modern UI** | ✅ Premium | ✅ Good | ⚠️ Dated | ⚠️ Basic | ⚠️ Basic |
| **Dark Mode** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **MT4/MT5 Sync** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Real-time Sync** | ✅ Pro | ✅ | ❌ | ⚠️ Delayed | ❌ |
| **Rich Journal** | ✅ WYSIWYG | ⚠️ Basic | ⚠️ Basic | ❌ | ⚠️ Basic |
| **Notebooks** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Playbooks** | ✅ | ⚠️ Basic | ✅ | ❌ | ❌ |
| **Calendar View** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **TradingView** | ✅ Embedded | ❌ | ❌ | ⚠️ Link | ❌ |
| **Psychology** | 🚧 Planned | ✅ | ✅ | ❌ | ❌ |
| **AI Insights** | 🚧 Planned | ❌ | ❌ | ❌ | ❌ |
| **Mobile App** | 🚧 Planned | ✅ | ❌ | ✅ | ❌ |
| **API Access** | ✅ Elite | ❌ | ❌ | ✅ | ✅ |

## Unique Selling Points (USPs)

### vs. TradeZella
- **Lower price point** — Starter at $19 vs $49
- **Free tier available** — Try before buy
- **Notion-style notebooks** — Better organization
- **Embedded TradingView** — No tab switching

### vs. Edgewonk
- **Cloud-based** — No desktop installation
- **Auto-sync** — No manual import
- **Subscription model** — Lower upfront cost
- **Modern UI** — Better user experience

### vs. Myfxbook
- **Privacy focused** — Trades not public by default
- **Better journal** — Rich text vs plain text
- **Strategy playbooks** — Rule-based checklists
- **Premium experience** — Ad-free, polished UI

## Feature Parity Gaps

### Must-Have (Closing Gap)
1. Psychology/emotion tracking
2. Mobile app
3. Screenshot attachment
4. Trade replay feature

### Nice-to-Have (Differentiation)
1. AI-powered insights
2. Community features
3. Strategy marketplace
4. Prop firm specific features

---

# 12. OPEN QUESTIONS & ASSUMPTIONS

## Open Questions

### Product
1. **Free tier limits** — How many trades before upgrade prompt?
2. **Trial period** — 7 days or 14 days for paid tiers?
3. **Refund policy** — 14 days or 30 days?
4. **Multi-currency** — Support accounts in EUR, GBP?
5. **Time zones** — User preference or broker timezone?

### Technical
1. **MetaApi plan** — Which tier for scaling?
2. **Hosting region** — US only or multi-region?
3. **File storage** — Max file size for screenshots?
4. **Data retention** — Keep trades forever or limit?

### Business
1. **Prop firm partnerships** — Pursue integrations?
2. **Affiliate program** — Launch at MVP or later?
3. **White-label** — Offer to trading educators?

## Assumptions Made

### User Behavior
- Users will primarily use MT4/MT5 (80%+ of target market)
- Users prefer auto-sync over manual entry
- Journal usage correlates with trading improvement
- Mobile usage is secondary to desktop

### Technical
- MetaApi reliability is sufficient for production
- PostgreSQL can handle scale for first 10K users
- TradingView widget is free for embedded use
- Stripe handles all payment complexity

### Market
- Competitor pricing ($49-99/mo) leaves room for disruption
- Traders willing to pay for better UX
- Free tier drives acquisition, Pro tier drives revenue
- Psychology features are key differentiators

## Decisions Needed from Stakeholders

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Backend framework | Express, Next.js, Fastify | Next.js API routes |
| Database | PostgreSQL, MongoDB | PostgreSQL (structured data) |
| Hosting | Vercel, Railway, AWS | Railway (simplicity) |
| Free tier limits | 10, 25, 50 trades/mo | 25 trades/month |
| Trial length | 7, 14 days | 14 days |
| MVP launch date | Q1 2025 | Jan 15, 2025 |

---

# APPENDIX

## A. File Reference Index

| File | Purpose | Lines |
|------|---------|-------|
| `App.tsx` | Main app component, routing, state | 193 |
| `LoginView.tsx` | Login screen with Vanta background | 172 |
| `DashboardView.tsx` | Dashboard container | 18 |
| `Hero.tsx` | Dashboard stats and charts | 159 |
| `CalendarWidget.tsx` | Monthly calendar with P&L | 111 |
| `TradesView.tsx` | Trade list and TradingView | 174 |
| `JournalView.tsx` | Journal entries list and editor | 181 |
| `NotebookView.tsx` | Multi-notebook organization | 441 |
| `PlaybooksView.tsx` | Strategy playbooks | 307 |
| `SettingsView.tsx` | User settings | 87 |
| `PricingView.tsx` | Pricing tiers and FAQ | 202 |
| `AccountManagerModal.tsx` | Broker connection wizard | 395 |
| `RichTextEditor.tsx` | WYSIWYG editor | 256 |
| `Sidebar.tsx` | Navigation sidebar | 125 |
| `Header.tsx` | Top header with notifications | 168 |
| `DashboardCard.tsx` | Floating trade card | 126 |
| `Features.tsx` | Feature cards | 42 |

## B. Environment Variables Required

```env
# Application
NODE_ENV=production
APP_URL=https://app.ryzen.trade

# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...

# MetaApi
METAAPI_TOKEN=...

# Email
SENDGRID_API_KEY=...

# Monitoring
SENTRY_DSN=...
```

## C. Glossary

| Term | Definition |
|------|------------|
| **P&L** | Profit and Loss |
| **R:R** | Risk to Reward ratio |
| **Profit Factor** | Gross profits / Gross losses |
| **Drawdown** | Peak-to-trough decline in equity |
| **Expectancy** | Average amount expected to win/lose per trade |
| **MetaApi** | Cloud service for MT4/MT5 integration |
| **JWT** | JSON Web Token for authentication |
| **Playbook** | A documented trading strategy with rules |

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Generated by: Codebase Analysis*







