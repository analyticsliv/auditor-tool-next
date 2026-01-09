'use client';
import React, { useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { Frown, Smile, Meh } from 'lucide-react';

const CustomDimensionMetrics = () => {
    const { auditData } = useAccountStore();

    const dimensions = auditData?.customDimensions?.customDimensions || [];
    const metrics = auditData?.customMetrics || [];

    // Calculate mood based on whether both, one, or neither are present
    const hasDimensions = dimensions?.length > 0;
    const hasMetrics = metrics?.length > 0;

    const getMoodIcon = () => {
        if (hasDimensions && hasMetrics) {
            return (
                <div className="p-2 rounded-lg bg-green-500">
                    <Smile className="w-5 h-5 text-white" />
                </div>
            );
        } else if (hasDimensions || hasMetrics) {
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

    return (
        <div className='parent-div bg-white rounded-3xl p-10 mt-10'>

            <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center flex items-center justify-center gap-3'>
                {getMoodIcon()}
                Custom Dimensions & Metrics
            </h1>
            <h3 className='text-center px-[10%]'>
                Custom dimensions and metrics are crucial in GA4 as they enable businesses to
                track and analyze specific, unique data points that align with their specific
                needs and goals.
            </h3>

            <div className="flex mt-12">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className='text-center'>Check</th>
                            <th className='text-center'>Status</th>
                            <th className='text-center'>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='h-[3.8rem] border-b border-gray-800 text-center'>
                            <td>Custom Dimensions</td>
                            <td className='h-[3.8rem] flex justify-center items-center'>
                                {dimensions?.length ? <div className="p-2 rounded-lg bg-green-500" >
                                    <Smile className="w-5 h-5 text-white" />
                                </div> : <div className="p-2 rounded-lg bg-red-500">
                                    <Frown className="w-5 h-5 text-white" />
                                </div>}
                            </td>
                            <td>
                                {dimensions?.length > 0
                                    ? (
                                        <>
                                            You have{' '}
                                            <span className="font-bold">
                                                {dimensions?.length}
                                            </span>{' '}
                                            Custom Dimensions.
                                        </>
                                    )
                                    : 'No Custom Dimensions found.'
                                }
                            </td>
                        </tr>
                        <tr className='h-[3.8rem] border-b border-gray-800 text-center'>
                            <td>Custom Metrics</td>
                            <td className='h-[3.8rem] flex justify-center items-center'>
                                {metrics?.length ? <div className="p-2 rounded-lg bg-green-500" >
                                    <Smile className="w-5 h-5 text-white" />
                                </div> : <div className="p-2 rounded-lg bg-red-500">
                                    <Frown className="w-5 h-5 text-white" />
                                </div>}
                            </td>
                            <td>
                                {metrics?.length > 0
                                    ? (
                                        <>
                                            You have{' '}
                                            <span className="font-bold">
                                                {metrics?.length}
                                            </span>{' '}
                                            Custom Metrics.
                                        </>
                                    )
                                    : 'No Custom Metrics found.'
                                }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomDimensionMetrics;
