import axios from "axios";
import * as cheerio from "cheerio"

export async function extractTextfromWeb(url : string){
    try {
        console.log("Fetching web page" , url);

        const response = await axios.get(url , {
            headers: {
                "User-Agent" : "Mozilla/5.0 (compatible; SummarizationBot/1.0)"
            },
            timeout: 10000,
        })

        console.log("Web page fetched , size:" , response.data.length, "characters");

        const $ = cheerio.load(response.data)

        $("script").remove()
    $("style").remove()
    $("nav").remove()
    $("footer").remove()
    $("header").remove()
    $(".advertisement").remove()
    $(".ad").remove()
    $(".social-share").remove()

    let text = ""

    const contenteSelectors = [
         "article",
      'div[class*="content"]',
      'div[class*="article"]',
      'div[class*="post"]',
      "main",
      ".entry-content",
      ".post-content",
      ".article-content",
    ]

    for(const selector of contenteSelectors){
        const content = $(selector).first().text()
        if(content && content.length > text.length){
            text = content
        }
    }

   if (!text || text.length < 100) {
      text = $("p")
        .map((i, el) => $(el).text())
        .get()
        .join("\n\n")
    } 

    text = text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n") 
      .trim()

      console.log("Text extracted, length" , text.length , "characters");

      if(!text || text.length < 50){
        throw new Error("Could not extract meaningful content from web page")
      }

      return text
        
    } catch (error) {
        console.log("Web extraction Error" , error);
        throw new Error(`Failed to extract text from web page: ${(error as Error).message}`)
        
    }
}