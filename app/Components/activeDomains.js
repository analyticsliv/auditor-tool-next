'use client'

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ActiveDomains = () => {

    const { endApiData } = useAccountStore();

    const [domain, setDomain] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [text, setText] = useState('');
    const [activeIndex, setActiveIndex] = useState(null);
    const [visibleDomains, setVisibleDomains] = useState(new Set());
    const [colorMap, setColorMap] = useState({});

    const data = endApiData?.usersDetails;

    function getRandomColor() {

        const r = Math.floor(Math.random() * 131) + 100;
        const g = Math.floor(Math.random() * 131) + 100;
        const b = Math.floor(Math.random() * 131) + 100;

        const color = '#' + r.toString(16).padStart(2, '0') +
            g.toString(16).padStart(2, '0') +
            b.toString(16).padStart(2, '0');

        return color;
    }

    useEffect(() => {
        const domains = data?.rows?.map(item => item?.dimensionValues[0]?.value);
        const chartValues = data?.rows?.map(item => (item?.metricValues[1]?.value
        ));
        setDomain(domains);
        setChartData(chartValues);
        setVisibleDomains(new Set(domains));

        const newColorMap = {};
        domains?.forEach(domain => {
            newColorMap[domain] = colorMap[domain] || getRandomColor();
        });
        setColorMap(newColorMap);
    }, [data]);


    const datas = domain?.map((element, index) => ({
        name: element,
        value: chartData[index] ? parseInt(chartData[index], 10) : 0
    }))?.filter(item => visibleDomains.has(item.name));

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const handleToggle = (name) => {
        setVisibleDomains(prev => {
            const newSet = new Set(prev);
            if (newSet.has(name)) newSet.delete(name);
            else newSet.add(name);
            return newSet;
        });
    };

    useEffect(() => {
        if (domain?.length == 1) {
            setText('The pie chart shows that You are currently tracking a single domain. Ensure that this domain represents the entirety of your traffic for accurate analytics.')
        } else if (!domain?.length) {
            setText('Error fetching user details for active domain.')
        } else {
            setText(`The pie chart shows that your GA4 traffic is distributed across multiple domains, indicating that you are not following best practices by using one domain per property. If these domains are not owned by you, you should consider removing them from your account.`)
        }
    }, [domain])

    return (
        <div>
            <div>
                <h1 className='pt-8 text-center text-[#7380ec] font-extrabold text-[1.8rem]'>Data Integrity &
                    Customization</h1>
                <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
                    <h1 className='pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center'>
                        Active Domains
                    </h1>
                    <h3 className='text-center'>
                        This checks which domains are receiving traffic inyour GA4
                        property
                        to ensure
                        spam-free
                        <br></br>traffic and best practices. Ideally, you should use only one root domain per
                        property.
                    </h3>
                    <div className='flex items-center justify-between gap-10 2xl:justify-evenly'>
                        <div className='max-w-[40%] min-w-[25%] flex justify-center items-center'>
                            <h3 className='text-center'>
                                {text}
                            </h3>
                        </div>
                        <div className='flex flex-col justify-center items-center'>
                            <ResponsiveContainer width={400} height={400}>
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={datas}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        fill="#8884d8"
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {datas?.map((entry, index) => (
                                            <Cell key={`cell-${index}`}
                                                fill={colorMap[entry?.name]}
                                                opacity={activeIndex === index ? 1 : 0.6}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onMouseLeave={() => setActiveIndex(null)}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-4 mt-4">
                                {domain?.map((name) => (
                                    <div
                                        key={name}
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => handleToggle(name)}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: colorMap[name] }}
                                        ></span>
                                        <span
                                            className={`${visibleDomains?.has(name) ? 'text-black' : 'line-through text-gray-400'}`}
                                        >
                                            {name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActiveDomains



// {/* <div className="flex flex-wrap gap-5">
//     {domain?.map((name, index) => (
//         <label key={index} className="flex items-center gap-1">
//             <input
//                 type="checkbox"
//                 checked={visibleDomains.has(name)}
//                 onChange={() => handleToggle(name)}
//             />
//             {name}
//         </label>
//     ))}
// </div> */}