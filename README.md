# SpendSense

SpendSense is a personal expense and budget tracker for a university web development project. It records income and expenses in Pakistani rupees, tracks monthly category budgets, and shows spending reports.

Laravel 13 handles authentication, validation, and database queries. Inertia sends the results to React pages. The interface uses TypeScript, Tailwind CSS 4, the official Laravel React starter kit components, and Recharts. MariaDB stores the records.

Windows users can follow the [Windows setup guide](README-WINDOWS.md).

## Set up on Arch Linux

Install the native packages from your terminal. The locked dependencies require PHP 8.4.1 or newer. The project is tested with PHP 8.5.

```bash
sudo pacman -Syu --needed php php-sqlite composer nodejs npm mariadb
php -v
composer --version
node --version
npm --version
mariadb --version
```

In the active PHP configuration file shown by `php --ini`, enable `extension=pdo_mysql` for MariaDB, `extension=pdo_sqlite` for automated tests, and `extension=curl` and `extension=iconv` for Composer. The checklist below covers Laravel's required extensions and both database drivers.

```bash
php -r 'foreach (["ctype","curl","dom","fileinfo","filter","hash","mbstring","openssl","pcre","PDO","session","tokenizer","xml","pdo_mysql","pdo_sqlite"] as $module) { if (!extension_loaded($module)) { echo "Missing: $module\n"; } }'
```

Check whether MariaDB is already active with `systemctl is-active mariadb`. Inspect the data directory (typically `/var/lib/mysql`) and server configuration if the service is inactive. Run the following initialization command only for a fresh installation with an empty data directory.

```bash
sudo mariadb-install-db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```

Start the service if needed, then open the local MariaDB administrator console.

```bash
sudo systemctl start mariadb
sudo mariadb
```

Create the database and a dedicated local account. Replace the example password with a unique password. If either name already exists, inspect the existing database and grants before proceeding.

```sql
CREATE DATABASE spendsense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'spendsense'@'127.0.0.1' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON spendsense.* TO 'spendsense'@'127.0.0.1';
EXIT;
```

## Configure and run the application

In the project directory, copy the example environment file if you do not have a local one. Set `DB_PASSWORD` in `.env` to the password you chose. The example already sets `DB_CONNECTION=mariadb`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=spendsense`, and `DB_USERNAME=spendsense`. Keep `.env` private.

```bash
test -f .env || cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
npm install
```

Generate the application key only during initial setup or when `APP_KEY` is empty. Existing application keys are needed to decrypt existing data.

In two terminals in the project directory, run:

```bash
php artisan serve
```

```bash
npm run dev
```

Open [SpendSense on localhost](http://127.0.0.1:8000). Create an account to get starting income and expense categories. The starter kit uses the log mailer in local development. Open the email verification link in `storage/logs/laravel.log` to access the dashboard. Password-reset links are written to the same log.

## Demo account

To create a verified demo account with the starting categories, run this after migrating your local database:

```bash
php artisan db:seed
```

Sign in with `demo@spendsense.test` and `SpendSenseDemo2026!`. The seeder runs only when `APP_ENV=local`. A second run leaves the existing account as it is.

## Run checks

```bash
php artisan wayfinder:generate
php artisan test
npm run types:check
npm run build
```

The automated tests use an in-memory SQLite database. Run the migrations and create a transaction in the browser to exercise the MariaDB connection itself.

## How the numbers work

- Recorded balance equals all recorded income minus all recorded expenses.
- Monthly reports group transactions by their transaction date and show the selected month plus the five months before it.
- A budget counts expenses matching its category, year, and month. Remaining budget equals the limit minus those expenses. Percentage used equals expenses divided by the limit, multiplied by 100.
- A category can be renamed while in use. Move or remove its transactions and budgets before changing its type or deleting it.
