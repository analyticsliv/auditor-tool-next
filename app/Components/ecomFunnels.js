'use client';

import React, { useEffect, useState } from 'react'
import { useAccountStore } from '../store/useAccountStore'

const EcomFunnels = () => {
  const { endApiData } = useAccountStore();

  const [purchaseFunnel, setPurchaseFunnel] = useState({
    itemView: '0',
    addToCart: '0',
    checkout: '0',
    purchase: '0'
  })

  const [checkoutFunnel, setCheckoutFunnel] = useState({
    beginCheckout: '0',
    shippingInfo: '0',
    paymentInfo: '0',
    purchase: '0'
  })

  const extractCount = (data) => {
    if (!data?.rows || data.rows.length === 0) return '0';

    let outputLine = '';

    for (let i = 0; i < data.rows.length; i++) {
      for (let j = 0; j < data.metricHeaders.length; j++) {
        outputLine += data.metricHeaders[j].name + ": " + data.rows[i].metricValues[j].value;
        if (j !== data.metricHeaders.length - 1) {
          outputLine += "\n ";
        }
      }
    }

    outputLine = outputLine.trim();
    if (outputLine === '') return '0';

    // Remove label prefix if present
    return outputLine.replace('totalUsers: ', '');
  };


  useEffect(() => {
    if (endApiData) {
      setPurchaseFunnel({
        itemView: extractCount(endApiData.itemView),
        addToCart: extractCount(endApiData.addToCart),
        checkout: extractCount(endApiData.checkout),
        purchase: extractCount(endApiData.purchase)
      })

      setCheckoutFunnel({
        beginCheckout: extractCount(endApiData.beginCheckout),
        shippingInfo: extractCount(endApiData.shipingInfo),
        paymentInfo: extractCount(endApiData.payment),
        purchase: extractCount(endApiData.purchase)
      });

    }
  }, [endApiData])

  return (

    <div>
      {purchaseFunnel?.addToCart && purchaseFunnel.addToCart !== '0' && (
        <div>
          <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <h1 className="text-xl font-bold mb-6">E-Commerce Shopping Purchase Funnel</h1>
            <div className='grid grid-cols-4 gap-6'>
              <FunnelCard title="Item View" count={purchaseFunnel.itemView} />
              <FunnelCard title="Add to Cart" count={purchaseFunnel.addToCart} />
              <FunnelCard title="Checkout" count={purchaseFunnel.checkout} />
              <FunnelCard title="Purchase" count={purchaseFunnel.purchase} />
            </div>
          </div>

          <div className='parent-div bg-white rounded-3xl p-10 mt-10'>
            <h1 className="text-xl font-bold mb-6">E-Commerce Shopping Checkout Funnel</h1>
            <div className='grid grid-cols-4 gap-6'>
              <FunnelCard title="Begin Checkout" count={checkoutFunnel.beginCheckout} />
              <FunnelCard title="Add Shipping Info" count={checkoutFunnel.shippingInfo} />
              <FunnelCard title="Add Payment Info" count={checkoutFunnel.paymentInfo} />
              <FunnelCard title="Purchase" count={checkoutFunnel.purchase} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FunnelCard = ({ title, count }) => (
  <div className="bg-gray-100 rounded-xl p-4 text-center">
    <h3 className="font-semibold">{title}</h3>
    <h2 className="text-2xl font-bold text-blue-600">{count}</h2>
  </div>
)

export default EcomFunnels
