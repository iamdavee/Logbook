import { Router, Response } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import prisma from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate);

const storage = multer.diskStorage({
  destination: process.env.UPLOAD_DIR ?? "./uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".png", ".jpg", ".jpeg", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  week: z.coerce.number().int().min(1).max(24),
  day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  company: z.string().optional(),
  task: z.string().min(3),
  skillsLearned: z.string().optional(),
});

// GET /api/logbook — student sees own entries; supervisor/admin sees assigned students
router.get("/", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;
  const { week, status, studentId } = req.query;

  if (role === "student") {
    const where: Record<string, unknown> = { studentId: id };
    if (week) where.week = Number(week);
    if (status) where.status = status;

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: [{ week: "asc" }, { day: "asc" }],
      include: { reviews: { include: { supervisor: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 1 } },
    });
    res.json(entries);
    return;
  }

  if (role === "supervisor") {
    const assignments = await prisma.studentSupervisor.findMany({ where: { supervisorId: id } });
    const studentIds = assignments.map((a) => a.studentId);
    const where: Record<string, unknown> = { studentId: { in: studentIds } };
    if (week) where.week = Number(week);
    if (status) where.status = status;
    if (studentId && studentIds.includes(studentId as string)) where.studentId = studentId;

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: { student: { select: { id: true, name: true, matricNumber: true } }, reviews: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    res.json(entries);
    return;
  }

  // admin: all entries
  const where: Record<string, unknown> = {};
  if (week) where.week = Number(week);
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;

  const entries = await prisma.logEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: { student: { select: { id: true, name: true, matricNumber: true } } },
  });
  res.json(entries);
});

// GET /api/logbook/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const entry = await prisma.logEntry.findUnique({
    where: { id: req.params.id },
    include: {
      student: { select: { id: true, name: true, matricNumber: true } },
      reviews: { include: { supervisor: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!entry) { res.status(404).json({ error: "Entry not found" }); return; }

  const { role, id } = req.user!;
  if (role === "student" && entry.studentId !== id) {
    res.status(403).json({ error: "Access denied" }); return;
  }
  res.json(entry);
});

// POST /api/logbook — student only
router.post("/", requireRole("student"), upload.single("attachment"), async (req: AuthRequest, res: Response) => {
  const parsed = entrySchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const attachmentUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const entry = await prisma.logEntry.create({
      data: {
        ...parsed.data,
        studentId: req.user!.id,
        attachmentUrl,
      },
    });
    res.status(201).json(entry);
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === "P2002") {
      res.status(409).json({ error: "An entry for this week and day already exists" });
    } else {
      throw e;
    }
  }
});

// PATCH /api/logbook/:id — student can edit own pending entries
router.patch("/:id", requireRole("student"), upload.single("attachment"), async (req: AuthRequest, res: Response) => {
  const entry = await prisma.logEntry.findUnique({ where: { id: req.params.id } });
  if (!entry) { res.status(404).json({ error: "Entry not found" }); return; }
  if (entry.studentId !== req.user!.id) { res.status(403).json({ error: "Access denied" }); return; }
  if (entry.status !== "pending") { res.status(400).json({ error: "Only pending entries can be edited" }); return; }

  const updates: Record<string, unknown> = {};
  const fields = ["date", "company", "task", "skillsLearned"] as const;
  for (const f of fields) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }
  if (req.file) updates.attachmentUrl = `/uploads/${req.file.filename}`;

  const updated = await prisma.logEntry.update({ where: { id: req.params.id }, data: updates });
  res.json(updated);
});

// DELETE /api/logbook/:id — student can delete own pending entries
router.delete("/:id", requireRole("student"), async (req: AuthRequest, res: Response) => {
  const entry = await prisma.logEntry.findUnique({ where: { id: req.params.id } });
  if (!entry) { res.status(404).json({ error: "Entry not found" }); return; }
  if (entry.studentId !== req.user!.id) { res.status(403).json({ error: "Access denied" }); return; }
  if (entry.status !== "pending") { res.status(400).json({ error: "Only pending entries can be deleted" }); return; }

  await prisma.logEntry.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
