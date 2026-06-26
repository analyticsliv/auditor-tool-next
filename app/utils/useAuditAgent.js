import { useCallback, useEffect, useRef, useState } from 'react';
import { getSession } from 'next-auth/react';

/* ============================================================
   GA4 Auto-Fix Agent — confirmed WebSocket contract.

   Connect:  wss://<host>/audit/agent/ws?token=<bearerToken>&property_id=<id>
             (query params — the browser WebSocket API can't send custom
             headers like Authorization/X-Property-Id on the handshake)

   Messages are PLAIN TEXT in both directions, not JSON:
   - The agent speaks first once the socket opens; the client sends
     nothing on connect.
   - Client replies are raw strings: "yes", "no", free text, or "exit"
     to end the session.

   All of this is isolated to this file — the UI only sees
   { status, messages, connect, sendMessage, disconnect }.
   ============================================================ */

const AGENT_BASE_URL =
    process.env.NEXT_PUBLIC_AGENT_URL ||
    'wss://auditor-tool-ai-135392845747.europe-west1.run.app';

// The agent can make real edits via the analytics.edit scope, so it's locked
// to a single allowlisted account regardless of how many other accounts the
// signed-in user can access elsewhere in the app. Shared by the launcher
// button (to decide whether to show at all) and the modal (to filter the
// account dropdown).
export const ALLOWED_ACCOUNT = 'accounts/186998328';

let idCounter = 0;
const nextId = () => `${Date.now()}-${idCounter++}`;

const log = (...args) => console.log('[AuditAgent]', ...args);
const logError = (...args) => console.error('[AuditAgent]', ...args);

// Never print the raw token — show enough to confirm it exists without
// leaking the full bearer token into console history.
const maskToken = (token) => (token ? `${token.slice(0, 10)}…(${token.length} chars)` : 'MISSING');

// The agent consistently ends a yes/no prompt with a literal "(yes/no)" —
// only show the quick-reply buttons when that marker is actually present,
// not for every message (status updates, final summaries, etc.).
const isYesNoQuestion = (text) =>
    typeof text === 'string' && /\(\s*yes\s*\/\s*no\s*\)/i.test(text);

export function useAuditAgent() {
    const [status, setStatus] = useState('idle'); // idle | connecting | connected | closed | error
    const [messages, setMessages] = useState([]);
    const [awaitingYesNo, setAwaitingYesNo] = useState(false);
    const wsRef = useRef(null);
    const userClosedRef = useRef(false);

    const addMessage = useCallback((role, text) => {
        setMessages((prev) => [...prev, { id: nextId(), role, text }]);
    }, []);

    useEffect(() => () => { wsRef.current?.close(); }, []);

    const connect = useCallback(async (propertyId) => {
        log('connect() called', { propertyId });

        if (!propertyId) {
            logError('connect() aborted — no propertyId');
            return;
        }
        if (wsRef.current && status === 'connected') {
            log('connect() skipped — already connected');
            return;
        }

        setStatus('connecting');
        setMessages([]);
        setAwaitingYesNo(false);
        userClosedRef.current = false;

        const session = await getSession();
        const token = session?.accessToken;
        log('Session resolved', { hasSession: !!session, token: maskToken(token) });

        if (!token) {
            logError('No access token on session — aborting connect');
            setStatus('error');
            addMessage('system', 'Your session expired. Please sign in again.');
            return;
        }

        // propertyId must travel as a string (already is, via name.split('/')[1]).
        const url = `${AGENT_BASE_URL}/audit/agent/ws?token=${encodeURIComponent(token)}&propertyId=${encodeURIComponent(propertyId)}`;
        log('Opening WebSocket (token masked):', `${AGENT_BASE_URL}/audit/agent/ws?token=${maskToken(token)}&propertyId=${propertyId}`);

        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            log('WebSocket OPEN — handshake succeeded, readyState:', ws.readyState);
            setStatus('connected');
            addMessage('system', 'Connected — agent is starting the audit…');
            // Per spec: send nothing here. The agent speaks first.
        };

        ws.onmessage = (event) => {
            log('WebSocket MESSAGE <<<', event.data);
            if (typeof event.data === 'string' && /error|missing|unauthorized|forbidden/i.test(event.data)) {
                logError('Agent reported an error:', event.data);
            }
            setAwaitingYesNo(isYesNoQuestion(event.data));
            addMessage('agent', event.data);
        };

        ws.onerror = (event) => {
            // The WebSocket spec deliberately hides details on error events
            // (no status code, no body) — onclose below carries whatever the
            // server actually said, if anything.
            logError('WebSocket ERROR event (browser hides details by spec):', event);
            setStatus('error');
            addMessage('system', 'Connection error — the agent link was interrupted.');
        };

        ws.onclose = (event) => {
            log('WebSocket CLOSE', { code: event.code, reason: event.reason, wasClean: event.wasClean });
            wsRef.current = null;
            if (!userClosedRef.current) {
                setStatus('closed');
                addMessage('system', event.reason ? `Session ended: ${event.reason}` : 'Session ended.');
            }
        };
    }, [status, addMessage]);

    const sendMessage = useCallback((text) => {
        if (!text?.trim() || !wsRef.current || status !== 'connected') return;
        log('WebSocket SEND >>>', text);
        wsRef.current.send(text);
        addMessage('user', text);
        // Hide the quick-reply buttons the moment the user answers — they
        // reappear only if the agent asks another yes/no question.
        setAwaitingYesNo(false);
    }, [status, addMessage]);

    const disconnect = useCallback(() => {
        if (status !== 'connecting' && status !== 'connected') {
            log('disconnect() skipped — nothing active', { status });
            return;
        }
        log('disconnect() called');
        userClosedRef.current = true;
        if (wsRef.current) {
            try { wsRef.current.send('exit'); } catch { /* socket may already be closing */ }
            wsRef.current.close();
        }
        wsRef.current = null;
        setStatus('closed');
        setAwaitingYesNo(false);
        addMessage('system', 'Session ended.');
    }, [status, addMessage]);

    return { status, messages, awaitingYesNo, connect, sendMessage, disconnect };
}
