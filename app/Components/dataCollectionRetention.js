'use client';

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { Frown, Smile } from 'lucide-react';

const DataCollectionRetention = () => {
    const { auditData } = useAccountStore();
    const [dataRetentionMood, setDataRetentionMood] = useState(true);
    const [googleSignalMood, setGoogleSignalMood] = useState(true);
    const dataretention = auditData?.dataRetentionSettings?.userDataRetention?.toLowerCase().replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'undefined';
    const googlesignaldetails = auditData?.googleSignalsSettings?.state?.toLowerCase().replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'undefined';

    useEffect(() => {
        if (dataretention !== "Two Months") {
            setDataRetentionMood(true);
        } else {
            setDataRetentionMood(false)
        }
    }, [dataretention])

    useEffect(() => {
        if (googlesignaldetails == "Google Signals Enabled") {
            setGoogleSignalMood(true);
        } else {
            setGoogleSignalMood(false)
        }
    }, [googlesignaldetails])

    return (
        <div>
            <div>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-20 text-gray-800 font-extrabold text-[1.8rem] text-center'>Data Collection & Retention</h1>
                    <div>
                        <table className='w-full'>
                            <thead>
                                <tr>
                                    <th className='text-sm text-center'>Check</th>
                                    <th className='text-sm text-center'>Status</th>
                                    <th className='text-sm text-center'>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Data Retention </td>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{dataRetentionMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Data retention is set to <b>{dataretention}</b></td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Google-Signal Details</td>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{googleSignalMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'><b>{googlesignaldetails}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataCollectionRetention
