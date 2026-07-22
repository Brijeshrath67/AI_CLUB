# ⚡️ ML Hive

**A platform where organisers create events and students pay online — and everything is tracked automatically.**

---

## 🛑 The Problem
Collecting money for college events is broken. 
Someone wants to organise a trip or an event. They ask 20 people for money. Some pay in cash, some say "I'll pay later", some forget. The organiser has no list, no record, no idea who paid ₹500 and who paid nothing. At the end, it's a mess of screenshots and WhatsApp messages. 

**ML Hive fixes this entirely.**

---

## 🎟️ The Two Types of Events

### 1. Public Event
- Visible to everyone on the main dashboard when they open ML Hive.
- Anyone from the campus can see it, click on it, and pay to register.
- **Best for:** College fests, competitions, seminars — events that are open to everyone.

### 2. Private Event
- Hidden from the dashboard.
- The organiser gets a unique link and shares it only with specific people. Only someone with that link can access and pay.
- **Best for:** Club trips, department outings, or restricted gatherings.

---

## 💸 How a Payment Works — Step by Step

1. **Student opens the event** — either from the dashboard (public) or from the link shared by the organiser (private).
2. **Student clicks Pay** — Razorpay's checkout window opens. They can pay via UPI, card, net banking, anything.
3. **Payment goes to Razorpay** — Razorpay processes the money and sends a secret signal (called a webhook) to ML Hive's backend saying "this person paid".
4. **ML Hive verifies the signal** — the backend checks a secret signature to make sure the signal is genuinely from Razorpay and not a fake. This is the security layer.
5. **Record is saved** — the database now has: who paid, how much, at what time. Permanently. No manual entry needed.
6. **Organiser's dashboard updates live** — the moment a payment is confirmed, the organiser sees it appear in real time without refreshing the page. *(Powered by Socket.io)*

---

## 👥 Who Uses It & What They Get

### For the Organiser (Student club, department, individual)
- **Live payment dashboard:** A screen that shows every payment as it happens (Name, amount, time). No refresh needed.
- **CSV export:** Download the entire payment list as a spreadsheet. Useful for submitting records to a college, treasurer, or faculty coordinator.
- **Zero manual work:** The organiser never has to chase people for payment screenshots or manually mark who paid. The system does all of it.

### For the Participant (Student)
- **Simple, familiar checkout:** They just click Pay, use UPI or card like any other app, and they're done. No separate app to download. No cash needed.
- **Proof of payment:** Their payment is recorded in the system. No need to keep a screenshot or argue later about whether they paid.

---

## 🛠️ The Tech Behind It

- **React:** The frontend that students and organisers see and interact with.
- **Express + PostgreSQL:** The backend that stores all data (events, users, payments) and handles all logic.
- **JWT (JSON Web Tokens):** How the system knows who is logged in. The organiser and student each get a token that proves their identity.
- **Razorpay:** The payment gateway. Handles the actual money movement. ML Hive never directly touches the card or UPI details.
- **Webhook + HMAC verification:** Razorpay secretly tells ML Hive "payment done". ML Hive checks a digital signature to confirm it's real.
- **Socket.io:** Keeps the organiser's dashboard alive with real-time updates. When a payment lands, it appears on screen instantly.
- **BullMQ:** A background job queue. Things like sending confirmation emails happen in the background without slowing down the payment response.
- **Docker:** Packages the whole application so it can be deployed and run anywhere.

---

## 🚀 Roadmap: Things Done & Coming Up

### ✅ Done (Frontend Foundation)
- **High-Fidelity Auth Interface:** Created a premium, dark-themed "glassmorphism" login and sign-up experience.
- **Immersive 3D Backgrounds:** Integrated optimized `@splinetool/react-spline` 3D elements that load lazily for high performance.
- **Responsive Split Layout:** Designed a seamless layout that provides storytelling and context on the left, and streamlined authentication on the right.
- **Micro-interactions:** Added Framer Motion animations, shake-on-error inputs, and dynamic form switching.

### 🚧 Coming Up
- **Backend Architecture Setup:** Initializing Express, PostgreSQL, and basic routing.
- **Authentication API:** Wiring up the React frontend with JWT-based backend authentication.
- **Dashboard UI Development:** Building the live dashboard for organisers and the event feed for participants.
- **Razorpay Integration:** Implementing the checkout flow and robust webhook listening/verification.
- **Real-time Engine:** Setting up Socket.io for live dashboard updates.
- **Export & Job Queueing:** Implementing CSV exports and background emails via BullMQ.
