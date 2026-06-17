import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./lib/prisma";

async function main() {
  console.log("Seeding database...");

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // Users
  const [admin, industrySup, schoolSup, student1, student2, student3, student4] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@siwes.edu" },
      update: {},
      create: { name: "Admin User", email: "admin@siwes.edu", password: await hash("admin123"), role: "admin" },
    }),
    prisma.user.upsert({
      where: { email: "emeka@company.com" },
      update: {},
      create: { name: "Dr. Chukwu Emeka", email: "emeka@company.com", password: await hash("super123"), role: "supervisor", supervisorType: "industry" },
    }),
    prisma.user.upsert({
      where: { email: "emeka@university.edu" },
      update: {},
      create: { name: "Prof. Emeka Obi", email: "emeka@university.edu", password: await hash("super123"), role: "supervisor", supervisorType: "school" },
    }),
    prisma.user.upsert({
      where: { email: "david@student.edu" },
      update: {},
      create: {
        name: "David Adibite-Daniel", email: "david@student.edu", password: await hash("student123"),
        role: "student", matricNumber: "STU/2023/001", department: "Computer Science",
        level: "400", company: "Tech Solutions Ltd",
      },
    }),
    prisma.user.upsert({
      where: { email: "chioma@student.edu" },
      update: {},
      create: {
        name: "Chioma Nwankwo", email: "chioma@student.edu", password: await hash("student123"),
        role: "student", matricNumber: "STU/2023/015", department: "Information Technology",
        level: "400", company: "DataVault Inc",
      },
    }),
    prisma.user.upsert({
      where: { email: "ibrahim@student.edu" },
      update: {},
      create: {
        name: "Ibrahim Yusuf", email: "ibrahim@student.edu", password: await hash("student123"),
        role: "student", matricNumber: "STU/2023/042", department: "Computer Engineering",
        level: "400", company: "NetBridge Systems",
      },
    }),
    prisma.user.upsert({
      where: { email: "fatima@student.edu" },
      update: {},
      create: {
        name: "Fatima Bello", email: "fatima@student.edu", password: await hash("student123"),
        role: "student", matricNumber: "STU/2023/008", department: "Electrical Engineering",
        level: "400", company: "CloudPeak Africa",
      },
    }),
  ]);

  // Assign students to supervisors
  const assignments = [
    { studentId: student1.id, supervisorId: industrySup.id, type: "industry" },
    { studentId: student1.id, supervisorId: schoolSup.id, type: "school" },
    { studentId: student2.id, supervisorId: industrySup.id, type: "industry" },
    { studentId: student2.id, supervisorId: schoolSup.id, type: "school" },
    { studentId: student3.id, supervisorId: industrySup.id, type: "industry" },
    { studentId: student3.id, supervisorId: schoolSup.id, type: "school" },
    { studentId: student4.id, supervisorId: industrySup.id, type: "industry" },
    { studentId: student4.id, supervisorId: schoolSup.id, type: "school" },
  ];

  for (const a of assignments) {
    await prisma.studentSupervisor.upsert({
      where: { studentId_supervisorId_type: a },
      update: {},
      create: a,
    });
  }

  // Sample log entries for David
  const entries = [
    { week: 1, day: "Monday", date: "2026-01-05", task: "Orientation and introduction to company structure", status: "approved" },
    { week: 1, day: "Tuesday", date: "2026-01-06", task: "Setup of development environment and tools", status: "approved" },
    { week: 1, day: "Wednesday", date: "2026-01-07", task: "Reading documentation for internal systems", status: "pending" },
    { week: 2, day: "Monday", date: "2026-01-12", task: "Database design and normalization for inventory module", status: "approved", skillsLearned: "SQL normalization, ERD design" },
    { week: 2, day: "Tuesday", date: "2026-01-13", task: "Implemented REST API endpoints for user management", status: "pending" },
    { week: 3, day: "Wednesday", date: "2026-01-21", task: "Frontend UI development for login and dashboard", status: "approved", skillsLearned: "React, Tailwind CSS" },
    { week: 3, day: "Friday", date: "2026-01-23", task: "Network configuration and firewall setup", status: "rejected" },
  ];

  for (const e of entries) {
    const existing = await prisma.logEntry.findUnique({
      where: { studentId_week_day: { studentId: student1.id, week: e.week, day: e.day } },
    });
    if (!existing) {
      const entry = await prisma.logEntry.create({
        data: { studentId: student1.id, company: "Tech Solutions Ltd", ...e },
      });

      if (e.status === "approved" || e.status === "rejected") {
        await prisma.review.create({
          data: {
            logEntryId: entry.id, supervisorId: industrySup.id,
            action: e.status,
            comment: e.status === "approved" ? "Good work" : "Needs more detail",
          },
        });
      }
    }
  }

  console.log("Seed complete. Demo accounts:");
  console.log("  Admin:            admin@siwes.edu         / admin123");
  console.log("  Industry Sup:     emeka@company.com       / super123");
  console.log("  School Sup:       emeka@university.edu    / super123");
  console.log("  Student (David):  david@student.edu       / student123");
  console.log("  Student (Chioma): chioma@student.edu      / student123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
