# This is the backend where the service is supported

## installation
1. Clone the repository:
```bash
   git clone --recurse-submoduleshttps://github.com/jjhy129/tiktok_music_recommender.git
   cd tiktok-music-recommender/backend
```
2. Install dependencies:
```
pip install -r requirements.txt
python -m playwright install
```
3. Docker deployment
```
bash setup.sh -build
bash setup.sh -start
```
4. Usage
```
python server.py
```