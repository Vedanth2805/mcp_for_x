// // mcp.trend.js
// import SerpApi from "google-search-results-nodejs";
// import { config } from "dotenv";

// config();
// const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);

// async function getTrendingNowIndia() {
//   const topics = ["technology", "india", "science", "ai", "sports", "entertainment"];
//   let chosen = topics[Math.floor(Math.random() * topics.length)];

//   let params = {
//     engine: "google_trends_trending_now",
//     geo: "IN",
//     hours: 12,     // time frame
//     hl: "en",
//     category: chosen,           // filter by random topic
//   };

//   return new Promise((resolve, reject) => {
//     search.json(params, (data) => {
//       if (data.error) return reject(new Error(data.error));

//       const trends = (data.trending_searches || [])
//         .slice(0, 5) // top 5
//         .map(item => item.query);

//       resolve({
//         content: [
//           { type: "text", text: `Random category selected: **${chosen}**` },
//           { type: "text", text: `🔥 Trending Now in India (${chosen}):\n` + trends.map((t, i) => `${i+1}. ${t}`).join("\n") }
//         ]
//       });
//     });
//   });
// }

// // Quick test
// getTrendingNowIndia()
//   .then(console.log)
//   .catch(console.error);




// import googleTrends from "google-trends-api";

// const categories = ["tech", "india", "science", "ai", "sports", "movies"];

// export async function trendingSearch(category) {
//   try {
//     const selectedCategory =
//       category || categories[Math.floor(Math.random() * categories.length)];

//     const results = await googleTrends.dailyTrends({
//       geo: "IN",
//     });

//     const parsed = JSON.parse(results);
//     const trends =
//       parsed.default.trendingSearchesDays[0].trendingSearches
//         .map((t) => t.title.query)
//         .slice(0, 5);

//     return {
//       content: [
//         { type: "text", text: `Category: ${selectedCategory}` },
//         {
//           type: "text",
//           text: `🔥 Top Trending Now:\n${trends
//             .map((t, i) => `${i + 1}. ${t}`)
//             .join("\n")}`,
//         },
//       ],
//     };
//   } catch (err) {
//     return {
//       content: [
//         {
//           type: "text",
//           text: `❌ Error fetching trends: ${err.message}`,
//         },
//       ],
//     };
//   }
// }








import SerpApi from "google-search-results-nodejs";
import { config } from "dotenv";

config();

let search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);
  
export async function getTrendingNowIndia() {
  const topics = ["technology", "india", "science", "ai", "sports", "entertainment"];
  let chosen = topics[Math.floor(Math.random() * topics.length)];


  let params = {
    engine: "google_trends_trending_now",
    geo: "IN", // ✅ hardcoded
    hours: 12,
    hl: "en",
    category: chosen,
  };

  let data = await new Promise((resolve, reject) => {
    search.json(params, (res) => {
      if (res.error) return reject(new Error(res.error));
      resolve(res);
    });
  });

  let trends = (data.trending_searches || [])
    .slice(0, 5)
    .map((item) => item.query);

  return {
    content: [
      { type: "text", text: `Random category selected: **${chosen}**` },
      {
        type: "text",
        text:
          `🔥 Trending Now in India :\n` +
          trends.map((t, i) => `${i + 1}. ${t}`).join("\n"),
      },
    ],
  };
}







