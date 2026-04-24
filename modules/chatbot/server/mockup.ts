"use server";

import { db } from "@/drizzle/db";
import { mockups } from "@/drizzle/schema";
import { ImageUpload } from "@/lib/image-upload";
import { auth } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";

// ─── Save / Update Mockup ────────────────────────────────────────────────────
export async function saveMockup(
  templateId: string,
  elements: object[],
  mockupId?: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (mockupId) {
    await db
      .update(mockups)
      .set({ elements, updatedAt: new Date() })
      .where(and(eq(mockups.id, mockupId), eq(mockups.userId, userId)));

    return { mockupId };
  }

  const [row] = await db
    .insert(mockups)
    .values({ userId, templateId, elements })
    .returning({ id: mockups.id });

  return { mockupId: row.id };
}

// ─── Upload Logo via your existing ImageUpload ───────────────────────────────
export async function uploadLogo(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const url = await ImageUpload(file);
  if (!url) throw new Error("Upload failed");

  return { url };
}

// ─── Save Exported Preview PNG ───────────────────────────────────────────────
export async function savePreview(mockupId: string, dataUrl: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // convert dataURL → File
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], `preview-${mockupId}.png`, {
    type: "image/png",
  });

  const url = await ImageUpload(file);
  if (!url) throw new Error("Preview upload failed");

  await db
    .update(mockups)
    .set({ previewUrl: url })
    .where(and(eq(mockups.id, mockupId), eq(mockups.userId, userId)));

  return { url };
}

// ─── Get User Mockups ────────────────────────────────────────────────────────
export async function getUserMockups() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(mockups)
    .where(eq(mockups.userId, userId))
    .orderBy(mockups.createdAt);
}