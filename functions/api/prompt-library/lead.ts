interface Env {
  BENCH_LEAD_WEBHOOK_URL?: string;
  CHRISTY_SMS_PHONE?: string;
}

const CHRISTY_EMAIL = "christy@thebenchclub.ai";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type LeadPayload = {
  name?: string;
  email?: string;
  phone?: string;
  pack_id?: string;
  pack_name?: string;
  source?: string;
  marketing_consent?: boolean;
  audit_requested?: boolean;
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let payload: LeadPayload;

  try {
    payload = await context.request.json<LeadPayload>();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const lead = normalizeLead(payload);
  const isAuditLead = lead.source.includes("find-your-bench") || Boolean(lead.name || lead.phone);

  if (!validEmail(lead.email)) {
    return json({ error: "A valid email is required." }, 400);
  }

  if (isAuditLead && (!lead.name || digitsOnly(lead.phone).length < 7)) {
    return json({ error: "Name, email, and phone are required for audit requests." }, 400);
  }

  const route = buildRoutingLinks(lead, context.env.CHRISTY_SMS_PHONE || "");
  let webhook_delivered = false;

  if (context.env.BENCH_LEAD_WEBHOOK_URL) {
    webhook_delivered = await sendWebhook(context.env.BENCH_LEAD_WEBHOOK_URL, {
      ...lead,
      route_email: CHRISTY_EMAIL,
      created_at: new Date().toISOString(),
      user_agent: context.request.headers.get("user-agent") || "",
    });
  }

  return json({
    ok: true,
    route_email: CHRISTY_EMAIL,
    sms_configured: Boolean(context.env.CHRISTY_SMS_PHONE),
    webhook_delivered,
    ...route,
  });
};

function normalizeLead(payload: LeadPayload) {
  return {
    name: String(payload.name || "").trim(),
    email: String(payload.email || "").trim().toLowerCase(),
    phone: String(payload.phone || "").trim(),
    pack_id: String(payload.pack_id || "").trim(),
    pack_name: String(payload.pack_name || "").trim(),
    source: String(payload.source || "prompt-library").trim(),
    marketing_consent: Boolean(payload.marketing_consent),
    audit_requested: Boolean(payload.audit_requested),
  };
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function buildRoutingLinks(lead: ReturnType<typeof normalizeLead>, smsPhone: string) {
  const subject = lead.name
    ? `Free business audit request: ${lead.name}`
    : `Prompt library download: ${lead.pack_name || lead.pack_id || "Bench prompt pack"}`;
  const body = [
    lead.name ? "New Find Your Bench audit request" : "New prompt library download",
    "",
    `Name: ${lead.name || "not provided"}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "not provided"}`,
    `Prompt pack: ${lead.pack_name || lead.pack_id || "not selected"}`,
    `Marketing consent: ${lead.marketing_consent ? "yes" : "no"}`,
    `Audit requested: ${lead.audit_requested ? "yes" : "no"}`,
    `Source: ${lead.source}`,
    "",
    "Requested from The Bench Prompt Library.",
  ].join("\n");
  const mailto = `mailto:${CHRISTY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const sms = smsPhone
    ? `sms:${encodeURIComponent(smsPhone)}?&body=${encodeURIComponent(`${lead.name || lead.email} requested The Bench. Email: ${lead.email}. Phone: ${lead.phone || "not provided"}. Pack: ${lead.pack_name || lead.pack_id || "not selected"}.`)}`
    : "";

  return { mailto, sms };
}

async function sendWebhook(url: string, lead: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
