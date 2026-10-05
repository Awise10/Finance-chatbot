# FinSight frontend deployment

## Render
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_BASE=https://awise10-finance-api.onrender.com`

The backend must allow the frontend origin in `CORS_ALLOWED_ORIGINS` and use `CROSS_SITE_COOKIES=true` when frontend/backend are on separate Render services.

## Sources added to the UI
- NGX / Nigerian Exchange: https://ngxgroup.com/
- CoinGecko: https://www.coingecko.com/
- Alpha Vantage: https://www.alphavantage.co/
- Twelve Data: https://twelvedata.com/
- SEC Nigeria: https://sec.gov.ng/
- Central Bank of Nigeria: https://www.cbn.gov.ng/

The source panel distinguishes data providers from regulatory/reference sources. It does not claim every source is used for every response.
