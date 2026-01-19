/**
 * Custom hook for video analytics API and WebSocket connection.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = '/api/analytics';
const WS_BASE = 'ws://localhost:8000/ws/analytics';

/**
 * Hook for real-time video analytics via WebSocket.
 *
 * @param {string} videoId - ID of the video to stream analytics for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Whether to connect automatically (default: true)
 * @param {number} options.reconnectDelay - Delay between reconnection attempts in ms (default: 3000)
 * @returns {Object} Analytics state and controls
 */
export function useVideoAnalytics(videoId, options = {}) {
  const { autoConnect = true, reconnectDelay = 3000 } = options;

  const [metrics, setMetrics] = useState({
    peopleCount: 0,
    density: 0,
    congestionStatus: 'free',
    velocity: 0,
    flowRate: 0,
    countTrend: 0
  });

  const [detections, setDetections] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [frameNumber, setFrameNumber] = useState(0);

  // Tier 3 advanced analytics
  const [advancedAnalytics, setAdvancedAnalytics] = useState({
    gates: {},
    dominantFlow: null,
    counterFlowCount: 0,
    counterFlowDetected: false,
    anomalyCount: 0,
    newAnomalies: []
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setError(null);

    try {
      const ws = new WebSocket(`${WS_BASE}/${videoId}`);

      ws.onopen = () => {
        console.log(`WebSocket connected for ${videoId}`);
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.error) {
            setError(data.error);
            return;
          }

          if (data.action === 'ping') {
            ws.send(JSON.stringify({ action: 'pong' }));
            return;
          }

          // Update metrics
          if (data.metrics) {
            setMetrics(data.metrics);
          }

          // Update detections
          if (data.detections) {
            setDetections(data.detections);
          }

          // Update frame number
          if (data.frame_number !== undefined) {
            setFrameNumber(data.frame_number);
          }

          // Update Tier 3 advanced analytics
          if (data.advanced) {
            setAdvancedAnalytics(data.advanced);
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error');
      };

      ws.onclose = (event) => {
        console.log(`WebSocket closed for ${videoId}:`, event.code, event.reason);
        setIsConnected(false);

        // Attempt reconnection if not intentionally closed
        if (shouldReconnectRef.current && event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect to ${videoId}...`);
            connect();
          }, reconnectDelay);
        }
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      setError('Failed to connect');
      setIsLoading(false);
    }
  }, [videoId, reconnectDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'Intentional disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
  }, []);

  // Set zone area
  const setZoneArea = useCallback((areaSqm) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'set_zone_area',
        area_sqm: areaSqm
      }));
    }
  }, []);

  // Set counting line position
  const setCountingLine = useCallback((yPercentage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'set_counting_line',
        y_percentage: yPercentage
      }));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    shouldReconnectRef.current = true;

    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [videoId, autoConnect, connect, disconnect]);

  return {
    // State
    metrics,
    detections,
    isConnected,
    isLoading,
    error,
    frameNumber,
    advancedAnalytics,

    // Actions
    connect,
    disconnect,
    setZoneArea,
    setCountingLine
  };
}

/**
 * Hook for fetching a single frame analysis.
 *
 * @param {string} videoId - ID of the video to analyze
 * @returns {Object} Analysis state and controls
 */
export function useSingleFrameAnalysis(videoId) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (frameNumber = null) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = frameNumber !== null
        ? `${API_BASE}/frame/${videoId}?frame_number=${frameNumber}`
        : `${API_BASE}/frame/${videoId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [videoId]);

  return {
    data,
    isLoading,
    error,
    analyze
  };
}

/**
 * Hook for fetching density analysis.
 *
 * @param {string} videoId - ID of the video
 * @param {number} zoneAreaSqm - Zone area in square meters
 * @returns {Object} Density state and controls
 */
export function useDensityAnalysis(videoId, zoneAreaSqm = 100) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/density/${videoId}?zone_area_sqm=${zoneAreaSqm}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [videoId, zoneAreaSqm]);

  return {
    data,
    isLoading,
    error,
    analyze
  };
}

/**
 * Hook for fetching analytics status.
 *
 * @returns {Object} Status state
 */
export function useAnalyticsStatus() {
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/status`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        setStatus(data);
        setError(null);
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    isLoading,
    error,
    isAvailable: status?.status === 'healthy'
  };
}

/**
 * Fallback hook that uses polling instead of WebSocket.
 * Use this if WebSocket is not available.
 *
 * @param {string} videoId - ID of the video
 * @param {number} intervalMs - Polling interval in ms (default: 2000)
 * @returns {Object} Analytics state
 */
export function useVideoAnalyticsPolling(videoId, intervalMs = 2000) {
  const [metrics, setMetrics] = useState({
    peopleCount: 0,
    density: 0,
    congestionStatus: 'free',
    velocity: 0,
    flowRate: 0,
    countTrend: 0
  });

  const [detections, setDetections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`${API_BASE}/frame/${videoId}`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (isActive) {
          if (data.metrics) {
            setMetrics(data.metrics);
          }
          if (data.detections) {
            setDetections(data.detections);
          }
          setError(null);
          setIsLoading(false);
        }
      } catch (e) {
        if (isActive) {
          setError(e.message);
          setIsLoading(false);
        }
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, intervalMs);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [videoId, intervalMs]);

  return {
    metrics,
    detections,
    isLoading,
    error
  };
}
