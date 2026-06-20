<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class UserController {

    // GET /api/users
    public function index(): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();

        $role = $_GET['role'] ?? null;
        $sql  = 'SELECT id, name, email, role, matric_number, department, level, company, avatar, created_at
                 FROM users WHERE 1=1';
        $params = [];

        if ($role) { $sql .= ' AND role = ?'; $params[] = $role; }
        $sql .= ' ORDER BY role ASC, name ASC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        json_response($stmt->fetchAll());
    }

    // GET /api/users/stats
    public function stats(): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();

        $stmt = $db->query('SELECT
            (SELECT COUNT(*) FROM users WHERE role = "student")              AS total_students,
            (SELECT COUNT(*) FROM users WHERE role = "industry_supervisor")  AS total_industry_supervisors,
            (SELECT COUNT(*) FROM users WHERE role = "school_coordinator")   AS total_school_coordinators,
            (SELECT COUNT(*) FROM users WHERE role = "itf_official")         AS total_itf_officials,
            (SELECT COUNT(*) FROM users WHERE role = "admin")                AS total_admins,
            (SELECT COUNT(*) FROM log_entries)                               AS total_entries,
            (SELECT COUNT(*) FROM log_entries WHERE status = "pending")      AS pending_entries,
            (SELECT COUNT(*) FROM log_entries WHERE status = "approved")     AS approved_entries,
            (SELECT COUNT(*) FROM log_entries WHERE status = "rejected")     AS rejected_entries
        ');
        json_response($stmt->fetch());
    }

    // GET /api/users/{id}
    public function show(int $userId): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();

        $stmt = $db->prepare('
            SELECT id, name, email, role, matric_number, department, level, company, avatar, created_at
            FROM users WHERE id = ?
        ');
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        if (!$user) error_response('User not found', 404);
        json_response($user);
    }

    // DELETE /api/users/{id}
    public function delete(int $userId): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();

        if ((int)$auth['id'] === $userId) error_response('Cannot delete your own account');

        $stmt = $db->prepare('SELECT id FROM users WHERE id = ?');
        $stmt->execute([$userId]);
        if (!$stmt->fetch()) error_response('User not found', 404);

        $db->prepare('DELETE FROM users WHERE id = ?')->execute([$userId]);
        http_response_code(204);
        exit;
    }
}
