import { useState, useEffect } from 'react';

export function useVocabulary(set = 'WK51-55', number = 10, enabled = false) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) {
      setError(null);
      return;
    }

    const maxRetries = 3;
    const retryDelay = 2000;
    const timeoutDuration = 5000;
    let isMounted = true;
    let timeoutId = null;

    const fetchData = async () => {
      setData([]);
      setLoading(true);
      setError(null);

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        if (!isMounted) return;

        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

        try {
          const response = await fetch(`/api/vocabulary/${set}/${number}`, {
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status >= 500) {
              throw new Error(`Internal server error occurred (Status: ${response.status}). Please try again later.`);
            } else if (response.status === 404) {
              throw new Error(`Requested vocabulary set "${set}" was not found on the server (Status: 404).`);
            } else if (response.status === 403 || response.status === 401) {
              throw new Error(`Access denied. Please check your authentication token (Status: ${response.status}).`);
            } else {
              throw new Error(`Unexpected server response (Status: ${response.status}).`);
            }
          }

          const result = await response.json();

          if (isMounted) {
            setData(result);
            setLoading(false);
            return;
          }
        } catch (err) {
          clearTimeout(timeoutId);

          let errorMessage = err.message;
          if (err.name === 'AbortError') {
            errorMessage = `Request timeout after ${timeoutDuration}ms. The server took too long to respond.`;
          } else if (err.message.includes('Failed to fetch')) {
            errorMessage = "Failed to connect to the server. Please verify your network connection or check if the backend is running.";
          }

          console.warn(`Attempt ${attempt}/${maxRetries} failed: ${errorMessage}`);

          if (attempt === maxRetries) {
            if (isMounted) {
              setError(`Failed to load data after ${maxRetries} attempts. ${errorMessage}`);
              setLoading(false);
            }
            return;
          }

          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [set, number, enabled]);

  return { data, loading, error };
}