"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { useAccountStore } from "../store/useAccountStore";
import { ALLOWED_ACCOUNT } from "../utils/useAuditAgent";
import AuditAgentModal from "./AuditAgentModal";

const BLUE = "#1A73E8";

/* ============================================================
   GLOBAL AUDIT AGENT BUTTON
   - Floating action button + audit agent modal, mirrors
     GlobalChatbotButton but stacked above it (blue vs. orange)
     so both are reachable without overlapping.
   - Mounted once in the layout, same routes as the chatbot button.
   - Only renders once we've confirmed the signed-in user actually has
     access to the allowlisted account — otherwise other users (e.g.
     clients with their own GA4 accounts) would see a button that opens
     to a permanently empty dropdown.
   ============================================================ */
export default function GlobalAuditAgentButton() {
    const [open, setOpen] = useState(false);

    const accounts = useAccountStore((s) => s.accounts);
    const hasFetchedAccounts = useAccountStore((s) => s.hasFetchedAccounts);
    const ensureAccountsFetched = useAccountStore((s) => s.ensureAccountsFetched);

    useEffect(() => {
        if (!hasFetchedAccounts) ensureAccountsFetched();
    }, [hasFetchedAccounts, ensureAccountsFetched]);

    const hasAllowedAccount = accounts?.some((a) => a?.account === ALLOWED_ACCOUNT);

    if (!hasFetchedAccounts || !hasAllowedAccount) return null;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 xl:bottom-32 xl:right-8 group w-12 h-12 xl:w-[54px] xl:h-[54px] rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 z-40"
                aria-label="Open GA4 Auto-fix AI Agent"
                title="Run AI audit agent"
                style={{ backgroundColor: BLUE, boxShadow: "0 14px 30px -8px rgba(26,115,232,0.55)" }}
            >
                <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-white/20" />
                <span aria-hidden className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: BLUE, filter: "blur(10px)" }} />
                <span className="relative flex items-center justify-center w-full h-full">
                    <Wrench className="w-5 h-5" strokeWidth={2.4} />
                </span>
            </button>

            <AuditAgentModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
