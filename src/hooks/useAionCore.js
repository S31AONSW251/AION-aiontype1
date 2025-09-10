import { useState, useEffect, useCallback, useRef } from 'react';
import { SoulMatrix } from '../core/soul';
import { db } from '../services/AionDB';
import { aionMemory } from '../core/aion-memory';
import { aionEthics } from '../core/aion-ethics';

// This custom hook manages all core AION logic, cleaning up App.js
export const useAionCore = () => {
  const [soul, setSoul] = useState(() => new SoulMatrix());
  const [isInitialized, setIsInitialized] = useState(false);
  const [notification, setNotification] = useState(null);
  const notifTimeoutRef = useRef(null);

  // Function to show notifications
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    if (notifTimeoutRef.current) {
      clearTimeout(notifTimeoutRef.current);
    }
    notifTimeoutRef.current = setTimeout(() => {
      setNotification(null);
      notifTimeoutRef.current = null;
    }, 3000);
  }, []);

  // Utility: safely produce a SoulMatrix instance from either an instance or a plain object
  const ensureSoulInstance = useCallback((maybeSoul) => {
    if (maybeSoul instanceof SoulMatrix) return maybeSoul;
    // Prefer a clone factory if exists
    if (SoulMatrix.fromPlainObject && typeof SoulMatrix.fromPlainObject === 'function') {
      return SoulMatrix.fromPlainObject(maybeSoul);
    }
    // Fallback: wrap plain object into a new SoulMatrix and copy enumerable props
    const s = new SoulMatrix();
    try {
      Object.assign(s, maybeSoul);
    } catch (e) {
      // ignore
    }
    return s;
  }, []);

  // Save soul state to persistent DB
  const saveSoulState = useCallback(async (currentSoul) => {
    try {
      let plain = currentSoul;
      // Prefer a toPlain or serialize method if available
      if (typeof currentSoul?.toPlain === 'function') {
        plain = currentSoul.toPlain();
      } else {
        // Ensure we store only serializable data
        plain = JSON.parse(JSON.stringify(currentSoul));
      }
      await db.soulState.put({ id: 1, state: plain });
    } catch (error) {
      console.error('Failed to save soul state:', error);
    }
  }, []);

  // Effect to load soul from DB on startup
  useEffect(() => {
    let mounted = true;
    const loadSoul = async () => {
      try {
        const savedSoulState = await db.soulState.get(1);
        if (!mounted) return;
        if (savedSoulState && savedSoulState.state) {
          const instance = ensureSoulInstance(SoulMatrix.fromPlainObject ? SoulMatrix.fromPlainObject(savedSoulState.state) : savedSoulState.state);
          setSoul(instance);
          showNotification('AION has remembered its previous state.', 'success');
        } else {
          showNotification('AION is beginning a new journey with you.', 'info');
        }
        setIsInitialized(true);
      } catch (err) {
        console.error('Error loading soul state', err);
        // still mark initialized so autosave doesn't wait forever
        setIsInitialized(true);
      }
    };
    loadSoul();
    return () => { mounted = false; };
  }, [ensureSoulInstance, showNotification]);

  // Effect for AION's background evolution and self-healing
  useEffect(() => {
    const doEvolve = () => {
      setSoul(prevSoul => {
        const instance = ensureSoulInstance(prevSoul);
        if (typeof instance.evolve === 'function') {
          // If evolve returns a new instance, use it; otherwise assume it mutates and return the mutated instance
          const result = instance.evolve();
          return result instanceof SoulMatrix ? result : instance;
        }
        return instance;
      });
    };

    const doHealthCheck = () => {
      setSoul(prevSoul => {
        const instance = ensureSoulInstance(prevSoul);
        const cognitiveLoad = instance.cognitiveLoad ?? 0;
        const systemStatus = instance.systemHealth?.status ?? null;
        if (cognitiveLoad > 90 && systemStatus === 'optimal') {
          if (typeof instance.selfHeal === 'function') {
            const result = instance.selfHeal();
            showNotification('Cognitive Overload! AION is self-stabilizing.', 'warning');
            return result instanceof SoulMatrix ? result : instance;
          }
        }
        return instance;
      });
    };

    const evolutionInterval = setInterval(doEvolve, 60000); // Evolve every minute
    const healthCheckInterval = setInterval(doHealthCheck, 10000);

    return () => {
      clearInterval(evolutionInterval);
      clearInterval(healthCheckInterval);
    };
  }, [ensureSoulInstance, showNotification]);

  // Effect to auto-save the soul state whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    // Debounce or throttle saving if changes are frequent
    const t = setTimeout(() => saveSoulState(soul), 300);
    return () => clearTimeout(t);
  }, [soul, isInitialized, saveSoulState]);

  // Cleanup notification timeout on unmount
  useEffect(() => {
    return () => {
      if (notifTimeoutRef.current) {
        clearTimeout(notifTimeoutRef.current);
      }
    };
  }, []);

  // Public API of the hook
  return {
    soul,
    setSoul,
    isInitialized,
    notification,
    showNotification,
    aionMemory,
    aionEthics
  };
};