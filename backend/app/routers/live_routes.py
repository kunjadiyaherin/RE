from fastapi import APIRouter, Query
from ..services.live_public_apis import (
    get_geocoding, get_live_weather_and_aqi, get_live_forex,
    get_live_india_macroeconomics, CITY_COORDS
)

router = APIRouter(prefix="/live", tags=["Live Public APIs"])

@router.get("/ticker")
async def get_live_ticker():
    forex = await get_live_forex()
    macro = await get_live_india_macroeconomics()
    mumbai_weather = await get_live_weather_and_aqi(CITY_COORDS['mumbai']['lat'], CITY_COORDS['mumbai']['lon'], 'Mumbai')
    ahmedabad_weather = await get_live_weather_and_aqi(CITY_COORDS['ahmedabad']['lat'], CITY_COORDS['ahmedabad']['lon'], 'Ahmedabad')

    return {
        "timestamp": forex.get("date"),
        "forex": forex.get("rates", {}),
        "macro": {
            "cpiInflation": macro.get("cpiInflationPercent", 4.8),
            "gdpGrowth": macro.get("gdpGrowthPercent", 6.8),
            "repoRate": macro.get("rbiRepoRatePercent", 6.5)
        },
        "cities": [
            {
                "name": "Mumbai",
                "temperature": mumbai_weather.get("temperature", 31),
                "aqi": mumbai_weather.get("aqi", {}).get("usAqi", 65),
                "healthStatus": mumbai_weather.get("aqi", {}).get("healthStatus", "Good")
            },
            {
                "name": "Ahmedabad",
                "temperature": ahmedabad_weather.get("temperature", 33),
                "aqi": ahmedabad_weather.get("aqi", {}).get("usAqi", 72),
                "healthStatus": ahmedabad_weather.get("aqi", {}).get("healthStatus", "Moderate")
            }
        ]
    }

@router.get("/geocoding")
async def api_geocoding(q: str = Query(..., description="Location search query")):
    return await get_geocoding(q)

@router.get("/weather")
async def api_weather(lat: float = 19.0760, lon: float = 72.8777, city: str = "Target City"):
    return await get_live_weather_and_aqi(lat, lon, city)

@router.get("/forex")
async def api_forex():
    return await get_live_forex()

@router.get("/macroeconomics")
async def api_macro():
    return await get_live_india_macroeconomics()
