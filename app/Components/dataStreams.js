import React from 'react';
import { useAccountStore } from '../store/useAccountStore';

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
            webMeasurementId = stream?.webStreamData?.measurementId || "Not Available";
        } else if (stream?.type === "ANDROID_APP_DATA_STREAM") {
            androidStreams = stream?.androidAppStreamData?.packageName || "Not Available";
            androidMeasurementId = stream?.androidAppStreamData?.firebaseAppId || "Not Available";
        } else if (stream?.type === "IOS_APP_DATA_STREAM") {
            iosStreams = stream?.iosAppStreamData?.bundleId || "Not Available";
            iosMeasurementId = stream?.iosAppStreamData?.firebaseAppId || "Not Available";
        }
    });

    return (
        <div>
            <h1>Tagging & Configuration</h1>
            <h2>Data Streams</h2>

            <table border="1">
                <thead>
                    <tr>
                        <th></th>
                        <th>Android Streams</th>
                        <th>Web Streams</th>
                        <th>iOS Streams</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><b># of streams</b></td>
                        <td>Android configured streams</td>
                        <td>Web configured stream</td>
                        <td>iOS configured streams</td>
                    </tr>
                    <tr>
                        <td><b>Active streams</b></td>
                        <td>{androidStreams}</td>
                        <td>{webStreams}</td>
                        <td>{iosStreams}</td>
                    </tr>
                    <tr>
                        <td><b>Measurement Id / App Id</b></td>
                        <td>{androidMeasurementId}</td>
                        <td>{webMeasurementId}</td>
                        <td>{iosMeasurementId}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default DataStreams;
