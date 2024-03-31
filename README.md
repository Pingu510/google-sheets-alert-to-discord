# google-sheets-alert-to-discord
## Function
When Google Sheets is edited, wait for delay and then send to Discord.

## Installation
1. Create google sheet
 * Configure colums, other tabs etc.
 * Select **Extensions** in the toolbar and then **App Scripts**, you will be taken to a new page
2. Building the brains aka. App Scripts
 * Copy the code from this repository and paste into the file "Code.gs" (this could have different names depending on your language but there is only one file by default)
 * Change the values [DISCORD_URL] [GOOGLESPREADSHEET_URL]
3. Create Webhook in Discord
 * Edit the Channel you want to post the update messages to.
 * Select **Integrations** and then **Create Webhook**, customize it to your liking with name and image.
 * Copy the Webhook URL for use later.
[External guide](https://www.lido.app/tutorials/discord-to-google-sheets)