'use client';
import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Frown, Smile } from 'lucide-react';

const EcomItemDetails = () => {
    const { endApiData } = useAccountStore();
    const [emojiMap, setEmojiMap] = useState({});
    const [shouldRender, setShouldRender] = useState(true); // New flag

    useEffect(() => {
        if (!endApiData) return;

        const addToCartData = endApiData['ecomItems_addToCart'];
        const rows = addToCartData?.rows || [];

        // Hide component if no rows for Add to Cart
        if (rows.length === 0) {
            setShouldRender(false);
            return;
        }

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

        Object.entries(metricKeysMap)?.forEach(([shortKey, storeKey]) => {
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
            return <div className="p-2 rounded-lg bg-green-500"><Smile className="w-5 h-5 text-white" /></div>;
        } else if (emojiMap[key] === 'sad') {
            return <div className="p-2 rounded-lg bg-red-500"><Frown className="w-5 h-5 text-white" /></div>;
        } else {
            return <span>-</span>;
        }
    };

    if (!shouldRender) return null; // 👈 Hide entire component if Add to Cart is empty

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
                            ]?.map((event, idx) => (
                                <tr key={idx}>
                                    <td className='h-[3.8rem] border-b border-gray-800'>{event?.label}</td>
                                    {[1, 2, 3, 4, 5]?.map(i => (
                                        <td className='h-[3.8rem] border-b border-gray-800' key={i}>
                                            <div className='flex justify-center items-center'>{renderEmoji(`${event?.key}${i}`)}</div>
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
