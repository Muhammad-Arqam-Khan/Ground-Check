import { Router, type Request, type Response } from "express";

const router = Router();

// ── In-memory store ──────────────────────────────────────────────────────────
// NOTE: Reports are lost on server restart. This is acceptable for the current
// hackathon stage; a persistent database can be added later.
interface ApiReport {
  id: string;
  lat: number;
  lon: number;
  radiusMeters: number;
  category: string;
  description: string;
  timestamp: number;
  up: number;
  down: number;
  flagged: boolean;
  score: number;
  session?: string;
  reporterStatus?: string;
  reporterIdentityId?: string;
  osm?: unknown;
}

const reports: ApiReport[] = [];

function validateReport(body: unknown): body is ApiReport {
  if (!body || typeof body !== "object") return false;
  const r = body as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.lat === "number" &&
    typeof r.lon === "number" &&
    typeof r.radiusMeters === "number" &&
    typeof r.category === "string" &&
    typeof r.description === "string" &&
    typeof r.timestamp === "number" &&
    typeof r.up === "number" &&
    typeof r.down === "number" &&
    typeof r.flagged === "boolean" &&
    typeof r.score === "number"
  );
}

// GET /reports — list all reports
router.get("/reports", (_req: Request, res: Response) => {
  res.json(reports);
});

// POST /reports — create a new report
router.post("/reports", (req: Request, res: Response) => {
  const body = req.body as unknown;

  if (!validateReport(body)) {
    res.status(400).json({ error: "Invalid report: missing or malformed required fields" });
    return;
  }

  const duplicate = reports.find((r) => r.id === body.id);
  if (duplicate) {
    // Idempotent: return the existing report rather than an error so that
    // retried POSTs (e.g. on flaky connections) don't fail.
    res.status(200).json(duplicate);
    return;
  }

  const report: ApiReport = {
    id: body.id,
    lat: body.lat,
    lon: body.lon,
    radiusMeters: body.radiusMeters,
    category: body.category,
    description: body.description,
    timestamp: body.timestamp,
    up: body.up,
    down: body.down,
    flagged: body.flagged,
    score: body.score,
    session: body.session,
    reporterStatus: body.reporterStatus,
    reporterIdentityId: body.reporterIdentityId,
    osm: body.osm,
  };

  reports.push(report);
  res.status(201).json(report);
});

// GET /reports/:id — get one report
router.get("/reports/:id", (req: Request, res: Response) => {
  const report = reports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json(report);
});

// PATCH /reports/:id — partial update (votes, score, flagged)
router.patch("/reports/:id", (req: Request, res: Response) => {
  const idx = reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  const allowed = ["up", "down", "flagged", "score", "reporterStatus"];
  const patch = req.body as Record<string, unknown>;
  const update: Partial<ApiReport> = {};

  for (const key of allowed) {
    if (key in patch) {
      (update as Record<string, unknown>)[key] = patch[key];
    }
  }

  reports[idx] = { ...reports[idx], ...update };
  res.json(reports[idx]);
});

export default router;
