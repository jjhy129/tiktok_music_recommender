import os
import sys
import asyncio
import json
from datetime import datetime
from quart import Quart, request, jsonify
from quart_cors import cors

sys.path.append(os.path.abspath(os.path.join('third_party', 'TikTok-Api')))

from TikTokApi import TikTokApi
from TikTokApi.api.video import Video

PORT = 8888
COUNT = 50
ms_token = os.environ.get("ms_token")
successful_requests = 0

api = None
apiLock = asyncio.Lock()

app = Quart(__name__)
app = cors(app, allow_origin="*")

async def initialize_api():
    global api
    if api is None:
        api = TikTokApi()
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3, headless=False)

async def get_hashtag_videos(tag: str) -> list:
    await initialize_api()
    videos = []
    async with apiLock:
        hashtag = api.hashtag(name=tag)
        count = 0
        async for video in hashtag.videos(count=10):
            if count == COUNT:
                break
            sound = video.sound
            video_info = {
                "title": sound.title,
                "authorName": sound.authorName,
                "duration": sound.duration,
                "play_url": sound.play_url,
                "cover_large": sound.cover_large,
                "stats": sound.stats
            }
            videos.append(video_info)
            count += 1
    return videos

@app.route('/data', methods=['POST'])
async def receive_data():
    global successful_requests
    try:
        data = await request.get_json()
        tags = " ".join([str(value) for value in data.values()])
        print(f"Received tags: {tags}")
        successful_requests += 1
        
        item_list = []
        videos = await get_hashtag_videos(tags)  
        item_list.extend(videos)

        return jsonify({'status': 'success', 'data': item_list})
    except Exception as e:
        print("Error:", e)
        return jsonify({'status': 'error', 'message': str(e)})

async def daily_log_writer():
    global successful_requests
    last_logged_date = datetime.now().date()
    while True:
        current_date = datetime.now().date()
        if current_date > last_logged_date:
            with open('log/access.txt', 'a') as file:
                file.write(f"{last_logged_date}: {successful_requests}\n")
            last_logged_date = current_date
            successful_requests = 0  # Reset the counter
        await asyncio.sleep(3600)  # Check once every hour

@app.before_serving
async def startup():
    asyncio.create_task(daily_log_writer())

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=PORT)
