'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { Frown, Smile } from 'lucide-react';

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
            setGaLinkText("No Google Ads Links found.");
            setGaLinkMood(false)
        } else {
            const length = gaLinksData?.googleAdsLinks?.length;
            setGaLinkText(
                <span>
                    You have the <span className="font-bold">{length}</span> Google Ads Links.
                </span>
            );

            setGaLinkMood(true)
        }
    }, [gaLinksData])

    useEffect(() => {
        if (!bqLinksData?.bigqueryLinks || bqLinksData?.bigqueryLinks?.length < 1) {
            setBqLinkText("No BigQuery Links found.");
            setBqLinkMood(false)
        } else {
            const length = bqLinksData?.bigqueryLinks?.length;
            setBqLinkText(
                <span>
                    You have the <span className="font-bold">{length}</span> BigQuery Links.
                </span>
            );

            setBqLinkMood(true)
        }
    }, [bqLinksData])

    useEffect(() => {
        if (!firebaseLinksData?.firebaseLinks || firebaseLinksData?.firebaseLinks?.length < 1) {
            setFirebaseLinkText("No Firebase Links found.");
            setFirebaseLinkMood(false)
        } else {
            const length = firebaseLinksData?.firebaseLinks?.length;
            setFirebaseLinkText(
                <span>
                    You have the <span className="font-bold">{length}</span> Firebase Links.
                </span>
            );

            setFirebaseLinkMood(true)
        }
    }, [firebaseLinksData])

    useEffect(() => {
        if (!sa360LinksData?.searchAds360Links || sa360LinksData?.searchAds360Links?.length < 1) {
            setSa360LinkText("No Search Ads 360 Links found.");
            setSa360LinkMood(false)
        } else {
            const length = sa360LinksData?.searchAds360Links?.length;
            setSa360LinkText(
                <span>
                    You have the <span className="font-bold">{length}</span> Search Ads 360 Links.
                </span>
            );

            setSa360LinkMood(true)
        }
    }, [sa360LinksData])

    useEffect(() => {
        if (!dv360LinksData?.displayVideo360AdvertiserLinks || dv360LinksData?.displayVideo360AdvertiserLinks?.length < 1) {
            setDv360LinkText("No Display & Video 360 links found.");
            setDv360LinkMood(false)
        } else {
            const length = dv360LinksData?.displayVideo360AdvertiserLinks?.length;
            setDv360LinkText(
                <span>
                    You have the <span className="font-bold">{length}</span> Display & Video 360 links.
                </span>
            );
            setDv360LinkMood(true)
        }

    }, [dv360LinksData])




    return (
        <div>
            <div>
                <h1 className='pt-8 text-center text-[#7380ec] font-extrabold text-[1.8rem]' >Insight Activation
                    & Integration
                </h1>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-5 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                        Product links
                    </h1>
                    <h3 className='text-center pb-20'>Ensuring that your Google Ads accounts are
                        properly linked
                        to GA4 and configured
                        <br></br>correctly to avoid having campaigns labeled as "(not set)."
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
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{gaLinkMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Google Ads Links </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>{gaLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{bqLinkMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>BigQuery Links </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>{bqLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{firebaseLinkMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Firebase Links </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>{firebaseLinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{sa360LinkMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Search Ads 360 Links </td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>{sa360LinkText}</td>
                                </tr>
                                <tr>
                                    <td className='h-[3.8rem] flex justify-center items-center border-b border-gray-800 font-bold text-center'>{dv360LinkMood ? <div className="p-2 rounded-lg bg-green-500" >
                                        <Smile className="w-5 h-5 text-white" />
                                    </div> : <div className="p-2 rounded-lg bg-red-500">
                                        <Frown className="w-5 h-5 text-white" />
                                    </div>}</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>Display & Video 360 links</td>
                                    <td className='h-[3.8rem] border-b border-gray-800 text-center'>{dv360LinkText}</td>
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
