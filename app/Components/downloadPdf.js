'use client';

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import { useTheme } from "next-themes";
import PdfContent from "./pdfContent";
import { useAccountStore } from "../store/useAccountStore";

const DownloadPdf = () => {
    const pdfRef = useRef(null);
    const [showInput, setShowInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filename, setFilename] = useState("GA4_Audit_Report");
    const [pdfTheme, setPdfTheme] = useState("light");

    const { resolvedTheme } = useTheme();
    const isDarkUi = resolvedTheme === "dark";

    const { isEcommerce } = useAccountStore();

    const generatePDF = async () => {
        if (!pdfRef.current) return;
        setShowInput(false);
        setLoading(true);
        const element = pdfRef.current;

        // When UI is light there is no choice — always export light.
        // When UI is dark, honor pdfTheme; default is "light".
        const exportTheme = isDarkUi ? pdfTheme : "light";

        const opt = {
            margin: 0,
            filename: `${filename || "GA4_Audit_Report"}.pdf`,
            image: { type: "jpeg", quality: 0.6 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: exportTheme === "dark" ? "#0b101a" : "#ffffff",
                // onclone runs against a CLONED document — we mutate that
                // copy only, leaving the live UI untouched. This is what
                // lets us flip the theme for the PDF without flicker.
                onclone: (clonedDoc) => {
                    const html = clonedDoc.documentElement;
                    if (exportTheme === "light") {
                        html.classList.remove("dark");
                        html.style.colorScheme = "light";
                    } else {
                        html.classList.add("dark");
                        html.style.colorScheme = "dark";
                    }
                },
            },
            jsPDF: {
                unit: "pt",
                format: "a4",
                orientation: "portrait",
            },
            pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        };

        try {
            await new Promise((resolve) => setTimeout(resolve, 300));
            await html2pdf().set(opt).from(element).save();
        } finally {
            setLoading(false);
        }
    };

    // The off-screen render target. When exporting dark, the wrapper carries
    // bg/text classes that work on a dark canvas; the onclone hook above
    // ensures `dark:` Tailwind variants activate during the capture.
    const renderTargetClass =
        isDarkUi && pdfTheme === "dark"
            ? "bg-[#111827] text-slate-100"
            : "theme-light bg-white text-gray-800";

    return (
        <div className="w-full">
            <div
                style={{
                    position: "absolute",
                    left: "-9999px",
                    top: "0",
                    visibility: "hidden",
                }}
            >
                <div ref={pdfRef} className={renderTargetClass}>
                    <PdfContent isEcommerceOverride={isEcommerce} />
                </div>
            </div>

            <div className="flex gap-10 justify-center items-center">
                <button
                    onClick={() => setShowInput(true)}
                    className={`${loading ? "cursor-not-allowed" : "cursor-pointer"} mt-6 px-4 py-2 rounded-xl bg-[#7380ec] text-white font-bold hover:bg-indigo-700`}
                >
                    {loading ? "Downloading PDF..." : "Download Audit PDF"}
                </button>

                {showInput && (
                    <div className="mt-4 flex items-end gap-3">
                        <div className="flex flex-col">
                            <div className="text-xs text-content-muted">pdf name:</div>
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="Enter PDF filename"
                                className="px-4 py-2 rounded-xl border border-line-strong bg-surface text-content"
                            />
                        </div>

                        {isDarkUi && (
                            <div className="flex flex-col">
                                <div className="text-xs text-content-muted">pdf theme:</div>
                                <div className="inline-flex rounded-xl border border-line-strong bg-surface overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setPdfTheme("light")}
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${pdfTheme === "light" ? "bg-brand text-brand-foreground" : "text-content hover:bg-surface-hover"}`}
                                    >
                                        Light
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPdfTheme("dark")}
                                        className={`px-3 py-2 text-sm font-medium transition-colors ${pdfTheme === "dark" ? "bg-brand text-brand-foreground" : "text-content hover:bg-surface-hover"}`}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={generatePDF}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowInput(false)}
                                className="px-4 py-2 rounded-xl bg-surface-hover text-content font-semibold hover:bg-line-strong"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadPdf;
