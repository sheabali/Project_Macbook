# 🐄 Daily Farm — Full-Stack Dairy & Milk Delivery Platform

## Project Overview

Build a **production-grade full-stack dairy/milk delivery web platform** for a Bangladeshi cow farm
business currently serving **~2,000 regular customers offline** and transitioning fully online.

The platform must support **customer subscriptions, daily delivery management, admin operations,
bilingual UI (Bangla + English), and local payment gateways** — all optimized for mobile users
on low-bandwidth networks in Bangladesh.

---

## 🛠 Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 14+ (App Router) | SSR/SSG hybrid for SEO + performance |
| **Language** | TypeScript (strict mode) | End-to-end type safety |
| **Styling** | Tailwind CSS + shadcn/ui | Design system tokens via CSS variables |
| **Animations** | Framer Motion | Micro-interactions, page transitions |
| **State & API** | RTK Query + Redux Toolkit | Normalized caching, optimistic updates |
| **Backend** | Next.js API Routes | `/app/api/` route handlers (or separate Express if team prefers) |
| **ORM** | Prisma | Type-safe DB access, migrations |
| **Database** | PostgreSQL | Primary data store |
| **Auth** | Phone OTP (JWT) | Preferred by BD users; no email required |
| **Payments** | bKash, Nagad, Cash on Delivery | Local gateway SDKs |
| **SMS** | SSL Wireless / Alpha SMS / Twilio | OTP delivery + billing reminders |
| **Push (optional)** | Firebase Cloud Messaging | Web push for delivery status |
| **File Storage** | AWS S3 / Cloudflare R2 | Product images, complaint photos |
| **Deployment** | Vercel (frontend) + Railway/Supabase (DB) | Or VPS with Nginx + PM2 |
| **Monitoring** | Sentry (errors) + Vercel Analytics | Production observability |

---

## 🎨 Brand & Design Language

### Identity
- **Name:** Daily Farm (দেইলি ফার্ম)
- **Tagline:** *"বিশুদ্ধ দুধ, প্রতিদিন সকালে"* (Pure milk, every morning)
- **Core values:** Farm-to-doorstep · 100% preservative-free · Transparent & trustworthy

### Color Palette
```css
:root {
  --color-cream:      #FAF7F0;  /* page background */
  --color-green:      #2D6A4F;  /* primary CTA */
  --color-green-light:#52B788;  /* hover states */
  --color-brown:      #6B3E26;  /* headings, accents */
  --color-amber:      #E9C46A;  /* badges, highlights */
  --color-text:       #1A1A2E;  /* body text */
  --color-muted:      #6B7280;  /* secondary text */
}
```

### Typography
- **Bangla:** `Hind Siliguri` or `Noto Sans Bengali` (Google Fonts)
- **English headings:** `Playfair Display` or `DM Serif Display`
- **UI / body:** `Inter` (Latin), `Hind Siliguri` (Bangla)
- Base font size: `16px` mobile, `18px` desktop

### Design Principles
- **Mobile-first** — 80%+ of BD customers order via phone
- Warm, natural, organic feel — NOT clinical white/blue
- Rounded cards (`border-radius: 16px`), soft box-shadows
- Real farm photography over stock icons/illustrations
- Bangla-first content with inline English toggle (not full page reload)

---

## 📄 Pages & UI/UX Requirements

### 1. Landing Page (`/`)

**Hero Section**
- Full-width farm video/image background with subtle overlay
- H1: *"বিশুদ্ধ দুধ, প্রতিদিন সকালে"* + English subtitle
- Primary CTA: `সাবস্ক্রাইব করুন` (Subscribe Now) → opens OTP login modal
- Secondary CTA: `আরও জানুন` (Learn More) → smooth scroll to features

**Stats Bar** (animated counters on scroll into view)
- ✅ 2,000+ সন্তুষ্ট গ্রাহক (Happy Customers)
- 📅 8+ বছরের অভিজ্ঞতা (Years of Operation)
- 🚚 15+ এলাকায় ডেলিভারি (Delivery Areas)

