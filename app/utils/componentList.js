import DataStreams from '../Components/dataStreams';
import GeneralConfig from '../Components/generalConfig';
import DataCollectionRetention from '../Components/dataCollectionRetention';
import AttributionSetting from '../Components/attributionSetting';
import ActiveDomains from '../Components/activeDomains';
import CoreMetrics from '../Components/coreMetrics';
import EngagementMetrics from '../Components/engagementMetrics';
import EngagementRate from '../Components/engagementRate';
import EventsTracking from '../Components/eventsTracking';
import KeyEvents from '../Components/keyEvents';
import ConversionAnomaly from '../Components/conversionAnomaly';
import EcommerceTracking from '../Components/ecommerceTracking';
import ProductLinks from '../Components/productLinks';
import EcomFunnels from '../Components/ecomFunnels';
import EcomItemDetails from '../Components/ecomItemDetails';
import Acquisitions from '../Components/acquisitions';
import CustomDimensionMetrics from '../Components/customDimensionMetrics';
import DownloadPdf from '../Components/downloadPdf';
import { useAccountStore } from '../store/useAccountStore';

// Function that returns components based on isEcommerce flag
export const getComponentsList = (isEcommerceOverride) => {
    // Use override if provided, otherwise get from store
    const isEcommerce = isEcommerceOverride !== undefined
        ? isEcommerceOverride
        : useAccountStore.getState().isEcommerce;

    const baseComponents = [
        DataStreams,
        GeneralConfig,
        DataCollectionRetention,
        AttributionSetting,
        ActiveDomains,
        ProductLinks,
        EngagementRate,
        EventsTracking,
        KeyEvents,
    ];

    // Only include ecommerce components if isEcommerce is true
    const ecommerceComponents = isEcommerce
        ? [EcommerceTracking, EcomFunnels, EcomItemDetails]
        : [];

    const endComponents = [
        Acquisitions,
        CustomDimensionMetrics,
        CoreMetrics,
        EngagementMetrics,
        ConversionAnomaly,
        DownloadPdf,
    ];

    return [...baseComponents, ...ecommerceComponents, ...endComponents];
};

export default [
    DataStreams,
    GeneralConfig,
    DataCollectionRetention,
    AttributionSetting,
    ActiveDomains,
    ProductLinks,
    EngagementRate,
    EventsTracking,
    KeyEvents,
    EcommerceTracking,
    EcomFunnels,
    EcomItemDetails,
    Acquisitions,
    CustomDimensionMetrics,
    CoreMetrics,
    EngagementMetrics,
    ConversionAnomaly,
    DownloadPdf,
];