import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// GET /api/dashboard/stats
router.get("/stats", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;

  if (role === "student") {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.logEntry.count({ where: { studentId: id } }),
      prisma.logEntry.count({ where: { studentId: id, status: "pending" } }),
      prisma.logEntry.count({ where: { studentId: id, status: "approved" } }),
      prisma.logEntry.count({ where: { studentId: id, status: "rejected" } }),
    ]);
    const recentEntries = await prisma.logEntry.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    res.json({ total, pending, approved, rejected, recentEntries });
    return;
  }

  if (role === "supervisor") {
    const assignments = await prisma.studentSupervisor.findMany({ where: { supervisorId: id } });
    const studentIds = assignments.map((a) => a.studentId);

    const [totalStudents, pendingReviews, approvedThisWeek, recentPending] = await Promise.all([
      prisma.user.count({ where: { id: { in: studentIds } } }),
      prisma.logEntry.count({ where: { studentId: { in: studentIds }, status: "pending" } }),
      prisma.review.count({
        where: {
          supervisorId: id,
          action: "approved",
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.logEntry.findMany({
        where: { studentId: { in: studentIds }, status: "pending" },
        orderBy: { createdAt: "asc" },
        take: 5,
        include: { student: { select: { id: true, name: true, matricNumber: true } } },
      }),
    ]);

    res.json({ totalStudents, pendingReviews, approvedThisWeek, recentPending });
    return;
  }

  // admin
  const [totalStudents, totalSupervisors, pendingEntries, approvedEntries] = await Promise.all([
    prisma.user.count({ where: { role: "student" } }),
    prisma.user.count({ where: { role: "supervisor" } }),
    prisma.logEntry.count({ where: { status: "pending" } }),
    prisma.logEntry.count({ where: { status: "approved" } }),
  ]);
  res.json({ totalStudents, totalSupervisors, pendingEntries, approvedEntries });
});

// GET /api/dashboard/notifications
router.get("/notifications", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;

  if (role === "supervisor") {
    const assignments = await prisma.studentSupervisor.findMany({ where: { supervisorId: id } });
    const studentIds = assignments.map((a) => a.studentId);

    const recent = await prisma.logEntry.findMany({
      where: { studentId: { in: studentIds }, status: "pending", createdAt: { gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { student: { select: { name: true } } },
    });

    const notifications = recent.map((e) => ({
      id: e.id,
      text: `${e.student.name} submitted a new log entry`,
      time: e.createdAt,
      type: "new_entry",
    }));
    res.json(notifications);
    return;
  }

  if (role === "student") {
    const reviewed = await prisma.review.findMany({
      where: { logEntry: { studentId: id }, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { logEntry: { select: { day: true, week: true } }, supervisor: { select: { name: true } } },
    });

    const notifications = reviewed.map((r) => ({
      id: r.id,
      text: `${r.supervisor.name} ${r.action} your Week ${r.logEntry.week} ${r.logEntry.day} entry`,
      time: r.createdAt,
      type: r.action,
    }));
    res.json(notifications);
    return;
  }

  res.json([]);
});

export default router;
