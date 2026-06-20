<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class DashboardController {

    // GET /api/dashboard/stats
    public function stats(): void {
        $auth = require_auth();
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        if ($role === 'student') {
            $stmt = $db->prepare('
                SELECT
                    COUNT(*)                        AS total,
                    SUM(status = "pending")         AS pending,
                    SUM(status = "approved")        AS approved,
                    SUM(status = "rejected")        AS rejected
                FROM log_entries WHERE student_id = ?
            ');
            $stmt->execute([$id]);
            $counts = $stmt->fetch();

            $stmt = $db->prepare('
                SELECT * FROM log_entries WHERE student_id = ?
                ORDER BY created_at DESC LIMIT 5
            ');
            $stmt->execute([$id]);
            $counts['recent_entries'] = $stmt->fetchAll();

            json_response($counts);
        }

        if ($role === 'industry_supervisor' || $role === 'school_coordinator') {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';

            $stmt = $db->prepare('
                SELECT COUNT(DISTINCT ss.student_id) AS total_students,
                       SUM(le.status = "pending")    AS pending_reviews,
                       SUM(le.status = "approved")   AS approved_entries
                FROM student_supervisors ss
                LEFT JOIN log_entries le ON le.student_id = ss.student_id
                WHERE ss.supervisor_id = ? AND ss.type = ?
            ');
            $stmt->execute([$id, $type]);
            $counts = $stmt->fetch();

            $stmt = $db->prepare('
                SELECT COUNT(*) AS approved_this_week
                FROM reviews
                WHERE supervisor_id = ? AND action = "approved"
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ');
            $stmt->execute([$id]);
            $counts['approved_this_week'] = (int)$stmt->fetchColumn();

            $stmt = $db->prepare('
                SELECT le.*, u.name AS student_name, u.matric_number
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                JOIN student_supervisors ss ON ss.student_id = le.student_id
                WHERE ss.supervisor_id = ? AND ss.type = ? AND le.status = "pending"
                ORDER BY le.created_at ASC LIMIT 5
            ');
            $stmt->execute([$id, $type]);
            $counts['recent_pending'] = $stmt->fetchAll();

            json_response($counts);
        }

        if ($role === 'itf_official') {
            $stmt = $db->query('
                SELECT
                    (SELECT COUNT(*) FROM users WHERE role = "student")          AS total_students,
                    (SELECT COUNT(*) FROM log_entries)                           AS total_entries,
                    (SELECT COUNT(*) FROM log_entries WHERE status = "pending")  AS pending_entries,
                    (SELECT COUNT(*) FROM log_entries WHERE status = "approved") AS approved_entries,
                    (SELECT COUNT(*) FROM log_entries WHERE status = "rejected") AS rejected_entries
            ');
            $counts = $stmt->fetch();

            $stmt = $db->prepare('
                SELECT COUNT(*) AS notes_this_week
                FROM reviews
                WHERE supervisor_id = ? AND action = "noted"
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ');
            $stmt->execute([$id]);
            $counts['notes_this_week'] = (int)$stmt->fetchColumn();

            $stmt = $db->query('
                SELECT le.*, u.name AS student_name, u.matric_number
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                WHERE le.status = "pending"
                ORDER BY le.created_at ASC LIMIT 5
            ');
            $counts['recent_pending'] = $stmt->fetchAll();

            json_response($counts);
        }

        // admin
        $stmt = $db->query('
            SELECT
                (SELECT COUNT(*) FROM users WHERE role = "student")             AS total_students,
                (SELECT COUNT(*) FROM users WHERE role IN ("industry_supervisor","school_coordinator")) AS total_supervisors,
                (SELECT COUNT(*) FROM users WHERE role = "itf_official")        AS total_itf_officials,
                (SELECT COUNT(*) FROM log_entries WHERE status = "pending")     AS pending_entries,
                (SELECT COUNT(*) FROM log_entries WHERE status = "approved")    AS approved_entries,
                (SELECT COUNT(*) FROM log_entries)                              AS total_entries
        ');
        json_response($stmt->fetch());
    }

    // GET /api/dashboard/notifications
    public function notifications(): void {
        $auth = require_auth();
        $db   = getDB();
        $id   = (int)$auth['id'];
        $role = $auth['role'];

        if ($role === 'industry_supervisor' || $role === 'school_coordinator') {
            $type = $role === 'industry_supervisor' ? 'industry' : 'school';
            $stmt = $db->prepare('
                SELECT le.id, u.name AS student_name, le.created_at,
                       "new_entry" AS type,
                       CONCAT(u.name, " submitted a new log entry") AS text
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                JOIN student_supervisors ss ON ss.student_id = le.student_id
                WHERE ss.supervisor_id = ? AND ss.type = ?
                  AND le.status = "pending"
                  AND le.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
                ORDER BY le.created_at DESC LIMIT 10
            ');
            $stmt->execute([$id, $type]);
            json_response($stmt->fetchAll());
            return;
        }

        if ($role === 'itf_official') {
            $stmt = $db->query('
                SELECT le.id, u.name AS student_name, le.created_at,
                       "new_entry" AS type,
                       CONCAT(u.name, " submitted a new log entry") AS text
                FROM log_entries le
                JOIN users u ON u.id = le.student_id
                WHERE le.status = "pending"
                  AND le.created_at >= DATE_SUB(NOW(), INTERVAL 3 DAY)
                ORDER BY le.created_at DESC LIMIT 10
            ');
            json_response($stmt->fetchAll());
            return;
        }

        if ($role === 'student') {
            $stmt = $db->prepare('
                SELECT r.id, r.action AS type, r.created_at,
                       CONCAT(sup.name, " ", r.action, " your Week ", le.week_number, " ", le.day_of_week, " entry") AS text
                FROM reviews r
                JOIN log_entries le ON le.id = r.log_entry_id
                JOIN users sup ON sup.id = r.supervisor_id
                WHERE le.student_id = ?
                  AND r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
                ORDER BY r.created_at DESC LIMIT 10
            ');
            $stmt->execute([$id]);
            json_response($stmt->fetchAll());
            return;
        }

        json_response([]);
    }
}
