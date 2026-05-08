/* ============================================================
   Email templates — solid colors only (no CSS gradients), URL
   shown ABOVE the button so the recipient can copy/paste even
   if their email client strips links. Matches the in-app brand
   palette: orange (#F97316) primary, blue (#1A73E8) secondary,
   slate (#0F172A) for the dark header band.

   Note: many email clients ignore <style> blocks and CSS classes,
   so all styling must be inline. We also keep table-based layouts
   for Outlook compatibility where reasonable, but since this app
   targets modern recipients we use simple <div> wrappers.
   ============================================================ */

const ORANGE = '#F97316';
const BLUE   = '#1A73E8';
const SLATE  = '#0F172A';

/* Shared chrome — header + body + footer scaffold so both templates
   stay visually identical. */
function emailShell({ headerEyebrow, headerTitle, headerSubtitle, bodyHtml }) {
    return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 8px 24px rgba(15,23,42,0.06);">

    <!-- Solid 3-block brand stripe (no gradient) -->
    <div style="display:block;height:4px;line-height:0;font-size:0;">
      <span style="display:inline-block;width:60%;height:4px;background-color:${ORANGE};"></span><!--
   --><span style="display:inline-block;width:25%;height:4px;background-color:${BLUE};"></span><!--
   --><span style="display:inline-block;width:15%;height:4px;background-color:${SLATE};"></span>
    </div>

    <!-- Solid slate header with orange L-bracket accent (mirrors in-app design) -->
    <div style="position:relative;background-color:${SLATE};padding:28px 32px;color:#ffffff;">
      <div style="display:inline-block;padding:4px 10px;border:1px solid rgba(249,115,22,0.4);background-color:rgba(249,115,22,0.12);color:${ORANGE};border-radius:6px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;">
        ${headerEyebrow}
      </div>
      <h1 style="margin:14px 0 6px;font-size:22px;font-weight:700;letter-spacing:-0.01em;line-height:1.2;color:#ffffff;">${headerTitle}</h1>
      ${headerSubtitle ? `<p style="margin:0;font-size:13.5px;color:#cbd5e1;line-height:1.5;">${headerSubtitle}</p>` : ''}
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;color:#1f2937;font-size:15px;line-height:1.65;">
      ${bodyHtml}
    </div>

    <!-- Footer -->
    <div style="background-color:#f8fafc;padding:18px 32px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#94a3b8;">
      <strong style="color:#475569;">AnalyticsLiv</strong> &middot; GA4 Auditor &middot;
      <a href="mailto:support@analyticsliv.com" style="color:${BLUE};text-decoration:none;">support@analyticsliv.com</a>
    </div>
  </div>
</body>
</html>`;
}

/* CTA "card" — URL is rendered as PLAIN TEXT (not an <a href>) so
   email gateways that rewrite anchor tags for click-tracking
   (e.g. SendGrid's urlNNN.analyticsliv.com proxy) can't touch the
   displayed copy-pasteable URL. The button below is the only
   clickable element. If the recipient's environment blocks the
   button, they can copy the plain-text URL by hand. */
function ctaBlock({ url, buttonLabel }) {
    return `
    <div style="margin:28px 0;border:1px solid #e5e7eb;border-radius:12px;background-color:#f8fafc;padding:18px 18px 14px;">

      <!-- URL displayed above the button as PLAIN TEXT (no anchor) -->
      <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;margin-bottom:8px;">
        Your secure link
      </div>
      <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin-bottom:14px;">
        <span style="color:${BLUE};word-break:break-all;font-size:13px;font-family:'SF Mono',Menlo,Consolas,monospace;">${url}</span>
      </div>

      <!-- Solid orange button — the only clickable link in this block -->
      <a href="${url}"
         style="display:inline-block;background-color:${ORANGE};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.01em;">
        ${buttonLabel} &rarr;
      </a>
    </div>`;
}

/* ============================================================
   AGENCY ADMIN WELCOME — sent when a super-admin creates an
   agency and assigns this email as its admin. The user account
   is already active; they just need to sign in.
   ============================================================ */
export function generateAgencyAdminWelcomeEmail({ email, inviterEmail, agencyName, plan, dashboardUrl }) {
    const planLabel = (plan || '').toUpperCase();
    const safeAgency = agencyName || 'your agency';

    const bodyHtml = `
      <p style="margin:0 0 14px;">Hi,</p>

      <p style="margin:0 0 14px;">
        <strong style="color:${SLATE};">${inviterEmail}</strong> has set you up as the
        <strong style="color:${ORANGE};">Agency Admin</strong> of
        <strong style="color:${SLATE};">${safeAgency}</strong>${planLabel ? ` on the <strong>${planLabel}</strong> plan` : ''} on the AnalyticsLiv GA4 Auditor.
      </p>

      <p style="margin:0 0 14px;">
        Your account is already active. Sign in with this email using Google to open
        your agency dashboard, where you can invite teammates and track audit and
        chatbot usage across your pooled quota.
      </p>

      ${ctaBlock({ url: dashboardUrl, buttonLabel: 'Sign in &amp; open dashboard' })}

      <div style="margin-top:24px;padding-top:18px;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${SLATE};">What's next</p>
        <ul style="margin:0;padding-left:18px;color:#475569;font-size:13.5px;line-height:1.7;">
          <li>Sign in with <strong style="color:${SLATE};">${email}</strong> via Google.</li>
          <li>Invite teammates from the Agency page — they share your pooled quota.</li>
          <li>Run audits or chat with the assistant from anywhere in the app.</li>
        </ul>
      </div>

      <p style="margin:24px 0 0;font-size:12.5px;color:#94a3b8;">
        Didn't expect this? Reply to this email or contact
        <a href="mailto:support@analyticsliv.com" style="color:${BLUE};text-decoration:none;">support@analyticsliv.com</a>
        and we'll sort it out.
      </p>
    `;

    return {
        to: email,
        subject: `You're now Agency Admin of ${safeAgency}`,
        html: emailShell({
            headerEyebrow: 'Agency admin · access ready',
            headerTitle: "You're now an Agency Admin",
            headerSubtitle: `${safeAgency}${planLabel ? ` &middot; ${planLabel}` : ''}`,
            bodyHtml,
        }),
    };
}

