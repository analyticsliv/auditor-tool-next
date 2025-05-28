'use client';
import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { FaLaugh } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

const EcomItemDetails = () => {
    const { endApiData } = useAccountStore();
    const [emojiMap, setEmojiMap] = useState({});

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

        const tempMap = {};

        Object.entries(metricKeysMap).forEach(([shortKey, storeKey]) => {
            const data = endApiData[storeKey];
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
                const key = `${shortKey}${index + 1}`;
                tempMap[key] = dimMap?.has(dimName) ? 'sad' : 'laugh';
            });
        });

        setEmojiMap(tempMap);
    }, [endApiData]);

    const renderEmoji = (key) => {
        if (emojiMap[key] === 'laugh') {
            return <FaLaugh className='h-8 w-14 mx-auto fill-green-600' />;
        } else if (emojiMap[key] === 'sad') {
            return <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />;
        } else {
            return <span>-</span>;
        }
    };

    return (
        <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <div id="ecommerce-section">
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>E-Commerce Item Details</h1>
                <h3 className='text-center'>
                    Ensuring complete capture of item details in all ecommerce events. Item details are crucial in<br />
                    understanding user behavior and shopping experience on your store.
                </h3>
                <div className='mt-10'>
                    <table className='w-full'>
                        <thead className='text-center'>
                            <tr>
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
                            ].map((event, idx) => (
                                <tr key={idx}>
                                    <td className='h-[3.8rem] border-b border-gray-800'>{event?.label}</td>
                                    {[1, 2, 3, 4, 5]?.map(i => (
                                        <td className='h-[3.8rem] border-b border-gray-800' key={i}>
                                            {renderEmoji(`${event?.key}${i}`)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EcomItemDetails;
