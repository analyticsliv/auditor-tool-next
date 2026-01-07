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

    const lightColorPalette = [
        // Red
        '#FFB3B3', '#FF8A80',

        // Coral
        '#FF9F80', '#FF6F61',

        // Orange
        '#FFB74D', '#FFCC80',

        // Amber
        '#FFD180', '#FFE082',

        // Yellow
        '#FFF176', '#FFF59D',

        // Lime
        '#DCE775', '#C5E1A5',

        // Green
        '#AED581', '#A5D6A7',

        // Mint
        '#B9F6CA', '#A7FFEB',

        // Teal
        '#80CBC4', '#B2EBF2',

        // Cyan
        '#81D4FA', '#90CAF9',

        // Sky Blue
        '#64B5F6', '#82B1FF',

        // Blue
        '#7986CB', '#AECBFA',

        // Indigo
        '#B39DDB', '#D1C4E9',

        // Purple
        '#CE93D8', '#E1BEE7',

        // Pink
        '#F8BBD0', '#FFCAD4',

        // Rose
        '#FADADD', '#FDE2E4',

        // Peach
        '#FFDAC1', '#FFD6A5',

        // Sand
        '#E6D3A3', '#EAD7C1',

        // Light Brown
        '#D7CCC8', '#CDB79E',

        // Olive
        '#CDEAC0', '#E2F0CB',

        // Steel
        '#CFD8DC', '#ECEFF1',

        // Grey
        '#E0E0E0', '#F5F5F5'
    ];


    function getRandomLightColor(usedColors) {
        // First use predefined palette
        const available = lightColorPalette.filter(c => !usedColors.includes(c));
        if (available.length > 0) {
            return available[Math.floor(Math.random() * available.length)];
        }

        // After palette exhausted → generate soft pastel via HSL
        let newColor = '';
        let attempts = 0;

        do {
            const hue = Math.floor(Math.random() * 360);      // any color
            const saturation = 60 + Math.random() * 20;      // soft but colorful
            const lightness = 75 + Math.random() * 10;       // always light

            newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            attempts++;
        } while (usedColors.includes(newColor) && attempts < 100);

        return newColor;
    }

    useEffect(() => {
        const domains = data?.rows?.map(item => item?.dimensionValues[0]?.value);
        const chartValues = data?.rows?.map(item => (item?.metricValues[1]?.value));
        setDomain(domains);
        setChartData(chartValues);
        setVisibleDomains(new Set(domains));

        const newColorMap = {};
        const usedColors = [];

        domains?.forEach(domain => {
            if (!colorMap[domain]) {
                const color = getRandomLightColor(usedColors);
                newColorMap[domain] = color;
                usedColors.push(color);
            } else {
                newColorMap[domain] = colorMap[domain];
                usedColors.push(colorMap[domain]);
            }
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
                    <div className='flex flex-col-reverse items-center'>
                        <div className='flex justify-center items-center'>
                            <h3 className='text-center text-xl'>
                                {text}
                            </h3>
                        </div>
                        <div className='flex justify-center items-center gap-10'>
                            <ResponsiveContainer width={500} height={500}>
                                <PieChart width={400} height={400}>
                                    <Pie
                                        data={datas}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        dataKey="value"
                                        stroke="#ffffff"
                                        strokeWidth={1}
                                    >
                                        {datas?.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={colorMap[entry?.name]}
                                                opacity={activeIndex === index ? 1 : 0.95}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onMouseLeave={() => setActiveIndex(null)}
                                                style={{
                                                    transition: 'opacity 0.2s ease',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap w-[50%] gap-4 mt-4">
                                {domain?.map((name) => (
                                    <div
                                        key={name}
                                        className="flex items-center gap-2 cursor-pointer"
                                        onClick={() => handleToggle(name)}
                                    >
                                        <span
                                            className="w-4 h-4 rounded-full opacity-75"
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
