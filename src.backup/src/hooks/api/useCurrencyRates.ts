import { useState, useEffect } from 'react';
import { ExchangeRates } from '@/types';

export const useCurrencyRates = () => {
  const [liveRates, setLiveRates] = useState<ExchangeRates | null>(null);
  const [ratesLastUpdated, setRatesLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      
      const baseCurrencies = {
        ABMY: 'MYR', ABSG: 'SGD', ABASG: 'SGD', ABVN: 'VND',
        ABTH: 'THB', ABID: 'IDR', JPY: 'JPY', USD: 'USD', EUR: 'EUR'
      };

      const processedRates: ExchangeRates = {};
      
      Object.entries(baseCurrencies).forEach(([regionFrom, currencyFrom]) => {
        processedRates[regionFrom] = {};
        Object.entries(baseCurrencies).forEach(([regionTo, currencyTo]) => {
          if (regionFrom !== regionTo) {
            const fromRate = data.rates?.[currencyFrom] ?? 1;
            const toRate = data.rates?.[currencyTo] ?? 1;
            processedRates[regionFrom][regionTo] = toRate / fromRate;
          }
        });
      });

      setLiveRates(processedRates);
      setRatesLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  return { liveRates, ratesLastUpdated, loading, refreshRates: fetchRates };
};
