'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { Frown, Smile } from 'lucide-react';

const GeneralConfig = () => {
    const { endApiData, selectedProperty } = useAccountStore();
    const dataStreams = endApiData?.generalConfig || [];

    const [timezoneMood, setTimezoneMood] = useState(true);
    const [currenyMood, setCurrencyMood] = useState(true);
    const [categorymood, setCategoryMood] = useState(true);

    let timezone = endApiData?.generalConfig?.metadata?.timeZone || 'Not Defined';
    let currencyCode = endApiData?.generalConfig?.metadata?.currencyCode || 'Not Defined';
    let category = endApiData?.generalConfig?.industryCategory || 'Not Defined';

    useEffect(() => {
        if (timezone != undefined) {
            setTimezoneMood(true);
        } else {
            setTimezoneMood(false)
        }
    }, [timezone])

    useEffect(() => {
        if (currencyCode != undefined) {
            setCurrencyMood(true);
        } else {
            setCurrencyMood(false)
        }
    }, [currencyCode])

    useEffect(() => {
        if (category != undefined) {
            setCategoryMood(true);
        } else {
            setCategoryMood(false)
        }
    }, [category])


    return (
        <div>
            <div>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <div className='pb-20 text-gray-800 font-extrabold text-[1.8rem] text-center'>General Configuration</div>
                    <div >
                        <table className='w-full'>
                            <thead>
                                <tr>
                                    <th className='text-sm text-center w-[15%] xl:w-[20%]'>Status</th>
                                    <th className='text-sm text-center w-[15%] xl:w-[20%]'>Check</th>
                                    <th className='text-sm text-center w-[70%] xl:w-[50%]'>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="time" className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{timezoneMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Time Zone </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>The time zone setting of the property is set to <b id="timezone">{timezone}</b></td>
                                </tr>
                                <tr>
                                    <td id="currency" className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{currenyMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Currency Code </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>The currency setting of the property is set to <b id="currencycode">{currencyCode}</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td id="industry" className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{categorymood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Industry Category </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>The industry category of the property is <b id="industrycategory">{category}</b></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GeneralConfig
