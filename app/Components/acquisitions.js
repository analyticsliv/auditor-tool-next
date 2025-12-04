'use client';
import React from 'react';
import { useAccountStore } from '../store/useAccountStore';

const Acquisitions = () => {
    const { endApiData } = useAccountStore();
    const userAcquisitionData = endApiData?.userAcquisition;
    const trafficAcquisitionData = endApiData?.trafficAcquisition;

    const renderUserAcquisitionTable = () => {
        if (!userAcquisitionData?.rows) return null;

        let positionOfDirectNone = null;
        let positionOfNotSet = null;

        const rows = userAcquisitionData.rows.map((row, index) => {
            const dimension = row?.dimensionValues[0]?.value || "N/A";
            const metrics = row?.metricValues?.map((m) => m?.value || "0");

            if (dimension === "(direct) / (none)") positionOfDirectNone = index + 1;
            if (dimension === "(not set)") positionOfNotSet = index + 1;

            return (
                <tr key={index} className="h-[3.8rem] border-b border-gray-800 text-center">
                    <td>{dimension}</td>
                    {metrics.map((val, i) => (
                        <td key={i}>{val}</td>
                    ))}
                </tr>
            );
        });

        let message = "Everything is fine";
        if (positionOfDirectNone && positionOfNotSet) {
            message = `In your First Click User Acquisition report, <strong>(direct) / (none)</strong> is at position <strong>${positionOfDirectNone}</strong>, and <strong>(not set)</strong> is at position <strong>${positionOfNotSet}</strong>. This is a critical issue.`;
        } else if (positionOfDirectNone) {
            message = `In your First Click User Acquisition report, <strong>(direct) / (none)</strong> is at position <strong>${positionOfDirectNone}</strong>.`;
        } else if (positionOfNotSet) {
            message = `In your First Click User Acquisition report, <strong>(not set)</strong> is at position <strong>${positionOfNotSet}</strong>.`;
        }

        return (
            <div className="flex w-full gap-10">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-center">First user source/medium</th>
                            <th className="text-center">Sessions</th>
                            <th className="text-center">Total Users</th>
                            <th className="text-center">New Users</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>

                <div className="w-[270px] flex flex-col">
                    <h3 className="text-center font-semibold text-base 2xl:text-lg mb-4">
                        Insights
                    </h3>
                    <div className="flex-1 flex items-center">
                        <p className="text-base 2xl:text-lg leading-relaxed text-left"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderTrafficAcquisitionTable = () => {
        if (!trafficAcquisitionData?.rows) return null;

        let positionOfDirect = null;
        let positionOfUnassigned = null;

        const rows = trafficAcquisitionData.rows.map((row, index) => {
            const dimension = row?.dimensionValues[0]?.value || "N/A";
            const metrics = row?.metricValues?.map((m) => m?.value || "0");

            if (dimension === "Direct") positionOfDirect = index + 1;
            if (dimension === "Unassigned") positionOfUnassigned = index + 1;

            return (
                <tr key={index} className="h-[3.8rem] border-b border-gray-800 text-center">
                    <td>{dimension}</td>
                    {metrics.map((val, i) => (
                        <td key={i}>{val}</td>
                    ))}
                </tr>
            );
        });

        let message = "Everything is fine";
        if (positionOfDirect && positionOfUnassigned) {
            message = `In your Traffic Attribution Channel reporting, <strong>Direct</strong> is at position <strong>${positionOfDirect}</strong>, <strong>Unassigned</strong> is at position <strong>${positionOfUnassigned}</strong>. Needs attention.`;
        } else if (positionOfDirect) {
            message = `In your Traffic Attribution Channel reporting, <strong>Direct</strong> is at position <strong>${positionOfDirect}</strong>.`;
        } else if (positionOfUnassigned) {
            message = `In your Traffic Attribution Channel reporting, <strong>Unassigned</strong> is at position <strong>${positionOfUnassigned}</strong>.`;
        }

        return (
            <div className="flex w-full gap-10">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-center">Session default channel group</th>
                            <th className="text-center">Sessions</th>
                            <th className="text-center">Engaged Sessions</th>
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                <div className="w-[270px] flex flex-col">
                    <h3 className="text-center font-semibold text-base 2xl:text-lg mb-4">
                        Insights
                    </h3>
                    <div className="flex-1 flex items-center">
                        <p
                            className="text-base 2xl:text-lg leading-relaxed text-left"
                            dangerouslySetInnerHTML={{ __html: message }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <section className='parent-div bg-white rounded-3xl p-10 mt-10'>
                <h1 className='pb-11 text-gray-800 font-extrabold text-[1.8rem] text-center'>User Acquisition</h1>
                {renderUserAcquisitionTable()}
            </section>
            <section className='parent-div bg-white rounded-3xl p-10 mt-10'>
                <h1 className='pb-11 text-gray-800 font-extrabold text-[1.8rem] text-center'>Traffic Acquisition</h1>
                {renderTrafficAcquisitionTable()}
            </section>
        </div>
    );
};

export default Acquisitions;
