import os
import sys
import asyncio
import json

sys.path.append(os.path.abspath(os.path.join('third_party', 'TikTok-Api')))

from quart import Quart, request, jsonify
from quart_cors import cors
from TikTokApi import TikTokApi
from TikTokApi.api.video import Video

PORT = 8888
COUNT = 51
ms_token = os.environ.get("ms_token")

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
    try:
        data = await request.get_json()
        tags = " ".join([str(value) for value in data.values()])
        print(f"Received tags: {tags}")
        item_list = []

        videos = await get_hashtag_videos(tags)  
        item_list.extend(videos)

        return jsonify({'status': 'success', 'data': item_list})
    except Exception as e:
        print("Error:", e)
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=PORT)
