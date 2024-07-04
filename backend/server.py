import os
import sys
import asyncio
import json

sys.path.append(os.path.abspath(os.path.join('third_party', 'TikTok-Api')))

from flask import Flask, request, jsonify
from flask_cors import CORS
from TikTokApi import TikTokApi
from TikTokApi.api.video import Video

PORT=8888
COUNT=50
ms_token = os.environ.get("ms_token", None) 

async def get_hashtag_videos(tag: str) -> dict:
    videos = []
    async with TikTokApi() as api:
        await api.create_sessions(ms_tokens=[ms_token], num_sessions=1, sleep_after=3, headless=False)
        hashtag = api.hashtag(name=tag)
        count = 0
        async for video in hashtag.videos(count=10):
            if count == COUNT:  break
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

app = Flask(__name__)
CORS(app)

@app.route('/data', methods=['POST'])
async def receive_data():
    try:
        tags = " ".join([str(value) for value in request.get_json().values()])
        print(f"Received tag: {tags}")
        item_list = []
        
        videos = await get_hashtag_videos(tags)  # Await the async function to get videos
        item_list.extend(videos)
        
        return jsonify({'status': 'success', 'data': item_list})
    except Exception as e:
        print("error: ", e)
        return jsonify({'status': "error", 'message': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=PORT)
