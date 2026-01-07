"use client";

import React from "react";
import { useAccountStore } from "../store/useAccountStore";

const DataStreams = () => {
  const { auditData } = useAccountStore();
  const dataStreams = auditData?.dataStreams?.dataStreams || [];

  let androidStreams = "Not Available";
  let webStreams = "Not Available";
  let iosStreams = "Not Available";

  let androidMeasurementId = "Not Available";
  let webMeasurementId = "Not Available";
  let iosMeasurementId = "Not Available";

  dataStreams?.forEach((stream) => {
    if (stream?.type === "WEB_DATA_STREAM") {
      webStreams = stream?.webStreamData?.defaultUri || "Not Available";
      webMeasurementId =
        stream?.webStreamData?.measurementId || "Not Available";
    } else if (stream?.type === "ANDROID_APP_DATA_STREAM") {
      androidStreams =
        stream?.androidAppStreamData?.packageName || "Not Available";
      androidMeasurementId =
        stream?.androidAppStreamData?.firebaseAppId || "Not Available";
    } else if (stream?.type === "IOS_APP_DATA_STREAM") {
      iosStreams = stream?.iosAppStreamData?.bundleId || "Not Available";
      iosMeasurementId =
        stream?.iosAppStreamData?.firebaseAppId || "Not Available";
    }
  });

  return (
    <div className="">
      <h1 className="pt-8 text-center text-[#7380ec] font-extrabold text-[1.8rem] ">
        Tagging & Configuration
      </h1>
      <div className="parent-div bg-white rounded-3xl p-10 mt-10">
        <h2 className="pb-10 text-gray-800 font-extrabold text-[1.8rem] text-center">
          Data Streams
        </h2>

        <table border="1" className="w-full">
          <thead>
            <tr>
              <th></th>
              <th className="text-xl text-center">Web Streams</th>
              <th className="text-xl text-center">Android Streams</th>
              <th className="text-xl text-center">iOS Streams</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="h-[3.8rem] border-b border-gray-800 font-bold text-center">
                # of streams
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 font-semibold text-center">
                Web configured stream
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 font-semibold text-center">
                Android configured streams
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 font-semibold text-center">
                iOS configured streams
              </td>
            </tr>
            <tr>
              <td className="h-[3.8rem] border-b border-gray-800 font-bold text-center">
                Active streams
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {webStreams}
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {androidStreams}
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {iosStreams}
              </td>
            </tr>
            <tr>
              <td className="h-[3.8rem] border-b border-gray-800 font-bold text-center">
                Measurement Id / App Id
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {webMeasurementId}
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {androidMeasurementId}
              </td>
              <td className="h-[3.8rem] border-b border-gray-800 text-center">
                {iosMeasurementId}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataStreams;
