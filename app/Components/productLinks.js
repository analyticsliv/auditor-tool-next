'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import MoodIcon from './MoodIcon';

const ProductLinks = () => {

    const { auditData } = useAccountStore();
    const gaLinksData = auditData?.googleAdsLinks;
    const [gaLinkMood, setGaLinkMood] = useState(true);
    const [gaLinkText, setGaLinkText] = useState("");

    const bqLinksData = auditData?.bigQueryLinks;
    const [bqLinkMood, setBqLinkMood] = useState(true);
    const [bqLinkText, setBqLinkText] = useState("");

    const firebaseLinksData = auditData?.firebaseLinks;
    const [firebaseLinkMood, setFirebaseLinkMood] = useState(true);
    const [firebaseLinkText, setFirebaseLinkText] = useState("");

    const sa360LinksData = auditData?.searchAds360Links;
    const [sa360LinkMood, setSa360LinkMood] = useState(true);
    const [sa360LinkText, setSa360LinkText] = useState("");

    const dv360LinksData = auditData?.displayVideo360AdvertiserLinks;
    const [dv360LinkMood, setDv360LinkMood] = useState(true);
    const [dv360LinkText, setDv360LinkText] = useState("");

    useEffect(() => {
        if (!gaLinksData?.googleAdsLinks || gaLinksData?.googleAdsLinks?.length < 1) {
            setGaLinkText("NA");
            setGaLinkMood(false)
        } else {
            const length = gaLinksData?.googleAdsLinks?.length;
            setGaLinkText(
                <span>
                    <span className="font-bold">{length}</span>
                </span>
            );

            setGaLinkMood(true)
        }
    }, [gaLinksData])

    useEffect(() => {
        if (!bqLinksData?.bigqueryLinks || bqLinksData?.bigqueryLinks?.length < 1) {
            setBqLinkText("NA");
            setBqLinkMood(false)
        } else {
            const length = bqLinksData?.bigqueryLinks?.length;
            setBqLinkText(
                <span>
                    <span className="font-bold">{length}</span>
                </span>
            );

            setBqLinkMood(true)
        }
    }, [bqLinksData])

    useEffect(() => {
        if (!firebaseLinksData?.firebaseLinks || firebaseLinksData?.firebaseLinks?.length < 1) {
            setFirebaseLinkText("NA");
            setFirebaseLinkMood(false)
        } else {
            const length = firebaseLinksData?.firebaseLinks?.length;
            setFirebaseLinkText(
                <span>
                    <span className="font-bold">{length}</span>
                </span>
            );

            setFirebaseLinkMood(true)
        }
    }, [firebaseLinksData])

    useEffect(() => {
        if (!sa360LinksData?.searchAds360Links || sa360LinksData?.searchAds360Links?.length < 1) {
            setSa360LinkText("NA");
            setSa360LinkMood(false)
        } else {
            const length = sa360LinksData?.searchAds360Links?.length;
            setSa360LinkText(
                <span>
                    <span className="font-bold">{length}</span>
                </span>
            );

            setSa360LinkMood(true)
        }
    }, [sa360LinksData])

    useEffect(() => {
        if (!dv360LinksData?.displayVideo360AdvertiserLinks || dv360LinksData?.displayVideo360AdvertiserLinks?.length < 1) {
            setDv360LinkText("NA");
            setDv360LinkMood(false)
        } else {
            const length = dv360LinksData?.displayVideo360AdvertiserLinks?.length;
            setDv360LinkText(
                <span>
                    <span className="font-bold">{length}</span>
                </span>
            );
            setDv360LinkMood(true)
        }

    }, [dv360LinksData])

    // Calculate overall mood based on how many products are linked
    const linkedCount = [gaLinkMood, bqLinkMood, firebaseLinkMood, sa360LinkMood, dv360LinkMood].filter(Boolean).length;

    const overallMood = linkedCount >= 4 ? 'good' : linkedCount >= 2 ? 'warning' : 'bad';

    return (
        <div>
            <div>
                <h1 className='pt-8 text-center text-[#7380ec] font-extrabold text-[1.8rem]' >Insight Activation
                    & Integration
                </h1>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-5 text-gray-800 font-extrabold text-[1.8rem] text-center flex items-center justify-center gap-3'>
                        <MoodIcon mood={overallMood} />
                        Product links
                    </h1>
                    <h3 className='text-center pb-10'>Ensuring that your Google Ads accounts are
                        properly linked
                        to GA4 and configured
                        <br></br>correctly to avoid having campaigns labeled as "(not set)."
                    </h3>
                    <div>
                        <table className='w-full'>
                            <thead>
                                <tr>
                                    <th className='text-lg text-center'>Check</th>
                                    <th className='text-lg text-center'>Status</th>
                                    <th className='text-lg text-center'>No. of account linked</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>Google Ads Links </td>
                                    <td className='h-[3.2rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>
                                        <div className="flex items-center justify-start w-[140px] gap-2">
                                            <MoodIcon mood={gaLinkMood ? 'good' : 'bad'} />
                                            <div>{gaLinkMood ? 'Linked' : 'Not Linked'}</div>
                                        </div>
                                    </td>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>{gaLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>BigQuery Links </td>
                                    <td className='h-[3.2rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>
                                        <div className="flex items-center justify-start w-[140px] gap-2">
                                            <MoodIcon mood={bqLinkMood ? 'good' : 'bad'} />
                                            <div>{bqLinkMood ? 'Linked' : 'Not Linked'}</div>
                                        </div>
                                    </td>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>{bqLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>Firebase Links </td>
                                    <td className='h-[3.2rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>
                                        <div className="flex items-center justify-start w-[140px] gap-2">
                                            <MoodIcon mood={firebaseLinkMood ? 'good' : 'bad'} />
                                            <div>{firebaseLinkMood ? 'Linked' : 'Not Linked'}</div>
                                        </div>
                                    </td>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>{firebaseLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>Search Ads 360 Links </td>
                                    <td className='h-[3.2rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>
                                        <div className="flex items-center justify-start w-[140px] gap-2">
                                            <MoodIcon mood={sa360LinkMood ? 'good' : 'bad'} />
                                            <div>{sa360LinkMood ? 'Linked' : 'Not Linked'}</div>
                                        </div>
                                    </td>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>{sa360LinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>Display & Video 360 links</td>
                                    <td className='h-[3.2rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>
                                        <div className="flex items-center justify-start w-[140px] gap-2">
                                            <MoodIcon mood={dv360LinkMood ? 'good' : 'bad'} />
                                            <div>{dv360LinkMood ? 'Linked' : 'Not Linked'}</div>
                                        </div>
                                    </td>
                                    <td className='h-[3.2rem] border-b border-gray-800 text-center'>{dv360LinkText}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductLinks
