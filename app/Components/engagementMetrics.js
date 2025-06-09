'use client'

import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAccountStore } from '../store/useAccountStore';
import moment from 'moment';

const EngagementMetrics = () => {

    const { endApiData } = useAccountStore();

    const [userChartData, setUserChartData] = useState([]);
    const [userAnomalies, setUserAnomalies] = useState([]);

    const [sessionsChartData, setSessionsChartData] = useState([]);
    const [sessionsAnomalies, setSessionsAnomalies] = useState([]);

    const [viewChartData, setViewChartData] = useState([]);
    const [viewAnomalies, setViewAnomalies] = useState([]);

    const totaluserData = endApiData?.totaluserEng;
    const sessionData = endApiData?.sessionsEng;
    const viewData = endApiData?.viewEng;


    // sessions
    useEffect(() => {
        const dates = sessionData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const sessions = sessionData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            sessions: Number(sessions[index])
        }));
        setSessionsChartData(formattedData)

        //anomaly
        const windowSize = 14;
        let sum = 0;
        let detectedAnomalies = [];

        for (let i = 0; i < formattedData?.length; i++) {
            if (i <= windowSize) {
                sum += formattedData[i]?.sessions;
            } else {
                sum -= formattedData[i - windowSize - 1]?.sessions;
                sum += formattedData[i - 1]?.sessions;
                let avg = sum / windowSize;

                if (avg * 3 < formattedData[i]?.sessions) {
                    detectedAnomalies?.push({ formattedDate: formattedData[i]?.formattedDate, sessions: formattedData[i]?.sessions });
                }
            }
        }

        setSessionsAnomalies(detectedAnomalies);

    }, [sessionData]);


    //users
    useEffect(() => {
        const dates = totaluserData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const users = totaluserData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            users: Number(users[index])
        }));
        setUserChartData(formattedData)


        //anomaly
        const windowSize = 14;
        let sum = 0;
        let detectedAnomalies = [];

        for (let i = 0; i < formattedData?.length; i++) {
            if (i <= windowSize) {
                sum += formattedData[i]?.users;
            } else {
                sum -= formattedData[i - windowSize - 1]?.users;
                sum += formattedData[i - 1]?.users;
                let avg = sum / windowSize;

                if (avg * 3 < formattedData[i]?.users) {
                    detectedAnomalies?.push({ formattedDate: formattedData[i]?.formattedDate, users: formattedData[i]?.users });
                }
            }
        }

        setUserAnomalies(detectedAnomalies);

    }, [totaluserData]);


    //views
    useEffect(() => {
        const dates = viewData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const views = viewData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            views: Number(views[index])
        }));
        setViewChartData(formattedData)


        //anomaly
        const windowSize = 14;
        let sum = 0;
        let detectedAnomalies = [];

        for (let i = 0; i < formattedData?.length; i++) {
            if (i <= windowSize) {
                sum += formattedData[i]?.views;
            } else {
                sum -= formattedData[i - windowSize - 1]?.views;
                sum += formattedData[i - 1]?.views;
                let avg = sum / windowSize;

                if (avg * 3 < formattedData[i]?.views) {
                    detectedAnomalies?.push({ formattedDate: formattedData[i]?.formattedDate, views: formattedData[i]?.views });
                }
            }
        }

        setViewAnomalies(detectedAnomalies);

    }, [viewData]);


    return (
        <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <div>
                <div className='flex justify-center relative'>
                    <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                        Engagement Metrics - Anomaly Detection
                    </h1>
                    {/* <img src="/images/info-icon.png" alt="info" id="info-icon" />
                        <div>
                            Our tool uses historical data from the 90 days to help detect anomalies in your
                            GA4
                            data. By analyzing patterns from that time period, we can better identify
                            unusual trends or discrepancies in your current data, which may differ from
                            GA4&apos;s standard anomaly detection methods.
                        </div> */}
                </div>
                <h3 className='text-center px-28 pb-10'>
                    A sudden Drop/Spike is noticeable of user engagements trends in Page views,
                    Engagement
                    sessions and Sessions per user.
                    A thorough insight into these rates should be managed as it can lead to potential
                    problems.
                    Solving which can leverage success of business.
                </h3>
                <div id="">
                    <div>
                        <div id="" className='flex flex-col gap-10'>
                            <div className='flex justify-between 2xl:justify-around items-center'>
                                <div className='w-[65%]'>
                                    <ResponsiveContainer height={230}>
                                        <LineChart data={sessionsChartData} height={230}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="formattedDate" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="sessions"
                                                stroke="#8884d8"
                                                strokeWidth={2}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;

                                                    // Check if the current data point is an anomaly
                                                    const isAnomaly = sessionsAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={isAnomaly ? 5 : 4}
                                                            fill={isAnomaly ? "red" : "white"}
                                                            stroke={isAnomaly ? "red" : "#8884d8"}
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                }}
                                            />
                                        </LineChart>
                                        {sessionsAnomalies?.length > 0 && (
                                            <Line
                                                type="monotone"
                                                dataKey="Anomalies"
                                                stroke="red"
                                                strokeWidth={2}
                                                dot={{ fill: "red", stroke: "red", r: 7 }}
                                            />
                                        )}
                                    </ResponsiveContainer>
                                </div>
                                <div className='w-[30%]' id="">
                                    {sessionsAnomalies?.length > 0 ?
                                        <div>
                                            <span className='font-bold'>Detected deviation</span> from expected normal behaviour in Session pattern.
                                        </div>
                                        :
                                        <div>
                                            <span className='font-bold'>No anomalies detected</span> in Session. Data trends are stable and within
                                            expected ranges in Sessions Per User pattern.
                                        </div>
                                    }
                                </div>
                            </div>

                            <div className='flex justify-between 2xl:justify-around items-center'>
                                <div className='w-[65%]'>

                                    <ResponsiveContainer height={230}>
                                        <LineChart data={userChartData} height={230}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="formattedDate" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="users"
                                                stroke="green"
                                                strokeWidth={2}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;

                                                    // Check if the current data point is an anomaly
                                                    const isAnomaly = userAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={isAnomaly ? 5 : 4}
                                                            fill={isAnomaly ? "red" : "white"}
                                                            stroke={isAnomaly ? "red" : "green"}
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                }}
                                            />
                                            {userAnomalies?.length > 0 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="Anomalies"
                                                    stroke="red"
                                                    strokeWidth={2}
                                                    dot={{ fill: "red", stroke: "red", r: 7 }}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='w-[30%]' id="">
                                    {userAnomalies?.length > 0 ?
                                        <div>
                                            <span className='font-bold'>Detected deviation</span> from expected normal behaviour in Total User pattern.
                                        </div>
                                        :
                                        <div>
                                            <span className='font-bold'>No anomalies detected</span> in
                                            Total Users. Data trends are stable and within
                                            expected ranges in Total User pattern.
                                        </div>
                                    }
                                </div>
                            </div>

                            <div className='flex justify-between 2xl:justify-around items-center'>
                                <div className='w-[65%]'>

                                    <ResponsiveContainer height={230}>
                                        <LineChart data={viewChartData} height={230}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="formattedDate" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />

                                            <Line
                                                type="monotone"
                                                dataKey="views"
                                                stroke="orange"
                                                strokeWidth={2}
                                                dot={(props) => {
                                                    const { cx, cy, payload } = props;

                                                    // Check if the current data point is an anomaly
                                                    const isAnomaly = viewAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

                                                    return (
                                                        <circle
                                                            cx={cx}
                                                            cy={cy}
                                                            r={isAnomaly ? 5 : 4}
                                                            fill={isAnomaly ? "red" : "white"}
                                                            stroke={isAnomaly ? "red" : "orange"}
                                                            strokeWidth={1}
                                                        />
                                                    );
                                                }}
                                            />
                                            {viewAnomalies?.length > 0 && (
                                                <Line
                                                    type="monotone"
                                                    dataKey="Anomalies"
                                                    stroke="red"
                                                    strokeWidth={2}
                                                    dot={{ fill: "red", stroke: "red", r: 7 }}
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className='w-[30%]' id="">
                                    {viewAnomalies?.length > 0 ?
                                        <div>
                                            <span className='font-bold'>Detected deviation</span> from expected normal behaviour in View pattern.
                                        </div>
                                        :
                                        <div>
                                            <span className='font-bold'>No anomalies detected</span> in View.
                                            Data trends are stable and within
                                            expected ranges in Screen Page View Per user pattern.
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EngagementMetrics
