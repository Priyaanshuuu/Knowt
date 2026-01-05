import {YoutubeTranscript} from 'youtube-transcript'

export async function getVideoTranscript(url : string){
    try {
       const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

        const videoId = videoIdMatch?.[1];
        if(!videoId){
            throw new Error("Invalid Youtube URL!!");
        }

        const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId)

        const fullText = transcriptItems.map(item => item.text).join(' ')

        return{
            videoId,
            text : fullText
        }


    } catch (error) {
        console.log("Error fetching transcript!!" , error);
        throw new Error("Failed to fetch video transcript.")
        
        
    }
}