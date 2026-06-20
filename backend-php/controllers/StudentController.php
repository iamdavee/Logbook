<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class StudentController {

    // GET /api/students
    public function index(): void {
        $auth = require_auth();
        require_role($auth, ['industry_supervisor', 'school_coordinator', 'admin', 'itf_official']);
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        if ($role === 'admin' || $role === 'itf_official') {
            $stmt = $db->prepare('
                SELECT u.id, u.name, u.email, u.matric_number, u.department, u.level, u.company,
                       u.avatar, u.created_at,
                       COUNT(le.id)                                                       AS total_entries,
                       SUM(le.status = "pending")                                         AS pending_entries,
                       SUM(le.status = "approved")                                        AS approved_entries,
                       GROUP_CONCAT(DISTINCT CONCAT(sup.name, " (", ss.type, ")") SEPARATOR ", ") AS supervisors
                FROM users u
                LEFT JOIN log_entries le ON le.student_id = u.id
                LEFT JOIN student_supervisors ss ON ss.student_id = u.id
                LEFT JOIN users sup ON sup.id = ss.supervisor_id
                WHERE u.role = "student"
                GROUP BY u.id
                ORDER BY u.name ASC
            ');
            $stmt->execute();
        } else {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $stmt = $db->prepare('
                SELECT u.id, u.name, u.email, u.matric_number, u.department, u.level, u.company,
                       u.avatar, ss.type AS assignment_type,
                       COUNT(le.id)              AS total_entries,
                       SUM(le.status = "pending")  AS pending_entries,
                       SUM(le.status = "approved") AS approved_entries
                FROM student_supervisors ss
                JOIN users u ON u.id = ss.student_id
                LEFT JOIN log_entries le ON le.student_id = u.id
                WHERE ss.supervisor_id = ? AND ss.type = ?
                GROUP BY u.id
                ORDER BY u.name ASC
            ');
            $stmt->execute([$id, $type]);
        }

        json_response($stmt->fetchAll());
    }

    // GET /api/students/{id}
    public function show(int $studentId): void {
        $auth = require_auth();
        require_role($auth, ['industry_supervisor', 'school_coordinator', 'admin', 'itf_official']);
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        // Non-admins (except itf_official) must be assigned to the student
        if ($role !== 'admin' && $role !== 'itf_official') {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $stmt = $db->prepare('SELECT id FROM student_supervisors WHERE supervisor_id = ? AND student_id = ? AND type = ?');
            $stmt->execute([$id, $studentId, $type]);
            if (!$stmt->fetch()) error_response('Not assigned to this student', 403);
        }

        $stmt = $db->prepare('
            SELECT id, name, email, matric_number, department, level, company, avatar, created_at
            FROM users WHERE id = ? AND role = "student"
        ');
        $stmt->execute([$studentId]);
        $student = $stmt->fetch();
        if (!$student) error_response('Student not found', 404);

        // Logbook entries
        $stmt = $db->prepare('
            SELECT le.*, r.action AS review_action, r.comment AS review_comment,
                   sup.name AS reviewer_name
            FROM log_entries le
            LEFT JOIN reviews r ON r.log_entry_id = le.id
            LEFT JOIN users sup ON sup.id = r.supervisor_id
            WHERE le.student_id = ?
            ORDER BY le.week_number ASC, le.day_of_week ASC
        ');
        $stmt->execute([$studentId]);
        $student['log_entries'] = $stmt->fetchAll();

        // Assigned supervisors
        $stmt = $db->prepare('
            SELECT sup.id, sup.name, sup.email, sup.role, ss.type AS assignment_type
            FROM student_supervisors ss
            JOIN users sup ON sup.id = ss.supervisor_id
            WHERE ss.student_id = ?
        ');
        $stmt->execute([$studentId]);
        $student['supervisors'] = $stmt->fetchAll();

        // Reviews (itf_official comments included)
        $stmt = $db->prepare('
            SELECT r.id, r.action, r.comment, r.created_at,
                   sup.name AS reviewer_name, sup.role AS reviewer_role
            FROM reviews r
            JOIN users sup ON sup.id = r.supervisor_id
            JOIN log_entries le ON le.id = r.log_entry_id
            WHERE le.student_id = ?
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([$studentId]);
        $student['reviews'] = $stmt->fetchAll();

        json_response($student);
    }

    // POST /api/students/assign  (admin only)
    public function assign(): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();
        $body = get_body();

        if (empty($body['student_id']) || empty($body['supervisor_id']) || empty($body['type'])) {
            error_response('student_id, supervisor_id and type are required');
        }
        if (!in_array($body['type'], ['industry', 'school', 'itf'], true)) {
            error_response('type must be "industry", "school", or "itf"');
        }

        $stmt = $db->prepare('SELECT id FROM users WHERE id = ? AND role = "student"');
        $stmt->execute([$body['student_id']]);
        if (!$stmt->fetch()) error_response('Student not found', 404);

        $stmt = $db->prepare('SELECT id FROM users WHERE id = ? AND role IN ("industry_supervisor","school_coordinator","itf_official")');
        $stmt->execute([$body['supervisor_id']]);
        if (!$stmt->fetch()) error_response('Supervisor not found', 404);

        try {
            $stmt = $db->prepare('INSERT INTO student_supervisors (student_id, supervisor_id, type) VALUES (?, ?, ?)');
            $stmt->execute([$body['student_id'], $body['supervisor_id'], $body['type']]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') error_response('Assignment already exists', 409);
            throw $e;
        }

        json_response(['message' => 'Assignment created', 'id' => (int)$db->lastInsertId()], 201);
    }

    // DELETE /api/students/assign  (admin only)
    public function unassign(): void {
        $auth = require_auth();
        require_role($auth, ['admin']);
        $db   = getDB();
        $body = get_body();

        if (empty($body['student_id']) || empty($body['supervisor_id'])) {
            error_response('student_id and supervisor_id are required');
        }

        $sql    = 'DELETE FROM student_supervisors WHERE student_id = ? AND supervisor_id = ?';
        $params = [$body['student_id'], $body['supervisor_id']];

        if (!empty($body['type'])) {
            $sql    .= ' AND type = ?';
            $params[] = $body['type'];
        }

        $db->prepare($sql)->execute($params);
        http_response_code(204);
        exit;
    }
}
