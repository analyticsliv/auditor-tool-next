'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { useRouter } from 'next/navigation';
import { runCallApiInChunks, callApiBatchesCount } from '../utils/callApis';
import componentsList from '../utils/componentList';
import AuditStart from '../Components/auditStart';

const COMPONENTS_PER_BATCH = 6;

const AuditPreview = () => {
  const {
    selectedProperty,
    propertyId,
    readyToRunAudit,
    setReadyToRunAudit,
    setAuditCompleted,
    auditCompleted,
    resetSelection,
    auditRunCompleted,
    setAuditRunCompleted,
  } = useAccountStore();

  const router = useRouter();

  const [visibleCount, setVisibleCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const hasRunRef = useRef(false);

  // Handle missing property on direct page load
  useEffect(() => {
    if (!propertyId || !selectedProperty?.name) {
      resetSelection();
      alert("No property selected");
      router.push("/");
      return;
    }
  }, [propertyId]);

  useEffect(() => {
    if (!readyToRunAudit && !auditCompleted) {
      router.push("/");
      return;
    }
  }, [readyToRunAudit, auditCompleted])

  useEffect(() => {
    if (auditRunCompleted) {
      setVisibleCount(componentsList.length);  // Show all components
      setLoading(false);
      return;
    }
  }, [auditRunCompleted])

  useEffect(() => {
    if (readyToRunAudit && !hasRunRef.current) {
      hasRunRef.current = true;
      const loadInBatches = async () => {
        for (let i = 0; i < callApiBatchesCount; i++) {
          setLoading(true);
          await runCallApiInChunks(i);
          setVisibleCount((prev) => prev + COMPONENTS_PER_BATCH);
          setLoading(false);
        }
        setReadyToRunAudit(false);
        setAuditCompleted(true);
        setAuditRunCompleted(true);  // Persist that audit has run
      };
      loadInBatches();
    }
  }, [
    readyToRunAudit,
  ]);

  const visibleComponents = componentsList.slice(0, visibleCount);

  return (
    <div className="p-6 space-y-4">
      <AuditStart />

      {visibleComponents?.map((Component, index) => (
        <Component key={index} />
      ))}

      {loading && (
        <div className="flex flex-col justify-center items-center py-10">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 animate-ping" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">Running audit...</div>
        </div>

      )}
    </div>
  );
};

export default AuditPreview;
