# Model

Sign in via openrouter.ai and create a token for the Gemini (free) model

List models:
```bash
aider --list-models gemini/
aider --list-models mistral
```

Set model:
```bash
aider --model gemini/gemini-2.5-pro-exp-03-25
aider --model openrouter/mistralai/mistral-7b-instruct
```

# Run

```bash
npm run install:all --legacy-peer-deps
npm start
```

This will install all dependencies for both frontend and backend, and start both servers concurrently.

The frontend will be available at http://localhost:4200 and the backend at http://localhost:3000.