**"How It Works" — 3-Step Visual**
1. 📋 সাবস্ক্রাইব করুন (Subscribe)
2. 🐄 প্রতিদিন সকালে ডেলিভারি (Daily Morning Delivery)
3. 💳 মাসিক বিল পরিশোধ (Pay Monthly)

**Product Showcase**
- Card grid: Raw Milk (কাঁচা দুধ), Ghee (ঘি), Curd (দই), Paneer (পনির), Butter (মাখন)
- Each card: product photo, name (Bangla + English), price in ৳, "Subscribe" + "One-time Buy" buttons
- Bestseller / Seasonal badges

**Testimonials**
- Carousel with real customer photos/avatars
- Format: Quote · Name · Area (e.g., *"রাফিক আহমেদ, মিরপুর-১২"*)
- Star ratings visible

**Delivery Coverage Map**
- Interactive map (Leaflet.js or Google Maps embed) showing delivery zones
- List view of covered thanas/areas as fallback for low-data users

**Trust & Transparency Section**
- Gallery: farm hygiene photos, cow care practices, quality testing
- Certifications / hygiene badges
- "From our farm to your door in under 4 hours" promise bar

**FAQ Accordion**
- Common questions: payment methods, delivery timing, how to pause, refund policy

**Footer**
- Logo, tagline, social links (Facebook, WhatsApp)
- Quick links: Products, My Account, Contact
- Contact: phone/WhatsApp number, delivery hours

---

### 2. Authentication (`/auth`)

**Flow:**
1. Enter phone number (BD format: `+880xxxxxxxxxx`)
2. OTP sent via SMS (6-digit, 5-min expiry)
3. Verify OTP → receive JWT (stored in httpOnly cookie)
4. New user → onboarding (name, address, area selection)
5. Existing user → redirect to `/dashboard`

**Notes:**
- Rate-limit OTP requests: max 3 per phone per 10 min
- OTP resend countdown timer (30s)
- Auto-detect if phone already registered → skip onboarding

---

### 3. Customer Dashboard (`/dashboard`)

**Subscription Management**
- Active subscriptions list with product, quantity, frequency
- Edit subscription: change quantity (0.5L increments), frequency (daily / alternate / weekly / custom days), delivery slot (morning 6-8am / 7-9am)
- Pause with custom date range + auto-resume date picker
- Cancel subscription (soft delete with confirmation)

**Delivery Calendar**
- Month view showing: delivered ✅, upcoming 📅, paused ⏸️, missed ❌
- Tap on a date → see delivery details and delivery person name

**Wallet & Billing**
- Current balance / outstanding amount prominently displayed
- Pay Now button (bKash / Nagad / COD)
- Payment history table: date, amount, method, status
- Auto-generated monthly invoice (PDF download)

**Quick Actions** (sticky bottom bar on mobile)
- ⏸ আগামীকালের ডেলিভারি বন্ধ (Pause Tomorrow)
- 🔁 একই অর্ডার করুন (Reorder)
- 📞 সাপোর্ট (Support via WhatsApp)

**Delivery Tracking**
- Realtime status: Preparing → Out for Delivery → Delivered
- Delivery person name + estimated arrival
- "Mark as Not Received" option (triggers complaint)

**Address Management**
- Add/edit multiple addresses (home, office)
- Area/thana dropdown (pre-defined list for covered zones)
- Set default address

**Referral Program**
- Unique referral code + shareable link
- Referral count and reward status (e.g., ৳50 wallet credit per successful referral)

**Reviews & Complaints**
- Rate recent deliveries (1-5 stars)
- Submit quality complaint: photo upload + description + date
- Track complaint resolution status

---

### 4. Admin Dashboard (`/admin`)

> Access restricted to farm owner + managers via role-based auth.

**Overview / Analytics**
- KPI cards: today's deliveries, pending, completed, revenue today, monthly revenue
- Charts: daily revenue trend (7/30/90 days), subscription growth, churn rate, area-wise order volume
- Real-time active deliveries map

