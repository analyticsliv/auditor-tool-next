'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const KeyEvents = () => {

    const { auditData } = useAccountStore();
    const data = auditData?.keyEvents;

    const eventNames = [];

    data?.keyEvents?.forEach(subArray => {
        if (subArray.eventName) {
            eventNames?.push(subArray.eventName);
        }

    });

    const { endApiData } = useAccountStore();
    const keyEventData = endApiData?.keyeventdetails;

    let nameofkeyevents = []
    for (var i = 0; i < keyEventData?.rows?.length; i++) {
        const obj = keyEventData?.rows?.[i];
        const keyeventname = obj?.dimensionValues?.[0]?.value;
        const value = obj?.metricValues?.[1]?.value;
        if (value != 0) {
            nameofkeyevents.push(keyeventname);
        }

    }


    return (
        <div className='parent-div bg-white rounded-3xl p-8 mt-10'>
            <div>
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>Key Events</h1>
                <h3 className='text-sm pb-12 text-center'>Reviewing your configured conversion
                    events,
                    ensuring that
                    they are active and,
                    <br></br>whenever possible, have conversion values assigned to them.

                </h3>
                <div>
                    <div className='flex justify-evenly gap-10'>
                        <div className='flex flex-col w-[33%] text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7'>
                            <h2 className='font-bold text-2xl pb-2'>Configured <br></br>Conversions</h2>
                            <h3 className='text-center text-sm'>You have configured <b id="keyeventcount">{eventNames?.length}</b> conversion events which is
                                great! At least <b>3</b> conversions are generally recommended in addition to default conversions
                            </h3>
                        </div>

                        <div className='flex flex-col w-[33%] text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7'>
                            <h2 className='font-bold text-2xl pb-2'>Active <br></br>Conversions</h2>
                            <h3 className='text-center text-sm'>You have <b id="activekeyeventcount">{keyEventData?.rows?.length}</b> active conversions.
                            </h3>
                        </div>

                        <div className='flex flex-col w-[33%] text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7'>
                            <h2 className='font-bold text-2xl pb-2'>Conversions <br></br>Value</h2>
                            <h3 className='text-center text-sm'>You have <b id="activekeyeventvalue">{nameofkeyevents?.length}</b> conversions out of <b
                                id="activekeyeventcount1">{keyEventData?.rows?.length}</b> active conversions have a value assigned to them.
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KeyEvents
// {
//     "dimensionHeaders": [
//         {
//             "name": "eventName"
//         }
//     ],
//     "metricHeaders": [
//         {
//             "name": "keyEvents",
//             "type": "TYPE_FLOAT"
//         },
//         {
//             "name": "eventvalue",
//             "type": "TYPE_FLOAT"
//         }
//     ],
//     "rows": [
//         {
//             "dimensionValues": [
//                 {
//                     "value": "purchase"
//                 }
//             ],
//             "metricValues": [
//                 {
//                     "value": "142"
//                 },
//                 {
//                     "value": "79002.31"
//                 }
//             ]
//         },
//         {
//             "dimensionValues": [
//                 {
//                     "value": "call_click"
//                 }
//             ],
//             "metricValues": [
//                 {
//                     "value": "124"
//                 },
//                 {
//                     "value": "0"
//                 }
//             ]
//         },
//         {
//             "dimensionValues": [
//                 {
//                     "value": "create_account"
//                 }
//             ],
//             "metricValues": [
//                 {
//                     "value": "100"
//                 },
//                 {
//                     "value": "0"
//                 }
//             ]
//         },
//         {
//             "dimensionValues": [
//                 {
//                     "value": "subscribe"
//                 }
//             ],
//             "metricValues": [
//                 {
//                     "value": "26"
//                 },
//                 {
//                     "value": "0"
//                 }
//             ]
//         }
//     ],
//     "rowCount": 4,
//     "metadata": {
//         "schemaRestrictionResponse": {},
//         "currencyCode": "USD",
//         "timeZone": "America/New_York"
//     },
//     "kind": "analyticsData#runReport"
// }