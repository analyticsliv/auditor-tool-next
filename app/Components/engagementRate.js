import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';

const EngagementRate = () => {

    const [engChartData, setEngChartData] = useState([]);
    const [engAnomalies, setEngAnomalies] = useState([]);

    const { endApiData } = useAccountStore();
    const engagementData = endApiData?.engagementRate;

    useEffect(() => {
        console.log("engagementData", engagementData)
    }, [engagementData])

    useEffect(() => {
        const dates = engagementData?.rows?.map(item => item?.dimensionValues[0]?.value);
        const engagements = engagementData?.rows?.map(item => (item?.metricValues[0]?.value
        ));
        const formattedDates = dates?.map(date => moment(date, "YYYYMMDD").format("YYYY-MM-DD"));

        const formattedData = formattedDates?.map((date, index) => ({
            formattedDate: date,
            engagements: Number(engagements[index])
        }));
        setEngChartData(formattedData)


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
        <div>
            <div>
                <div>
                    <h1> </h1>
                    <div className='flex justify-between'>
                        <div className='w-[40%] content-center'>
                            <h3>By analyzing the engagement rate
                                over
                                a period of
                                time, you can ascertain the
                                accuracy of your data and detect any potential tagging setup problems
                            </h3>
                            <h3>Your engagement rate appears to be within normal
                                limits, it
                                is neither
                                too high nor
                                too low, nothing to worry about here!
                            </h3>
                        </div>
                        <div className='min-w-[50%] content-center'>
                            <div className=''>
                                <ResponsiveContainer height={230}>
                                    <LineChart data={engChartData} height={230}>
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
                                            dot={(props) => {
                                                const { cx, cy, payload } = props;

                                                // Check if the current data point is an anomaly
                                                const isAnomaly = engAnomalies?.some(anomaly => anomaly?.formattedDate === payload?.formattedDate);

                                                return (
                                                    <circle
                                                        cx={cx}
                                                        cy={cy}
                                                        r={isAnomaly ? 7 : 5}
                                                        fill={isAnomaly ? "red" : "white"}
                                                        stroke={isAnomaly ? "red" : "#8884d8"}
                                                        strokeWidth={1}
                                                    />
                                                );
                                            }}
                                        />
                                    </LineChart>
                                    {engAnomalies?.length > 0 && (
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EngagementRate
