import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("admin"));

// GET /api/users
router.get("/", async (_req: AuthRequest, res: Response) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, supervisorType: true,
      matricNumber: true, department: true, level: true, company: true, avatar: true, createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  res.json(users);
});

// GET /api/users/stats
router.get("/stats", async (_req: AuthRequest, res: Response) => {
  const [totalStudents, totalSupervisors, totalEntries, pendingEntries, approvedEntries, rejectedEntries] =
    await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "supervisor" } }),
      prisma.logEntry.count(),
      prisma.logEntry.count({ where: { status: "pending" } }),
      prisma.logEntry.count({ where: { status: "approved" } }),
      prisma.logEntry.count({ where: { status: "rejected" } }),
    ]);

  res.json({ totalStudents, totalSupervisors, totalEntries, pendingEntries, approvedEntries, rejectedEntries });
});

// DELETE /api/users/:id
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  if (user.id === req.user!.id) { res.status(400).json({ error: "Cannot delete your own account" }); return; }

  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
