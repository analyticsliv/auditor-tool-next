'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const GeneralConfig = () => {
    const { endApiData, selectedProperty } = useAccountStore();
    const dataStreams = endApiData?.generalConfig || [];

    const [timezoneMood, setTimezoneMood] = useState(true);
    const [currenyMood, setCurrencyMood] = useState(true);
    const [categorymood, setCategoryMood] = useState(true);

    let timezone = selectedProperty?.timeZone || 'Not Defined';
    let currencyCode = selectedProperty?.currencyCode || 'Not Defined';
    let category = selectedProperty?.industryCategory || 'Not Defined';

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
                <div>
                    <h1>General Configuration</h1>
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Check</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td id="time">{timezoneMood ? 'Mood Good' : 'Mood Bad'}</td>
                                    <td>Time Zone </td>
                                    <td>The time zone setting of the property is set to <b id="timezone">{timezone}</b></td>
                                </tr>
                                <tr>
                                    <td id="currency">{currenyMood ? 'Mood Good' : 'Mood Bad'}</td>
                                    <td>Currency Code </td>
                                    <td>The currency setting of the property is set to <b id="currencycode">{currencyCode}</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td id="industry">{categorymood ? 'Mood Good' : 'Mood Bad'}</td>
                                    <td>Industry Category </td>
                                    <td>The industry category of the property is <b id="industrycategory">{category}</b></td>
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