**Customer Management**
- Searchable/filterable table: name, phone, area, subscription status, balance due
- Customer detail page: full order history, subscription details, payment records
- Export to CSV / Excel

**Subscription Operations**
- Bulk status update (e.g., pause all subscriptions in an area due to holiday)
- Upcoming pauses/cancellations alert list

**Daily Delivery Route Sheet**
- Auto-generated by area/thana grouping
- Filter by date + delivery staff + area
- Printable PDF with customer name, address, quantity, contact number
- Mobile-friendly view for delivery staff

**Inventory & Production Tracking**
- Input: today's milk yield (liters)
- Auto-calculate: total committed subscriptions for today vs. available stock
- Alert: surplus / shortage warning with numbers
- Weekly/monthly production log

**Billing & Payments Dashboard**
- List of customers with outstanding balance
- Filter: overdue 7+ days, 15+ days, 30+ days
- One-click SMS reminder to individual customer or bulk (by area / overdue tier)
- Mark payment as received (cash)

**Delivery Staff Management**
- Staff list: name, phone, assigned areas, today's delivery count
- Assign/reassign customers to staff
- Delivery completion tracking (staff marks as delivered via mobile)
- Performance report: deliveries completed vs. assigned

**Bulk Notifications**
- Compose SMS to: all customers / by area / custom segment
- Templates: price change, holiday notice, new product launch
- Schedule send (e.g., send tomorrow 8am)
- SMS credit balance display

---

## 🗄 Database Schema

```prisma
// prisma/schema.prisma

model User {
  id            String         @id @default(cuid())
  name          String
  phone         String         @unique
  role          Role           @default(CUSTOMER)
  referralCode  String         @unique
  referredBy    String?
  walletBalance Float          @default(0)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  addresses     Address[]
  subscriptions Subscription[]
  orders        Order[]
  payments      Payment[]
  reviews       Review[]
  complaints    Complaint[]
}

model Address {
  id         String  @id @default(cuid())
  userId     String
  label      String  // "Home", "Office"
  line1      String
  area       String  // thana/area name
  city       String  @default("Dhaka")
  isDefault  Boolean @default(false)

  user          User           @relation(fields: [userId], references: [id])
  subscriptions Subscription[]
}

model Product {
  id          String  @id @default(cuid())
  name        String
  nameBn      String  // Bangla name
  description String?
  unit        String  // "liter", "kg", "piece"
  pricePerUnit Float
  imageUrl    String?
  inStock     Boolean @default(true)
  isFeatured  Boolean @default(false)

  subscriptions Subscription[]
  reviews       Review[]
}

model Subscription {
  id          String             @id @default(cuid())
  userId      String
  productId   String
  addressId   String
  quantity    Float              // e.g. 1.5 (liters)
  frequency   SubscriptionFreq
  status      SubscriptionStatus @default(ACTIVE)
  startDate   DateTime
  pauseFrom   DateTime?
  pauseUntil  DateTime?
  deliverySlot String?           // "6am-8am", "7am-9am"
  createdAt   DateTime           @default(now())

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
  address Address @relation(fields: [addressId], references: [id])
  orders  Order[]
}

model Order {
  id             String      @id @default(cuid())
  subscriptionId String?
  userId         String
  date           DateTime
  status         OrderStatus @default(PENDING)
  quantity       Float
  totalAmount    Float
  deliveredById  String?
  deliveredAt    DateTime?
  notes          String?

  subscription Subscription?  @relation(fields: [subscriptionId], references: [id])
  user         User           @relation(fields: [userId], references: [id])
  deliveredBy  DeliveryStaff? @relation(fields: [deliveredById], references: [id])
  payment      Payment?
}

model Payment {
  id           String        @id @default(cuid())
  userId       String
  orderId      String?       @unique
  amount       Float
  method       PaymentMethod
  status       PaymentStatus @default(PENDING)
  transactionId String?
  billingCycle  String?       // "2024-09" format
  createdAt    DateTime      @default(now())

  user  User   @relation(fields: [userId], references: [id])
  order Order? @relation(fields: [orderId], references: [id])
}

model DeliveryStaff {
  id             String   @id @default(cuid())
  name           String
  phone          String   @unique
  assignedAreas  String[]
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())

  orders Order[]
}

model Review {
  id        String   @id @default(cuid())
  userId    String
  productId String
  rating    Int      // 1-5
  comment   String?
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

model Complaint {
  id          String          @id @default(cuid())
  userId      String
  orderId     String?
  description String
  photoUrl    String?
  status      ComplaintStatus @default(OPEN)
  resolvedAt  DateTime?
  createdAt   DateTime        @default(now())

  user User @relation(fields: [userId], references: [id])
}

model InventoryLog {
  id          String   @id @default(cuid())
  date        DateTime @unique
  yieldLiters Float    // actual production
  committedLiters Float // sum of active subscriptions
  surplus     Float    // yieldLiters - committedLiters
  notes       String?
}

model SmsLog {
  id         String   @id @default(cuid())
  recipients String[] // phone numbers
  message    String
  status     String   // "sent", "failed"
  sentAt     DateTime @default(now())
  sentBy     String   // admin userId
}

// ========= ENUMS =========

enum Role {
  CUSTOMER
  ADMIN
  DELIVERY_STAFF
}

enum SubscriptionFreq {
  DAILY
  ALTERNATE_DAY
  WEEKLY
  CUSTOM
}

enum SubscriptionStatus {
  ACTIVE
  PAUSED
  CANCELLED
}

enum OrderStatus {
  PENDING
  OUT_FOR_DELIVERY
  DELIVERED
  MISSED
  CANCELLED
}

enum PaymentMethod {
  BKASH
  NAGAD
  COD
  WALLET
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum ComplaintStatus {
  OPEN
  IN_REVIEW
  RESOLVED
  CLOSED
}
```

