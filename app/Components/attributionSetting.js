'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const AttributionSetting = () => {

    const { auditData } = useAccountStore();
    const [modelMood, setModelMood] = useState(true);
    const [acquisitionWindowMood, setAcquisitionWindowMood] = useState(true);
    const [conversionWindowMood, setConversionWindowMood] = useState(true);

    const data = auditData?.attributionSettings;

    let model = data?.reportingAttributionModel.toLowerCase().replace(/_/g, ' ');
    let acquisitionWindow = data?.acquisitionConversionEventLookbackWindow.toLowerCase().replace(/_/g, ' ');
    let conversionWindow = data?.otherConversionEventLookbackWindow.toLowerCase().replace(/_/g, ' ');

    useEffect(() => {
        if (data?.reportingAttributionModel === "CROSS_CHANNEL_DATA_DRIVEN" || "Paid and organic channels") {
            setModelMood(true);
        } else {
            setModelMood(false)
        }
    }, [data?.reportingAttributionModel])
    useEffect(() => {
        if (data?.acquisitionConversionEventLookbackWindow === "ACQUISITION_CONVERSION_EVENT_LOOKBACK_WINDOW_30_DAYS") {
            setAcquisitionWindowMood(true);
        } else {
            setAcquisitionWindowMood(false)
        }
    }, [data?.acquisitionConversionEventLookbackWindow])
    useEffect(() => {
        if (data?.otherConversionEventLookbackWindow === "OTHER_CONVERSION_EVENT_LOOKBACK_WINDOW_90_DAYS") {
            setConversionWindowMood(true);
        } else {
            setConversionWindowMood(false)
        }
    }, [data?.otherConversionEventLookbackWindow])


    return (
        <div>
            <div>
                <div className='bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-5 text-gray-800 font-extrabold text-[1.8rem] text-center'>Attribution Setting Details</h1>
                    <div>
                        <div className='flex justify-evenly gap-10'>
                            <div className='flex flex-col text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7 justify-around'>
                                <span>{modelMood ? 'Mood Good' : 'Mood Bad'}</span>
                                <div>
                                    <div>
                                        <h2 className='font-bold text-2xl pb-2'>Model</h2>
                                        <h3>Your attribution model is set to <b>{model}</b></h3>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7 justify-around'>
                                <span>{acquisitionWindowMood ? 'Mood Good' : 'Mood Bad'}</span>
                                <div>
                                    <div>
                                        <h2 className='font-bold text-2xl pb-2'>Acquisition Window
                                        </h2>
                                        <h3>Your <b>{acquisitionWindow}</b></h3>
                                    </div>
                                </div>
                            </div>

                            <div className='flex flex-col text-center bg-red-200 rounded-3xl py-5 px-4 2xl:px-7 justify-around'>
                                <span>{conversionWindowMood ? 'Mood Good' : 'Mood Bad'}</span>
                                <div>
                                    <div>
                                        <h2 className='font-bold text-2xl pb-2'>Conversion Window</h2>
                                        <h3>Your <b>{conversionWindow}</b></h3>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttributionSetting
