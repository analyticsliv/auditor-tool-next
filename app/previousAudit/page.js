'use client';

import React, { useEffect, useState } from 'react';
import { AllAudit } from '../utils/allAudit';

const ITEMS_PER_PAGE = 5;

const PreviousAudit = () => {
    const [audits, setAudits] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchAudits = async () => {
            setLoading(true);
            const data = await AllAudit();
            setAudits(data || []);
            setLoading(false);
        };
        fetchAudits();
    }, []);

    const handleView = (id) => {
        const url = `/previous-audit?id=${id}`;
        window.open(url, '_blank');
    };

    // Filtered list based on search input
    const filteredAudits = audits.filter(
        (audit) =>
            audit?.accountName.toLowerCase().includes(search.toLowerCase()) ||
            audit?.propertyName.toLowerCase().includes(search.toLowerCase())
    ).reverse();

    // Pagination: calculate displayed audits
    const totalPages = Math.ceil(filteredAudits?.length / ITEMS_PER_PAGE);
    const paginatedAudits = filteredAudits?.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8f9ff] to-[#e0e7ff] py-10 px-6">
            <h2 className="text-3xl text-center font-extrabold text-[#3f51b5] mb-6 drop-shadow-md">
                🚀 Previous Audits
            </h2>

            <div className="flex justify-center mb-8">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="🔍 Search by Account or Property Name"
                    className="w-[90%] max-w-[600px] px-5 py-3 text-base border border-[#ccc] rounded-xl shadow focus:ring-2 focus:ring-blue-400 transition duration-300"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden">
                    <thead className="bg-[#3f51b5] text-white text-sm lg:text-base uppercase">
                        <tr>
                            <th className="px-6 py-4 text-left">Account Name</th>
                            <th className="px-6 py-4 text-left">Property Name</th>
                            <th className="px-6 py-4 text-left">Created At</th>
                            <th className="px-6 py-4 text-left">Updated At</th>
                            <th className="px-6 py-4 text-left">Links</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            [...Array(3)]?.map((_, i) => (
                                <tr key={i} className="animate-pulse bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-8 bg-gray-300 rounded w-16"></div>
                                    </td>
                                </tr>
                            ))
                        ) : paginatedAudits?.length > 0 ? (
                            paginatedAudits?.map((audit, index) => (
                                <tr
                                    key={audit?._id}
                                    className={`text-gray-700 text-sm lg:text-base ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        } hover:bg-blue-50 transition`}
                                >
                                    <td className="px-6 py-4">{audit?.accountName}</td>
                                    <td className="px-6 py-4">{audit?.propertyName}</td>
                                    <td className="px-6 py-4">
                                        {new Date(audit?.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(audit?.updatedAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleView(audit?._id)}
                                            className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 font-medium">
                                    No audits found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded-md border ${currentPage === index + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-blue-600 hover:bg-blue-50'
                                }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border rounded-md text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default PreviousAudit;