---

## 🔌 API Routes (Key Endpoints)

```
POST   /api/auth/send-otp          → send OTP to phone
POST   /api/auth/verify-otp        → verify OTP, return JWT
POST   /api/auth/refresh           → refresh access token

GET    /api/products               → list all products
GET    /api/products/:id           → product detail + reviews

POST   /api/subscriptions          → create subscription
GET    /api/subscriptions/me       → current user's subscriptions
PATCH  /api/subscriptions/:id      → update (quantity, frequency, pause)
DELETE /api/subscriptions/:id      → cancel

GET    /api/orders/me              → order history (paginated)
GET    /api/orders/me/calendar     → orders grouped by date (for calendar view)
PATCH  /api/orders/:id/status      → delivery staff marks as delivered

GET    /api/payments/me            → payment history
POST   /api/payments/initiate      → start bKash/Nagad payment
POST   /api/payments/callback      → payment gateway webhook

GET    /api/dashboard/admin/stats  → KPI metrics (admin only)
GET    /api/admin/customers        → paginated customer list
GET    /api/admin/route-sheet      → daily delivery route (by area, date)
POST   /api/admin/sms/send         → bulk SMS send
GET    /api/admin/inventory        → inventory log
POST   /api/admin/inventory        → log today's production

POST   /api/complaints             → submit complaint
GET    /api/complaints/me          → user's complaints
PATCH  /api/admin/complaints/:id   → resolve complaint

POST   /api/reviews                → submit review
GET    /api/products/:id/reviews   → paginated reviews
```

---

## 📁 Project Folder Structure

