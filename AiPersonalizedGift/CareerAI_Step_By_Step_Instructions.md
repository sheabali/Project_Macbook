You are a senior full-stack software architect and engineer.

Build a production-ready AI Personalized Gift E-commerce Platform.

===================================
TECH STACK
===================================

Frontend:
- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- ShadCN UI
- Redux Toolkit
- RTK Query
- Framer Motion
- React Hook Form
- Zod validation

Backend:
- Node.js
- Express.js
- TypeScript
- MongoDB
- Prisma ORM
- JWT Authentication
- Redis
- Multer
- Cloudinary

Payment:
- SSLCOMMERZ integration
- Cash on Delivery support

===================================
PROJECT GOAL
===================================

Users can:
1. Browse products
2. Upload images
3. Generate AI personalized gift previews
4. Add products to cart
5. Checkout
6. Pay using SSLCOMMERZ
7. Track orders

Admin can:
1. Manage products
2. Manage users
3. Manage orders
4. Track analytics
5. Approve AI-generated images

===================================
BUILD PHASES
===================================

Follow the exact order below.

===================================
PHASE 1 — PROJECT INITIALIZATION
===================================

Frontend Setup:
1. Create Next.js app with TypeScript
2. Configure Tailwind CSS
3. Setup ShadCN UI
4. Setup Redux Toolkit
5. Setup RTK Query
6. Setup folder architecture
7. Setup absolute imports
8. Setup environment variables

Backend Setup:
1. Initialize Express app
2. Configure TypeScript
3. Setup Prisma ORM
4. Connect MongoDB
5. Setup ESLint + Prettier
6. Setup environment validation
7. Setup global error handling
8. Setup modular folder architecture

===================================
PHASE 2 — AUTHENTICATION SYSTEM
===================================

Build complete authentication system.

Frontend:
- Login page
- Register page
- Forgot password page
- OTP verification page
- Protected routes
- Persist authentication

Backend:
- Register API
- Login API
- Refresh token API
- Logout API
- Forgot password API
- Reset password API
- JWT authentication
- Password hashing using bcrypt

Features:
- Access token
- Refresh token
- Secure HTTP-only cookies
- Role-based access

===================================
PHASE 3 — DATABASE DESIGN
===================================

Create Prisma schema for:

1. User
2. Product
3. Category
4. Cart
5. Order
6. OrderItem
7. Review
8. AIImage
9. Coupon
10. Payment

Add:
- Relations
- Indexes
- Enums
- Timestamps

Generate full Prisma schema.

===================================
PHASE 4 — PRODUCT SYSTEM
===================================

Frontend:
- Product listing page
- Product details page
- Category filtering
- Search functionality
- Pagination
- Product reviews
- Product image gallery

Backend:
- Product CRUD APIs
- Category CRUD APIs
- Review system
- Search API
- Filtering API

Admin:
- Add product
- Edit product
- Delete product

===================================
PHASE 5 — IMAGE UPLOAD SYSTEM
===================================

Build complete image upload system.

Requirements:
- Multer upload
- Cloudinary integration
- Image compression
- Image validation
- Drag and drop uploader
- Multiple image upload

Frontend:
- Upload component
- Preview component
- Progress bar

Backend:
- Upload API
- Delete API

===================================
PHASE 6 — AI IMAGE GENERATION SYSTEM
===================================

Build AI personalization workflow.

Workflow:
1. User uploads image
2. Backend stores image
3. AI service processes image
4. Generate anime/cartoon portrait
5. Save generated image
6. Return preview

Frontend:
- AI generation loading state
- AI preview page
- Before/after slider
- Download preview

Backend:
- AI service layer
- Queue system
- Retry failed jobs

Use:
- OpenAI
- Replicate API
- Stable Diffusion API

===================================
PHASE 7 — CART SYSTEM
===================================

Frontend:
- Add to cart
- Remove from cart
- Quantity update
- Cart drawer
- Cart page

Backend:
- Cart APIs
- Persistent cart

===================================
PHASE 8 — CHECKOUT SYSTEM
===================================

Frontend:
- Checkout page
- Address form
- Order summary
- Payment selection

Backend:
- Create order
- Validate stock
- Calculate totals
- Save order

Support:
- COD
- SSLCOMMERZ

===================================
PHASE 9 — SSLCOMMERZ PAYMENT INTEGRATION
===================================

Build full SSLCOMMERZ payment gateway integration.

Requirements:
- Sandbox integration
- Payment initiation
- Success callback
- Fail callback
- Cancel callback
- IPN validation
- Transaction verification

Frontend:
- Payment redirect
- Success page
- Failed page

Backend:
- SSL payment controller
- Verification service
- Transaction logs

===================================
PHASE 10 — ORDER MANAGEMENT
===================================

Frontend:
- Order history
- Order tracking
- Download invoice

Backend:
- Order status update
- Admin order management
- Delivery tracking

Order statuses:
- Pending
- Paid
- Processing
- Shipped
- Delivered
- Cancelled

===================================
PHASE 11 — ADMIN DASHBOARD
===================================

Build modern admin dashboard.

Features:
- Analytics cards
- Revenue charts
- Order statistics
- User management
- Product management
- AI job monitoring

Frontend:
- Sidebar layout
- Data tables
- Charts
- Filters

Use:
- Recharts
- TanStack Table

===================================
PHASE 12 — REDUX TOOLKIT ARCHITECTURE
===================================

Setup:
- Auth slice
- Product slice
- Cart slice
- Order slice
- API slice

Use RTK Query properly.

===================================
PHASE 13 — UI/UX DESIGN
===================================

Design style:
- Modern
- Premium
- Minimal
- Emotional branding

Use:
- Framer Motion animations
- Skeleton loading
- Responsive design
- Mobile-first approach

Pages should look like:
- Apple
- Stripe
- Modern Shopify stores

===================================
PHASE 14 — SECURITY
===================================

Implement:
- Rate limiting
- Helmet
- CORS
- XSS protection
- CSRF protection
- Input sanitization
- Image validation

===================================
PHASE 15 — PERFORMANCE OPTIMIZATION
===================================

Frontend:
- Lazy loading
- Code splitting
- Image optimization
- SEO optimization

Backend:
- Redis caching
- Database indexing
- API optimization

===================================
PHASE 16 — TESTING
===================================

Frontend:
- Component testing

Backend:
- Unit testing
- API testing

Use:
- Jest
- Supertest

===================================
PHASE 17 — DEPLOYMENT
===================================

Frontend:
- Deploy to Vercel

Backend:
- Deploy to Railway/Render

Database:
- MongoDB Atlas

Media:
- Cloudinary

Environment:
- Setup production variables

===================================
PHASE 18 — FINAL PRODUCTION FEATURES
===================================

Add:
- Wishlist
- Coupons
- Referral system
- Email notifications
- SMS notifications
- AI recommendations

===================================
IMPORTANT RULES
===================================

1. Use clean architecture
2. Use reusable components
3. Use scalable folder structure
4. Write production-grade TypeScript
5. Use proper validation everywhere
6. Use modern best practices
7. Use responsive design
8. Add loading states
9. Add proper error handling
10. Write maintainable code

===================================
OUTPUT FORMAT
===================================

For every phase:
1. Explain architecture
2. Generate folder structure
3. Generate code
4. Explain why
5. Explain best practices
6. Explain scalability concerns
7. Explain security concerns

Build step-by-step carefully.

Never skip architecture explanations.