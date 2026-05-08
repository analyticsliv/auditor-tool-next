"use client";

import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { useToastStore } from "../store/useToastStore";

const TONES = {
    success: { bar: "bg-emerald-500", icon: CheckCircle2, iconCls: "text-emerald-500" },
    error:   { bar: "bg-rose-500",    icon: AlertTriangle, iconCls: "text-rose-500" },
    info:    { bar: "bg-purple-500",  icon: Info,          iconCls: "text-purple-500" },
};

export default function GlobalToast() {
    const toasts = useToastStore((s) => s.toasts);
    const dismiss = useToastStore((s) => s.dismiss);

    if (!toasts.length) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => {
                const tone = TONES[t.type] || TONES.info;
                const Icon = tone.icon;
                return (
                    <div
                        key={t.id}
                        role="status"
                        aria-live="polite"
                        className="pointer-events-auto bg-surface-elevated border border-line rounded-xl pl-3 pr-2.5 py-2.5 flex items-center gap-3 max-w-sm shadow-lg backdrop-blur"
                        style={{ animation: "global-toast-in 220ms cubic-bezier(0.32,0.72,0,1)" }}
                    >
                        <span className={`w-1 h-7 rounded-full flex-shrink-0 ${tone.bar}`} />
                        <Icon size={15} className={`${tone.iconCls} flex-shrink-0`} />
                        <span className="text-[13px] text-content leading-snug">{t.message}</span>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="ml-1 flex-shrink-0 text-content-subtle hover:text-content p-0.5 rounded hover:bg-surface-hover transition-colors"
                            aria-label="Dismiss"
                        >
                            <X size={13} strokeWidth={2.25} />
                        </button>
                        <style jsx>{`
                            @keyframes global-toast-in {
                                from { opacity: 0; transform: translateY(8px) }
                                to   { opacity: 1; transform: translateY(0) }
                            }
                        `}</style>
                    </div>
                );
            })}
        </div>
    );
}
