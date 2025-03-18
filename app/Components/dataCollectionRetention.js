import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const DataCollectionRetention = () => {
    const { auditData } = useAccountStore();
    const [dataRetentionMood, setDataRetentionMood] = useState(true);
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
            setDataRetentionMood(true);
        } else {
            setDataRetentionMood(false)
        }
    }, [googlesignaldetails])

    return (
        <div>
            <div>
                <div>
                    <h1>Data Collection & Retention</h1>
                    <div>
                        <table>
                            <tr>
                                <th>Status</th>
                                <th>Check</th>
                                <th>Description</th>
                            </tr>
                            <tr>
                                <td>{dataRetentionMood ? 'Mood Good' : 'Mood Bad'}</td>
                                <td>Data Retention </td>
                                <td>Data retention is set to <b>{dataretention}</b></td>
                            </tr>
                            <tr>
                                <td>{dataRetentionMood ? 'Mood Good' : 'Mood Bad'}</td>
                                <td>Google-Signal Details</td>
                                <td><b>{googlesignaldetails}</b></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DataCollectionRetention
