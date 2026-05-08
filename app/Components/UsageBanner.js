"use client";

const UsageBanner = ({ used, limit, kind = 'messages', threshold = 0.2 }) => {
    if (limit == null || limit === 0) return null;
    const remaining = Math.max(0, limit - used);
    if (remaining === 0) return null;
    const ratio = remaining / limit;
    if (ratio > threshold) return null;

    return (
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 px-4 py-2 text-sm text-yellow-800 dark:text-yellow-200 flex items-center justify-between">
            <span>
                You have <strong>{remaining}</strong> {kind} left out of {limit}. Contact us at
                {' '}<a className="underline" href="mailto:data.analytics@analyticsliv.com">data.analytics@analyticsliv.com</a> to get more.
            </span>
        </div>
    );
};

export default UsageBanner;
