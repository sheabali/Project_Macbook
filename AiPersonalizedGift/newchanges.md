# 🎁 GiftAI — Proposed Changes & Business Checklist

This document contains a checklist of branding fixes, security improvements, user experience adjustments, and essential features required to successfully run the **GiftAI** platform as a live business.

---

## 🚨 Phase 1: Emergency & Branding Fixes
*The main objective of this phase is to eliminate all trace of the old template (CareerAI) to establish brand authority and customer trust.*

- [ ] **Dashboard Branding & Code Cleanup:**
  - Remove `CareerSidebar` and all associated resume analyzer navigation links (e.g., Analyzer, History, Credits Remaining) from the user/admin dashboard layouts.
  - Integrate a new, appropriate gift dashboard navigation containing Order History, AI Designs, Wishlist, Gift Reminders, and Profile Settings.
- [ ] **Remove Unused Templates:**
  - Delete the obsolete `(dashboard)` route group and layout file that contains leftover resume analyzer sidebar elements.
- [ ] **Security & Rate Limiting:**
  - Enable backend rate limiting (the current `rateLimit.ts` middleware is a no-op, posing a risk of rapid AI API credits exhaustion from spam bots).
  - Modify the Next.js frontend middleware to verify JWT signatures using a server secret instead of only client-side decoding (`jwtDecode`), preventing unauthorized dashboard access.
- [ ] **Create Missing Legal & Essential Pages:**
  - Build the pages linked in the footer that currently return 404 errors:
    - **About Us**
    - **Contact Us** (with a functional support contact form)
    - **Privacy Policy**
    - **Terms & Conditions**

---

## 🎨 Phase 2: Core E-Commerce & AI Pipeline Enhancements
*Perfecting the core value proposition (AI personalization) and optimizing the shopping experience.*

- [ ] **True Image-to-Image (img2img) Pipeline:**
  - **Issue:** The platform currently falls back to Pollinations AI (Text-to-Image) which ignores the user's uploaded portrait and creates a new random character from scratch.
  - **Fix:** Connect and configure **Replicate (ControlNet/FaceSwap)** or **Stability AI (img2img)** so the generated gift designs actually preserve the user's facial features.
- [ ] **Dynamic Search, Filtering & Sorting:**
  - Connect the sidebar filter controls (Category checkboxes, Price Range slider, Sort dropdown) on the products page to the active backend product search endpoints (currently they are static mock controls).
- [ ] **Wishlist & Product Reviews:**
  - Make the Heart button functional across product cards, storing favorited items in the database and rendering them on the `/user/wishlist` page.
  - Build a frontend UI to display existing reviews and a submission form on product detail pages (Prisma model `Review` already exists).

---

## 💳 Phase 3: Payments & Communication
*Streamlining order collection and customer communication.*

- [ ] **Stripe International Payment Integration:**
  - SSLCommerz is currently integrated for local currencies (BDT). Add **Stripe** support on the checkout page to accept international credit cards for global orders.
- [ ] **Automated Order Confirmation Emails:**
  - Configure **Nodemailer / Resend** to send automated email confirmations containing receipt PDFs and tracking links to customers upon successful orders.
