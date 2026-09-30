# Facebook "Latest news" setup

The home page section `#news` shows the 3 newest posts from the Sakura Preschool Facebook page.

- **Without setup**, it shows Facebook's official Page Plugin, a scrollable box with the page's latest posts.
- **With setup**, it shows the 3 newest posts as cards styled like the rest of the site. They update automatically, and changes show up on the site within about 10 minutes of posting.

## One-time setup (about 10 minutes; you must be an admin of the Facebook page)

1. Go to https://developers.facebook.com/apps → **Create app** → choose **Other** → **Business** type
   (or the "Manage everything on your Page" use case). No review is needed because you only read your own page.
2. Open **Tools → Graph API Explorer** (https://developers.facebook.com/tools/explorer):
   - Select your app.
   - Under **User or Page**, choose **Get Page Access Token**, log in, and tick the Sakura page.
   - Add the permissions `pages_show_list`, `pages_read_engagement` and `pages_read_user_content`, then click **Generate Access Token**.
3. Make it long-lived:
   - Open https://developers.facebook.com/tools/debug/accesstoken, paste the token, click **Debug**, then
     **Extend Access Token** at the bottom. Copy the new long-lived *user* token.
   - Back in the Graph API Explorer, paste that token and run `GET me/accounts`.
     The `access_token` shown next to the Sakura page is a **Page token that does not expire**.
     (You can confirm this in the debugger, where "Expires" shows *Never*.)
4. In Vercel, open the project, then **Settings → Environment Variables**, and add:
   - `FB_PAGE_ID` = `1032649809940043` (the API id; the `61560372808466` in the Facebook link does not work here)
   - `FB_PAGE_TOKEN` = the page token from step 3
5. Redeploy the site (Deployments → ⋯ → Redeploy).

Check that it works by opening `https://sakura-pre-school.vercel.app/api/facebook-posts`. You should see JSON with `posts`.

If the token ever stops working (for example after a Facebook password change or a change of page admin), repeat steps 2–5.
The site falls back to the Page Plugin automatically in the meantime, so the section never goes blank.
