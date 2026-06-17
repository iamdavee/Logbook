<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class AuthController {

    // POST /api/auth/register
    public function register(): void {
        $body = get_body();

        $required = ['name', 'email', 'password', 'role'];
        foreach ($required as $field) {
            if (empty($body[$field])) {
                error_response("Field '$field' is required");
            }
        }

        $allowed_roles = ['student', 'industry_supervisor', 'school_coordinator', 'admin'];
        if (!in_array($body['role'], $allowed_roles, true)) {
            error_response('Invalid role. Must be one of: ' . implode(', ', $allowed_roles));
        }

        if (!filter_var($body['email'], FILTER_VALIDATE_EMAIL)) {
            error_response('Invalid email address');
        }

        if (strlen($body['password']) < 6) {
            error_response('Password must be at least 6 characters');
        }

        $db = getDB();

        $stmt = $db->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute([$body['email']]);
        if ($stmt->fetch()) {
            error_response('Email already registered', 409);
        }

        if ($body['role'] === 'student' && !empty($body['matric_number'])) {
            $stmt = $db->prepare('SELECT id FROM users WHERE matric_number = ?');
            $stmt->execute([$body['matric_number']]);
            if ($stmt->fetch()) {
                error_response('Matric number already registered', 409);
            }
        }

        $hashed = password_hash($body['password'], PASSWORD_BCRYPT);

        $stmt = $db->prepare('
            INSERT INTO users (name, email, password, role, matric_number, department, level, company)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $body['name'],
            $body['email'],
            $hashed,
            $body['role'],
            $body['matric_number'] ?? null,
            $body['department']    ?? null,
            $body['level']         ?? null,
            $body['company']       ?? null,
        ]);

        $id   = (int)$db->lastInsertId();
        $user = $this->findUser($id);
        $token = jwt_encode(['id' => $id, 'role' => $user['role']]);

        json_response(['user' => $user, 'token' => $token], 201);
    }

    // POST /api/auth/login
    public function login(): void {
        $body = get_body();

        if (empty($body['email']) || empty($body['password'])) {
            error_response('Email and password are required');
        }

        $db   = getDB();
        $stmt = $db->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$body['email']]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($body['password'], $user['password'])) {
            error_response('Invalid email or password', 401);
        }

        $token = jwt_encode(['id' => $user['id'], 'role' => $user['role']]);
        unset($user['password']);

        json_response(['user' => $user, 'token' => $token]);
    }

    // GET /api/auth/me
    public function me(): void {
        $auth = require_auth();
        $user = $this->findUser($auth['id']);
        if (!$user) error_response('User not found', 404);
        json_response($user);
    }

    // PATCH /api/auth/me
    public function updateMe(): void {
        $auth = require_auth();
        $body = get_body();
        $db   = getDB();

        $allowed = ['name', 'department', 'level', 'company', 'avatar'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $field) {
            if (array_key_exists($field, $body)) {
                $sets[]   = "$field = ?";
                $params[] = $body[$field];
            }
        }

        if (!empty($body['password'])) {
            if (strlen($body['password']) < 6) error_response('Password must be at least 6 characters');
            $sets[]   = 'password = ?';
            $params[] = password_hash($body['password'], PASSWORD_BCRYPT);
        }

        if (empty($sets)) error_response('No fields to update');

        $params[] = $auth['id'];
        $db->prepare('UPDATE users SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);

        json_response($this->findUser($auth['id']));
    }

    private function findUser(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare('
            SELECT id, name, email, role, matric_number, department, level, company, avatar, created_at
            FROM users WHERE id = ?
        ');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
}
