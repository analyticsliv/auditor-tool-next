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

const itemView = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "view_item" }, "fieldName": "eventName" } },
    "limit": "5000"
};

const addToCart = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "add_to_cart" }, "fieldName": "eventName" } },
    "limit": "5000"
};

const checkout = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "begin_checkout" }, "fieldName": "eventName" } },
    "limit": "5000"
};

const purchase = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "purchase" }, "fieldName": "eventName" } },
    "limit": "5000"
};

const beginCheckout = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "begin_checkout" }, "fieldName": "eventName" } }
};

const shipingInfo = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "add_shipping_info" }, "fieldName": "eventName" } }
};

const paymentInfo = {
    "dimensions": [{ "name": "eventName" }],
    "metrics": [{ "name": "totalUsers" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "dimensionFilter": { "filter": { "stringFilter": { "matchType": "EXACT", "value": "add_payment_info" }, "fieldName": "eventName" } }
};

const userAcquisition = {
    "dimensions": [{ "name": "sessionSourceMedium" }],
    "metrics": [{ "name": "sessions" }, { "name": "totalUsers" }, { "name": "newUsers" }],
    // , { "name": "returningUsers"}
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "limit": "5",
    "orderBys": [{
        "metric": { "metricName": "sessions" },
        "desc": true
    }]
}

const trafficAcquisition = {
    "dimensions": [{ "name": "sessionDefaultChannelGroup" }],
    "metrics": [{ "name": "sessions" }, { "name": "engagedSessions" }],
    "dateRanges": [{ "startDate": formattedStartDate, "endDate": formattedEndDate }],
    "limit": "5",
    "orderBys": [{
        "metric": { "metricName": "sessions" },
        "desc": true
    }],
    "metricAggregations": ["TOTAL"]
}

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

async function runEcomItemsDetailsWithMultipleMetrics() {
    const extraMetrics = [
        { key: 'ecomItems_addToCart', metric: 'itemsAddedToCart' },
        { key: 'ecomItems_itemIVL', metric: 'itemsViewedInList' },
        { key: 'ecomItems_purchase', metric: 'itemsPurchased' },
        { key: 'ecomItems_itemIV', metric: 'itemsViewed' },
        { key: 'ecomItems_checkout', metric: 'itemsCheckedOut' }
    ];

    const ecomDimensions = [
        { name: "itemId" },
        { name: "itemName" },
        { name: "itemCategory" },
        { name: "itemBrand" },
        { name: "itemListName" },
    ];

    const dateRange = [{ startDate: formattedStartDate, endDate: formattedEndDate }];

    for (const { key, metric } of extraMetrics) {
        const payload = {
            dimensions: ecomDimensions,
            metrics: [{ name: metric }],
            dateRanges: dateRange,
            limit: "10000"
        };

        await reportEndApiCall(key, payload);
    }
}

const callApiBatches = [
    async () => {
        await fetchAuditData('dataStreams', 'dataStreams');
        reportEndApiCall('generalConfig', endapiall);
        fetchAuditData('dataRetentionSettings', 'dataRetentionSettings');
        fetchAuditData('attributionSettings', 'attributionSettings');
        fetchAuditData('googleSignalsSettings', 'googleSignalsSettings');
        await reportEndApiCall('usersDetails', usersDetails);
        fetchAuditData('googleAdsLinks', 'googleAdsLinks');
        fetchAuditData('bigQueryLinks', 'bigQueryLinks');
        fetchAuditData('firebaseLinks', 'firebaseLinks');
        fetchAuditData('searchAds360Links', 'searchAds360Links');
        await fetchAuditData('displayVideo360AdvertiserLinks', 'displayVideo360AdvertiserLinks');
    },
    async () => {
        await reportEndApiCall('totaluserCore', totaluserCore);
        reportEndApiCall('sessionsCore', sessionsCore);
        reportEndApiCall('viewCore', viewCore);
        reportEndApiCall('engagementRate', engagementRate);
        reportEndApiCall('totaluserEng', totaluserEng);
        await reportEndApiCall('viewEng', viewEng);
        reportEndApiCall('sessionsEng', sessionsEng);
        reportEndApiCall('eventsTracking', eventsTracking);
        fetchAuditData('keyEvents', 'keyEvents');
        reportEndApiCall('keyeventdetails', keyeventdetails);
        await reportEndApiCall('ConversionAnomaly', ConversionAnomaly);
    },
    async () => {
        await reportEndApiCall('ecomTracking', ecomTracking);
        reportEndApiCall('itemView', itemView);
        reportEndApiCall('addToCart', addToCart);
        reportEndApiCall('checkout', checkout);
        reportEndApiCall('purchase', purchase);
        reportEndApiCall('beginCheckout', beginCheckout);
        await reportEndApiCall('shipingInfo', shipingInfo);
        reportEndApiCall('paymentInfo', paymentInfo);
        runEcomItemsDetailsWithMultipleMetrics();
        reportEndApiCall('userAcquisition', userAcquisition);
        reportEndApiCall('trafficAcquisition', trafficAcquisition);
        fetchAuditData('customDimensions', 'customDimensions');
        await fetchAuditData('customMetrics', 'customMetrics');
    },
];

export const runCallApiInChunks = async (batchIndex) => {
    const batch = callApiBatches[batchIndex];
    if (batch) {
        await batch();
    }
};

export const callApiBatchesCount = callApiBatches.length;