/* ============================================================
   GENERIC INVITATION — sent when an existing admin invites a
   teammate (or another admin) into an agency. Recipient must
   click the link to accept (the route validates the token).
   ============================================================ */
export function generateInvitationEmail({ email, inviterEmail, agencyName, role, acceptUrl, expiresAt }) {
    const roleLabel = role === 'agencyAdmin' ? 'Agency Admin' : 'Team Member';
    const expiresStr = new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const safeAgency = agencyName || 'AnalyticsLiv';

    const bodyHtml = `
      <p style="margin:0 0 14px;">Hi,</p>

      <p style="margin:0 0 14px;">
        <strong style="color:${SLATE};">${inviterEmail}</strong> has invited you to join
        <strong style="color:${SLATE};">${safeAgency}</strong> as a
        <strong style="color:${ORANGE};">${roleLabel}</strong> on the AnalyticsLiv GA4 Auditor.
      </p>

      <p style="margin:0 0 14px;">
        Click the link below to accept the invitation. You'll be asked to sign in with
        Google using <strong style="color:${SLATE};">${email}</strong>, after which your
        access becomes active immediately.
      </p>

      ${ctaBlock({ url: acceptUrl, buttonLabel: 'Accept invitation' })}

      <div style="display:inline-block;padding:8px 12px;border:1px solid #fed7aa;background-color:#fff7ed;border-radius:8px;">
        <span style="font-size:12.5px;color:#9a3412;">
          This invitation expires on <strong>${expiresStr}</strong>.
        </span>
      </div>

      <p style="margin:24px 0 0;font-size:12.5px;color:#94a3b8;">
        Didn't expect this invitation? You can safely ignore this email — nothing will happen
        to your account if you don't click the link.
      </p>
    `;

    return {
        to: email,
        subject: `${inviterEmail} invited you to ${safeAgency} on AnalyticsLiv`,
        html: emailShell({
            headerEyebrow: `Invitation · ${roleLabel.toLowerCase()}`,
            headerTitle: `You're invited to ${safeAgency}`,
            headerSubtitle: `Joining as ${roleLabel}`,
            bodyHtml,
        }),
    };
}
