<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class ReviewController {

    // GET /api/reviews  — pending entries for this supervisor
    public function index(): void {
        $auth = require_auth();
        require_role($auth, ['industry_supervisor', 'school_coordinator', 'admin']);
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        if ($role === 'admin') {
            $stmt = $db->prepare('
                SELECT le.*, u.name AS student_name, u.matric_number, u.company AS student_company
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                WHERE le.status = "pending"
                ORDER BY le.created_at ASC
            ');
            $stmt->execute();
        } else {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $stmt = $db->prepare('
                SELECT le.*, u.name AS student_name, u.matric_number, u.company AS student_company
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                JOIN student_supervisors ss ON ss.student_id = le.student_id
                WHERE ss.supervisor_id = ? AND ss.type = ? AND le.status = "pending"
                ORDER BY le.created_at ASC
            ');
            $stmt->execute([$id, $type]);
        }

        json_response($stmt->fetchAll());
    }

    // GET /api/reviews/history
    public function history(): void {
        $auth = require_auth();
        require_role($auth, ['industry_supervisor', 'school_coordinator', 'admin']);
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        if ($role === 'admin') {
            $stmt = $db->prepare('
                SELECT r.*, le.task, le.week_number, le.day_of_week, le.status,
                       u.name AS student_name, u.matric_number,
                       sup.name AS supervisor_name
                FROM reviews r
                JOIN log_entries le ON le.id = r.log_entry_id
                JOIN users u        ON u.id  = le.student_id
                JOIN users sup      ON sup.id = r.supervisor_id
                ORDER BY r.created_at DESC
            ');
            $stmt->execute();
        } else {
            $stmt = $db->prepare('
                SELECT r.*, le.task, le.week_number, le.day_of_week, le.status,
                       u.name AS student_name, u.matric_number
                FROM reviews r
                JOIN log_entries le ON le.id = r.log_entry_id
                JOIN users u        ON u.id  = le.student_id
                WHERE r.supervisor_id = ?
                ORDER BY r.created_at DESC
            ');
            $stmt->execute([$id]);
        }

        json_response($stmt->fetchAll());
    }

    // POST /api/reviews/{entryId}
    public function review(int $entryId): void {
        $auth = require_auth();
        require_role($auth, ['industry_supervisor', 'school_coordinator', 'admin']);
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];
        $body = get_body();

        if (empty($body['action']) || !in_array($body['action'], ['approved', 'rejected'], true)) {
            error_response('action must be "approved" or "rejected"');
        }

        $stmt = $db->prepare('SELECT * FROM log_entries WHERE id = ?');
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();

        if (!$entry) error_response('Log entry not found', 404);
        if ($entry['status'] !== 'pending') error_response('Entry has already been reviewed');

        // Non-admin supervisors must be assigned to the student
        if ($role !== 'admin') {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $stmt = $db->prepare('
                SELECT id FROM student_supervisors
                WHERE supervisor_id = ? AND student_id = ? AND type = ?
            ');
            $stmt->execute([$id, $entry['student_id'], $type]);
            if (!$stmt->fetch()) error_response('Not assigned to this student', 403);
        }

        $db->beginTransaction();
        try {
            $db->prepare('
                INSERT INTO reviews (log_entry_id, supervisor_id, action, comment)
                VALUES (?, ?, ?, ?)
            ')->execute([$entryId, $id, $body['action'], $body['comment'] ?? null]);

            $db->prepare('UPDATE log_entries SET status = ? WHERE id = ?')
               ->execute([$body['action'], $entryId]);

            $db->commit();
        } catch (Exception $e) {
            $db->rollBack();
            throw $e;
        }

        $stmt = $db->prepare('SELECT * FROM reviews WHERE id = ?');
        $stmt->execute([(int)$db->lastInsertId()]);
        json_response($stmt->fetch(), 201);
    }
}
