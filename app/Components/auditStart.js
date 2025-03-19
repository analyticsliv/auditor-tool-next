'use client'

import React from 'react'
import { useAccountStore } from '../store/useAccountStore';

const AuditStart = () => {
    const {
        selectedAccount,
        selectedProperty,
        accountId,
        propertyId,
    } = useAccountStore();

    return (
        <div>
            <div className='bg-white rounded-3xl p-10 mt-5 text-center text-bold'>
                <h1 className='text-3xl font-extrabold'>In Review</h1>
                <div>
                    <h3 className='text-sm font-bold pt-4 pb-2'> Account: <span className='text-[13.5px] font-bold'><b>{selectedAccount?.displayName}</b> - (<b>{accountId}</b>)</span>
                    </h3>
                    <h3 className='font-bold text-sm'>Property: <span className='text-[13.5px] font-bold'><b>{selectedProperty?.displayName}</b> - (<b>{propertyId}</b>)</span>
                    </h3>
                </div>
            </div>
        </div>
    )
}

export default AuditStart
