'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { GetAuditById } from '../utils/getAuditById';
import { getComponentsList } from '../utils/componentList';
import Loader from '../Components/loader';
import { useAccountStore } from '../store/useAccountStore';
import InfoComponent from '../Components/info';

const AuditDetailPage = () => {
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const setAuditData = useAccountStore((state) => state.setAuditData);
    const setEndApiData = useAccountStore((state) => state.setEndApiData);
    const setIsEcommerce = useAccountStore((state) => state.setIsEcommerce);
    const setAnalyzerData = useAccountStore((state) => state.setAnalyzerData); // ✅ Add this
    const resetSelection = useAccountStore((state) => state.resetSelection);

    const [loading, setLoading] = useState(true);
    const [isEcommerceFromApi, setIsEcommerceFromApi] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        const fetchAudit = async () => {
            if (!id || fetchedRef.current) return;
            fetchedRef.current = true;

            // Reset all relevant store state
            resetSelection();

            setLoading(true);
            const data = await GetAuditById(id);

            if (data) {
                const {
                    auditData = {},
                    endApiData = {},
                    analyzerData = null,
                    isEcommerce = false
                } = data;

                const {
                    accountId,
                    accountName,
                    propertyId,
                    propertyName,
                } = data;

                setIsEcommerceFromApi(isEcommerce);
                setIsEcommerce(isEcommerce);

                if (analyzerData) {
                    setAnalyzerData(analyzerData);
                } else {
                    setAnalyzerData(null);
                }

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
    }, [id, setAuditData, setEndApiData, setAnalyzerData, resetSelection, setIsEcommerce]); // ✅ Add dependencies

    // Get dynamic component list based on isEcommerce from API
    const componentsList = getComponentsList(isEcommerceFromApi);

    return (
        <div>
            {loading ? (
                <div className="h-screen w-full flex flex-col justify-center items-center py-10">
                    <Loader />
                </div>
            ) : (
                <>
                    <InfoComponent previousAudit={true} />
                    {componentsList?.map((Component, idx) => <Component key={idx} />)}
                </>
            )}
        </div>
    );
};

export default AuditDetailPage;