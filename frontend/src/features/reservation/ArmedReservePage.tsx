import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { KakaoMap } from './components/KakaoMap';
import { TrainingCenterList } from './components/TrainingCenterList';
import { TrainingCenterModal } from './components/TrainingCenterModal';
import { TRAINING_CENTERS, TrainingCenter } from './data/trainingCenters';

const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const SIDO_LIST = Array.from(new Set(TRAINING_CENTERS.map((center) => center.sido))).sort();

const getZonesForSido = (sido: string) =>
  Array.from(
    new Set(
      TRAINING_CENTERS
        .filter((center) => center.sido === sido)
        .flatMap((center) => center.zones)
    )
  ).sort();

export const ArmedReservePage: React.FC = () => {
  const [selectedSido, setSelectedSido] = useState(SIDO_LIST[0] || '');
  const [selectedZone, setSelectedZone] = useState('');
  const [focusedCenter, setFocusedCenter] = useState<TrainingCenter | null>(null);
  const [highlightedCenterId, setHighlightedCenterId] = useState<string | null>(null);
  const [modalCenter, setModalCenter] = useState<TrainingCenter | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const zones = useMemo(() => getZonesForSido(selectedSido), [selectedSido]);

  useEffect(() => {
    if (selectedZone && !zones.includes(selectedZone)) {
      setSelectedZone('');
    }
  }, [selectedZone, zones]);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLoading(false);
      },
      () => setLocationLoading(false),
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }, []);

  const filteredCenters = useMemo(() => {
    const bySido = TRAINING_CENTERS.filter((center) => center.sido === selectedSido);

    if (!selectedZone) {
      return bySido;
    }

    return bySido.filter((center) => center.zones.includes(selectedZone));
  }, [selectedSido, selectedZone]);

  const sortedCenters = useMemo(() => {
    if (!userLocation) {
      return filteredCenters;
    }

    return filteredCenters
      .map((center) => ({
        ...center,
        distance: haversineKm(userLocation.lat, userLocation.lng, center.lat, center.lng),
      }))
      .sort((left, right) => (left.distance ?? Infinity) - (right.distance ?? Infinity));
  }, [filteredCenters, userLocation]);

  return (
    <div className="space-y-12 w-full">
      <section>
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-[3.5rem] font-extrabold tracking-tighter leading-tight text-on-surface dark:text-white">
              예비군 정보 서비스
            </h1>
            <p className="text-on-surface-variant dark:text-slate-400 mt-2 text-lg">
              내 주변 훈련소 정보와 예약을 한눈에 관리하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={requestUserLocation}
              disabled={locationLoading}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                userLocation
                  ? 'bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 border border-primary/30 dark:border-blue-500/30'
                  : 'bg-surface-container-high dark:bg-slate-800 text-on-surface dark:text-slate-200 border border-outline-variant/30 dark:border-slate-700 hover:bg-surface-dim dark:hover:bg-slate-700'
              }`}
            >
              <span
                className={`material-symbols-outlined text-lg ${locationLoading ? 'animate-spin' : ''}`}
                translate="no"
              >
                {locationLoading ? 'progress_activity' : 'my_location'}
              </span>
              {userLocation ? '내 위치 기준' : '내 위치'}
            </button>
            <label
              htmlFor="sido-select"
              className="text-sm font-medium text-on-surface-variant dark:text-slate-400 whitespace-nowrap"
            >
              지역 선택
            </label>
            <select
              id="sido-select"
              value={selectedSido}
              onChange={(event) => setSelectedSido(event.target.value)}
              className="bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              {SIDO_LIST.map((sido) => (
                <option key={sido} value={sido}>
                  {sido}
                </option>
              ))}
            </select>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(event) => setSelectedZone(event.target.value)}
              className="bg-surface-container-lowest dark:bg-slate-800 border border-outline-variant/30 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm font-medium text-on-surface dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            >
              <option value="">전체 구/군</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8">
          <KakaoMap
            centers={sortedCenters}
            focusedCenter={focusedCenter}
            onMarkerClick={(center) => setHighlightedCenterId(center.id)}
          />
        </div>
        <div className="lg:col-span-4">
          <TrainingCenterList
            centers={sortedCenters}
            isLoading={false}
            onDetailClick={(center) => {
              setFocusedCenter(center);
              setModalCenter(center);
            }}
            highlightedCenterId={highlightedCenterId}
          />
        </div>
      </div>

      {modalCenter && (
        <TrainingCenterModal
          center={modalCenter}
          onClose={() => setModalCenter(null)}
        />
      )}
    </div>
  );
};
