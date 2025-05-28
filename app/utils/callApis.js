import moment from "moment";
import { fetchAuditData, reportEndApiCall } from "./endApi";
import { useAccountStore } from "../store/useAccountStore";

export const runCallApiInChunks = async (batchIndex) => {
  const { dateRange } = useAccountStore.getState(); // Fetch fresh state every call

  const endDate = moment(dateRange?.endDate);
  const startDate = moment(dateRange?.startDate);

  const formattedStartDate = startDate.format("YYYY-MM-DD");
  const formattedEndDate = endDate.format("YYYY-MM-DD");

  const startDate90 = moment(endDate).subtract(89, "days");
  const formattedStartDate90 = startDate90.format("YYYY-MM-DD");
  const formattedEndDate90 = endDate.format("YYYY-MM-DD");

  // Define payloads using computed dates
  const endapiall = {
    dimensions: [{ name: "streamId" }, { name: "streamName" }],
    metrics: [{ name: "activeUsers" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    keepEmptyRows: true,
  };

  const usersDetails = {
    dimensions: [{ name: "hostName" }],
    metrics: [{ name: "totalUsers" }, { name: "sessions" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    keepEmptyRows: true,
  };

  const engagementRate = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "engagementRate" }, { name: "totalusers" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const eventsTracking = {
    dimensions: [{ name: "eventName" }],
    metrics: [
      { name: "conversions" },
      { name: "eventCount" },
      { name: "eventCountPerUser" },
    ],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    keepEmptyRows: true,
  };

  const keyeventdetails = {
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "keyEvents" }, { name: "eventvalue" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
  };

  const ecomTracking = {
    dimensions: [{ name: "transactionId" }],
    metrics: [{ name: "transactions" }, { name: "totalRevenue" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    keepEmptyRows: true,
  };

  const dimensionFilterFactory = (eventName) => ({
    dimensions: [{ name: "eventName" }],
    metrics: [{ name: "totalUsers" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    dimensionFilter: {
      filter: {
        stringFilter: { matchType: "EXACT", value: eventName },
        fieldName: "eventName",
      },
    },
    limit: "5000",
  });

  const itemView = dimensionFilterFactory("view_item");
  const addToCart = dimensionFilterFactory("add_to_cart");
  const checkout = dimensionFilterFactory("begin_checkout");
  const purchase = dimensionFilterFactory("purchase");
  const beginCheckout = dimensionFilterFactory("begin_checkout");
  const shipingInfo = dimensionFilterFactory("add_shipping_info");
  const paymentInfo = dimensionFilterFactory("add_payment_info");

  const userAcquisition = {
    dimensions: [{ name: "sessionSourceMedium" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
    ],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    limit: "5",
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
  };

  const trafficAcquisition = {
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }, { name: "engagedSessions" }],
    dateRanges: [{ startDate: formattedStartDate, endDate: formattedEndDate }],
    limit: "5",
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    metricAggregations: ["TOTAL"],
  };

  const totaluserCore = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "totalUsers" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const sessionsCore = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessions" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const viewCore = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "screenPageViews" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const totaluserEng = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "sessionsPerUser" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const viewEng = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "screenPageViewsPerUser" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const sessionsEng = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "engagedSessions" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    keepEmptyRows: true,
  };

  const ConversionAnomaly = {
    dimensions: [{ name: "date" }],
    metrics: [{ name: "conversions:purchase" }],
    dateRanges: [
      { startDate: formattedStartDate90, endDate: formattedEndDate90 },
    ],
    orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
  };

  const runEcomItemsDetailsWithMultipleMetrics = async () => {
    const extraMetrics = [
      { key: "ecomItems_addToCart", metric: "itemsAddedToCart" },
      { key: "ecomItems_itemIVL", metric: "itemsViewedInList" },
      { key: "ecomItems_purchase", metric: "itemsPurchased" },
      { key: "ecomItems_itemIV", metric: "itemsViewed" },
      { key: "ecomItems_checkout", metric: "itemsCheckedOut" },
    ];

    const ecomDimensions = [
      { name: "itemId" },
      { name: "itemName" },
      { name: "itemCategory" },
      { name: "itemBrand" },
      { name: "itemListName" },
    ];

    const dateRange = [
      { startDate: formattedStartDate, endDate: formattedEndDate },
    ];

    for (const { key, metric } of extraMetrics) {
      await reportEndApiCall(key, {
        dimensions: ecomDimensions,
        metrics: [{ name: metric }],
        dateRanges: dateRange,
        limit: "10000",
      });
    }
  };

  const callApiBatches = [
    async () => {
      fetchAuditData("dataStreams", "dataStreams");
      await reportEndApiCall("generalConfig", endapiall);
      fetchAuditData("dataRetentionSettings", "dataRetentionSettings");
      fetchAuditData("attributionSettings", "attributionSettings");
      fetchAuditData("googleSignalsSettings", "googleSignalsSettings");
      await reportEndApiCall("usersDetails", usersDetails);
      fetchAuditData("googleAdsLinks", "googleAdsLinks");
      fetchAuditData("bigQueryLinks", "bigQueryLinks");
      fetchAuditData("firebaseLinks", "firebaseLinks");
      fetchAuditData("searchAds360Links", "searchAds360Links");
      fetchAuditData(
        "displayVideo360AdvertiserLinks",
        "displayVideo360AdvertiserLinks"
      );
    },
    async () => {
      await reportEndApiCall("totaluserCore", totaluserCore);
      reportEndApiCall("sessionsCore", sessionsCore);
      reportEndApiCall("viewCore", viewCore);
      reportEndApiCall("engagementRate", engagementRate);
      reportEndApiCall("totaluserEng", totaluserEng);
      await reportEndApiCall("viewEng", viewEng);
      reportEndApiCall("sessionsEng", sessionsEng);
      reportEndApiCall("eventsTracking", eventsTracking);
      fetchAuditData("keyEvents", "keyEvents");
      reportEndApiCall("keyeventdetails", keyeventdetails);
      await reportEndApiCall("ConversionAnomaly", ConversionAnomaly);
    },
    async () => {
      await reportEndApiCall("ecomTracking", ecomTracking);
      reportEndApiCall("itemView", itemView);
      reportEndApiCall("addToCart", addToCart);
      reportEndApiCall("checkout", checkout);
      reportEndApiCall("purchase", purchase);
      reportEndApiCall("beginCheckout", beginCheckout);
      await reportEndApiCall("shipingInfo", shipingInfo);
      reportEndApiCall("paymentInfo", paymentInfo);
      await runEcomItemsDetailsWithMultipleMetrics();
      reportEndApiCall("userAcquisition", userAcquisition);
      reportEndApiCall("trafficAcquisition", trafficAcquisition);
      fetchAuditData("customDimensions", "customDimensions");
      await fetchAuditData("customMetrics", "customMetrics");
    },
  ];

  const batch = callApiBatches[batchIndex];
  if (batch) {
    console.log("store-date-callapi", dateRange);
    console.log(
      "formattedStartDate, end,start90,end90",
      formattedStartDate,
      formattedEndDate,
      formattedStartDate90,
      formattedEndDate90
    );
    await batch();
  }
};

export const callApiBatchesCount = 3;
