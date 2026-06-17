<?php

require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/LogbookController.php';
require_once __DIR__ . '/controllers/ReviewController.php';
require_once __DIR__ . '/controllers/StudentController.php';
require_once __DIR__ . '/controllers/UserController.php';
require_once __DIR__ . '/controllers/DashboardController.php';

cors_headers();

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip base path (adjust if installed in a subfolder, e.g. /logbook-api)
$uri = preg_replace('#^/logbook-api#', '', $uri);
$uri = rtrim($uri, '/');

// Health check
if ($uri === '/health' && $method === 'GET') {
    json_response(['status' => 'ok', 'timestamp' => date('c')]);
}

// ── Auth ──────────────────────────────────────────────────────────
if ($uri === '/api/auth/register' && $method === 'POST') {
    (new AuthController())->register();
}
if ($uri === '/api/auth/login' && $method === 'POST') {
    (new AuthController())->login();
}
if ($uri === '/api/auth/me') {
    if ($method === 'GET')   (new AuthController())->me();
    if ($method === 'PATCH') (new AuthController())->updateMe();
}

// ── Logbook ───────────────────────────────────────────────────────
if ($uri === '/api/logbook') {
    if ($method === 'GET')  (new LogbookController())->index();
    if ($method === 'POST') (new LogbookController())->create();
}
if (preg_match('#^/api/logbook/(\d+)$#', $uri, $m)) {
    $entryId = (int)$m[1];
    if ($method === 'GET')    (new LogbookController())->show($entryId);
    if ($method === 'PATCH')  (new LogbookController())->update($entryId);
    if ($method === 'DELETE') (new LogbookController())->delete($entryId);
}

// ── Reviews ───────────────────────────────────────────────────────
if ($uri === '/api/reviews' && $method === 'GET') {
    (new ReviewController())->index();
}
if ($uri === '/api/reviews/history' && $method === 'GET') {
    (new ReviewController())->history();
}
if (preg_match('#^/api/reviews/(\d+)$#', $uri, $m) && $method === 'POST') {
    (new ReviewController())->review((int)$m[1]);
}

// ── Students ──────────────────────────────────────────────────────
if ($uri === '/api/students' && $method === 'GET') {
    (new StudentController())->index();
}
if ($uri === '/api/students/assign') {
    if ($method === 'POST')   (new StudentController())->assign();
    if ($method === 'DELETE') (new StudentController())->unassign();
}
if (preg_match('#^/api/students/(\d+)$#', $uri, $m) && $method === 'GET') {
    (new StudentController())->show((int)$m[1]);
}

// ── Users ─────────────────────────────────────────────────────────
if ($uri === '/api/users' && $method === 'GET') {
    (new UserController())->index();
}
if ($uri === '/api/users/stats' && $method === 'GET') {
    (new UserController())->stats();
}
if (preg_match('#^/api/users/(\d+)$#', $uri, $m)) {
    if ($method === 'GET')    (new UserController())->show((int)$m[1]);
    if ($method === 'DELETE') (new UserController())->delete((int)$m[1]);
}

// ── Dashboard ─────────────────────────────────────────────────────
if ($uri === '/api/dashboard/stats' && $method === 'GET') {
    (new DashboardController())->stats();
}
if ($uri === '/api/dashboard/notifications' && $method === 'GET') {
    (new DashboardController())->notifications();
}

// ── 404 ───────────────────────────────────────────────────────────
error_response("Route not found: $method $uri", 404);
