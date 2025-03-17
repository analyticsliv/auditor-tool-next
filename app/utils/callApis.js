import moment from "moment";
import { fetchAuditData, reportEndApiCall } from "./endApi";

const today = moment();
const yesterday = moment().subtract(1, 'days');
const startDate = moment().subtract(30, 'days');
const formattedStartDate = startDate.format('YYYY-MM-DD');
const formattedEndDate = yesterday.format('YYYY-MM-DD');

const endapiall = {
    "dimensions": [{ "name": "streamId" }, { "name": "streamName" }],
    "metrics": [{ "name": "activeUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "keepEmptyRows": true
};

const usersDetails = {
    "dimensions": [{ "name": "hostName" }],
    "metrics": [{ "name": "totalUsers" }, { "name": "sessions" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "keepEmptyRows": true
};

export async function callApis() {
    await fetchAuditData('dataStreams', 'dataStreams');
    await reportEndApiCall('generalConfig', endapiall);
    await fetchAuditData('dataRetentionSettings', 'dataRetentionSettings');
    await fetchAuditData('attributionSettings', 'attributionSettings');
    await reportEndApiCall('usersDetails', usersDetails);
}
