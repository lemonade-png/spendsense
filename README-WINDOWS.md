# Run SpendSense on Windows

Use native PHP, Node.js, and MariaDB on Windows. Laravel serves the application locally, and the setup script builds its frontend.

## 1. Install the prerequisites

- Install [Git for Windows](https://gitforwindows.org/).
- Install [PHP for Windows](https://windows.php.net/download/) **8.3 or newer**. PHP 8.5 is the version verified on the development machine. Add the PHP folder to your user PATH.
- Install [Composer](https://getcomposer.org/download/) using its Windows installer. Point it at the same PHP executable.
- Install [Node.js 24 LTS](https://nodejs.org/en/download), **version 24.11 or newer**, which includes npm.
- Install [MariaDB](https://mariadb.com/downloads/) with its Windows MSI installer. Configure it as a Windows service on port 3306 and set an administrator password.

Open a new PowerShell window after installing the tools:

```powershell
php -v
php --ini
composer --version
node --version
npm.cmd --version
Get-Service *maria*
```

If `php --ini` reports no configuration file, copy `php.ini-development` from the PHP folder to `php.ini` in the same folder. In the active `php.ini`, set `extension_dir = "ext"` or use the full path to the PHP extensions folder. Enable these entries by removing the leading semicolon where present:

```ini
extension=curl
extension=iconv
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=pdo_sqlite
extension=zip
```

Some PHP builds include extensions directly. Use `php -m` to check which ones already load. If the MariaDB service is stopped, start it in the Windows Services app.

## 2. Create the database and configure SpendSense

Add MariaDB’s `bin` folder to PATH or open its client by full path. In PowerShell, run:

```powershell
mariadb.exe -u root -p
```

In the MariaDB console, replace the example password with a unique password and run:

```sql
CREATE DATABASE spendsense CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'spendsense'@'127.0.0.1' IDENTIFIED BY 'replace-with-a-unique-password';
GRANT ALL PRIVILEGES ON spendsense.* TO 'spendsense'@'127.0.0.1';
EXIT;
```

If the database or account already exists, use the existing SpendSense database credentials. Clone the workspace version and configure it in PowerShell:

```powershell
git clone --branch workspace-version https://github.com/lemonade-png/spendsense.git SpendSense
cd SpendSense
```

If you already have this version checked out, start in that project folder.

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
notepad .env
```

Set the following values. If you chose a different local MariaDB port, use it for `DB_PORT`.

```dotenv
DB_CONNECTION=mariadb
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=spendsense
DB_USERNAME=spendsense
DB_PASSWORD="replace-with-a-unique-password"
```

## 3. Build, test, and start

From the project folder, run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1 -Demo -Serve
```

The script installs the locked dependencies, generates the application key when needed, runs migrations, builds the frontend, and runs the TypeScript and Laravel checks. `-Demo` seeds a verified demo account. `-Serve` starts Laravel after the checks pass. The PowerShell execution policy applies only to the child process.

Open [SpendSense](http://127.0.0.1:8000). With `-Demo`, sign in with `demo@spendsense.test` and `SpendSenseDemo2026!`. For a new registration, use the verification link in `storage/logs/laravel.log`.

If you prefer to run the steps individually:

```powershell
composer install --no-interaction
# Generate the key only if APP_KEY is empty in .env.
php artisan key:generate
php artisan migrate
php artisan db:seed
npm.cmd ci
npm.cmd run build
npm.cmd run types:check
php artisan test
php artisan serve
```
