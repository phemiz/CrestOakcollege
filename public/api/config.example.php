<?php
/**
 * CrestOak College — Server Configuration Example
 * ================================================
 * Copy this file to `config.php` on your host or use environment variables.
 *
 * PREFERRED WAY:
 *  Set environment variables on your server: DB_HOST, DB_NAME, DB_USER, DB_PASS.
 *
 * FALLBACK WAY (for hosts without env var support):
 *  Copy config.example.php -> config.php and update values below.
 */

// ── MySQL credentials ─────────────────────────────────────────────────────
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
