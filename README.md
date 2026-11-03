# SpendSense 💳📊
A full-stack personal expense tracking and budgeting web application built as a 6th-semester Computer Science undergraduate project.

---

## 🚀 Tech Stack
* **Backend:** Laravel (PHP 8.2+) with Inertia.js & Sanctum
* **Frontend:** React with TypeScript, Tailwind CSS v4, and Lucide React
* **Charts:** Recharts (Interactive cash flow & category breakdown)
* **Database & Server:** XAMPP (Apache & MariaDB) with exact decimal financial arithmetic

---

## 🪟 Windows Setup & Deployment (XAMPP Control Panel)

1. **Prerequisites**: Install [XAMPP](https://www.apachefriends.org/) (PHP 8.2+), Node.js (v20+), and Composer.
2. **Start XAMPP**: Open the XAMPP Control Panel and click **Start** next to **MySQL** (and Apache if using phpMyAdmin).
3. **Create Database**: Open PowerShell and run:
   ```powershell
   C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS spendsense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
