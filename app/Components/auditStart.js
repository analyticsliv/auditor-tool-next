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
    console.log("object00--",selectedAccount,selectedProperty)

    return (
        <div>
            <div class="review">
                <h1>In Review</h1>
                <div class="inreview">
                    <h3> Account:<span><b></b>{selectedAccount?.displayName} - (<b>{accountId}</b>)</span>
                    </h3>
                    <h3>Property:<span><b>{selectedProperty?.displayName}</b> - (<b>{propertyId}</b>)</span>
                    </h3>
                </div>
            </div>
        </div>
    )
}

export default AuditStart
