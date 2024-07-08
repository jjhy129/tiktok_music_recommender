# TikTok Music Recommender

## Inspiration

As music enthusiasts, we care deeply about how music conveys emotions and messages in our TikTok content. However, browsing through music lists to find the perfect match for our videos can be time-consuming. We always desired a tool that recommends music fitting the theme of our videos and is popular enough to attract more viewers. This desire led us to create the TikTok music recommendation tool.

## What It Does

This project addresses the need for an easy-to-use tool that allows TikTok users to find appropriate music for their video content based on hashtag inputs and seamlessly combine these media files for demos. <br><br>The goal is to streamline the process of creating engaging video content with music based on preferred video hashtags, calculating the music fitness based on popularity stats, enhancing the user's creative workflow, and enabling better content production for social media platforms.

### Features and Functionality

- #### Tag Input and Music Recommender Algorithm
  - Users can input tags related to their videos.
  - Based on these tags, the system fetches the songs' metadata through the TikTok API from the TikTok server.
  - Songs are ranked through scoring based on the following weights: <br>
    `score = playCount + (diggCount * 2) + (commentCount * 3) + (shareCount * 4);`

- #### Music Player
  - A music bar allows users to play, pause, skip, and return to previous songs.
  - Displays the current song title and artist.
  - Includes a progress bar to visualize and control the music playback.

- #### Video Upload and Editing
  - A video demo popup combines the uploaded video with the selected music.

## Development Process

1. We first researched available TikTok APIs on the market and found an open-source library [TikTok-Api](https://github.com/davidteather/TikTok-Api) that would be particularly useful. After spending some time learning, we made modifications and integrated the library into our code base.
2. We studied the data fetched by the API wrapper and filtered out useful information. Then, we discussed how to make recommendations based on the data we have.
3. We designed the project's architecture and divided the work into frontend and backend. For the frontend, we used Figma and JavaScript for webpage design. For the backend, we needed an intermediate layer to communicate between the TikTok database and our frontend webpage. We used a Flask server integrated with the wrapper library to accomplish this task.
4. We decided to optimize the server by using Python's async library. However, Flask doesn't coexist well with async, so we switched to Quart (a more advanced version of Flask) and achieved a 10x speed increase.
5. Finally, we tested the functionality, fixed bugs (pop-ups, error notices), and improved the layout of the webpage.

## Accomplishments that We're Proud Of

We are proud of creating a tool that recommends music based on hashtags and provides a seamless audio-visual editing experience. Learning tools like Figma and javascript while making the web apps was both challenging and rewarding.

## What We Learned

We learned about integrating third-party APIs, handling large datasets efficiently, and optimizing algorithms for performance. Additionally, we gained insights into designing UI/UX and balancing backend and frontend development.

## What's Next for TikTok Music Recommender Based on Hashtags

Currently, we don't yet have a domain name and SSL credentials, meaning a frontend webpage using "https" is not available (however, we can still experience it by running HTML locally). The next step could be hosting the webpage and letting more people experience this project. We also plan to build our own database if we have many users and make better recommendations based on our database.


## Video Demo

Check out our video demo:

<iframe src="https://vimeo.com/980204435?share=copy" width="560" height="315" frameborder="0" allowfullscreen></iframe>
