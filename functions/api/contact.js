// Cloudflare Pages Function: POST /api/contact
// Saves each enquiry in D1 (binding: DB) and optionally emails a notification via Resend.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const clip = (v, n) => String(v ?? "").trim().slice(0, n);

export async function onRequestPost({ request, env, waitUntil }) {
  let d;
  try {
    d = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Honeypot: real visitors never fill this. Pretend success so bots move on.
  if (d.website) return json({ ok: true });

  const row = {
    name: clip(d.name, 200),
    email: clip(d.email, 254),
    organisation: clip(d.organisation, 200),
    interest: clip(d.interest, 100),
    volume: clip(d.volume, 200),
    message: clip(d.message, 5000),
  };

  if (
    !row.name || !row.organisation || !row.message ||
    !/^\S+@\S+\.\S+$/.test(row.email) || d.consent !== true
  ) {
    return json({ ok: false, error: "Missing or invalid fields" }, 400);
  }

  try {
    await env.DB.prepare(
      `INSERT INTO enquiries (name, email, organisation, interest, volume, message, consent, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    )
      .bind(row.name, row.email, row.organisation, row.interest, row.volume, row.message, new Date().toISOString())
      .run();
  } catch (err) {
    console.error("D1 insert failed", err);
    return json({ ok: false, error: "Could not save enquiry" }, 500);
  }

  // Optional email alert (set RESEND_API_KEY, NOTIFY_TO, NOTIFY_FROM in Pages settings).
  if (env.RESEND_API_KEY && env.NOTIFY_TO && env.NOTIFY_FROM) {
    const text =
      `Name: ${row.name}\nEmail: ${row.email}\nOrganisation: ${row.organisation}\n` +
      `Interested in: ${row.interest}\nMonthly call volume: ${row.volume || "Not given"}\n\n${row.message}`;
    const mail = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.NOTIFY_FROM,
        to: [env.NOTIFY_TO],
        reply_to: row.email,
        subject: `ADAM-AR enquiry: ${row.interest} (${row.name})`,
        text,
      }),
    }).catch((e) => console.error("Email notify failed", e));
    if (waitUntil) waitUntil(mail);
  }

  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: "Method not allowed" }, 405);
