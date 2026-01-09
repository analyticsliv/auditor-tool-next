'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { ListChecks, Zap, TrendingUp, Smile, Meh, Frown } from 'lucide-react';

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

    const events = keyEventData?.rows?.map(
        (row) => row?.dimensionValues?.[0]?.value
    ) || [];

    const showLimited = events.length > 4;
    const visibleEvents = showLimited ? events.slice(0, 4) : events;

    const configuredCount = eventNames?.length || 0;
    const activeCount = keyEventData?.rows?.length || 0;
    const valueCount = nameofkeyevents?.length || 0;

    let auditStatus = 'good';
    let auditMessage = '';
    let moodState = 'good'; // good, mediator, sad

    if (configuredCount >= 1 && activeCount === 0) {
        auditStatus = 'bad';
        moodState = 'sad';
        auditMessage =
            'You have configured conversion events but none of them are active. This indicates serious tracking issues. Please check your GA4 and GTM implementation.';
    } else if (configuredCount < 6 && configuredCount > 3 && activeCount < 2) {
        auditStatus = 'bad';
        moodState = 'sad';
        auditMessage =
            'You have multiple configured conversions but fewer than 2 active ones. At least 2 active conversions are recommended for meaningful GA4 insights.';
    } else if (configuredCount >= 6 && activeCount < 3) {
        auditStatus = 'bad';
        moodState = 'sad';
        auditMessage =
            'You have many configured conversions, but fewer than 3 are active. This is not ideal for GA4 reporting and optimization. Check whether events are firing correctly.';
    } else if (configuredCount >= 1 && !activeCount) {
        auditStatus = 'bad';
        moodState = 'sad';
        auditMessage =
            'You have many configured conversions, but doesn\'t have any active ones. This is not ideal for GA4 reporting and optimization. Check whether events are firing correctly.';
    } else if (configuredCount >= 3 && activeCount >= 2 && activeCount < configuredCount) {
        auditStatus = 'good';
        moodState = 'mediator';
        auditMessage =
            'Your conversion setup looks healthy. You have a good balance between configured and active conversion events for reliable GA4 measurement.';
    } else if (configuredCount >= 3 && activeCount >= configuredCount) {
        auditStatus = 'good';
        moodState = 'good';
        auditMessage =
            'Your conversion setup looks healthy. You have a good balance between configured and active conversion events for reliable GA4 measurement.';
    } else {
        auditStatus = 'good';
        moodState = 'good';
        auditMessage =
            'Your conversion setup looks healthy. You have a good balance between configured and active conversion events for reliable GA4 measurement.';
    }

    const getMoodIcon = () => {
        if (moodState === 'good') {
            return (
                <div className="p-2 rounded-lg bg-green-500">
                    <Smile className="w-5 h-5 text-white" />
                </div>
            );
        } else if (moodState === 'mediator') {
            return (
                <div className="p-2 rounded-lg bg-orange-500">
                    <Meh className="w-5 h-5 text-white" />
                </div>
            );
        } else {
            return (
                <div className="p-2 rounded-lg bg-red-500">
                    <Frown className="w-5 h-5 text-white" />
                </div>
            );
        }
    };

    const cardBase =
        'relative flex flex-col w-[33%] text-center items-center bg-white border border-gray-200 rounded-b-3xl py-8 px-6 2xl:px-10 justify-between shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1';

    return (
        <div className='parent-div bg-white rounded-3xl p-8 mt-10'>
            <div>
                <div className='flex justify-center items-start gap-10 pb-5'>
                    <h1 className='text-gray-800 font-extrabold text-[1.8rem] text-center flex items-center gap-3'>
                        {getMoodIcon()}
                        Key Events -
                    </h1>
                    <h3 className='text-sm text-left'>Reviewing your configured conversion
                        events,
                        ensuring that
                        they are active and,
                        <br></br>whenever possible, have conversion values assigned to them.
                    </h3>
                </div>
                {/* Audit Finding */}
                <div
                    className={`mb-5 p-6 rounded-2xl text-center border ${auditStatus === 'good'
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-red-50 border-red-300 text-red-800'
                        }`}
                >
                    <h3 className="text-lg font-bold mb-2">
                        {auditStatus === 'good' ? '✅ Audit Finding' : '⚠️ Audit Finding'}
                    </h3>
                    <p className="text-sm leading-relaxed">{auditMessage}</p>
                </div>

                <div>
                    <div className='flex justify-evenly gap-10'>
                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-3xl" />

                            <h2 className="font-bold text-2xl pb-1 text-gray-800">
                                Configured<br />Conversions
                            </h2>

                            <ListChecks className="w-14 h-14 text-blue-500 my-3 opacity-90" />

                            <h3 className="text-base text-gray-600">
                                You have configured <b className="text-gray-800">{eventNames?.length || 'NA'}</b> conversion
                                events. At least <b className="text-gray-800">3</b> are recommended in addition to default
                                conversions.
                            </h3>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-t-3xl" />

                            <h2 className="font-bold text-2xl pb-1 text-gray-800">
                                Active<br />Conversions
                            </h2>

                            <Zap className="w-14 h-14 text-purple-500 my-3 opacity-90" />

                            <h3 className="text-base text-gray-600 pb-2">
                                You have <b className="text-gray-800">{keyEventData?.rows?.length || 'NA'}</b> active conversions.
                            </h3>

                            <h3 className="text-base text-gray-500">
                                {showLimited ? "Some of them are:" : "These are:"}{" "}
                                <b className="text-gray-700">
                                    {visibleEvents.join(", ")}
                                    {showLimited && " etc.."}
                                </b>
                            </h3>
                        </div>

                        <div className={cardBase}>
                            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-3xl" />

                            <h2 className="font-bold text-2xl pb-1 text-gray-800">
                                Conversion<br />Value
                            </h2>

                            <TrendingUp className="w-14 h-14 text-amber-500 my-3 opacity-90" />

                            <h3 className="text-base text-gray-600">
                                <b className="text-gray-800">{nameofkeyevents?.length || 'NA'}</b> out of{" "}
                                <b className="text-gray-800">{keyEventData?.rows?.length || 'NA'}</b> active conversions
                                have a value assigned.
                            </h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KeyEvents