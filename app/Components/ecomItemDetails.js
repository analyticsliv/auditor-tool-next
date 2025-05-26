'use client';
import React, { useEffect } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const EcomItemDetails = () => {
    const { endApiData } = useAccountStore();

    useEffect(() => {
        if (!endApiData) return;

        const metricKeysMap = {
            'itemIVL': 'ecomItems_itemIVL',
            'itemIV': 'ecomItems_itemIV',
            'addtocart': 'ecomItems_addToCart',
            'checkout': 'ecomItems_checkout',
            'purchase': 'ecomItems_purchase'
        };

        const dimensionHeaders = [
            "itemId",
            "itemName",
            "itemCategory",
            "itemBrand",
            "itemListName",
        ];

        const processData = (data, keyPrefix) => {
            const rows = data?.rows || [];
            const dimMap = new Set();

            rows?.forEach(row => {
                row.dimensionValues?.forEach((dim, idx) => {
                    if (dim?.value === '(not set)') {
                        dimMap?.add(data?.dimensionHeaders[idx]?.name);
                    }
                });
            });

            dimensionHeaders?.forEach((dimName, index) => {
                const elementId = `${keyPrefix}${index + 1}`;
                const cell = document.getElementById(elementId);
                if (cell) {
                    cell.textContent = dimMap?.has(dimName) ? 'mood_bad' : 'mood';
                }
            });
        };

        Object?.entries(metricKeysMap)?.forEach(([shortKey, storeKey]) => {
            const metricData = endApiData[storeKey];
            if (metricData) {
                processData(metricData, shortKey);
            }
        });

    }, [endApiData]);


    return (
        <div className='bg-white rounded-3xl p-10 mt-10'>
            <div id="ecommerce-section">
                <div>
                    <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>E-Commerce Item Details</h1>
                    <h3 className='text-center'>
                        Ensuring complete capture of item details in all ecommerce events. Item details are crucial in<br />
                        understanding user behavior and shopping experience on your store.
                    </h3>
                    <div className='mt-10'>
                        <table className='w-full'>
                            <thead className='text-center'>
                                <tr className=''>
                                    <th>Event</th>
                                    <th>Item ID</th>
                                    <th>Item Name</th>
                                    <th>Item Category</th>
                                    <th>Item Brand</th>
                                    <th>Item List</th>
                                </tr>
                            </thead>
                            <tbody className='text-center'>
                                {[
                                    { label: 'View Item List', key: 'itemIVL' },
                                    { label: 'View Item Details', key: 'itemIV' },
                                    { label: 'Add to Cart', key: 'addtocart' },
                                    { label: 'Checkout', key: 'checkout' },
                                    { label: 'Purchase', key: 'purchase' }
                                ]?.map((event, idx) => (
                                    <tr key={idx}>
                                        <td className='h-[3.8rem] border-b border-gray-800 text-center'>{event?.label}</td>
                                        {[1, 2, 3, 4, 5]?.map(i => (
                                            <td className='h-[3.8rem] border-b border-gray-800 text-center' key={i} id={`${event?.key}${i}`}><span>mood</span></td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EcomItemDetails;
