'use client'

import React from 'react'
import AuditStart from '../Components/auditStart'
import DataStreams from '../Components/dataStreams'
import { useAccountStore } from '../store/useAccountStore'
import GeneralConfig from '../Components/generalConfig'
import DataCollectionRetention from '../Components/dataCollectionRetention'

const Page = () => {

  const { auditData, endApiData } = useAccountStore();

  console.log("Audit Data:", auditData);
  console.log("End API Data:", endApiData);

  console.log("Data Streams Audit:", auditData?.dataStreams);
  console.log("Data Retention Settings:", auditData?.dataRetentionSettings);
  console.log("Attribution Settings:", auditData?.attributionSettings);
  console.log("End API Data Streams:", endApiData?.dataStreams);
  console.log("generalConfig", endApiData?.usersDetails);

  return (
    <div>
      <AuditStart />
      <DataStreams />
      <GeneralConfig />
      <DataCollectionRetention />
    </div>
  )
}

export default Page
