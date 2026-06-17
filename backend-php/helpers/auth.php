<?php

require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';

function require_auth(): array {
    $token = get_bearer_token();
    if (!$token) {
        error_response('Missing or invalid authorization header', 401);
    }
    $payload = jwt_decode($token);
    if (!$payload) {
        error_response('Invalid or expired token', 401);
    }
    return $payload;
}

function require_role(array $user, array $roles): void {
    if (!in_array($user['role'], $roles, true)) {
        error_response('Insufficient permissions', 403);
    }
}
