import React, { forwardRef } from "react";
import DataStreams from "./dataStreams";
import GeneralConfig from "./generalConfig";
import DataCollectionRetention from './dataCollectionRetention'
import AttributionSetting from './attributionSetting'
import ActiveDomains from './activeDomains'
import CoreMetrics from './coreMetrics'
import EngagementMetrics from './engagementMetrics'
import EngagementRate from './engagementRate'
import EventsTracking from './eventsTracking'
import KeyEvents from './keyEvents'
import ConversionAnomaly from './conversionAnomaly'
import EcommerceTracking from './ecommerceTracking'
import ProductLinks from './productLinks'
import EcomFunnels from './ecomFunnels'
import EcomItemDetails from './ecomItemDetails'
import Acquisitions from './acquisitions'
import CustomDimensionMetrics from './customDimensionMetrics'
import { useAccountStore } from "../store/useAccountStore";
import InfoComponent from "./info";
import AnalyzerResults from "./AnalyzerResults";

const PdfContent = forwardRef(({ isEcommerceOverride }, ref) => {

    const { endApiData, isEcommerce: isEcommerceFromStore } = useAccountStore();

    // Use override if provided, otherwise use store value
    const isEcommerce = isEcommerceOverride !== undefined
        ? isEcommerceOverride
        : isEcommerceFromStore;

    const hasAddToCartData = () => {
        if (!isEcommerce) return false;
        const value = endApiData?.addToCart?.rows?.[0]?.metricValues?.[0]?.value;
        return parseFloat(value || '0') > 0;
    };

    const hasAddToCartDataEcomItem = () => {
        if (!isEcommerce) return false;
        const rows = endApiData?.ecomItems_addToCart?.rows || [];
        return rows.length > 0;
    };

    return (
        <div ref={ref} style={{ padding: "8px", background: "#fff", width: "800px" }}>
            <div><InfoComponent previousAudit={true} /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><DataStreams /></div>
            <div><GeneralConfig /></div>
            {/* <div className="page-break" style={{ pageBreakAfter: "always" }}><DataCollectionRetention /></div> */}
            <div><AttributionSetting /></div>
            <div><ActiveDomains /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><ProductLinks /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><EngagementRate /></div>
            <div><EventsTracking /></div>
            <div><KeyEvents /></div>

            {/* Only render ecommerce components if isEcommerce is true */}
            {isEcommerce && (
                <>
                    <div className="page-break" style={{ pageBreakAfter: "always" }}>
                        <EcommerceTracking />
                    </div>

                    {hasAddToCartData() && (
                        <div className="page-break" style={{ pageBreakAfter: "always" }}>
                            <EcomFunnels />
                        </div>
                    )}

                    {hasAddToCartDataEcomItem() && (
                        <div className="page-break" style={{ pageBreakAfter: "always" }}>
                            <EcomItemDetails />
                        </div>
                    )}
                </>
            )}

            <div><Acquisitions /></div>
            <div><CustomDimensionMetrics /></div>
            <div><CoreMetrics /></div>
            <div><EngagementMetrics /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><ConversionAnomaly /></div>
            <div><AnalyzerResults /></div>
        </div>
    );
});

PdfContent.displayName = "PdfContent";
export default PdfContent;