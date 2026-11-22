import { useCallback, useEffect, useState } from 'react';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSun, Droplets, RefreshCw, Sun, Wind } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Quy đổi mã thời tiết WMO của Open-Meteo sang khóa i18n + icon Lucide
function parseWeatherCode(code) {
  if (code === 0) return { key: 'clear', Icon: Sun };
  if (code <= 3) return { key: 'partlyCloudy', Icon: CloudSun };
  if (code === 45 || code === 48) return { key: 'fog', Icon: CloudFog };
  if (code >= 51 && code <= 57) return { key: 'drizzle', Icon: CloudDrizzle };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { key: 'rain', Icon: CloudRain };
  if (code >= 95) return { key: 'storm', Icon: CloudLightning };
  return { key: 'cloudy', Icon: Cloud };
}

/**
 * Widget hiển thị thời tiết & nhiệt độ thời gian thực (Open-Meteo, miễn phí, không cần API key).
 * variant: 'hero' (kính mờ tối cho Hero trang chủ) | 'card' (thẻ sáng/tối chuẩn cho trang chi tiết)
 */
export default function WeatherWidget({
  lat = 19.8067,
  lng = 105.7852,
  locationName,
  variant = 'card',
}) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWeather = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&timezone=Asia%2FBangkok`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather fetch failed');
      const data = await res.json();
      if (data?.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          feelsLike: Math.round(data.current.apparent_temperature),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: Math.round(data.current.wind_speed_10m),
          code: data.current.weather_code,
          updatedAt: new Date(),
        });
      }
    } catch {
      // Giữ dữ liệu cũ nếu có, không làm ảnh hưởng trang chính
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lat, lng]);

  useEffect(() => {
    setLoading(true);
    fetchWeather(false);
    const timer = setInterval(() => fetchWeather(false), 15 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchWeather]);

  const isHero = variant === 'hero';
  const displayName = locationName || t('weather.defaultLocation');

  if (loading && !weather) {
    return (
      <div
        className={`h-16 w-full max-w-sm animate-pulse rounded-2xl ${
          isHero ? 'bg-white/10' : 'bg-surface-2'
        }`}
        aria-label={t('weather.loading')}
      />
    );
  }

  if (!weather) return null;

  const { key, Icon } = parseWeatherCode(weather.code);

  if (isHero) {
    return (
      <div className="inline-flex flex-wrap items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15 text-[#f1d9a0]">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-semibold leading-none">{weather.temp}°C</span>
              <span className="text-xs font-medium text-white/85">{displayName}</span>
            </div>
            <p className="mt-1 text-xs text-white/75">
              {t(`weather.codes.${key}`)} · {t('weather.feelsLike', { temp: weather.feelsLike })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-l border-white/20 pl-3 text-xs text-white/85">
          <span className="inline-flex items-center gap-1" title={t('weather.humidity')}>
            <Droplets className="h-3.5 w-3.5 text-[#f1d9a0]" aria-hidden="true" />
            {weather.humidity}%
          </span>
          <span className="inline-flex items-center gap-1" title={t('weather.wind')}>
            <Wind className="h-3.5 w-3.5 text-[#f1d9a0]" aria-hidden="true" />
            {weather.wind} km/h
          </span>
          <button
            type="button"
            onClick={() => fetchWeather(true)}
            aria-label={t('weather.refresh')}
            title={t('weather.refresh')}
            className="grid h-7 w-7 place-items-center rounded-full text-white/75 transition hover:bg-white/15 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-surface-2/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          {t('weather.liveLabel')}
        </span>
        <button
          type="button"
          onClick={() => fetchWeather(true)}
          aria-label={t('weather.refresh')}
          title={t('weather.refresh')}
          className="grid h-7 w-7 place-items-center rounded-full text-muted transition hover:bg-surface hover:text-brand"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold leading-none text-fg">{weather.temp}°C</span>
            <span className="truncate text-xs text-muted">{t(`weather.codes.${key}`)}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{t('weather.feelsLike', { temp: weather.feelsLike })}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 border-t pt-2.5 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Droplets className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {t('weather.humidity')}: <strong className="font-medium text-fg">{weather.humidity}%</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Wind className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
          {weather.wind} km/h
        </span>
      </div>
    </div>
  );
}
