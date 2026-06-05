// import { getJson } from "serpapi";
// import { config } from "dotenv";

// config();

// const API_KEY = process.env.SERPAPI_API_KEY;

// getJson(
//   {
//     engine: "google_trends_trending_now",
//     geo: "IN",
//     api_key: API_KEY,
//   },
//   (json) => {
//     const trending = json.trending_searches || [];

//     const simplified = trending.map((t) => ({
//       query: t.query,
//       categories: t.categories?.map(c => c.name) || ["Unknown"],
//     }));

//     console.log("Trending searches in India:");
//     simplified.forEach((t, i) => {
//       console.log(`${i + 1}. ${t.query} [Categories: ${t.categories.join(", ")}]`);
//     });
//   }
// );




import { getJson } from "serpapi";
import { config } from "dotenv";
import { fileURLToPath } from "url";

config();

const topics = ["technology", "india", "science", "ai", "sports", "entertainment"];

export async function getTrendingNowIndia() {
  // Randomly choose a category
  const chosenCategory = topics[Math.floor(Math.random() * topics.length)];
  console.log("Selected category:", chosenCategory);

  // Wrap callback-based getJson into a Promise
  const data = await new Promise((resolve, reject) => {
    getJson(
      {
        engine: "google_trends_trending_now",
        geo: "IN",
        api_key: process.env.SERPAPI_API_KEY,
      },
      (json) => {
        if (!json?.trending_searches) return reject(new Error("No trending searches found"));
        console.log("Total trending searches fetched:", json.trending_searches.length);
        resolve(json.trending_searches);
      }
    );
  });

  // Filter for chosen category and map query + category
  const filtered = data
    .filter((t) => t.categories?.some((c) => c.name.toLowerCase() === chosenCategory))
    .slice(0, 5)
    .map((t) => `${t.query} [Category: ${t.categories.map((c) => c.name).join(", ")}]`);

  console.log("Filtered top trends:", filtered);

  return {
    content: [
      { type: "text", text: `Random category selected: **${chosenCategory}**` },
      {
        type: "text",
        text:
          `🔥 Top 5 trending searches in India (${chosenCategory}):\n` +
          (filtered.length > 0 ? filtered.map((t, i) => `${i + 1}. ${t}`).join("\n") : "No trends available"),
      },
    ],
  };
}

// --- Quick test for ES modules ---
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  (async () => {
    try {
      const result = await getTrendingNowIndia();
      console.log("\nMCP Tool Output:\n", result);
    } catch (err) {
      console.error("Error:", err);
    }
  })();
}

