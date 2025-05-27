'use client';

import React, { useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import PdfContent from "./pdfContent";

const DownloadPdf = () => {
    const pdfRef = useRef(null);
    const [showInput, setShowInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [filename, setFilename] = useState("GA4_Audit_Report");

    const generatePDF = async () => {
        if (pdfRef.current) {
            setShowInput(false);
            setLoading(true);
            const element = pdfRef.current;

            const opt = {
                margin: 0,
                filename: `${filename || "GA4_Audit_Report"}.pdf`,
                image: { type: 'jpeg', quality: 0.6 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                },
                jsPDF: {
                    unit: 'pt',
                    format: 'a4',
                    orientation: 'portrait',
                },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
            };

            await new Promise((resolve) => setTimeout(resolve, 1000));
            html2pdf().set(opt).from(element).save();
            setLoading(false);
        }

    };

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
                <div ref={pdfRef}>
                    <PdfContent />
                </div>
            </div>

            <div className="flex gap-10 justify-center items-center">
                <button
                    onClick={() => setShowInput(true)}
                    className={`${loading ? 'cursor-not-allowed' : 'cursor-pointer'} mt-6 px-4 py-2 rounded-xl bg-[#7380ec] text-white font-bold hover:bg-indigo-700`}
                >
                    {loading ? 'Downloading PDF...' : 'Download Audit PDF'}
                </button>

                {showInput && (
                    <div className="mt-4 flex items-end gap-2">
                        <div className="flex flex-col">
                            <div className="text-xs">pdf name:</div>
                            <input
                                type="text"
                                value={filename}
                                onChange={(e) => setFilename(e.target.value)}
                                placeholder="Enter PDF filename"
                                className="px-4 py-2 rounded-xl border border-gray-300"
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={generatePDF}
                                className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowInput(false)}
                                className="px-4 py-2 rounded-xl bg-gray-300 text-black font-semibold hover:bg-gray-400"
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
