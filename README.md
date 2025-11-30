# FORBI - Comprehensive Retail Management & Billing System

FORBI is a **modern, full-featured retail management and billing system** designed for small to medium-sized businesses. It's a complete solution for managing sales, inventory, customers, and financial operations with an intuitive, responsive user interface.

---

## 📋 Table of Contents

- [Features](#-key-features--modules)
- [Technology Stack](#-core-technology-stack)
- [Installation](#-installation)
- [Development](#-development--deployment)
- [Use Cases](#-use-cases)
- [Project Structure](#-project-structure)

---

## 🎯 Key Features & Modules

### 1. **Dashboard**
- Real-time KPIs: Total Revenue, Expenses, Profit
- Business Metrics: Products, Customers, Invoices count
- Low Stock Alerts with visual warnings
- Recent Invoices overview
- Top Products analysis with revenue data
- Trend Analysis with visual indicators

### 2. **Billing System (Point of Sale)**
- Complete POS Interface for bill creation
- Product Search & Barcode Scanning
- Shopping Cart Management with real-time calculations
- Customer Search and Selection
- Dynamic Pricing with per-item price, tax, and discounts
- Multiple Payment Modes (Cash, Card, etc.)
- GST/Tax Handling with automatic calculation
- Hold Bill Feature to save bills for later
- Automatic Invoice Generation
- Print Preview and Invoice Printing

### 3. **Products Management**
- Complete CRUD Operations
- Product Catalog with detailed information
- Barcode Generation and Management
- Real-time Stock Tracking
- Category Organization
- Pricing Management
- Bulk Import/Export with Excel
- Advanced Search & Filter capabilities

### 4. **Inventory Management**
- Real-time Stock Level Monitoring
- Stock Adjustments (Add, Remove, Set quantities)
- Low Stock Alerts with visual indicators
- Complete Adjustment History & Audit Trail
- Stock Valuation Reports
- Product Location Tracking
- Configurable Minimum Stock Levels

### 5. **Customer Management**
- Customer Database with detailed profiles
- Contact Details (Phone, Email, Address)
- Customer Segmentation
- Purchase History Tracking
- GST Registration Support
- Advanced Search & Filter

### 6. **Invoices**
- Invoice Creation from Billing System
- Complete Invoice Tracking
- Invoice Status Management (Paid/Pending/Partial)
- PDF Download & Export
- Print Functionality
- Email Integration for sending invoices
- Customizable Invoice Templates
- Date-based Filtering

### 7. **Payments**
- Payment Recording and Tracking
- Payment Status Management
- Multiple Payment Methods Support
- Payment Reconciliation
- Outstanding Payments Tracking

### 8. **Purchases & Suppliers**
- Purchase Order Creation & Tracking
- Supplier Database Management
- Complete Purchase History
- Cost Tracking and Monitoring
- Supplier Contact Information

### 9. **Expenses**
- Comprehensive Expense Tracking
- Expense Categorization
- Expense Reports Generation
- Budget Monitoring
- Multiple Expense Categories

### 10. **Reports & Analytics**
- Sales Summary Reports
- Sales by Item Analysis
- Sales by Customer Analysis
- Purchase Summary Reports
- Expense Reports
- Stock Valuation Reports
- Custom Date Range Filtering
- Export to Excel functionality

### 11. **Barcode Management**
- Barcode Generation for Products
- Barcode Label Printing
- Barcode Scanning Support in Billing

### 12. **User & Access Management**
- Multi-User Support with Different Roles
- Admin and Billing User Roles
- Employee Management
- Role-Based Access Control
- Comprehensive Admin Dashboard

### 13. **Settings & Configuration**
- Business Settings (Name, GST Number)
- Invoice Customization (Prefix, Numbering)
- Currency Configuration
- Default Tax Rate Settings
- Logo Management & Upload
- Theme Switching (Light/Dark Mode)

### 14. **Deleted Items Tracking**
- Trash/Archive for deleted items
- Recovery Options
- Complete Audit Trail

### 15. **Authentication & Security**
- Secure User Login
- Cookie-Based Session Management
- Protected Routes with Role-Based Access
- Secure Logout
- Authorization Controls

### 16. **Admin Notifications**
- Real-time Low Stock Alerts
- New Order Notifications
- Payment Alerts
- Unread Notification Tracking
- Priority-Based Categorization

---

## 🛠️ Core Technology Stack

| Technology | Purpose |
|-----------|---------|
| **React 18+** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Fast Build Tool & Dev Server |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Pre-built UI Components (Radix UI) |
| **Zustand** | State Management |
| **React Router** | Client-side Routing |
| **TanStack React Query** | Data Fetching & Caching |
| **Lucide React** | Icons |
| **next-themes** | Theme Management (Light/Dark) |
| **React Hook Form** | Form Management |
| **date-fns** | Date Handling |

---

## 📦 Installation

### Prerequisites
- Node.js (v14+) & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Setup Steps

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd forbi-frontEnd

# Step 3: Install dependencies
npm i

# Step 4: Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

---

## 🚀 Development & Deployment

### Available Scripts

```sh
# Development server with hot reload
npm run dev

# Production build
npm run build

# Development build
npm run build:dev

# Code linting
npm lint

# Preview production build
npm preview
```

### Edit Code

**Option 1: Use Your Preferred IDE**
- Clone the repo and work locally with VS Code, WebStorm, etc.

**Option 2: Edit on GitHub**
- Navigate to files and click the Edit (pencil) button
- Make changes and commit

**Option 3: GitHub Codespaces**
- Click "Code" → "Codespaces" → "New codespace"
- Edit directly in the browser environment

### Deployment

Deploy this project using:
- **Vercel** - Recommended for Vite apps
- **Netlify** - Drag and drop deployment
- **Any Node.js Hosting** - AWS, DigitalOcean, Heroku, etc.

---

## 💼 Use Cases

This system is ideal for:

✅ **Retail Stores** - Complete POS and inventory management  
✅ **Billing Services** - Invoice and payment tracking  
✅ **Wholesale Businesses** - Supplier and purchase management  
✅ **Small Enterprises** - All-in-one business management  
✅ **Multi-location Operations** - Centralized reporting and analytics  
✅ **Franchise Operations** - Multi-user, role-based access  

---

## 📁 Project Structure

```
forbi-frontEnd/
├── src/
│   ├── components/
│   │   ├── layout/           # Header, Sidebar, Main layout
│   │   ├── ui/               # Reusable UI components
│   │   └── theme-provider.tsx # Theme management
│   ├── pages/                # Application pages/routes
│   │   ├── Dashboard.tsx
│   │   ├── Billing.tsx
│   │   ├── Products.tsx
│   │   ├── Inventory.tsx
│   │   ├── Customers.tsx
│   │   ├── Invoices.tsx
│   │   ├── Payments.tsx
│   │   ├── Purchases.tsx
│   │   ├── Expenses.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── Users.tsx
│   │   ├── Employees.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Barcode.tsx
│   │   ├── DeletedItems.tsx
│   │   └── Login.tsx
│   ├── store/                # State management
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Utility functions
│   ├── App.tsx               # Main app component
│   └── main.tsx              # Entry point
├── public/                   # Static assets
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite configuration
├── tailwind.config.ts        # Tailwind CSS config
└── README.md                 # This file
```

---

## 🎨 UI/UX Features

- ✨ **Responsive Design** - Works on desktop, tablet, and mobile
- 🌓 **Dark Mode Support** - Light and dark theme options
- 🔔 **Toast Notifications** - Real-time user feedback
- 📋 **Modal Dialogs** - Clean modal interfaces for forms
- 📊 **Data Tables** - Sortable and filterable displays
- ⏳ **Loading States** - Visual feedback during data fetching
- ⚠️ **Error Handling** - User-friendly error messages
- 🔍 **Search Functionality** - Quick search across modules
- 📄 **Pagination** - Navigate through large datasets
- 🎯 **Intuitive Icons** - Clear visual indicators

---

## 🔄 Business Process Support

| Process | Support |
|---------|---------|
| **Sales Cycle** | Billing → Invoice → Payment → Reports |
| **Inventory** | Stock Tracking → Adjustments → Alerts → Valuation |
| **Financial** | Revenue → Expenses → Profit → Analytics |
| **Customers** | Database → Purchase History → Segmentation |
| **Suppliers** | Database → Purchase Orders → Payment Tracking |
| **Multi-user** | Different roles → Permissions → Admin controls |
| **Data Export** | Excel export for external analysis |

---

## 📝 License

This project is part of the FORBI-BILLING suite developed by vvajidz.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

For issues and questions, please open an issue in the repository.
