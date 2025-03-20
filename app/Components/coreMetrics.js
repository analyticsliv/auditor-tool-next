import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAccountStore } from '../store/useAccountStore';
import moment from 'moment';

const CoreMetrics = () => {

    const { endApiData } = useAccountStore();
    const [userChartData, setUserChartData] = useState([]);
    const [sessionsChartData, setSessionsChartData] = useState([]);
    const [viewChartData, setViewChartData] = useState([]);

    const totaluserData = endApiData?.totaluserCore;
    const sessionData = endApiData?.sessionsCore;
    const viewData = endApiData?.viewCore;

    console.log('totaluserData', totaluserData, 'sessionData', sessionData, 'viewData', viewData)

    useEffect(() => {
        const dates = totaluserData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const users = totaluserData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        // dates = moment(dates).format('YYYY-MM-DD');
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            users: Number(users[index])
        }));
        setUserChartData(formattedData)

    }, [totaluserData]);

    useEffect(() => {
        console.log("Updated userChartData:", userChartData);
    }, [userChartData]);

    useEffect(() => {
        const dates = sessionData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const sessions = sessionData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        console.log("datre sessu", dates, sessions)
        // dates = moment(dates).format('YYYY-MM-DD');
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            sessions: Number(sessions[index]) // Convert to number if needed
        }));
        setSessionsChartData(formattedData)
    }, [sessionData]);

    useEffect(() => {
        console.log("Updated sessch:", sessionsChartData);
    }, [sessionsChartData]);

    useEffect(() => {
        const dates = viewData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const views = viewData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        // dates = moment(dates).format('YYYY-MM-DD');
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        // console.log("dates chart", formattedDates, chartValues)
        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            views: Number(views[index]) // Convert to number if needed
        }));
        setViewChartData(formattedData)

    }, [viewData]);

    useEffect(() => {
        console.log("viewChartData", viewChartData);
    }, [viewChartData]);

    return (
        <div className='bg-white rounded-3xl p-10 mt-10'>
            <div>
                <div className='flex justify-center relative'>
                    <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                        Core Metrics - Anomaly Detection
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
                <h3 className='text-center px-36 pb-10'>
                    Anomaly detection is one of the core aspect of finding significant deviations
                    from normal patterns which leads to the indication of underlying issues in Sessions,
                    Total Users and Screen Page view.
                </h3>
                <div id="">
                    <div>
                        <div id="" className='flex flex-col gap-10'>
                            <div className='h- w- flex justify-around items-center'>
                                <ResponsiveContainer height={200} width={700}>
                                    <LineChart
                                        width={700}
                                        height={200}
                                        data={sessionsChartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="formattedDate" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="sessions" stroke="#8884d8" activeDot={{ r: 8 }} /> {/* Corrected */}
                                    </LineChart>
                                </ResponsiveContainer>
                                <h3 className='w-[300px]' id="">
                                    <span>No anomalies detected</span> in Total
                                    user. Data trends are stable and
                                    within
                                    expected ranges in Total user pattern.
                                </h3>
                            </div>
                            <div className='h- w- flex justify-around items-center'>
                                <ResponsiveContainer height={200} width={700}>
                                    <LineChart
                                        width={500}
                                        height={200}
                                        data={userChartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="formattedDate" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="users" stroke="green" activeDot={{ r: 8 }} /> {/* Corrected */}
                                    </LineChart>
                                </ResponsiveContainer>
                                <h3 className='w-[300px]' id="">
                                    <span>No anomalies detected</span> in
                                    Session. Data trends are stable and within
                                    expected ranges in Sessions Per User pattern.
                                </h3>
                            </div>
                            <div className='h- w- flex justify-around items-center'>
                                <ResponsiveContainer height={200} width={700}>
                                    <LineChart
                                        width={500}
                                        height={200}
                                        data={viewChartData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="formattedDate" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="views" stroke="red" activeDot={{ r: 8 }} /> {/* Corrected */}
                                    </LineChart>
                                </ResponsiveContainer>
                                <h3 className='w-[300px]' id="">
                                    <span>No anomalies detected</span> in View.
                                    Data trends are stable and within
                                    expected ranges in Screen Page View Per user pattern.
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CoreMetrics
