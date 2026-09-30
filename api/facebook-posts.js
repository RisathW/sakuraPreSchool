// Vercel serverless function: returns the latest 3 posts from the Sakura Preschool Facebook page.
// Needs two environment variables in Vercel (Project → Settings → Environment Variables):
//   FB_PAGE_ID     – the page's API id (1032649809940043, not the id in the facebook.com link)
//   FB_PAGE_TOKEN  – a long-lived Page access token (see FACEBOOK-SETUP.md)
// Responses are cached on Vercel's edge for 10 minutes, so Facebook is not hit on every visit.

const GRAPH_VERSION = process.env.FB_GRAPH_VERSION || 'v26.0';
const LIMIT = 3;

function firstImage(post) {
  const att = post.attachments && post.attachments.data && post.attachments.data[0];
  if (att) {
    if (att.media && att.media.image && att.media.image.src) return att.media.image.src;
    const sub = att.subattachments && att.subattachments.data && att.subattachments.data[0];
    if (sub && sub.media && sub.media.image && sub.media.image.src) return sub.media.image.src;
  }
  return post.full_picture || null;
}

module.exports = async function handler(req, res) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!pageId || !token) {
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ error: 'not_configured' }));
    return;
  }

  const fields = [
    'message',
    'created_time',
    'permalink_url',
    'full_picture',
    'attachments{media_type,media,title,subattachments.limit(1){media}}'
  ].join(',');
  // Fetch a few extra so posts without text or a picture (e.g. cover changes) can be skipped.
  const url = 'https://graph.facebook.com/' + GRAPH_VERSION + '/' + encodeURIComponent(pageId) +
    '/posts?fields=' + encodeURIComponent(fields) + '&limit=10&access_token=' + encodeURIComponent(token);

  try {
    const fbRes = await fetch(url);
    const json = await fbRes.json();
    if (!fbRes.ok || json.error) {
      console.error('Facebook API error:', json && json.error ? json.error.message : fbRes.status);
      res.statusCode = 502;
      res.setHeader('Cache-Control', 's-maxage=60');
      res.end(JSON.stringify({ error: 'facebook_error' }));
      return;
    }

    const posts = (json.data || [])
      .map(function (p) {
        const att = p.attachments && p.attachments.data && p.attachments.data[0];
        return {
          id: p.id,
          text: p.message || '',
          date: p.created_time,
          url: p.permalink_url || ('https://www.facebook.com/' + p.id),
          image: firstImage(p),
          isVideo: !!(att && /video/i.test(att.media_type || ''))
        };
      })
      // Skip posts with nothing to show, e.g. shares of content that is no longer available.
      .filter(function (p) { return p.text || p.image; })
      .slice(0, LIMIT);

    res.statusCode = 200;
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    res.end(JSON.stringify({ posts: posts }));
  } catch (err) {
    console.error('Facebook fetch failed:', err);
    res.statusCode = 502;
    res.setHeader('Cache-Control', 's-maxage=60');
    res.end(JSON.stringify({ error: 'fetch_failed' }));
  }
};
