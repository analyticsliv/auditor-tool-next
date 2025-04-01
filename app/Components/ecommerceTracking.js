'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const EcommerceTracking = () => {

    const { endApiData } = useAccountStore();
    const trackingData = endApiData?.ecomTracking;

    useEffect(() => {
        console.log("trackingData -  ", trackingData)
    })

    return (
        <div className='bg-white rounded-3xl p-10 mt-10'>
            <div class="streams">
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                    E-Commerce Tracking
                </h1>
                <h3>Analyzing transaction and revenue data,
                    making sure it&apos;s
                    working properly.</h3>
                <div></div>
                <div>
                    <table>
                        <tr>
                            <th>Status</th>
                            <th>Check</th>
                            <th>Description</th>
                        </tr>
                        <tr>
                            <td><span>mood</span>
                            </td>
                            <td>Collecting Transactions </td>
                            <td>
                            You have <b>{trackingData?.rows?.length}</b> transactions during reporting period.
                            </td>
                        </tr>
                        <tr>
                            <td><span>mood</span>
                            </td>
                            <td>Transactions without IDs </td>
                            <td>
                                You don&apos;t have transactions without transaction ID.
                            </td>
                        </tr>
                        <tr>
                            <td><span>mood</span>
                            </td>
                            <td>Duplicate Transactions </td>
                            <td>
                                No duplicate Transaction ID detected.
                            </td>
                        </tr>
                        <tr>
                            <td><span>mood</span>
                            </td>
                            <td>Transactions Revenue</td>
                            <td></td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default EcommerceTracking
