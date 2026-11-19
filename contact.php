<?php
header('Content-Type: application/json');

$to = 'oasislachambersltd@gmail.com';

// Block anything that is not a normal form submission, and block bots (hidden field filled)
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($_POST['website'])) {
  http_response_code(400);
  echo json_encode(['ok' => false]);
  exit;
}

// Clean the one-line fields so nobody can inject extra email headers
$clean = fn($s) => trim(str_replace(["\r", "\n"], ' ', strip_tags($s ?? '')));

$name = $clean($_POST['name'] ?? '');
$phone = $clean($_POST['phone'] ?? '');
$area = $clean($_POST['area'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || $phone === '' || $message === '' || strlen($message) > 3000) {
  http_response_code(422);
  echo json_encode(['ok' => false]);
  exit;
}

$subject = "New website inquiry from $name";
$body = "Name: $name\nPhone: $phone\nArea of law: $area\n\nMessage:\n$message";

// Change this to an address on your own domain once you have it, for example info@yourdomain.rw
$headers = 'From: website@yourdomain.rw';

echo json_encode(['ok' => mail($to, $subject, $body, $headers)]);