import { Router, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("supervisor", "admin"));

const reviewSchema = z.object({
  action: z.enum(["approved", "rejected"]),
  comment: z.string().optional(),
});

// GET /api/reviews — pending entries for supervisor's students
router.get("/", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;

  if (role === "supervisor") {
    const assignments = await prisma.studentSupervisor.findMany({ where: { supervisorId: id } });
    const studentIds = assignments.map((a) => a.studentId);

    const entries = await prisma.logEntry.findMany({
      where: { studentId: { in: studentIds }, status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { student: { select: { id: true, name: true, matricNumber: true, company: true } } },
    });
    res.json(entries);
    return;
  }

  // admin sees all pending
  const entries = await prisma.logEntry.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: { student: { select: { id: true, name: true, matricNumber: true, company: true } } },
  });
  res.json(entries);
});

// GET /api/reviews/history
router.get("/history", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;
  const where = role === "supervisor" ? { supervisorId: id } : {};

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      logEntry: { include: { student: { select: { id: true, name: true, matricNumber: true } } } },
      supervisor: { select: { id: true, name: true } },
    },
  });
  res.json(reviews);
});

// POST /api/reviews/:entryId — review a log entry
router.post("/:entryId", async (req: AuthRequest, res: Response) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const entry = await prisma.logEntry.findUnique({ where: { id: req.params.entryId } });
  if (!entry) { res.status(404).json({ error: "Log entry not found" }); return; }
  if (entry.status !== "pending") { res.status(400).json({ error: "Entry has already been reviewed" }); return; }

  // Verify supervisor is assigned to this student
  const { role, id } = req.user!;
  if (role === "supervisor") {
    const assignment = await prisma.studentSupervisor.findFirst({
      where: { supervisorId: id, studentId: entry.studentId },
    });
    if (!assignment) { res.status(403).json({ error: "Not assigned to this student" }); return; }
  }

  const [review] = await prisma.$transaction([
    prisma.review.create({
      data: { logEntryId: entry.id, supervisorId: req.user!.id, ...parsed.data },
    }),
    prisma.logEntry.update({
      where: { id: entry.id },
      data: { status: parsed.data.action },
    }),
  ]);

  res.status(201).json(review);
});

export default router;
