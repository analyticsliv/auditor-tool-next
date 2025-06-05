'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GetAuditById } from '../utils/getAuditById';
import componentList from '../utils/componentList';
import Loader from '../Components/loader';
import { useAccountStore } from '../store/useAccountStore';
import InfoComponent from '../Components/info';

const AuditDetailPage = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const setAuditData = useAccountStore((state) => state.setAuditData);
    const setEndApiData = useAccountStore((state) => state.setEndApiData);
    const resetSelection = useAccountStore((state) => state.resetSelection);

    const [loading, setLoading] = useState(true);
    const fetchedRef = useRef(false);

    useEffect(() => {
        const fetchAudit = async () => {
            if (!id || fetchedRef.current) return;
            fetchedRef.current = true;

            // ✅ Reset all relevant store state
            resetSelection();

            setLoading(true);
            const data = await GetAuditById(id);

            if (data) {
                const { auditData = {}, endApiData = {} } = data;
                const {
                    accountId,
                    accountName,
                    propertyId,
                    propertyName,
                } = data;
                useAccountStore.getState().setAccountDetailsFromAudit({
                    accountId,
                    accountName,
                    propertyId,
                    propertyName,
                });
                // Batch auditData updates
                await Promise.all(
                    Object.entries(auditData)?.map(([key, value]) =>
                        new Promise((resolve) => {
                            setAuditData(key, value);
                            setTimeout(resolve, 0);
                        })
                    )
                );

                // Batch endApiData updates
                await Promise.all(
                    Object.entries(endApiData)?.map(([key, value]) =>
                        new Promise((resolve) => {
                            setEndApiData(key, value);
                            setTimeout(resolve, 0);
                        })
                    )
                );
            }

            setLoading(false);
        };

        fetchAudit();
    }, [id, setAuditData, setEndApiData, resetSelection]);

    return (
        <div>
            {loading ? (
                <div className="h-screen w-full flex flex-col justify-center items-center py-10">
                    <Loader />
                </div>
            ) : (
                <>
                    <InfoComponent previousAudit={true} />
                    {componentList?.map((Component, idx) => <Component key={idx} />)}
                </>
            )}
        </div>
    );
};

export default AuditDetailPage;
