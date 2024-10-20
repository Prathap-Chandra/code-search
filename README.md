# code-search

### Demo
https://www.youtube.com/watch?v=srR50wOpVKo

### Slides
https://docs.google.com/presentation/d/1Bh2CKUK2bUlsFV1TuizCk0fHq_rASN5G0lV0Euc2j0Q

### How to run this:

Make a FireWorks api key on fireworks.ai.

```
cd backend
cp .env.example .env
```

Insert the FIREWORKS_API_KEY

Frontend:

```
cd frontend
npm install
npm run dev
```

Backend:
```
cd backend
python -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
python app.py
```

