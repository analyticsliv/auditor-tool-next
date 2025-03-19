import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';

const ActiveDomains = () => {
    const { endApiData } = useAccountStore();

    const [domain, setDomain] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [text, setText] = useState('');

    const data = endApiData?.usersDetails;
    // for (let i = 0; i < info?.rows?.length; i++) {
    //     for (let j = 0; j < info?.rows[i].dimensionValues?.length; j++) {
    //         domain.push(info?.rows[i].dimensionValues[j].value);
    //         session.push(info?.rows[i].metricValues[j + 1].value);
    //     }
    // }
    useEffect(() => {
        const domains = data?.rows?.map(item => item?.dimensionValues[0].value);
        const chartValues = data?.rows?.map(item => ({
            domain: item?.dimensionValues[1].value,
            metric1: parseInt(item?.metricValues[0].value, 10),
            metric2: parseInt(item?.metricValues[1].value, 10),
        }));

        setDomain(domains);
        setChartData(chartValues);
    }, [data]);

    console.log("domain - ", domain)
    console.log("chartData  - ", chartData)

    if (domain?.length == 1) {
        'The pie chart shows that You are currently tracking a single domain. Ensure that this domain represents the entirety of your traffic for accurate analytics.'
    } else if (!domain?.length) {
        'Error fetching user details for active domain.'
    } else {
        `The pie chart shows that your GA4 traffic is distributed across multiple domains, indicating that you are not following best practices by using one domain per property. If these domains are not owned by you, you should consider removing them from your account.`
    }


    return (
        <div>
            <div>
                <h1>Data Integrity &
                    Customization</h1>
                <div>
                    <h1>
                        Active Domains
                    </h1>
                    <h3>This checks which domains are receiving traffic inyour GA4
                        property
                        to ensure
                        spam-free
                        <br></br>traffic and best practices. Ideally, you should use only one root domain per
                        property.
                    </h3>
                    <div>
                        <div>
                            <h3>
                            </h3>
                        </div>
                        <div>
                            <div><canvas id="myChart"></canvas></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActiveDomains
