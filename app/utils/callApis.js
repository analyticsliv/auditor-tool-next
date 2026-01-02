import moment from "moment";
import { fetchAuditData, reportEndApiCall } from "./endApi";
import { useAccountStore } from "../store/useAccountStore";
import { saveAudit } from "./saveAudit";
import { incrementAuditCount } from "./Auditcountutils";
import { getUserSession } from "./user";
import { analyzeAudit } from "./analyzeAudit";

export const runCallApiInChunks = async (batchIndex) => {
  const { dateRange, accountId, propertyId, selectedAccount, selectedProperty, isEcommerce } = useAccountStore.getState();

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

  // Ecommerce-related payloads (only used if isEcommerce is true)
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
      // Execute ecommerce APIs sequentially if isEcommerce is true
      if (isEcommerce) {
        await reportEndApiCall("ecomTracking", ecomTracking);
        await reportEndApiCall("itemView", itemView);
        await reportEndApiCall("addToCart", addToCart);
        await reportEndApiCall("checkout", checkout);
        await reportEndApiCall("purchase", purchase);
        await reportEndApiCall("beginCheckout", beginCheckout);
        await reportEndApiCall("shipingInfo", shipingInfo);
        await reportEndApiCall("paymentInfo", paymentInfo);
        await runEcomItemsDetailsWithMultipleMetrics();
      }

      // Execute remaining APIs sequentially
      await reportEndApiCall("userAcquisition", userAcquisition);
      await reportEndApiCall("trafficAcquisition", trafficAcquisition);
      await fetchAuditData("customDimensions", "customDimensions");
      await fetchAuditData("customMetrics", "customMetrics");

      const analyzerResult = await analyzeAudit(
        accountId,
        propertyId,
        selectedAccount,
        selectedProperty,
        isEcommerce
      );

      let analyzerData = null;

      if (analyzerResult.success) {
        analyzerData = analyzerResult.data;
        // Store in global state
        useAccountStore.getState().setAnalyzerData(analyzerData);
      } else {
        console.error('❌ Analyzer failed:', analyzerResult.error);
      }

      // Save audit to database WITH analyzer data
      const saveResult = await saveAudit(
        accountId,
        propertyId,
        selectedAccount,
        selectedProperty,
        isEcommerce,
        analyzerData
      );

      if (!saveResult.success) {
        console.error('❌ Failed to save audit:', saveResult.error);
        return; // Exit if save fails
      }

      // Increment audit count ONLY after successful save
      const user = getUserSession();
      if (user?.user?.email) {
        const result = await incrementAuditCount(user.user.email);

        if (result.success) {
          console.log('Audit count incremented:', result.data.auditCount);
        } else {
          console.error('Failed to increment audit count:', result.error);
        }
      }
    }
  ];

  const batch = callApiBatches[batchIndex];
  if (batch) {
    await batch();
  }
};

export const callApiBatchesCount = 3;