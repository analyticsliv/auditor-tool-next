'use client';
import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const EngagementRate = () => {

    const [engChartData, setEngChartData] = useState([]);
    const [engAnomalies, setEngAnomalies] = useState([]);
    const [headerTitle, setHeaderTitle] = useState("");

    const { endApiData } = useAccountStore();
    const engagementData = endApiData?.engagementRate;

    useEffect(() => {
        if (!engagementData) return;

        engagementData?.dimensionHeaders?.map(header => header?.name)?.join(', ') || "";
        engagementData?.metricHeaders?.map(header => header?.name)?.join(', ') || "";

        let statuses = [];
        engagementData?.rows?.forEach(row => {
            row?.metricValues?.forEach((metric, index) => {
                let multipliedValue = (Number(metric?.value) * 100).toFixed(2);
                let status = multipliedValue >= 10 && multipliedValue <= 90 ? "Engagement Rate" : "Engagement Rate";
                statuses?.push(status);
            });
        });

        let counts = statuses?.reduce((acc, status) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        const collectiveTag = Object.keys(counts)?.reduce((a, b) => (counts[a] > counts[b] ? a : b), "");
        setHeaderTitle(collectiveTag);
    }, [engagementData]);

    useEffect(() => {
        if (!engagementData) return;

        const dates = engagementData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const engagements = engagementData?.rows?.map(item => item?.metricValues[0]?.value);
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            engagements: (Number(engagements[index]) * 100).toFixed(2),
        }));
        setEngChartData(formattedData);

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
        setEngAnomalies(detectedAnomalies);
    }, [engagementData]);

    return (
        <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <div>
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>{headerTitle}</h1>
                <div className='flex justify-between items-center'>
                    <div className='w-[40%] content-center text-base 2xl:text-lg text-left'>
                        <h3>By analyzing the engagement rate
                            over
                            a period of
                            time, you can ascertain the
                            accuracy of your data and detect any potential tagging setup problems
                        </h3>
                        <h3 className='pt-5'>Your engagement rate appears to be within normal
                            limits, it
                            is neither
                            too high nor
                            too low, nothing to worry about here!
                        </h3>
                    </div>
                    <div className='min-w-[55%] content-center'>
                        <ResponsiveContainer height={300}>
                            <LineChart data={engChartData} height={300}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="formattedDate" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="engagements"
                                    stroke="#8884d8"
                                    strokeWidth={2}
                                    r={5}
                                    name='Engagement Rate'
                                // dot={(props) => {
                                //     const { cx, cy, payload } = props;
                                //     const isAnomaly = engAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

                                //     return (
                                //         <circle
                                //             cx={cx}
                                //             cy={cy}
                                //             r={isAnomaly ? 7 : 5}
                                //             fill={isAnomaly ? "red" : "white"}
                                //             stroke={isAnomaly ? "red" : "#8884d8"}
                                //             strokeWidth={1}
                                //         />
                                //     );
                                // }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EngagementRate;
