from fastapi import FastAPI, HTTPException, Query

import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import uvicorn

app = FastAPI(title="India Real Estate AI Forecasting Engine")

# Base Historical Index dictionary to simulate regional tables
HISTORICAL_SERIES = {
    ("mumbai", "lower parel"): [295000, 302000, 315000, 322000, 335000, 341000, 350000, 358000, 365000],
    ("mumbai", "thane west"): [145000, 150000, 158000, 163000, 169000, 174000, 178000, 182000, 185000],
    ("ahmedabad", "thaltej"): [72000, 74000, 78000, 80500, 85000, 88000, 91500, 93800, 96000],
    ("ahmedabad", "science city"): [65000, 68000, 72000, 75000, 79000, 82000, 85000, 87500, 89000],
    ("pune", "hinjewadi"): [62000, 64000, 66500, 69000, 71500, 73500, 75800, 77500, 79000],
    ("surat", "vesu"): [52000, 54000, 56000, 58200, 60500, 62000, 64000, 66000, 68000]
}

# Timestamps representing fractional years for the quarters above
# Q1 2021, Q3 2021, Q1 2022, Q3 2022, Q1 2023, Q3 2023, Q1 2024, Q3 2024, Q1 2025
X_YEARS = np.array([2021.0, 2021.5, 2022.0, 2022.5, 2023.0, 2023.5, 2024.0, 2024.5, 2025.0]).reshape(-1, 1)

@app.get("/api/health")
def health():
    return {"status": "AI Service Operational", "engine": "scikit-learn", "features": ["LinearRegression"]}

@app.get("/api/forecast")
def forecast(
    city: str = Query(..., description="Target City name"),
    locality: str = Query(..., description="Target Locality name")
):
    city_key = city.lower().strip()
    loc_key = locality.lower().strip()
    
    key = (city_key, loc_key)
    
    # Fallback to general city averages if locality sequence is missing
    if key not in HISTORICAL_SERIES:
        city_averages = {
            "mumbai": [200000, 206000, 212000, 219000, 225000, 230000, 236000, 241000, 246000],
            "ahmedabad": [60000, 62000, 64500, 67000, 69500, 71200, 73000, 75200, 77000],
            "pune": [55000, 56800, 58500, 60200, 62000, 63800, 65500, 67000, 68500],
            "surat": [42000, 43500, 45000, 46200, 47800, 49000, 50200, 51500, 52800],
            "bangalore": [90000, 94000, 99000, 104000, 109000, 115000, 122000, 128000, 134000],
            "hyderabad": [82000, 85000, 89000, 94000, 99000, 105000, 111000, 118000, 124000]
        }
        if city_key in city_averages:
            y_prices = city_averages[city_key]
        else:
            raise HTTPException(status_code=404, detail=f"No regression baseline configured for city: {city}")
    else:
        y_prices = HISTORICAL_SERIES[key]
        
    y = np.array(y_prices)
    
    # Fit Linear Regression Model
    model = LinearRegression()
    model.fit(X_YEARS, y)
    
    # R2 Score calculation (Coeff of Determination)
    r2_score = float(model.score(X_YEARS, y))
    slope = float(model.coef_[0])
    
    # Horizon inputs:
    # 6 Months (2025.5)
    # 1 Year (2026.0)
    # 5 Years (2030.0)
    future_horizons = np.array([[2025.5], [2026.0], [2030.0]])
    predictions = model.predict(future_horizons)
    
    forecast_6m = int(round(predictions[0]))
    forecast_1y = int(round(predictions[1]))
    forecast_5y = int(round(predictions[2]))
    
    # Adjust for logical positive bound
    current_price = y_prices[-1]
    forecast_6m = max(current_price, forecast_6m)
    forecast_1y = max(current_price, forecast_1y)
    forecast_5y = max(current_price, forecast_5y)
    
    # Dynamic Growth Probability indicator based on model R2 and positive slope
    growth_probability = float(min(0.99, max(0.40, r2_score * 0.9 if slope > 0 else 0.40)))
    
    # Simulated logical rental yield (typical Indian yields are 2.5% to 4.5%)
    rental_yield = float(round(3.0 + (slope / 100000), 2))
    rental_yield = max(2.0, min(5.0, rental_yield))
    
    historical_points = []
    quarters = ["Q1 2021", "Q3 2021", "Q1 2022", "Q3 2022", "Q1 2023", "Q3 2023", "Q1 2024", "Q3 2024", "Q1 2025"]
    for q, val in zip(quarters, y_prices):
        historical_points.append({
            "period": q,
            "price": val
        })
        
    return {
        "city": city,
        "locality": locality,
        "modelName": "Scikit-Learn Ordinary Least Squares (OLS) Linear Regression",
        "currentPricePerSqm": current_price,
        "forecast_6m": forecast_6m,
        "forecast_1y": forecast_1y,
        "forecast_5y": forecast_5y,
        "growthProbability": growth_probability,
        "rentalYieldPercent": rental_yield,
        "r2_fit": round(r2_score, 4),
        "historicalPoints": historical_points
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
