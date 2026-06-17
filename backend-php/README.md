# SIWES Logbook — PHP/MySQL Backend

Pure PHP REST API for the SIWES Logbook app, compatible with **WAMP** (Windows Apache MySQL PHP).

---

## Setup on WAMP

### 1. Copy files
Copy the `backend-php` folder into your WAMP `www` directory:
```
C:\wamp64\www\logbook-api\
```

### 2. Import the database
- Open **phpMyAdmin** → `http://localhost/phpmyadmin`
- Click **Import** → choose `database.sql` → click **Go**

### 3. Configure database
Edit `config/database.php` if your MySQL credentials differ:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'siwes_logbook');
define('DB_USER', 'root');
define('DB_PASS', '');   // your MySQL root password
```

### 4. Enable mod_rewrite (required for URL routing)
- Open WAMP tray → Apache → Apache modules → enable **rewrite_module**
- Open `C:\wamp64\bin\apache\apacheX.X.X\conf\httpd.conf`
- Find `AllowOverride None` for your www directory and change to `AllowOverride All`
- Restart WAMP

### 5. Test
Visit `http://localhost/logbook-api/health` — you should see:
```json
{"status":"ok"}
```

---

## Demo Accounts

| Role                | Email                  | Password    |
|---------------------|------------------------|-------------|
| Admin               | admin@siwes.edu        | admin123    |
| Industry Supervisor | emeka@company.com      | super123    |
| School Coordinator  | emeka@university.edu   | super123    |
| Student (David)     | david@student.edu      | student123  |
| Student (Chioma)    | chioma@student.edu     | student123  |

---

## API Endpoints

All endpoints return JSON. Protected endpoints require:
```
Authorization: Bearer <token>
```

### Auth
| Method | Path                  | Access  | Description          |
|--------|-----------------------|---------|----------------------|
| POST   | /api/auth/register    | Public  | Register new user    |
| POST   | /api/auth/login       | Public  | Login → JWT token    |
| GET    | /api/auth/me          | Any     | Get own profile      |
| PATCH  | /api/auth/me          | Any     | Update own profile   |

### Logbook
| Method | Path                  | Access   | Description                   |
|--------|-----------------------|----------|-------------------------------|
| GET    | /api/logbook          | Any      | List entries (role-filtered)  |
| POST   | /api/logbook          | Student  | Submit new entry              |
| GET    | /api/logbook/{id}     | Any      | View single entry             |
| PATCH  | /api/logbook/{id}     | Student  | Edit pending entry            |
| DELETE | /api/logbook/{id}     | Student  | Delete pending entry          |

### Reviews
| Method | Path                     | Access      | Description              |
|--------|--------------------------|-------------|--------------------------|
| GET    | /api/reviews             | Supervisor+ | Pending entries to review|
| GET    | /api/reviews/history     | Supervisor+ | Review history           |
| POST   | /api/reviews/{entryId}   | Supervisor+ | Approve or reject entry  |

### Students
| Method | Path                     | Access      | Description                   |
|--------|--------------------------|-------------|-------------------------------|
| GET    | /api/students            | Supervisor+ | List students                 |
| GET    | /api/students/{id}       | Supervisor+ | Student detail + logbook      |
| POST   | /api/students/assign     | Admin       | Assign student to supervisor  |
| DELETE | /api/students/assign     | Admin       | Remove assignment             |

### Users (Admin only)
| Method | Path              | Description        |
|--------|-------------------|--------------------|
| GET    | /api/users        | List all users     |
| GET    | /api/users/stats  | Platform stats     |
| GET    | /api/users/{id}   | Single user        |
| DELETE | /api/users/{id}   | Delete user        |

### Dashboard
| Method | Path                          | Description               |
|--------|-------------------------------|---------------------------|
| GET    | /api/dashboard/stats          | Role-specific stats       |
| GET    | /api/dashboard/notifications  | Role-specific alerts      |

---

## File Uploads
Submit logbook entries as `multipart/form-data` with the file field named `attachment`.  
Accepted: PNG, JPG, PDF — max 5MB.  
Files are saved to the `uploads/` folder and served at `/logbook-api/uploads/filename`.

---

## Roles Summary
| Role                 | Can do                                          |
|----------------------|-------------------------------------------------|
| `student`            | Submit, edit, delete own pending log entries    |
| `industry_supervisor`| View & review entries for assigned students     |
| `school_coordinator` | View & review entries for assigned students     |
| `admin`              | Full access — manage all users and assignments  |
