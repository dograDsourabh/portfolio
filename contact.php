<?php
/**
 * Contact Form Handler
 * Receives POST data, validates, and sends email to the portfolio owner.
 *
 * Setup:
 *  1. Change $to to your preferred email address.
 *  2. Change $fromDomain to your actual domain.
 *  3. Deploy to any PHP host (Apache / Nginx with PHP 7.4+).
 *  4. For shared hosting, mail() usually works out-of-the-box.
 *  5. For VPS / custom server, configure an SMTP relay or use PHPMailer.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/* ---- Config ---- */
const RECIPIENT   = 'dograsourabh91@gmail.com';
const FROM_DOMAIN = 'sourabh.himsparsh.in';
const RATE_LIMIT  = 60; // seconds between submissions per session

/* ---- CORS (restrict in production to your own origin) ---- */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Method not allowed.', 405);
}

/* ---- Session-based rate limiting ---- */
session_start();
$now = time();
if (isset($_SESSION['last_contact']) && ($now - $_SESSION['last_contact']) < RATE_LIMIT) {
    respond(false, 'Please wait a moment before sending another message.', 429);
}

/* ---- Honeypot check ---- */
if (!empty($_POST['website'])) {
    respond(false, 'Spam detected.', 400);
}

/* ---- Sanitise & validate ---- */
$name    = sanitise($_POST['name']    ?? '');
$email   = filter_var(trim($_POST['email']   ?? ''), FILTER_SANITIZE_EMAIL);
$subject = sanitise($_POST['subject'] ?? '');
$message = sanitise($_POST['message'] ?? '');

if (strlen($name)    < 2)                             respond(false, 'Name is too short.',                 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        respond(false, 'Invalid email address.',             400);
if (strlen($subject) < 3)                             respond(false, 'Subject is too short.',              400);
if (strlen($message) < 20)                            respond(false, 'Message must be at least 20 characters.', 400);
if (strlen($message) > 5000)                          respond(false, 'Message is too long.',               400);

/* ---- Build email ---- */
$to          = RECIPIENT;
$mailSubject = '[Portfolio] ' . $subject;

$body  = "New message from your portfolio contact form:\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name:    {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n\n";
$body .= str_repeat('-', 50) . "\n";
$body .= "Sent at: " . date('Y-m-d H:i:s T') . "\n";

$headers  = "From: Portfolio Contact <no-reply@" . FROM_DOMAIN . ">\r\n";
$headers .= "Reply-To: {$name} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

/* ---- Send ---- */
if (mail($to, $mailSubject, $body, $headers)) {
    $_SESSION['last_contact'] = $now;
    respond(true, "Message sent! I'll get back to you within 24 hours.");
} else {
    respond(false, 'Could not send email. Please try emailing me directly at ' . RECIPIENT, 500);
}

/* ---- Helpers ---- */
function sanitise(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function respond(bool $success, string $message, int $code = 200): void {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}
