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
            <ChatbotModal isOpen={open} onClose={() => setOpen(false)} />
        </>
    );
}
