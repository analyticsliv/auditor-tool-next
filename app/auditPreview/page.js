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

  console.log("Audit Data:", auditData);
  console.log("End API Data:", endApiData);

  console.log("Data Streams Audit:", auditData?.dataStreams);
  console.log("Data Retention Settings:", auditData?.dataRetentionSettings);
  console.log("Attribution Settings:", auditData?.attributionSettings);
  console.log("End API Data Streams:", endApiData?.dataStreams);
  console.log("usersDetails activedomain-", endApiData?.usersDetails);

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
    </div>
  )
}

export default Page
