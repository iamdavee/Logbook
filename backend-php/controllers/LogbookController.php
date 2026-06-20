<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class LogbookController {

    // GET /api/logbook
    public function index(): void {
        $auth = require_auth();
        $db   = getDB();
        $role = $auth['role'];
        $id   = (int)$auth['id'];

        $week      = isset($_GET['week'])      ? (int)$_GET['week']      : null;
        $status    = $_GET['status']    ?? null;
        $studentId = isset($_GET['student_id']) ? (int)$_GET['student_id'] : null;

        if ($role === 'student') {
            $sql    = 'SELECT le.*, r.action AS review_action, r.comment AS review_comment,
                              r.created_at AS reviewed_at, u.name AS reviewer_name
                       FROM log_entries le
                       LEFT JOIN reviews r ON r.log_entry_id = le.id
                       LEFT JOIN users u   ON u.id = r.supervisor_id
                       WHERE le.student_id = ?';
            $params = [$id];
            if ($week)   { $sql .= ' AND le.week_number = ?'; $params[] = $week; }
            if ($status) { $sql .= ' AND le.status = ?';      $params[] = $status; }
            $sql .= ' ORDER BY le.week_number ASC, le.day_of_week ASC';

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            json_response($stmt->fetchAll());
        }

        if ($role === 'industry_supervisor' || $role === 'school_coordinator') {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $sql  = 'SELECT le.*, u.name AS student_name, u.matric_number,
                            r.action AS review_action, r.comment AS review_comment
                     FROM log_entries le
                     JOIN users u ON u.id = le.student_id
                     JOIN student_supervisors ss ON ss.student_id = le.student_id
                     LEFT JOIN reviews r ON r.log_entry_id = le.id
                     WHERE ss.supervisor_id = ? AND ss.type = ?';
            $params = [$id, $type];
            if ($week)      { $sql .= ' AND le.week_number = ?';  $params[] = $week; }
            if ($status)    { $sql .= ' AND le.status = ?';       $params[] = $status; }
            if ($studentId) { $sql .= ' AND le.student_id = ?';   $params[] = $studentId; }
            $sql .= ' ORDER BY le.created_at DESC';

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            json_response($stmt->fetchAll());
        }

        // itf_official: read-only access to all entries
        if ($role === 'itf_official') {
            $sql    = 'SELECT le.*, u.name AS student_name, u.matric_number,
                              r.action AS review_action, r.comment AS review_comment
                       FROM log_entries le
                       JOIN users u ON u.id = le.student_id
                       LEFT JOIN reviews r ON r.log_entry_id = le.id
                       WHERE 1=1';
            $params = [];
            if ($week)      { $sql .= ' AND le.week_number = ?'; $params[] = $week; }
            if ($status)    { $sql .= ' AND le.status = ?';      $params[] = $status; }
            if ($studentId) { $sql .= ' AND le.student_id = ?';  $params[] = $studentId; }
            $sql .= ' ORDER BY le.created_at DESC';

            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            json_response($stmt->fetchAll());
        }

        // admin
        $sql    = 'SELECT le.*, u.name AS student_name, u.matric_number
                   FROM log_entries le JOIN users u ON u.id = le.student_id WHERE 1=1';
        $params = [];
        if ($week)      { $sql .= ' AND le.week_number = ?'; $params[] = $week; }
        if ($status)    { $sql .= ' AND le.status = ?';      $params[] = $status; }
        if ($studentId) { $sql .= ' AND le.student_id = ?';  $params[] = $studentId; }
        $sql .= ' ORDER BY le.created_at DESC';

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        json_response($stmt->fetchAll());
    }

    // GET /api/logbook/{id}
    public function show(int $entryId): void {
        $auth  = require_auth();
        $db    = getDB();
        $stmt  = $db->prepare('
            SELECT le.*, u.name AS student_name, u.matric_number,
                   r.action AS review_action, r.comment AS review_comment,
                   r.created_at AS reviewed_at, sup.name AS reviewer_name
            FROM log_entries le
            JOIN users u ON u.id = le.student_id
            LEFT JOIN reviews r   ON r.log_entry_id = le.id
            LEFT JOIN users sup   ON sup.id = r.supervisor_id
            WHERE le.id = ?
        ');
        $stmt->execute([$entryId]);
        $entry = $stmt->fetch();

        if (!$entry) error_response('Entry not found', 404);

        if ($auth['role'] === 'student' && (int)$entry['student_id'] !== (int)$auth['id']) {
            error_response('Access denied', 403);
        }

        json_response($entry);
    }

    // POST /api/logbook
    public function create(): void {
        $auth = require_auth();
        require_role($auth, ['student']);
        $db   = getDB();

        $body     = get_body();
        $required = ['entry_date', 'week_number', 'day_of_week', 'task'];
        foreach ($required as $f) {
            if (empty($body[$f])) error_response("Field '$f' is required");
        }

        $valid_days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
        if (!in_array($body['day_of_week'], $valid_days, true)) {
            error_response('day_of_week must be a weekday name');
        }

        $week = (int)$body['week_number'];
        if ($week < 1 || $week > 24) error_response('week_number must be between 1 and 24');

        // Handle file upload if multipart request
        $attachmentUrl = null;
        if (!empty($_FILES['attachment'])) {
            $attachmentUrl = $this->handleUpload($_FILES['attachment']);
        }

        try {
            $stmt = $db->prepare('
                INSERT INTO log_entries
                    (student_id, entry_date, week_number, day_of_week, company, task, skills_learned, attachment_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ');
            $stmt->execute([
                $auth['id'],
                $body['entry_date'],
                $week,
                $body['day_of_week'],
                $body['company']        ?? null,
                $body['task'],
                $body['skills_learned'] ?? null,
                $attachmentUrl,
            ]);
            $id = (int)$db->lastInsertId();
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                error_response('An entry for this week and day already exists', 409);
            }
            throw $e;
        }

        $this->respondWithEntry($id);
    }

    // PATCH /api/logbook/{id}
    public function update(int $entryId): void {
        $auth  = require_auth();
        require_role($auth, ['student']);
        $db    = getDB();

        $entry = $this->getEntry($entryId);
        if (!$entry) error_response('Entry not found', 404);
        if ((int)$entry['student_id'] !== (int)$auth['id']) error_response('Access denied', 403);
        if ($entry['status'] !== 'pending') error_response('Only pending entries can be edited');

        $body    = get_body();
        $allowed = ['entry_date', 'company', 'task', 'skills_learned'];
        $sets    = [];
        $params  = [];

        foreach ($allowed as $f) {
            if (array_key_exists($f, $body)) {
                $sets[]   = "$f = ?";
                $params[] = $body[$f];
            }
        }

        if (!empty($_FILES['attachment'])) {
            $sets[]   = 'attachment_url = ?';
            $params[] = $this->handleUpload($_FILES['attachment']);
        }

        if (empty($sets)) error_response('No fields to update');

        $params[] = $entryId;
        $db->prepare('UPDATE log_entries SET ' . implode(', ', $sets) . ' WHERE id = ?')->execute($params);

        $this->respondWithEntry($entryId);
    }

    // DELETE /api/logbook/{id}
    public function delete(int $entryId): void {
        $auth  = require_auth();
        require_role($auth, ['student']);
        $db    = getDB();

        $entry = $this->getEntry($entryId);
        if (!$entry) error_response('Entry not found', 404);
        if ((int)$entry['student_id'] !== (int)$auth['id']) error_response('Access denied', 403);
        if ($entry['status'] !== 'pending') error_response('Only pending entries can be deleted');

        $db->prepare('DELETE FROM log_entries WHERE id = ?')->execute([$entryId]);
        http_response_code(204);
        exit;
    }

    private function getEntry(int $id): ?array {
        $db   = getDB();
        $stmt = $db->prepare('SELECT * FROM log_entries WHERE id = ?');
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }

    private function respondWithEntry(int $id): void {
        $db   = getDB();
        $stmt = $db->prepare('SELECT * FROM log_entries WHERE id = ?');
        $stmt->execute([$id]);
        json_response($stmt->fetch());
    }

    private function handleUpload(array $file): string {
        $allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!in_array($file['type'], $allowed, true)) {
            error_response('Only PNG, JPG and PDF files are allowed');
        }
        if ($file['size'] > 5 * 1024 * 1024) {
            error_response('File size must not exceed 5MB');
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
        $dest     = __DIR__ . '/../uploads/' . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            error_response('Failed to save uploaded file', 500);
        }

        return '/uploads/' . $filename;
    }
}
