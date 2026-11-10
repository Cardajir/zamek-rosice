import type { APIRoute } from "astro";
import { query } from "@/sanity/client.ts";
import { secret } from "@/sanity/preview.ts";

/*
 * Where the contact form posts. A message is checked, then handed to the
 * e-mail service; the address it goes to is the castle's own, read from
 * Sanity, never anything the visitor sent.
 *
 * Secrets, all optional until the form goes live:
 *   RESEND_API_KEY        key of the e-mail service
 *   CONTACT_FROM          sender on a domain verified with that service
 *   TURNSTILE_SECRET_KEY  when set, a message must carry a solved challenge
 */

const LIMITS = { name: 100, email: 200, message: 5000 };
const EMAIL = /^[^\s@<>"',;:\\]+@[^\s@<>"',;:\\]+\.[^\s@<>"',;:\\]{2,}$/;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

/** One line of text: trimmed, no line breaks, no longer than allowed. */
const line = (value: FormDataEntryValue | null, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[\r\n\t]+/g, " ")
        .trim()
        .slice(0, max)
    : "";

async function passedChallenge(token: string, request: Request) {
  const key = secret("TURNSTILE_SECRET_KEY");
  if (!key) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret: key, response: token });
  const address = request.headers.get("CF-Connecting-IP");
  if (address) body.set("remoteip", address);

  try {
    const answer = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const result = (await answer.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[contact] challenge check failed:", error);
    return false;
  }
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  /* A field no person sees: whatever fills it in is not a person. */
  if (line(form.get("website"), 200)) return json({ ok: true });

  const name = [
    line(form.get("name"), LIMITS.name),
    line(form.get("surname"), LIMITS.name),
  ]
    .filter(Boolean)
    .join(" ");
  const email = line(form.get("email"), LIMITS.email);
  const rawMessage = form.get("message");
  const message =
    typeof rawMessage === "string"
      ? rawMessage.trim().slice(0, LIMITS.message)
      : "";

  if (!name || !EMAIL.test(email) || !message || !form.get("consent")) {
    return json({ ok: false, error: "invalid" }, 400);
  }

  const token = line(form.get("cf-turnstile-response"), 4000);
  if (!(await passedChallenge(token, request))) {
    return json({ ok: false, error: "challenge" }, 400);
  }

  const key = secret("RESEND_API_KEY");
  const from = secret("CONTACT_FROM");
  const to = await query<string | null>(
    `*[_id == "siteSettings"][0]{ "to": coalesce(formRecipient, email) }.to`,
    {},
    null,
  );
  if (!key || !from || !to) {
    console.error("[contact] the form is not configured to send e-mail");
    return json({ ok: false, error: "unavailable" }, 503);
  }

  try {
    const answer = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Zpráva z webu: ${name}`,
        text: `${message}\n\n--\n${name}\n${email}`,
      }),
    });
    if (!answer.ok) throw new Error(`e-mail service answered ${answer.status}`);
  } catch (error) {
    console.error("[contact] sending failed:", error);
    return json({ ok: false, error: "unavailable" }, 502);
  }

  return json({ ok: true });
};
