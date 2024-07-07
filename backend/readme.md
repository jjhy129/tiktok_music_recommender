# This is the proxy server

## Discription
This layer functions as a middleware, wrapping the TikTok API and facilitating communication between our frontend and the TikTok database.

## Installation
1. Clone the repository:
```bash
   git clone --recurse-submoduleshttps://github.com/jjhy129/tiktok_music_recommender.git
   cd tiktok-music-recommender/backend
```
2. Install dependencies on local environment
```
# python version 3.9+
pip install -r requirements.txt
python -m playwright install
```
3. Docker deployment (alternative)
```
# Docker version 24.0.7, build 24.0.7-0ubuntu4
bash setup.sh -build
bash setup.sh -start
```
4. Usage
```
python server.py
```