<?php
/**
 * CrestOak College — Server Configuration
 * ========================================
 * ⚠️  IMPORTANT: Fill in your real Whogohost MySQL credentials below.
 *
 * HOW TO CONFIGURE ON WHOGOHOST:
 *  1. Login to DirectAdmin → MySQL Management
 *  2. Create a database (e.g. crestoak_db) and a database user
 *  3. Note the exact DB Host (usually 'localhost'), DB Name, DB User, DB Password
 *  4. Open this file in Whogohost File Manager → edit the values below → Save
 *
 * This file is committed with placeholder values only.
 * NEVER commit real passwords — always edit directly on the server.
 */

// ── MySQL credentials ─────────────────────────────────────────────────────
// Replace each value with your actual Whogohost MySQL details:
define('DB_CONFIG_HOST', 'localhost');           // Almost always 'localhost' on shared hosting
define('DB_CONFIG_NAME', 'YOUR_DB_NAME_HERE');   // e.g. cpanelusername_crestoak
define('DB_CONFIG_USER', 'YOUR_DB_USER_HERE');   // e.g. cpanelusername_user
define('DB_CONFIG_PASS', 'YOUR_DB_PASS_HERE');   // The password you set in DirectAdmin

// ── SMTP credentials ──────────────────────────────────────────────────────
define('SMTP_CONFIG_HOST', 'da34.host-ww.net');
define('SMTP_CONFIG_PORT', 465);
define('SMTP_CONFIG_USER', 'info@crestoakcollege.com.ng');
define('SMTP_CONFIG_PASS', 'YOUR_EMAIL_PASSWORD_HERE');

// ── Paystack ──────────────────────────────────────────────────────────────
define('PAYSTACK_SECRET_KEY', 'YOUR_PAYSTACK_SECRET_KEY_HERE');
