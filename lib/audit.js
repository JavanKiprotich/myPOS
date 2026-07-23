import { prisma } from "@/lib/prisma";

export async function logAudit({
  userId,
  action,
  target = null,
  details = null,
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        details,
      },
    });
  } catch (error) {
    console.error("Audit Log Error:", error);
  }
}