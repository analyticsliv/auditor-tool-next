'use client';

import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAccountStore } from '../store/useAccountStore';
import moment from 'moment';

const ConversionAnomaly = () => {

    const { endApiData } = useAccountStore();

    const [convChartData, setConvChartData] = useState([]);
    const [convAnomalies, setConvAnomalies] = useState([]);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();

    const totalConvData = endApiData?.ConversionAnomaly;

    useEffect(() => {
        const dates = totalConvData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const purchases = totalConvData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            purchases: Number(purchases[index])
        }));
        setConvChartData(formattedData)

        //anomaly
        const windowSize = 14;
        let sum = 0;
        let detectedAnomalies = [];

        for (let i = 0; i < formattedData?.length; i++) {
            if (i <= windowSize) {
                sum += formattedData[i]?.purchases;
            } else {
                sum -= formattedData[i - windowSize - 1]?.purchases;
                sum += formattedData[i - 1]?.purchases;
                let avg = sum / windowSize;

                if (avg * 3 < formattedData[i]?.purchases) {
                    detectedAnomalies?.push({ formattedDate: formattedData[i]?.formattedDate, purchases: formattedData[i]?.purchases });
                }
            }
        }

        setConvAnomalies(detectedAnomalies);

    }, [totalConvData]);

    useEffect(() => {
        setStartDate(convChartData?.[0]?.formattedDate);
        setEndDate(convChartData?.[convChartData?.length - 1]?.formattedDate);
    }, [totalConvData, convChartData, startDate, endDate])

    return (
        <div className='bg-white rounded-3xl px-4 py-10 mt-10'>
            <div>
                <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                    Conversions - Anomaly Detection
                </h1>
                {(!totalConvData?.rows || totalConvData?.rows?.length === 0) ?
                    <div className='text-red-400 text-center text-base'>
                        There is some issue to fetching data related to this section or data not present sorry for inconvenience
                    </div>
                    :
                    <div className='flex justify-between 2xl:justify-around items-center'>
                        <div className='w-[35%] text-center text-sm 2xl:text-base' id="">
                            <h3 className='pb-5'>
                                Presented
                                graph highlights your core conversions.
                                Abnormality in this graph depicts issues that need immediate attention as
                                conversions from <br></br><span className='font-bold'>{startDate} </span>to <span className='font-bold'> {endDate} </span>have abnormal patterns.
                            </h3>
                            {convAnomalies?.length > 0 ?
                                <div>
                                    <span className='font-bold'>Detected deviation</span> from expected normal behaviour in Purchase pattern.
                                </div>
                                :
                                <div>
                                    <span className='font-bold'>No anomalies detected</span> in Purchase. Data trends are stable and within
                                    expected ranges in Purchases Per User pattern.
                                </div>
                            }
                        </div>
                        <div className='w-[65%]'>
                            <ResponsiveContainer height={280}>
                                <LineChart data={convChartData} height={280}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="formattedDate" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="purchases"
                                        stroke="green"
                                        strokeWidth={2}
                                        dot={(props) => {
                                            const { cx, cy, payload } = props;

                                            // Check if the current data point is an anomaly
                                            const isAnomaly = convAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

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
                                    {convAnomalies?.length > 0 && (
                                        <Line
                                            type="monotone"
                                            dataKey="purchases"
                                            stroke="red"
                                            strokeWidth={2}
                                            dot={{ fill: "red", stroke: "red", r: 7 }}
                                        />
                                    )}
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default ConversionAnomaly
