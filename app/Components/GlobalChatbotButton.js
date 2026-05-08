"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatbotModal from "./ChatbotModal";

const ORANGE = "#F97316";

/* ============================================================
   GLOBAL CHATBOT BUTTON
   - Floating action button + chatbot modal
   - Mounted once in the layout so it appears on every authenticated
     route (Home, Audit Preview, Dashboard, Account, All Audits, Agency).
   - Excluded routes (e.g. the print-friendly /previous-audit) decide
     whether to render this in layout.js, not here.
   ============================================================ */
export default function GlobalChatbotButton() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-8 right-4 xl:bottom-14 xl:right-8 group w-12 h-12 xl:w-[54px] xl:h-[54px] rounded-full text-white transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 z-40"
                aria-label="Open GA4 chatbot"
                title="Ask anything about GA4"
                style={{ backgroundColor: ORANGE, boxShadow: "0 14px 30px -8px rgba(249,115,22,0.55)" }}
            >
                <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-white/20" />
                <span aria-hidden className="absolute -inset-1.5 rounded-full opacity-0 group-hover:opacity-30 transition-opacity"
                    style={{ backgroundColor: ORANGE, filter: "blur(10px)" }} />
                <span className="relative flex items-center justify-center w-full h-full">
                    <MessageCircle className="w-5 h-5" strokeWidth={2.4} />
                </span>
            </button>

            <ChatbotModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
