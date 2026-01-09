'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useAccountStore } from '../store/useAccountStore'
import { Frown, Smile, Meh } from 'lucide-react';

const EcommerceTracking = () => {
    const { endApiData, selectedProperty } = useAccountStore();
    const trackingData = endApiData?.ecomTracking;

    const [notSetCount, setNotSetCount] = useState(0);
    const [duplicateArray, setDuplicateArray] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isEcomDataAvailable, setIsEcomDataAvailable] = useState(true);
    const [currency, setCurrency] = useState('INR');
    const [isLoading, setIsLoading] = useState(true);

    // Use ref to track if we've already processed this data
    const hasProcessedData = useRef(false);
    const lastProcessedRows = useRef(null);

    useEffect(() => {
        // If endApiData doesn't exist yet, we're still loading
        if (!endApiData) {
            setIsLoading(true);
            return;
        }

        // If ecomTracking key doesn't exist yet, we're still loading
        if (!endApiData.hasOwnProperty('ecomTracking')) {
            setIsLoading(true);
            return;
        }

        // Check if we've already processed this exact data
        if (hasProcessedData.current && lastProcessedRows.current === trackingData?.rows) {
            return; // Skip processing if it's the same data
        }

        // Mark that we're now processing
        setIsLoading(false);

        // Check if there's no data or empty rows
        if (!trackingData?.rows || trackingData?.rows?.length === 0) {
            setIsEcomDataAvailable(false);
            hasProcessedData.current = true;
            lastProcessedRows.current = trackingData?.rows;
            return;
        }

        // Data is available, process it
        setIsEcomDataAvailable(true);

        let notSet = 0;
        let duplicates = [];
        let revenue = 0;

        trackingData.rows.forEach((item, index) => {
            if (item?.dimensionValues?.[0]?.value === '(not set)' && index !== trackingData.rows.length - 1) {
                notSet++;
            }

            if (Number(item?.metricValues?.[0]?.value) > 1) {
                duplicates.push(item?.dimensionValues?.[0]?.value);
            }

            revenue += Number(item?.metricValues?.[1]?.value);
        });

        setNotSetCount(notSet);
        setDuplicateArray(duplicates);
        setTotalRevenue(revenue);
        setCurrency(selectedProperty?.currencyCode);

        // Mark as processed
        hasProcessedData.current = true;
        lastProcessedRows.current = trackingData.rows;

    }, [trackingData?.rows]);

    // Calculate overall mood based on how many checks are passing (smile)
    const getOverallMoodIcon = () => {
        if (!isEcomDataAvailable) {
            return null; // Don't show mood icon if no e-commerce data
        }

        let smileCount = 0;

        // Check 1: Collecting Transactions - always smile
        smileCount++;

        // Check 2: Transactions without IDs - smile if notSetCount === 0
        if (notSetCount === 0) smileCount++;

        // Check 3: Duplicate Transactions - smile if duplicateArray.length === 0
        if (duplicateArray.length === 0) smileCount++;

        // Check 4: Transactions Revenue - always smile
        smileCount++;

        // At least 3 smiles = good, 2 smiles = mediator, else sad
        if (smileCount >= 3) {
            return (
                <div className="p-2 rounded-lg bg-green-500">
                    <Smile className="w-5 h-5 text-white" />
                </div>
            );
        } else if (smileCount === 2) {
            return (
                <div className="p-2 rounded-lg bg-orange-500">
                    <Meh className="w-5 h-5 text-white" />
                </div>
            );
        } else {
            return (
                <div className="p-2 rounded-lg bg-red-500">
                    <Frown className="w-5 h-5 text-white" />
                </div>
            );
        }
    };

    return (
        <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <div className="streams">
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center flex items-center justify-center gap-3'>
                    {getOverallMoodIcon()}
                    E-Commerce Tracking
                </h1>
                <h3 className="pb-6 text-center">Analyzing transaction and revenue data, making sure it&apos;s working properly.</h3>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading e-commerce data...</p>
                    </div>
                ) : !isEcomDataAvailable ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="p-4 rounded-full bg-red-100 mb-4">
                            <Frown className="w-8 h-8 text-red-500" />
                        </div>
                        <p className="text-red-500 font-semibold text-lg">Not an e-commerce account.</p>
                        <p className="text-gray-500 text-sm mt-2">No transaction data found for the selected period.</p>
                    </div>
                ) : (
                    <div>
                        <table className='w-full'>
                            <thead>
                                <tr className="">
                                    <th className='text-sm text-center'>Check</th>
                                    <th className='text-sm text-center'>Status</th>
                                    <th className='text-sm text-center'>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Collecting Transactions</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] flex justify-center items-center font-bold text-center'>
                                            <div className="p-2 rounded-lg bg-green-500" >
                                                <Smile className="w-5 h-5 text-white" />
                                            </div>
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>You have <b>{trackingData?.rows?.length}</b> transactions during reporting period.</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Transactions without IDs</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] flex justify-center items-center font-bold text-center'>
                                            {notSetCount > 0 ? <div className="p-2 rounded-lg bg-red-500">
                                                <Frown className="w-5 h-5 text-white" />
                                            </div> : <div className="p-2 rounded-lg bg-green-500" >
                                                <Smile className="w-5 h-5 text-white" />
                                            </div>}
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        {notSetCount > 0 ? (
                                            <>You have <b>{notSetCount}</b> transactions without transaction ID.</>
                                        ) : (
                                            "You don't have transactions without transaction ID."
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Duplicate Transactions</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] flex justify-center items-center font-bold text-center'>
                                            {duplicateArray.length > 0 ? <div className="p-2 rounded-lg bg-red-500">
                                                <Frown className="w-5 h-5 text-white" />
                                            </div> : <div className="p-2 rounded-lg bg-green-500" >
                                                <Smile className="w-5 h-5 text-white" />
                                            </div>}
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        {duplicateArray.length > 0 ? (
                                            <>You have <b>{duplicateArray.length}</b> duplicate transactions.</>
                                        ) : (
                                            "No duplicate Transaction ID detected."
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Transactions Revenue</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] flex justify-center items-center font-bold text-center'>
                                            <div className="p-2 rounded-lg bg-green-500" >
                                                <Smile className="w-5 h-5 text-white" />
                                            </div>
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        You have <b>{totalRevenue.toFixed(2)} {currency}</b> revenue during the reporting period.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default EcommerceTracking;
