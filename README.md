# Finance Assistant Chatbot

An AI chatbot for market analysis — Nigerian markets (NGX equities, naira,
crypto) by default, plus global markets on request — with a security-first
backend. See **THREAT_MODEL.md** for the full step-by-step risk walkthrough.

> **Not financial advice.** This is informational tooling only. See
> THREAT_MODEL.md §6 before presenting this to real users or in Nigeria
> specifically — there are regulatory framing requirements to be aware of.

## Architecture

```
frontend/   React + Vite chat UI (cookie-based auth, no tokens in JS storage)
backend/    Node/Express API
  src/
    config/      env loading + fail-fast validation
    middleware/  auth (JWT), rate limiting, validation, error handling
    routes/      auth, market, chat
    services/    Anthropic AI wrapper, market data adapters (NGX, crypto,
                 Alpha Vantage, Twelve Data)
    models/      SQLite-backed User model (bcrypt, lockout)
    db/          SQLite schema (users, refresh_tokens, chat_messages, audit_events)
THREAT_MODEL.md  full security/risk documentation
```

## Setup

### Backend

```bash
cd backend
cp .env.example .env
# Fill in JWT_ACCESS_SECRET / JWT_REFRESH_SECRET (generate with the command
# in the .env.example comments), ANTHROPIC_API_KEY, and whichever market data
# keys you want (Alpha Vantage / Twelve Data). CoinGecko needs no key.
npm install
npm run dev        # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173, proxies /api to :4000
```

Open http://localhost:5173, register an account, then chat. Pick a market
(NGX / Crypto / Global) and a symbol to pull live data into the conversation
— e.g. market=`ngx`, symbol=`DANGCEM`, or market=`crypto`, symbol=`bitcoin`.

## Market data coverage

| Market key   | Source                          | Key required | Notes |
|--------------|----------------------------------|:---:|-------|
| `ngx`        | Unofficial community NGX source  | No  | Dev/demo grade — see THREAT_MODEL.md §7 before production |
| `crypto`     | CoinGecko                        | No  | Returns USD + NGN price |
| `global`     | Alpha Vantage                    | Yes | `GLOBAL_QUOTE` endpoint |
| `twelvedata` | Twelve Data                      | Yes | Broader global + some African coverage |

Adding a new market is a matter of adding one file under
`backend/src/services/marketAdapters/` and one `case` in
`marketDataService.js` — the rest of the app (validation, chat, caching) is
already generic.

## Before you deploy this for real users

Go through the checklist at the bottom of **THREAT_MODEL.md**. The short
version: real secrets manager, HTTPS in front, MFA, legal review of the
"advice vs analysis" line under SEC Nigeria rules, NDPA/NDPR compliance, and
a licensed NGX data feed instead of the unofficial adapter.
