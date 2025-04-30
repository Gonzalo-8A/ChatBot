export async function searchYouTube(query) {
  try {
    const response = await fetch(`https://chatbot-api-server-dusky.vercel.app/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    const data = await response.json();
    return { videoId: data.videoId, title: data.title };
  } catch (error) {
    console.error("Error searching YouTube:", error);
    return null;
  }
}
