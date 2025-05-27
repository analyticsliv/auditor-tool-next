'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore'
import { FaLaugh } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

const EcommerceTracking = () => {
    const { endApiData, selectedProperty } = useAccountStore();
    const trackingData = endApiData?.ecomTracking;

    const [notSetCount, setNotSetCount] = useState(0);
    const [duplicateArray, setDuplicateArray] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [isEcomDataAvailable, setIsEcomDataAvailable] = useState(true);
    const [currency, setCurrency] = useState('INR');

    useEffect(() => {
        if (!trackingData?.rows || trackingData?.rows?.length === 0) {
            setIsEcomDataAvailable(false);
            return;
        }

        let notSet = 0;
        let duplicates = [];
        let revenue = 0;

        trackingData?.rows?.forEach((item, index) => {
            if (item?.dimensionValues?.[0]?.value === '(not set)' && index !== trackingData?.rows?.length - 1) {
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
    }, [trackingData]);

    return (
        <div className='bg-white rounded-3xl p-10 mt-10'>
            <div className="streams">
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                    E-Commerce Tracking
                </h1>
                <h3 className="pb-6 text-center">Analyzing transaction and revenue data, making sure it&apos;s working properly.</h3>

                {!isEcomDataAvailable ? (
                    <div className="text-red-500 font-semibold text-center">Not an e-commerce account.</div>
                ) : (
                    <div>
                        <table className='w-full'>
                            <thead>
                                <tr className="">
                                    <th className='text-sm text-center'>Status</th>
                                    <th className='text-sm text-center'>Check</th>
                                    <th className='text-sm text-center'>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'><span className='h-[3.8rem] font-bold text-center'><FaLaugh className='h-8 w-14 mx-auto fill-green-600' /></span></td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Collecting Transactions</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>You have <b>{trackingData?.rows?.length}</b> transactions during reporting period.</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] font-bold text-center'>
                                            {notSetCount > 0 ? <FaLaugh className='h-8 w-14 mx-auto fill-green-600' /> : <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />}
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Transactions without IDs</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        {notSetCount > 0 ? (
                                            <>You have <b>{notSetCount}</b> transactions without transaction ID.</>
                                        ) : (
                                            "You don't have transactions without transaction ID."
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        <span className='h-[3.8rem] font-bold text-center'>
                                            {duplicateArray.length > 0 ? <FaLaugh className='h-8 w-14 mx-auto fill-green-600' /> : <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />}
                                        </span>
                                    </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Duplicate Transactions</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>
                                        {duplicateArray.length > 0 ? (
                                            <>You have <b>{duplicateArray.length}</b> duplicate transactions.</>
                                        ) : (
                                            "No duplicate Transaction ID detected."
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'><span className='h-[3.8rem] font-bold text-center'><FaLaugh className='h-8 w-14 mx-auto fill-green-600' /></span></td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Transactions Revenue</td>
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
