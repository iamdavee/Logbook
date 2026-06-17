import { Router, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();
router.use(authenticate, requireRole("supervisor", "admin"));

// GET /api/students — supervisor's assigned students or all students for admin
router.get("/", async (req: AuthRequest, res: Response) => {
  const { role, id } = req.user!;

  if (role === "supervisor") {
    const assignments = await prisma.studentSupervisor.findMany({
      where: { supervisorId: id },
      include: {
        student: {
          select: {
            id: true, name: true, email: true, matricNumber: true,
            department: true, level: true, company: true, avatar: true,
            logEntries: { select: { status: true } },
          },
        },
      },
    });

    const students = assignments.map((a) => {
      const { logEntries, ...rest } = a.student;
      return {
        ...rest,
        assignmentType: a.type,
        totalEntries: logEntries.length,
        pendingEntries: logEntries.filter((e) => e.status === "pending").length,
        approvedEntries: logEntries.filter((e) => e.status === "approved").length,
      };
    });
    res.json(students);
    return;
  }

  // admin: all students
  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: {
      id: true, name: true, email: true, matricNumber: true,
      department: true, level: true, company: true, avatar: true, createdAt: true,
      logEntries: { select: { status: true } },
      supervisors: { include: { supervisor: { select: { id: true, name: true, supervisorType: true } } } },
    },
    orderBy: { name: "asc" },
  });

  const result = students.map(({ logEntries, supervisors, ...rest }) => ({
    ...rest,
    totalEntries: logEntries.length,
    pendingEntries: logEntries.filter((e) => e.status === "pending").length,
    approvedEntries: logEntries.filter((e) => e.status === "approved").length,
    supervisors: supervisors.map((s) => ({ ...s.supervisor, assignmentType: s.type })),
  }));
  res.json(result);
});

// GET /api/students/:id
router.get("/:id", async (req: AuthRequest, res: Response) => {
  const { role, id: userId } = req.user!;

  if (role === "supervisor") {
    const assignment = await prisma.studentSupervisor.findFirst({
      where: { supervisorId: userId, studentId: req.params.id },
    });
    if (!assignment) { res.status(403).json({ error: "Not assigned to this student" }); return; }
  }

  const student = await prisma.user.findUnique({
    where: { id: req.params.id, role: "student" },
    select: {
      id: true, name: true, email: true, matricNumber: true,
      department: true, level: true, company: true, avatar: true, createdAt: true,
      logEntries: { orderBy: [{ week: "asc" }, { day: "asc" }], include: { reviews: { orderBy: { createdAt: "desc" }, take: 1 } } },
      supervisors: { include: { supervisor: { select: { id: true, name: true, supervisorType: true, email: true } } } },
    },
  });

  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  res.json(student);
});

// POST /api/students/assign — assign student to supervisor
const assignSchema = z.object({
  studentId: z.string(),
  supervisorId: z.string(),
  type: z.enum(["industry", "school"]),
});

router.post("/assign", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.flatten() }); return; }

  const { studentId, supervisorId, type } = parsed.data;

  const [student, supervisor] = await Promise.all([
    prisma.user.findUnique({ where: { id: studentId, role: "student" } }),
    prisma.user.findUnique({ where: { id: supervisorId, role: "supervisor" } }),
  ]);

  if (!student) { res.status(404).json({ error: "Student not found" }); return; }
  if (!supervisor) { res.status(404).json({ error: "Supervisor not found" }); return; }

  try {
    const assignment = await prisma.studentSupervisor.create({
      data: { studentId, supervisorId, type },
    });
    res.status(201).json(assignment);
  } catch {
    res.status(409).json({ error: "Assignment already exists" });
  }
});

// DELETE /api/students/assign — remove assignment
router.delete("/assign", requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { studentId, supervisorId, type } = req.body;

  await prisma.studentSupervisor.deleteMany({
    where: { studentId, supervisorId, type },
  });
  res.status(204).send();
});

export default router;
