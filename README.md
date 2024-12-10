1. Go through [notion integration guide](https://developers.notion.com/docs/create-a-notion-integration#getting-started) and get the API secret
2. Create the page in notion and get the ID of the page (share page -> get ID from URL)
2. Create `.env` file from `.env_example`, and set the secret and page ID
3. Connect the notion page to the integration (top-right 3 dots and scroll to the bottom -> Connect to -> *your integration*)
5. Run `node main.js`