```
daily-farm/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public pages (no auth required)
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── auth/page.tsx         # OTP login/register
│   │   └── onboarding/page.tsx   # New user setup
│   ├── (customer)/               # Protected: customer area
│   │   ├── dashboard/page.tsx
│   │   ├── subscriptions/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── complaints/page.tsx
│   │   └── layout.tsx
│   ├── (admin)/                  # Protected: admin area
│   │   ├── admin/page.tsx        # Overview
│   │   ├── admin/customers/page.tsx
│   │   ├── admin/deliveries/page.tsx
│   │   ├── admin/inventory/page.tsx
│   │   ├── admin/billing/page.tsx
│   │   ├── admin/sms/page.tsx
│   │   └── layout.tsx
│   └── api/                      # API route handlers
│       ├── auth/
│       ├── products/
│       ├── subscriptions/
│       ├── orders/
│       ├── payments/
│       ├── admin/
│       └── complaints/
├── components/
│   ├── ui/                       # shadcn/ui base components
│   ├── marketing/                # Landing page components
│   │   ├── Hero.tsx
│   │   ├── StatsBar.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ProductShowcase.tsx
│   │   ├── Testimonials.tsx
│   │   ├── DeliveryMap.tsx
│   │   └── TrustSection.tsx
│   ├── dashboard/                # Customer dashboard components
│   │   ├── SubscriptionCard.tsx
│   │   ├── DeliveryCalendar.tsx
│   │   ├── WalletWidget.tsx
│   │   └── QuickActions.tsx
│   ├── admin/                    # Admin dashboard components
│   │   ├── KPICard.tsx
│   │   ├── RouteSheet.tsx
│   │   ├── InventoryTracker.tsx
│   │   └── SMSComposer.tsx
│   └── shared/
│       ├── LanguageToggle.tsx    # Bangla ↔ English toggle
│       ├── OTPModal.tsx
│       ├── PhoneInput.tsx        # BD phone number input
│       └── LoadingSpinner.tsx
├── lib/
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # JWT helpers
│   ├── sms.ts                    # SMS gateway wrapper
│   ├── payment/
│   │   ├── bkash.ts
│   │   └── nagad.ts
│   ├── delivery.ts               # Route sheet generation
│   └── constants.ts              # Delivery areas, product units, etc.
├── store/
│   ├── index.ts                  # Redux store setup
│   ├── api/                      # RTK Query API slices
│   │   ├── authApi.ts
│   │   ├── productsApi.ts
│   │   ├── subscriptionsApi.ts
│   │   └── adminApi.ts
│   └── slices/
│       ├── authSlice.ts
│       └── uiSlice.ts            # Language, theme, modals
├── i18n/
│   ├── bn.json                   # Bangla translations
│   └── en.json                   # English translations
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                   # Seed data for dev
│   └── migrations/
├── public/
│   ├── images/
│   └── fonts/
└── types/
    └── index.ts                  # Shared TS types
```

---

## 🔐 Auth & Security

- **JWT** stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies (not localStorage)
- **Access token:** 15-min expiry; **Refresh token:** 30-day expiry
- **OTP:** 6-digit, bcrypt-hashed in DB, 5-min TTL, max 3 attempts before lockout
- **RBAC:** middleware checks `user.role` on every admin route
- **Rate limiting:** `/api/auth/send-otp` — 3 requests per phone per 10 min (Redis or in-memory)
- **Input validation:** Zod schemas on all API route bodies
- **CSRF:** use Next.js built-in CSRF protection + `SameSite` cookies

---

## 📱 Offline & Low-Bandwidth Considerations

- **Service Worker** (Workbox): cache static assets, product images
- **Delivery staff app:** delivery confirmation queued locally (IndexedDB), synced when connectivity resumes
- **Lazy load** all images; use `next/image` with WebP + AVIF
- **Skeleton loaders** instead of spinners — perceived performance on slow 3G
- **Minimal JS on landing page** — prefer RSC (React Server Components) for initial render
- **SMS fallback** for critical notifications (not just push/email)

---

## 🧪 Testing Strategy

| Level | Tool | Coverage Target |
|---|---|---|
| Unit | Vitest | Business logic: billing calc, route generation |
| Integration | Vitest + Prisma Test DB | API routes, DB queries |
| E2E | Playwright | OTP login, subscription flow, payment |
| Manual | QA checklist | Mobile responsiveness, Bangla rendering |

