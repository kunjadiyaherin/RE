import time
import httpx
from typing import Dict, Any

# In-memory TTL Cache
_api_cache: Dict[str, Dict[str, Any]] = {}
CACHE_TTL = 900  # 15 minutes

CITY_COORDS = {
    'ahmedabad': {'lat': 23.0225, 'lon': 72.5714, 'state': 'Gujarat'},
    'mumbai': {'lat': 19.0760, 'lon': 72.8777, 'state': 'Maharashtra'},
    'pune': {'lat': 18.5204, 'lon': 73.8567, 'state': 'Maharashtra'},
    'surat': {'lat': 21.1702, 'lon': 72.8311, 'state': 'Gujarat'},
    'bangalore': {'lat': 12.9716, 'lon': 77.5946, 'state': 'Karnataka'},
    'hyderabad': {'lat': 17.3850, 'lon': 78.4867, 'state': 'Telangana'},
    'delhi': {'lat': 28.6139, 'lon': 77.2090, 'state': 'Delhi'}
}

async def get_geocoding(query: str) -> Dict[str, Any]:
    cache_key = f"nom_{query.lower()}"
    now = time.time()
    if cache_key in _api_cache and now - _api_cache[cache_key]['time'] < CACHE_TTL:
        return _api_cache[cache_key]['data']

    url = f"https://nominatim.openstreetmap.org/search?q={query}, India&format=json&addressdetails=1&limit=1"
    headers = {"User-Agent": "PropertyIntelligence/3.0 (FastAPI-RealEstate)"}
    
    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                data = res.json()
                if isinstance(data, list) and len(data) > 0:
                    item = data[0]
                    result = {
                        "displayName": item.get("display_name"),
                        "lat": float(item.get("lat")),
                        "lon": float(item.get("lon")),
                        "osmId": item.get("osm_id"),
                        "address": item.get("address", {})
                    }
                    _api_cache[cache_key] = {'data': result, 'time': now}
                    return result
    except Exception as e:
        print(f"[OSM Geocoding Error]: {e}")

    # Fallback to coords map
    key = query.lower().split()[0]
    coords = CITY_COORDS.get(key, {'lat': 19.0760, 'lon': 72.8777})
    result = {
        "displayName": f"{query}, India",
        "lat": coords['lat'],
        "lon": coords['lon'],
        "osmId": "osm_local"
    }
    return result

async def get_live_weather_and_aqi(lat: float, lon: float, city_name: str = "City") -> Dict[str, Any]:
    cache_key = f"meteo_{lat:.2f}_{lon:.2f}"
    now = time.time()
    if cache_key in _api_cache and now - _api_cache[cache_key]['time'] < CACHE_TTL:
        return _api_cache[cache_key]['data']

    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
    aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=pm10,pm2_5,us_aqi"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            w_res, a_res = await client.get(weather_url), await client.get(aqi_url)
            weather = w_res.json().get("current_weather", {}) if w_res.status_code == 200 else {}
            aqi = a_res.json().get("current", {}) if a_res.status_code == 200 else {}

            pm25 = aqi.get("pm2_5", 32)
            env_score = max(20, min(100, round(100 - (pm25 * 0.8))))

            result = {
                "cityName": city_name,
                "temperature": weather.get("temperature", 31),
                "windSpeed": weather.get("windspeed", 8),
                "weatherCode": weather.get("weathercode", 0),
                "aqi": {
                    "usAqi": aqi.get("us_aqi", 65),
                    "pm25": pm25,
                    "pm10": aqi.get("pm10", 58),
                    "healthStatus": "Good" if pm25 <= 30 else "Moderate"
                },
                "environmentalLiveabilityScore": env_score
            }
            _api_cache[cache_key] = {'data': result, 'time': now}
            return result
    except Exception as e:
        print(f"[Open-Meteo Error]: {e}")
        return {
            "cityName": city_name,
            "temperature": 30,
            "windSpeed": 9,
            "aqi": {"usAqi": 65, "pm25": 32, "healthStatus": "Moderate"},
            "environmentalLiveabilityScore": 74
        }

async def get_live_forex() -> Dict[str, Any]:
    cache_key = "frankfurter_forex"
    now = time.time()
    if cache_key in _api_cache and now - _api_cache[cache_key]['time'] < 1800:
        return _api_cache[cache_key]['data']

    url = "https://api.frankfurter.dev/v1/latest?from=USD&to=INR,EUR,GBP"
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                inr = data.get("rates", {}).get("INR", 95.82)
                result = {
                    "base": "USD",
                    "date": data.get("date"),
                    "rates": {
                        "INR": inr,
                        "EUR": data.get("rates", {}).get("EUR", 0.88),
                        "GBP": data.get("rates", {}).get("GBP", 0.75),
                        "AED": round(inr / 3.67, 2),
                        "SGD": round(inr / 1.34, 2)
                    }
                }
                _api_cache[cache_key] = {'data': result, 'time': now}
                return result
    except Exception as e:
        print(f"[Frankfurter Error]: {e}")

    return {
        "base": "USD",
        "rates": {"INR": 95.82, "EUR": 0.88, "GBP": 0.75, "AED": 26.11, "SGD": 71.51}
    }

async def get_live_india_macroeconomics() -> Dict[str, Any]:
    cache_key = "worldbank_macro"
    now = time.time()
    if cache_key in _api_cache and now - _api_cache[cache_key]['time'] < 3600:
        return _api_cache[cache_key]['data']

    cpi_url = "https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&per_page=5"
    gdp_url = "https://api.worldbank.org/v2/country/IN/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=5"

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            c_res, g_res = await client.get(cpi_url), await client.get(gdp_url)
            cpi_data = c_res.json() if c_res.status_code == 200 else []
            gdp_data = g_res.json() if g_res.status_code == 200 else []

            latest_cpi = 4.8
            latest_gdp = 6.8

            if len(cpi_data) > 1 and isinstance(cpi_data[1], list):
                for item in cpi_data[1]:
                    if item.get("value") is not None:
                        latest_cpi = round(float(item["value"]), 2)
                        break

            if len(gdp_data) > 1 and isinstance(gdp_data[1], list):
                for item in gdp_data[1]:
                    if item.get("value") is not None:
                        latest_gdp = round(float(item["value"]), 2)
                        break

            result = {
                "country": "India",
                "cpiInflationPercent": latest_cpi,
                "gdpGrowthPercent": latest_gdp,
                "urbanizationAnnualRate": 2.3,
                "rbiRepoRatePercent": 6.5,
                "homeLoanBaseRatePercent": 8.4
            }
            _api_cache[cache_key] = {'data': result, 'time': now}
            return result
    except Exception as e:
        print(f"[World Bank Error]: {e}")

    return {
        "country": "India",
        "cpiInflationPercent": 4.8,
        "gdpGrowthPercent": 6.8,
        "urbanizationAnnualRate": 2.3,
        "rbiRepoRatePercent": 6.5,
        "homeLoanBaseRatePercent": 8.4
    }
