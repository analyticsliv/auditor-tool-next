export function generateAgencyAdminWelcomeEmail({ email, inviterEmail, agencyName, plan, dashboardUrl }) {
    const planLabel = (plan || '').toUpperCase();
    const html = `
    <!DOCTYPE html>
    <html><body style="font-family: Arial, sans-serif; background:#f6f7fb; padding:24px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
            <div style="background:linear-gradient(135deg,#4f46e5,#9333ea,#ec4899); padding:28px; color:#fff;">
                <h1 style="margin:0; font-size:22px;">You're now an Agency Admin</h1>
                <p style="margin:8px 0 0; opacity:0.9; font-size:14px;">${agencyName} ${planLabel ? `· ${planLabel}` : ''}</p>
            </div>
            <div style="padding:28px; color:#1f2937; font-size:15px; line-height:1.6;">
                <p>Hi,</p>
                <p><strong>${inviterEmail}</strong> has set you up as the Agency Admin of <strong>${agencyName}</strong> on the AnalyticsLiv GA4 Auditor.</p>
                <p>Your account is ready — sign in with this email using Google to access your agency dashboard. From there you can invite teammates and track your audit and chatbot usage.</p>
                <p style="text-align:center; margin:32px 0;">
                    <a href="${dashboardUrl}" style="display:inline-block; background:#4f46e5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">Activate your account</a>
                </p>
                <p style="font-size:13px; color:#6b7280;">Or paste this link in your browser:<br/>
                    <span style="color:#4f46e5; word-break:break-all;">${dashboardUrl}</span>
                </p>
                <p style="font-size:13px; color:#9ca3af; margin-top:24px;">If you didn't expect this, please reach out to support@analyticsliv.com.</p>
            </div>
            <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
                AnalyticsLiv &middot; support@analyticsliv.com
            </div>
        </div>
    </body></html>`;
    return {
        to: email,
        subject: `You're now Agency Admin of ${agencyName}`,
        html,
    };
}

export function generateInvitationEmail({ email, inviterEmail, agencyName, role, acceptUrl, expiresAt }) {
    const roleLabel = role === 'agencyAdmin' ? 'Agency Admin' : 'Team Member';
    const expiresStr = new Date(expiresAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const html = `
    <!DOCTYPE html>
    <html><body style="font-family: Arial, sans-serif; background:#f6f7fb; padding:24px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);">
            <div style="background:linear-gradient(135deg,#4f46e5,#9333ea,#ec4899); padding:28px; color:#fff;">
                <h1 style="margin:0; font-size:22px;">You're invited to AnalyticsLiv</h1>
                <p style="margin:8px 0 0; opacity:0.9; font-size:14px;">${agencyName ? `Agency: ${agencyName}` : ''}</p>
            </div>
            <div style="padding:28px; color:#1f2937; font-size:15px; line-height:1.6;">
                <p>Hi,</p>
                <p><strong>${inviterEmail}</strong> has invited you to join${agencyName ? ` <strong>${agencyName}</strong>` : ''} as a <strong>${roleLabel}</strong> on the AnalyticsLiv GA4 Auditor.</p>
                <p style="text-align:center; margin:32px 0;">
                    <a href="${acceptUrl}" style="display:inline-block; background:#4f46e5; color:#fff; text-decoration:none; padding:12px 28px; border-radius:8px; font-weight:600;">Accept invitation</a>
                </p>
                <p style="font-size:13px; color:#6b7280;">Or paste this link in your browser:<br/>
                    <span style="color:#4f46e5; word-break:break-all;">${acceptUrl}</span>
                </p>
                <p style="font-size:13px; color:#6b7280;">This invitation expires on <strong>${expiresStr}</strong>.</p>
                <p style="font-size:13px; color:#9ca3af; margin-top:24px;">If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
            <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
                AnalyticsLiv &middot; support@analyticsliv.com
            </div>
        </div>
    </body></html>`;
    return {
        to: email,
        subject: `You've been invited to join ${agencyName || 'AnalyticsLiv'}`,
        html,
    };
}
