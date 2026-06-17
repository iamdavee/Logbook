import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["student", "supervisor", "admin"]),
  supervisorType: z.enum(["industry", "school"]).optional(),
  matricNumber: z.string().optional(),
  department: z.string().optional(),
  level: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { password, ...data } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  if (data.role === "student" && data.matricNumber) {
    const existingMatric = await prisma.user.findUnique({ where: { matricNumber: data.matricNumber } });
    if (existingMatric) {
      res.status(409).json({ error: "Matric number already registered" });
      return;
    }
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { ...data, password: hashed },
    select: { id: true, name: true, email: true, role: true, supervisorType: true, matricNumber: true, department: true, level: true, company: true, avatar: true, createdAt: true },
  });

  const token = jwt.sign(
    { id: user.id, role: user.role, supervisorType: user.supervisorType },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") } as SignOptions
  );

  res.status(201).json({ user, token });
});

router.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, supervisorType: user.supervisorType },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") } as SignOptions
  );

  const { password: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, role: true, supervisorType: true, matricNumber: true, department: true, level: true, company: true, avatar: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(user);
});

router.patch("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const allowedFields = ["name", "department", "level", "company", "avatar"] as const;
  const updates: Record<string, string> = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (req.body.password) {
    updates["password"] = await bcrypt.hash(req.body.password, 10);
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updates,
    select: { id: true, name: true, email: true, role: true, supervisorType: true, matricNumber: true, department: true, level: true, company: true, avatar: true, createdAt: true },
  });
  res.json(user);
});

export default router;
