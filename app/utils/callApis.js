import { fetchAuditData, reportEndApiCall } from "./endApi";

const endapiall = {
    "dimensions": [{ "name": "streamId" }, { "name": "streamName" }],
    "metrics": [{ "name": "activeUsers" }],
    "dateRanges": [{ "startDate": '2025-02-15', "endDate": '2025-03-17' }],
    "keepEmptyRows": true
};

const usersDetails = {
    "dimensions": [{ "name": "hostName" }],
    "metrics": [{ "name": "totalUsers" }, { "name": "sessions" }],
    "dateRanges": [{ "startDate": '2025-02-15', "endDate": '2025-03-17' }],
    "keepEmptyRows": true
};

export async function callApis() {
    await fetchAuditData('dataStreams', 'dataStreams');
    await reportEndApiCall('dataStreams', endapiall)
    await fetchAuditData('dataRetentionSettings', 'dataRetentionSettings');
    await fetchAuditData('attributionSettings', 'attributionSettings');
    await reportEndApiCall('usersDetails', usersDetails)
}
