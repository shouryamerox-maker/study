import { z } from "zod";
import { api, badRequest, notFound, parseBody } from "@/server/http";
import { db } from "@/server/db";
import { publishAssessment } from "@/server/assessments/definition";

/** publish (snapshots a new version) · archive (closes the test) · release / unrelease results. */
export const POST = api<{ id: string }>("staff", async ({ req, params }) => {
  const { action } = await parseBody(req, z.object({ action: z.enum(["publish", "archive", "reopen", "release", "unrelease"]) }));
  const a = await db.assessment.findUnique({ where: { id: params.id } });
  if (!a) throw notFound("Test");
  switch (action) {
    case "publish":
      try {
        const p = await publishAssessment(db, a.id);
        return { status: p.status };
      } catch (e) {
        throw badRequest(e instanceof Error ? e.message : "Could not publish.");
      }
    case "archive":
      await db.assessment.update({ where: { id: a.id }, data: { status: "ARCHIVED" } });
      return { status: "ARCHIVED" };
    case "reopen":
      if (!a.currentVersionId) throw badRequest("Publish the test first.");
      await db.assessment.update({ where: { id: a.id }, data: { status: "PUBLISHED" } });
      return { status: "PUBLISHED" };
    case "release":
      await db.assessment.update({ where: { id: a.id }, data: { resultsReleasedAt: new Date() } });
      return { resultsReleasedAt: new Date() };
    case "unrelease":
      await db.assessment.update({ where: { id: a.id }, data: { resultsReleasedAt: null } });
      return { resultsReleasedAt: null };
  }
});
