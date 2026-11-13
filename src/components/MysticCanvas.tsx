import { useEffect, useRef, useState } from 'react';
import { WeatherType } from '../types/game';
import { MysticWorldEngine } from '../scene/MysticWorldEngine';

export interface MysticCanvasProps {
  lives: number;
  maxLives: number;
  weatherOverride: WeatherType | null;
  pulseKey: number;
  shakeKey: number;
  onWeatherChange: (weather: WeatherType) => void;
  onThunderStrike: (intensity: number) => void;
  onAtmosphereUpdate: (windStrength: number, rainIntensity: number) => void;
}

export function MysticCanvas({
  lives,
  maxLives,
  weatherOverride,
  pulseKey,
  shakeKey,
  onWeatherChange,
  onThunderStrike,
  onAtmosphereUpdate,
}: MysticCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<MysticWorldEngine | null>(null);
  const [contextLost, setContextLost] = useState(false);

  const callbacksRef = useRef({
    onWeatherChange,
    onThunderStrike,
    onAtmosphereUpdate,
  });
  callbacksRef.current = {
    onWeatherChange,
    onThunderStrike,
    onAtmosphereUpdate,
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const engine = new MysticWorldEngine(el, {
      onWeatherChange: (w) => callbacksRef.current.onWeatherChange(w),
      onThunderStrike: (i) => callbacksRef.current.onThunderStrike(i),
      onAtmosphereUpdate: (wind, rain) => callbacksRef.current.onAtmosphereUpdate(wind, rain),
      onContextLost: (lost) => setContextLost(lost),
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setLives(lives, maxLives);
  }, [lives, maxLives]);

  useEffect(() => {
    if (weatherOverride) {
      engineRef.current?.setWeather(weatherOverride);
    }
  }, [weatherOverride]);

  useEffect(() => {
    if (pulseKey > 0) {
      engineRef.current?.triggerSuccessPulse();
    }
  }, [pulseKey]);

  useEffect(() => {
    if (shakeKey > 0) {
      engineRef.current?.triggerErrorShake();
    }
  }, [shakeKey]);

  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-[#070a10]">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      {contextLost && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#070a10]/90 text-slate-200 z-50">
          <p className="text-sm">3D sahne yeniden yükleniyor...</p>
        </div>
      )}
    </div>
  );
}
