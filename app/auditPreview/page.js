'use client'

import React, { useEffect } from 'react'
import AuditStart from '../Components/auditStart'
import DataStreams from '../Components/dataStreams'
import { useAccountStore } from '../store/useAccountStore'
import GeneralConfig from '../Components/generalConfig'
import DataCollectionRetention from '../Components/dataCollectionRetention'
import AttributionSetting from '../Components/attributionSetting'
import ActiveDomains from '../Components/activeDomains'
import CoreMetrics from '../Components/coreMetrics'
import { useRouter } from 'next/navigation';
import EngagementMetrics from '../Components/engagementMetrics'
import EngagementRate from '../Components/engagementRate'
import EventsTracking from '../Components/eventsTracking'
import KeyEvents from '../Components/keyEvents'
import ConversionAnomaly from '../Components/conversionAnomaly'

const Page = () => {

  const { auditData, endApiData } = useAccountStore();
  const router = useRouter();

  useEffect(() => {
    if (
      Object.keys(auditData)?.length === 0 &&
      Object.keys(endApiData)?.length === 0
    ) {
      router.push("/");
    }
  }, [auditData, endApiData, router]);

  return (
    <div>
      <AuditStart />
      <DataStreams />
      <GeneralConfig />
      <DataCollectionRetention />
      <AttributionSetting />
      <ActiveDomains />

      <CoreMetrics />
      <EngagementRate />
      <EngagementMetrics />
      <EventsTracking />
      <KeyEvents />
      <ConversionAnomaly />
    </div>
  )
}

export default Page
