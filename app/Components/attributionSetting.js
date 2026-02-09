'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { Share2, MousePointerClick, TrendingUp } from 'lucide-react';
import MoodIcon from './MoodIcon';

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

    const cardBase =
        'relative flex flex-col text-center items-center bg-white border border-gray-200 rounded-b-3xl py-8 px-6 2xl:px-10 justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full';

    // Calculate overall mood based on how many checks are positive
    const positiveChecks = [modelMood, acquisitionWindowMood, conversionWindowMood].filter(Boolean).length;

    const overallMood = positiveChecks === 3 ? 'good' : positiveChecks === 2 ? 'warning' : 'bad';

    return (
        <div>
            <div>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-5 text-gray-800 font-extrabold text-[1.8rem] text-center flex items-center justify-center gap-3'>
                        <MoodIcon mood={overallMood} />
                        Attribution Setting Details
                    </h1>
                    <div>
                        <div className='flex justify-evenly gap-10'>
                            <div className={cardBase}>
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-3xl" />

                                <span className="pb-3">
                                    <MoodIcon mood={modelMood ? 'good' : 'bad'} variant="card" />
                                </span>
                                <h2 className="font-bold text-2xl pb-2 text-gray-800">Model</h2>

                                <Share2 className="w-14 h-14 text-indigo-500 mb-3 opacity-90" />

                                <h3 className="text-base text-gray-600">
                                    Your attribution model is set to <b className="text-gray-800">{model}</b>
                                </h3>
                            </div>

                            <div className={cardBase}>
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-t-3xl" />

                                <span className="pb-3">
                                    <MoodIcon mood={acquisitionWindowMood ? 'good' : 'bad'} variant="card" />
                                </span>

                                <h2 className="font-bold text-2xl pb-2 text-gray-800">Acquisition Window</h2>

                                <MousePointerClick className="w-14 h-14 text-emerald-500 mb-3 opacity-90" />

                                <h3 className="text-base text-gray-600">
                                    Your <b className="text-gray-800">{acquisitionWindow}</b>
                                </h3>
                            </div>

                            <div className={cardBase}>
                                <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-t-3xl" />

                                <span className="pb-3">
                                    <MoodIcon mood={conversionWindowMood ? 'good' : 'bad'} variant="card" />
                                </span>

                                <h2 className="font-bold text-2xl pb-2 text-gray-800">Conversion Window</h2>

                                <TrendingUp className="w-14 h-14 text-orange-500 mb-3 opacity-90" />

                                <h3 className="text-base text-gray-600">
                                    Your <b className="text-gray-800">{conversionWindow}</b>
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttributionSetting
