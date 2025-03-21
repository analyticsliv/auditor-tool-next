import moment from "moment";
import { fetchAuditData, reportEndApiCall } from "./endApi";

const today = moment();
const yesterday = moment().subtract(1, 'days');
const startDate = moment().subtract(30, 'days');
const formattedStartDate = startDate.format('YYYY-MM-DD');
const formattedEndDate = yesterday.format('YYYY-MM-DD');

const startDate90 = moment().subtract(90, 'days');
const formattedStartDate90 = startDate90.format('YYYY-MM-DD');
const formattedEndDate90 = yesterday.format('YYYY-MM-DD');

// 30 days

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

// 90 days

const totaluserCore = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const sessionsCore = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "sessions" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const viewCore = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "screenPageViews" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const totaluserEng = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "sessionsPerUser" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const viewEng = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "screenPageViewsPerUser" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const sessionsEng = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "engagedSessions" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

export async function callApis() {
    await fetchAuditData('dataStreams', 'dataStreams');
    await reportEndApiCall('generalConfig', endapiall);
    await fetchAuditData('dataRetentionSettings', 'dataRetentionSettings');
    await fetchAuditData('attributionSettings', 'attributionSettings');
    await fetchAuditData('googleSignalsSettings', 'googleSignalsSettings');
    await reportEndApiCall('usersDetails', usersDetails);

    await reportEndApiCall('totaluserCore', totaluserCore);
    await reportEndApiCall('sessionsCore', sessionsCore);
    await reportEndApiCall('viewCore', viewCore);

    await reportEndApiCall('totaluserEng', totaluserEng);
    await reportEndApiCall('viewEng', viewEng);
    await reportEndApiCall('sessionsEng', sessionsEng);
}
