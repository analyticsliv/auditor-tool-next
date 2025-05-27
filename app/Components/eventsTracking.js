'use client'

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { useAccountStore } from '../store/useAccountStore';
import { FaLaugh } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

const EventsTracking = () => {

    const [eventChartData, setEventChartData] = useState([]);
    const [eventAnomalies, setEventAnomalies] = useState([]);
    const [eventstatus, setEventstatus] = useState([]);
    const [caseSensitiveMood, setCaseSensitiveMood] = useState(true);

    const { endApiData } = useAccountStore();
    const eventData = endApiData?.eventsTracking;


    useEffect(() => {
        if (!eventData) return;

        var labels = ["Automatically ", "Enhanced", "Recommended ", "Custom "];
        var eventlength = []
        // Define arrays containing events for each category
        var automaticallyCollectedEvents = ["ad_click", "ad_exposure", "ad_query", "ad_reward", "adunit_exposure", "app_clear_data", "app_exception", "app_remove", "app_store_refund", "app_store_subscription_cancel", "app_store_subscription_convert", "app_store_subscription_renew", "app_update", "dynamic_link_app_open", "dynamic_link_app_update", "dynamic_link_first_open", "error", "firebase_campaign", "firebase_in_app_message_action", "firebase_in_app_message_dismiss", "firebase_in_app_message_impression", "first_open", "first_visit", "in_app_purchase", "notification_dismiss", "notification_foreground", "notification_open", "notification_receive", "os_update", "screen_view", "session_start", "user_engagement"];
        var recommendedEvents = ["ad_impression", "earn_virtual_currency", "generate_lead", "join_group", "login", "purchase", "refund", "search", "select_content", "share", "sign_up", "spend_virtual_currency", "tutorial_begin", "tutorial_complete", "add_payment_info", "add_shipping_info", "add_to_cart", "add_to_wishlist", "begin_checkout", "remove_from_cart", "select_item", "select_promotion", "view_cart", "view_item", "view_item_list", "view_promotion", "join_group", "level_end", "level_start", "level_up", "post_score", "unlock_achievement"];
        var enhancedMeasurementEvents = ["page_view", "scroll", "click", "view_search_results", "video_start", "video_progress", "video_complete", "file_download", "form_start", "form_submit"];

        // Assume info?.rows is an array containing objects with dimensionValues property
        var customEvents = [];
        var enhancedMeasurementEvents1 = [];
        var recommendedEvents1 = [];
        var automaticallyCollectedEvents1 = [];
        var notFollowingNamingConventionEvents = [];

        // Iterate through each row and categorize the events
        eventData?.rows?.forEach(function (row) {
            row.dimensionValues?.forEach(function (value) {
                var eventName = value.value;
                if (automaticallyCollectedEvents.includes(eventName)) {
                    automaticallyCollectedEvents1.push(value.value)
                } else if (recommendedEvents.includes(eventName)) {
                    recommendedEvents1.push(value.value)
                } else if (enhancedMeasurementEvents.includes(eventName)) {
                    enhancedMeasurementEvents1.push(value.value);
                } else {
                    customEvents.push(value.value);
                }

                if (eventName.includes(" ") || eventName !== eventName.toLowerCase()) {
                    notFollowingNamingConventionEvents.push(eventName);
                }
            });
        });

        if (notFollowingNamingConventionEvents?.length === 0) {
            setEventstatus("All the events are following the naming convention.");
            setCaseSensitiveMood(true);
        } else {
            setEventstatus(`Few events are not following naming convention. (Some of them are : ${notFollowingNamingConventionEvents.slice(0, 3)})`);
            setCaseSensitiveMood(false);
        }
        eventlength.push(automaticallyCollectedEvents1?.length, enhancedMeasurementEvents1?.length, recommendedEvents1?.length, customEvents?.length);



        const formattedData = labels.map((label, index) => ({
            category: label,
            count: eventlength[index]
        }));
        setEventChartData(formattedData);

        //anomaly
        const windowSize = 14;
        let sum = 0;
        let detectedAnomalies = [];

        for (let i = 0; i < formattedData?.length; i++) {
            if (i <= windowSize) {
                sum += formattedData[i]?.engagements;
            } else {
                sum -= formattedData[i - windowSize - 1]?.engagements;
                sum += formattedData[i - 1]?.engagements;
                let avg = sum / windowSize;

                if (avg * 3 < formattedData[i]?.engagements) {
                    detectedAnomalies?.push({ formattedDate: formattedData[i]?.formattedDate, engagements: formattedData[i]?.engagements });
                }
            }
        }
        setEventAnomalies(detectedAnomalies);
    }, [eventData]);


    return (
        <>
            <div className='bg-white rounded-3xl p-10 mt-10'>
                <div>
                    <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                        Events Tracking
                    </h1>
                    <div className='flex justify-between items-center'>
                        <div className='w-[40%] content-center text-sm 2xl:text-base text-center'>
                            <h3><b>Automatically collected
                                events</b> are events
                                that are collected by default i.e page_view, app_update. You&apos;re
                                tracking <b>{eventChartData?.[0]?.count}</b> events
                                from this type.</h3>
                            <h3 className='pt-3'><b>Enhanced measurement
                                events</b> are events
                                that are collected when enhanced measurement is enabled i.e file_download,
                                scroll. You&apos;re
                                tracking <b>{eventChartData?.[1]?.count}</b> events from this type.</h3>
                            <h3 className='pt-3'><b>Recommended events</b> are
                                events
                                that you
                                implement, but that have predefined names i.e purchase, sign_up. You&apos;re
                                tracking <b>{eventChartData?.[2]?.count}</b> events from this type.
                            </h3>
                            <h3 className='pt-3'><b>Custom events</b> are events
                                that
                                you define
                                and implement yourself i.e clicked_shop_now. You&apos;re tracking <b>{eventChartData?.[3]?.count}</b> events from this
                                type.</h3>
                        </div>
                        <div className='min-w-[55%] content-center'>
                            <ResponsiveContainer height={400}>
                                <BarChart height={400} data={eventChartData}>
                                    <XAxis dataKey="category" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>

                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-white rounded-3xl p-10 mt-10'>
                <div>
                    <div>
                        <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>Events Naming Convention</h1>
                        <h3 className='text-sm pb-14 text-center'>The best practice for naming your events is
                            to follow the <b>&apos;Snake Case&apos;</b> rule, where yo can use event names in lowercase and spenated
                            with underscore(&apos;_&apos;).
                        </h3>
                        <div>
                            <table className='w-full'>
                                <thead>
                                    <tr>
                                        <th className='text-sm text-center'>Status</th>
                                        <th className='text-sm text-center'>Check</th>
                                        <th className='text-sm text-center'>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='h-[3.8rem] border-b text-sm border-gray-800 text-center'>{caseSensitiveMood ? <FaLaugh className='h-8 w-14 mx-auto fill-green-600' /> : <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />}
                                        </td>
                                        <td className='h-[3.8rem] border-b text-sm border-gray-800 text-center'>Case Sensitivity </td>
                                        <td className='h-[3.8rem] border-b text-sm border-gray-800 text-center'>
                                            {eventstatus}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EventsTracking
