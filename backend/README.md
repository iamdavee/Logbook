# Logbook Backend API

Node.js + Express + TypeScript backend for the SIWES Logbook app.

## Stack
- **Runtime**: Node.js
- **Framework**: Express
- **ORM**: Prisma (SQLite)
- **Auth**: JWT + bcrypt
- **Validation**: Zod

## Setup

```bash
cd backend
npm install
cp .env.example .env   # edit JWT_SECRET
npm run db:migrate
npm run db:seed        # loads demo accounts
npm run dev            # starts on http://localhost:3000
```

## Demo Accounts

| Role             | Email                     | Password    |
|------------------|---------------------------|-------------|
| Admin            | admin@siwes.edu           | admin123    |
| Industry Supervisor | emeka@company.com      | super123    |
| School Supervisor | emeka@university.edu     | super123    |
| Student (David)  | david@student.edu         | student123  |
| Student (Chioma) | chioma@student.edu        | student123  |

## API Endpoints

### Auth
| Method | Path              | Description              |
|--------|-------------------|--------------------------|
| POST   | /api/auth/register | Register new user       |
| POST   | /api/auth/login   | Login, returns JWT token |
| GET    | /api/auth/me      | Get current user         |
| PATCH  | /api/auth/me      | Update profile           |

### Logbook (student)
| Method | Path              | Description                      |
|--------|-------------------|----------------------------------|
| GET    | /api/logbook      | Get entries (role-filtered)      |
| GET    | /api/logbook/:id  | Get single entry                 |
| POST   | /api/logbook      | Create entry (+ file upload)     |
| PATCH  | /api/logbook/:id  | Edit pending entry               |
| DELETE | /api/logbook/:id  | Delete pending entry             |

### Reviews (supervisor / admin)
| Method | Path                     | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/reviews             | Pending entries to review|
| GET    | /api/reviews/history     | Review history           |
| POST   | /api/reviews/:entryId    | Approve or reject entry  |

### Students (supervisor / admin)
| Method | Path                  | Description               |
|--------|-----------------------|---------------------------|
| GET    | /api/students         | List students             |
| GET    | /api/students/:id     | Student detail + logbook  |
| POST   | /api/students/assign  | Assign student to supervisor (admin) |
| DELETE | /api/students/assign  | Remove assignment (admin) |

### Users (admin)
| Method | Path              | Description       |
|--------|-------------------|-------------------|
| GET    | /api/users        | List all users    |
| GET    | /api/users/stats  | Platform stats    |
| DELETE | /api/users/:id    | Delete user       |

### Dashboard
| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/dashboard/stats        | Role-specific stats      |
| GET    | /api/dashboard/notifications | Recent notifications    |

## File Uploads
Files are accepted on `POST /api/logbook` via `multipart/form-data` with the field name `attachment`.  
Max size: 5MB. Accepted types: PNG, JPG, JPEG, PDF.
