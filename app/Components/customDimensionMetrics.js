'use client';
import React, { useEffect } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { FaLaugh } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

const MoodIcon = ({ type }) => {
    const mood = type === 'bad' ? 'mood_bad' : 'mood';
    const bgColor = type === 'bad' ? '#ff321f' : '#015fff';

    return (
        <span
            className="material-symbols-outlined rounded-full p-3"
            style={{
                backgroundColor: bgColor,
                padding: '0.3rem',
                color: '#fff',
                fontSize: '1.7rem',
                borderRadius: '0.2rem',
            }}
        >
            {mood}
        </span>
    );
};

const CustomDimensionMetrics = () => {
    const { auditData } = useAccountStore();

    const dimensions = auditData?.customDimensions?.customDimensions || [];
    const metrics = auditData?.customMetrics || [];

    return (
        <div className='bg-white rounded-3xl p-10 mt-10'>

            <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>Custom Dimensions & Metrics</h1>
            <h3 className='text-center px-[10%]'>
                Custom dimensions and metrics are crucial in GA4 as they enable businesses to
                track and analyze specific, unique data points that align with their specific
                needs and goals.
            </h3>

            <div className="flex mt-12">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Check</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className='h-[3.8rem] border-b border-gray-800 text-center'>
                            <td>
                                {dimensions?.length ? <FaLaugh className='h-8 w-14 mx-auto fill-green-600' /> : <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />}
                            </td>
                            <td>Custom Dimensions</td>
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
                            <td>
                                {metrics?.length ? <FaLaugh className='h-8 w-14 mx-auto fill-green-600' /> : <HiEmojiSad className='h-10 w-14 mx-auto fill-red-600' />}
                                {/* <MoodIcon type={metrics?.length ? 'good' : 'bad'} /> */}
                            </td>
                            <td>Custom Metrics</td>
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
