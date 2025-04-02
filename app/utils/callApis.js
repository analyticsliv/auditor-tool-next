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

const engagementRate = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "engagementRate" }, { "name": "totalusers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }],
    "keepEmptyRows": true
};

const eventsTracking = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "conversions" }, { "name": "eventCount" }, { "name": "eventCountPerUser" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "keepEmptyRows": true
};

const keyeventdetails = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "keyEvents" }, { "name": "eventvalue" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }]
};

const ecomTracking = {
    "dimensions": [{ "name": "transactionId" }],
    "metrics": [{ "name": "transactions" }, { "name": "totalRevenue" }],
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

const ConversionAnomaly = {
    "dimensions": [{ "name": "date" }],
    "metrics": [{ "name": "conversions:purchase" }],
    "dateRanges": [{ "startDate": formattedStartDate90, "endDate": formattedEndDate90 }],
    "orderBys": [{ "dimension": { "dimensionName": "date" }, "desc": false }]
};

export async function callApis() {
    await fetchAuditData('dataStreams', 'dataStreams');
    await reportEndApiCall('generalConfig', endapiall);
    await fetchAuditData('dataRetentionSettings', 'dataRetentionSettings');
    await fetchAuditData('attributionSettings', 'attributionSettings');
    await fetchAuditData('googleSignalsSettings', 'googleSignalsSettings');
    await reportEndApiCall('usersDetails', usersDetails);
    await fetchAuditData('googleAdsLinks', 'googleAdsLinks');
    await fetchAuditData('bigQueryLinks', 'bigQueryLinks');
    await fetchAuditData('firebaseLinks', 'firebaseLinks');
    await fetchAuditData('searchAds360Links', 'searchAds360Links');
    await fetchAuditData('displayVideo360AdvertiserLinks', 'displayVideo360AdvertiserLinks');
    await reportEndApiCall('totaluserCore', totaluserCore);
    await reportEndApiCall('sessionsCore', sessionsCore);
    await reportEndApiCall('viewCore', viewCore);
    await reportEndApiCall('engagementRate', engagementRate);
    await reportEndApiCall('totaluserEng', totaluserEng);
    await reportEndApiCall('viewEng', viewEng);
    await reportEndApiCall('sessionsEng', sessionsEng);
    await reportEndApiCall('eventsTracking', eventsTracking);
    await fetchAuditData('keyEvents', 'keyEvents');
    await reportEndApiCall('keyeventdetails', keyeventdetails);
    await reportEndApiCall('ConversionAnomaly', ConversionAnomaly);
    await reportEndApiCall('ecomTracking', ecomTracking);
}
