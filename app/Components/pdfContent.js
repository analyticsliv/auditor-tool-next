import React, { forwardRef } from "react";
import AuditStart from "./auditStart";
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

const PdfContent = forwardRef((props, ref) => {

    const { endApiData } = useAccountStore();

    const hasAddToCartData = () => {
        const value = endApiData?.addToCart?.rows?.[0]?.metricValues?.[0]?.value;
        return parseFloat(value || '0') > 0;
    };

    return (
        <div ref={ref} style={{ padding: "8px", background: "#fff", width: "800px" }}>
            <div><AuditStart /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><DataStreams /></div>
            <div><GeneralConfig /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><DataCollectionRetention /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><AttributionSetting /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><ActiveDomains /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><ProductLinks /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><CoreMetrics /></div>
            <div><EngagementRate /></div>
            <div><EngagementMetrics /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><EventsTracking /></div>
            <div><KeyEvents /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><ConversionAnomaly /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><EcommerceTracking /></div>
            {/* <div className="page-break" style={{ pageBreakAfter: "always" }}><EcomFunnels /></div> */}
            {hasAddToCartData() && (
                <div className="page-break" style={{ pageBreakAfter: "always" }}>
                    <EcomFunnels />
                </div>
            )}
            <div className="page-break" style={{ pageBreakAfter: "always" }}><EcomItemDetails /></div>
            <div className="page-break" style={{ pageBreakAfter: "always" }}><Acquisitions /></div>
            <div><CustomDimensionMetrics /></div>
        </div>
    );
});

PdfContent.displayName = "PdfContent";
export default PdfContent;