**Key test cases:**
- OTP send/verify flow (happy path + expired OTP + wrong OTP)
- Subscription pause/resume with correct billing
- Route sheet groups customers correctly by area
- bKash/Nagad payment callback (success + failure)
- Admin bulk SMS sends to correct recipient list

---

## ⚙️ Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
JWT_SECRET="..."
JWT_REFRESH_SECRET="..."

# SMS Gateway
SMS_GATEWAY_URL="https://api.sslwireless.com/..."
SMS_GATEWAY_API_KEY="..."
SMS_SENDER_ID="DailyFarm"

# bKash
BKASH_APP_KEY="..."
BKASH_APP_SECRET="..."
BKASH_USERNAME="..."
BKASH_PASSWORD="..."
BKASH_BASE_URL="https://tokenized.pay.bka.sh/v1.2.0-beta"

# Nagad
NAGAD_MERCHANT_ID="..."
NAGAD_MERCHANT_PRIVATE_KEY="..."
NAGAD_BASE_URL="https://api.mynagad.com"

# File Storage
S3_BUCKET="..."
S3_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# App
NEXT_PUBLIC_APP_URL="https://dailyfarm.com.bd"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="..."
```

---

## 🚀 Build Order / Implementation Phases

### Phase 1 — Foundation
- [ ] Next.js project scaffold with TypeScript + Tailwind + shadcn/ui
- [ ] Prisma schema + initial migration + seed data
- [ ] i18n setup (Bangla/English toggle via context)
- [ ] Auth: OTP send/verify, JWT, middleware

### Phase 2 — Customer-Facing
- [ ] Landing Page (Hero, Stats, HowItWorks, Products, Testimonials, Map, Trust, FAQ)
- [ ] Product listing page
- [ ] Customer onboarding (post-OTP)
- [ ] Customer Dashboard (subscriptions, calendar, wallet, quick actions)
- [ ] Complaint & review submission

### Phase 3 — Payments
- [ ] bKash payment integration (tokenized checkout)
- [ ] Nagad payment integration
- [ ] COD flow + wallet deduction
- [ ] Auto monthly billing calculation cron job

### Phase 4 — Admin Dashboard
- [ ] Customer management + CSV export
- [ ] Daily route sheet generator (PDF printable)
- [ ] Inventory/production tracker
- [ ] Delivery staff management
- [ ] Bulk SMS composer + scheduler

### Phase 5 — Polish & Production
- [ ] Offline delivery confirmation (Service Worker + IndexedDB queue)
- [ ] Performance audit (Core Web Vitals, Lighthouse ≥ 90)
- [ ] Error monitoring (Sentry)
- [ ] Staging environment + E2E Playwright tests
- [ ] Production deployment + DB backup automation

---

## 📋 Non-Functional Requirements

- **Performance:** LCP < 2.5s on 3G; paginate all lists (20 items/page); DB indexes on `(area, date)`, `(userId, status)`
- **Scalability:** Support 5,000+ subscriptions without degradation
- **SMS cost:** Batch notifications (max 1 SMS/customer/event, no duplicate sends); log all SMS sends
- **Billing accuracy:** Never lose payment records — use DB transactions for all payment writes
- **Auditability:** Log all admin actions (who changed what, when)
- **Accessibility:** WCAG AA — proper contrast ratios, focus states, screen reader labels for Bangla text
- **Data residency:** Consider Bangladesh data laws; prefer local hosting or Singapore region

---

## 🏗 Scaffold Command

```bash
npx create-next-app@latest daily-farm \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd daily-farm
npx shadcn-ui@latest init
npm install @reduxjs/toolkit react-redux
npm install @prisma/client prisma
npm install framer-motion
npm install zod
npm install jose          # JWT
npm install sharp         # image optimization
npx prisma init
```

---

> **Start building in this order:**
> 1. Landing Page (`/`)
> 2. Auth flow (OTP login/register)
> 3. Customer Dashboard
> 4. Admin Dashboard