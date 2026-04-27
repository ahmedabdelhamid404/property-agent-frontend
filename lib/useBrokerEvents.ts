"use client";

import { useEffect, useRef, useState } from "react";
import { apiBroker, type BrokerNotification } from "./api";
import { broker } from "./storage";

/**
 * T7 — Live broker SSE consumer hook.
 *
 * Connects to /api/broker/events as soon as a broker is signed in. Reconnects
 * on transient errors (network, proxy timeout) with exponential backoff up
 * to 30s. Fires `onNotification(payload)` for each `event: notification`
 * frame; the consumer (NotificationBell) is responsible for adding to its
 * own list and showing toasts.
 *
 * Heartbeats from the server (`:hb` comments every 25s) keep the connection
 * alive through Render/CDN proxies.
 */
export interface BrokerEventCallbacks {
  onNotification?: (n: BrokerNotification) => void;
  /** Fired when the server emits an ephemeral takeover/handback event. */
  onTakeover?: (payload: { sessionId: number; takenOverAt?: string }) => void;
  onHandback?: (payload: { sessionId: number }) => void;
  onReady?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Returns `connected` boolean for the UI to reflect connection state.
 */
export function useBrokerEvents(callbacks: BrokerEventCallbacks): boolean {
  const [connected, setConnected] = useState(false);
  const cbRef = useRef(callbacks);
  cbRef.current = callbacks;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!broker.getKey()) return;                                                // not signed in

    let es: EventSource | null = null;
    let cancelled = false;
    let backoff = 1000;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (cancelled) return;
      try {
        es = new EventSource(apiBroker.eventsUrl());
      } catch (err) {
        cbRef.current.onError?.(err);
        scheduleReconnect();
        return;
      }

      es.addEventListener("ready", () => {
        backoff = 1000;
        setConnected(true);
        cbRef.current.onReady?.();
      });

      es.addEventListener("notification", (evt: MessageEvent) => {
        try {
          const data = JSON.parse(evt.data) as BrokerNotification;
          cbRef.current.onNotification?.(data);
        } catch {
          // malformed — ignore.
        }
      });

      es.addEventListener("takeover", (evt: MessageEvent) => {
        try {
          cbRef.current.onTakeover?.(JSON.parse(evt.data));
        } catch {}
      });

      es.addEventListener("handback", (evt: MessageEvent) => {
        try {
          cbRef.current.onHandback?.(JSON.parse(evt.data));
        } catch {}
      });

      es.onerror = (err) => {
        // EventSource auto-reconnects on transient network errors, but if the
        // server returns 4xx (auth dropped) we need to back off and retry.
        cbRef.current.onError?.(err);
        setConnected(false);
        es?.close();
        es = null;
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (cancelled) return;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        backoff = Math.min(backoff * 2, 30_000);
        connect();
      }, backoff);
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
      setConnected(false);
    };
  }, []);

  return connected;
}
