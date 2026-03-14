# Perfect Knot CRM

A comprehensive CRM designed specifically for wedding planners, built on **Next.js 15** and **Payload CMS 3.0**. 

Perfect Knot allows you to track wedding inquiries, generate professional white-label PDF quotations, manage your event calendar, and oversee your team—all from a single, fast, and secure dashboard.

---

## 🚀 Features

### 1. Lead Management
- **Pipeline Tracking:** Move leads effortlessly through stages: *New → Contacted → Proposal Sent → Negotiation → Confirmed*.
- **Wedding Details:** Record critical data like Check-in/Check-out dates, Wedding Date, Guest Count, and Budget.
- **Filters & Search:** Instantly find leads by name, email, status, or specific wedding date ranges.

### 2. Smart Quotation Engine
- **Service Categories:** Add line items across categories like Photography, Decoration, Venue, and Catering.
- **Dynamic Pricing:** Automatically calculates sub-totals, discounts, taxes (%), and grand totals.
- **Multiple Currencies:** Support for INR (₹), USD ($), EUR (€), and GBP (£).
- **Professional PDF Generation (Client-Side):** Generate print-ready, clean, white-labeled quotations right from the browser. 

### 3. Interactive Event Calendar
- **Automated Sync:** Wedding dates, check-ins, and check-outs are automatically plotted on the calendar when added to a lead.
- **Color-Coded Events:** 🟢 Check-ins, 🔴 Check-outs, and 🟣 Wedding dates.
- **Multiple Views:** Month, Week, and Day views with a detailed side-summary panel for selected dates.

### 4. Multi-Tenant Architecture (User Isolation)
- **Data Privacy:** Users only see the leads, quotations, and employees *they* created.
- **Account Scoping:** Lead and quotation lists are strictly bound to the authenticated user's `payload-token`.

### 5. Employee & Team Management
- Add team members with roles, departments, statuses, and contact information.
- Fully paginated employee lists.

### 6. Admin Settings
- **Price Management:** Define standard base prices for frequently offered services to quickly drop into new quotes.
- **Custom Form Builder:** Add dynamic intake questions to your client forms on the fly.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Backend/CMS:** [Payload CMS 3.0](https://payloadcms.com/) (Headless CMS, running completely within Next.js)
- **Database:** SQLite (LibSQL adapter via Payload)
- **Styling:** Tailwind CSS + Shadcn UI
- **Icons:** Tabler Icons React
- **Dates/Time:** `date-fns`

---

## ⚙️ Local Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/en/) (v18.20.2+ recommended) and `pnpm` installed.

### 1. Clone & Install
```bash
git clone https://github.com/NoahMenezes/Client.git
cd Client
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root based on `.env.example` (if present) or add:
```env
PAYLOAD_SECRET=your_super_secret_payload_string
DATABASE_URI=file:./payload.db
```

### 3. Run the Development Server
```bash
pnpm dev
```
The application will be accessible at:
- **Frontend/Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Payload Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)

### 4. First Time Setup (Admin User)
On your first run, you'll need to create an initial user account:
1. Navigate to `http://localhost:3000/admin`
2. Follow the on-screen instructions to create the first admin user.
3. You can then log into the main CRM interface at `http://localhost:3000/login`.

---

## 🗄️ Database Structure (Payload Collections)

- **Users:** System authentication and user accounts.
- **Leads:** Stores client inquiries, wedding dates, and pipeline status. Linked to `createdBy`.
- **Quotations:** Stores financial estimates, line items, and discounts. Linked to a `Lead` and `createdBy`.
- **Employees:** Stores team member details.
- **Services:** Stores base services and standard pricing (controlled via Settings).
- **FormFields:** Stores dynamic intake questions (controlled via Settings).

---

## 🤝 Need Help?
Check out the **Help** tab inside the dashboard, or connect with us on [Frover.io's LinkedIn](https://www.linkedin.com/company/frover-io/posts/?feedView=all) for support and feature requests!
