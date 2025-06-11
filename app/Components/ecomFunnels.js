'use client';

import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';

const EcomFunnels = () => {
  const { endApiData } = useAccountStore();

  const [purchaseData, setPurchaseData] = useState([]);
  const [checkoutData, setCheckoutData] = useState([]);

  const extractCount = (data) => {
    if (!data?.rows || data?.rows?.length === 0) return 0;
    return parseInt(data.rows[0].metricValues[0].value || '0');
  };

  useEffect(() => {
    if (endApiData) {
      const purchase = [
        { label: 'Item View', value: extractCount(endApiData.itemView), color: '#6366f1' },
        { label: 'Add to Cart', value: extractCount(endApiData.addToCart), color: '#8b5cf6' },
        { label: 'Checkout', value: extractCount(endApiData.checkout), color: '#ec4899' },
        { label: 'Purchase', value: extractCount(endApiData.purchase), color: '#ef4444' }
      ];

      const checkout = [
        { label: 'Begin Checkout', value: extractCount(endApiData.beginCheckout), color: '#06b6d4' },
        { label: 'Add Shipping Info', value: extractCount(endApiData.shipingInfo), color: '#3b82f6' },
        { label: 'Add Payment Info', value: extractCount(endApiData.payment), color: '#10b981' },
        { label: 'Purchase', value: extractCount(endApiData.purchase), color: '#f97316' }
      ];

      setPurchaseData(purchase);
      setCheckoutData(checkout);
    }
  }, [endApiData]);

  if (!purchaseData.length || !checkoutData.length) return null;

  return (
    <div>
      {purchaseData.find(step => step.label === 'Add to Cart')?.value > 0 && (
        <>
          {/* Purchase Funnel Block */}
          <div className="parent-div bg-white rounded-3xl p-10 mt-10">
            <h2 className="pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center">
              E-Commerce Shopping Purchase Funnel
            </h2>
            <FunnelContent data={purchaseData} />
          </div>

          {/* Checkout Funnel Block */}
          <div className="parent-div bg-white rounded-3xl p-10 mt-10">
            <h2 className="pb-8 text-gray-800 font-extrabold text-[1.8rem] text-center">
              E-Commerce Shopping Checkout Funnel
            </h2>
            <FunnelContent data={checkoutData} />
          </div>
        </>
      )}
    </div>
  );
};

const FunnelContent = ({ data }) => {
  return (
    <div className="flex flex-col md:flex-row justify-around items-center gap-10">
      {/* SVG Funnel */}
      <div className="flex justify-center">
        <svg width="350" height="350" viewBox="0 0 300 350">
          {data?.map((item, index) => {
            const y = index * 80 + 20;
            const width = 300 - index * 40;
            const x = (300 - width) / 2;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={60}
                  fill={item?.color}
                  rx="8"
                  className="drop-shadow-lg"
                />
                <text
                  x={150}
                  y={y + 25}
                  textAnchor="middle"
                  className="fill-white font-bold text-sm"
                >
                  {item?.label}
                </text>
                <text
                  x={150}
                  y={y + 45}
                  textAnchor="middle"
                  className="fill-white font-bold text-lg"
                >
                  {item?.value.toLocaleString()}
                </text>

                {index < data.length - 1 && (
                  <polygon
                    points={`${150 - 8},${y + 65} ${150 + 8},${y + 65} ${150},${y + 75}`}
                    fill="#6b7280"
                    className="drop-shadow"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 w-full lg:max-w-md mt-6 lg:mt-0">
        <StatCard label="Top of Funnel" value={data[0].value.toLocaleString()} color="text-indigo-600" />
        <StatCard
          label="Conversion"
          value={`${((data[data.length - 1].value / data[0].value) * 100).toFixed(1)}%`}
          color="text-purple-600"
        />
        <StatCard label="Purchases" value={data[data.length - 1].value.toLocaleString()} color="text-pink-600" />
        <StatCard
          label="Drop-offs"
          value={(data[0].value - data[data.length - 1].value).toLocaleString()}
          color="text-red-600"
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-gray-50 p-4 lg:m-2 rounded-xl shadow text-center">
    <div className={`text-xl font-bold ${color}`}>{value}</div>
    <div className="text-gray-600 text-sm mt-1">{label}</div>
  </div>
);

export default EcomFunnels;







// import React from 'react';

// const PurchaseFunnel = ({
//   data = [
//     { label: 'Item View', value: 12508, color: '#6366f1' },
//     { label: 'Add to cart', value: 1449, color: '#8b5cf6' },
//     { label: 'Checkout', value: 475, color: '#ec4899' },
//     { label: 'Purchase', value: 139, color: '#ef4444' }
//   ]
// }) => {
//   return (
//     <div className="parent-div bg-white rounded-3xl p-10 mt-10">
//       <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
//         Purchase Funnel Analytics
//       </h2>

//       <div className="flex justify-around gap-8 items-center">
//         {/* Left side - Visual funnel */}
//         <div className="relative h-96 flex items-center justify-center">
//           <svg width="300" height="350" viewBox="0 0 300 350">
//             {data.map((item, index) => {
//               const y = index * 80 + 20;
//               const width = 250 - (index * 40);
//               const x = (300 - width) / 2;

//               return (
//                 <g key={index}>
//                   {/* Funnel segment */}
//                   <rect
//                     x={x}
//                     y={y}
//                     width={width}
//                     height={60}
//                     fill={item.color}
//                     rx="8"
//                     className="drop-shadow-lg"
//                   />

//                   {/* Text inside segment */}
//                   <text
//                     x={150}
//                     y={y + 25}
//                     textAnchor="middle"
//                     className="fill-white font-bold text-sm"
//                   >
//                     {item.label}
//                   </text>
//                   <text
//                     x={150}
//                     y={y + 45}
//                     textAnchor="middle"
//                     className="fill-white font-bold text-lg"
//                   >
//                     {item.value.toLocaleString()}
//                   </text>

//                   {/* Arrow between segments */}
//                   {index < data.length - 1 && (
//                     <polygon
//                       points={`${150 - 8},${y + 65} ${150 + 8},${y + 65} ${150},${y + 75}`}
//                       fill="#6b7280"
//                       className="drop-shadow"
//                     />
//                   )}
//                 </g>
//               );
//             })}
//           </svg>
//         </div>

//         {/* right side stats */}
//         <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
//           <div className="bg-white p-6 rounded-xl shadow-md text-center">
//             <div className="text-3xl font-bold text-indigo-600">
//               {data[0].value.toLocaleString()}
//             </div>
//             <div className="text-gray-600 mt-1">Total Views</div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-md text-center">
//             <div className="text-3xl font-bold text-purple-600">
//               {((data[data.length - 1].value / data[0].value) * 100).toFixed(1)}%
//             </div>
//             <div className="text-gray-600 mt-1">Conversion</div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-md text-center">
//             <div className="text-3xl font-bold text-pink-600">
//               {data[data.length - 1].value.toLocaleString()}
//             </div>
//             <div className="text-gray-600 mt-1">Purchases</div>
//           </div>

//           <div className="bg-white p-6 rounded-xl shadow-md text-center">
//             <div className="text-3xl font-bold text-red-600">
//               {(data[0].value - data[data.length - 1].value).toLocaleString()}
//             </div>
//             <div className="text-gray-600 mt-1">Drop-offs</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PurchaseFunnel;

