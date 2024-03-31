# google-sheets-alert-to-discord
Base code created by [rvbautista](https://github.com/rvbautista/google-sheets-alert-to-discord/) and continued by Pingu510<br>
A lot copied from [Paul Egan on slackoverflow](https://stackoverflow.com/a/62105239) regarding delay timer

## Function
When Google Sheets is edited, check for new edits within delay and then send update message to Discord.

## Installation
### Create google sheet
 * Configure colums, other tabs etc.
 * Select **Extensions** in the toolbar and then **App Scripts**, you will be taken to a new page
### Create Webhook in Discord
 * Click **Edit** on the Channel you want to post the update messages to
 * Select **Integrations** and then **Create Webhook**, customize it to your liking with name and image
 * Copy the Webhook URL for use later.
### Building the brains aka. App Scripts
 * Add a name to the project so you know what it does, eg. "MySheet Discord Notifier" 
 * Copy the code from this repository and paste into the file "Code.gs" (this could have different names depending on your language but there is only one file per default)
 * Replace the values [DISCORD_WEBHOOK_URL] [GOOGLE_SPREADSHEET_URL] with your own
 * Save the file
### Use a Trigger to connect editEvent from the spreadsheet to start the script
 * In Apps Script click **Triggers** in the sidebar and then **Add Trigger**
 * Set the options in this order: <br>
    onHandleEditEvents<br>
    Head<br>
    From spreadsheet<br>
    On Edit <br> 
    Notify me daily (*optional)
 * When you **Save** the Trigger some warnings will pop up to ask you to accept the use of the script, **Accept** these.

[External guide](https://www.lido.app/tutorials/discord-to-google-sheets)

## Potential Errors
* If changes keep happening to the document within the delay's timewindow, nothing will be sent so don't set the $time to a too high value.
* Make sure to use the right event (EDIT) when connecting the script to the spreadsheet, there is one Edit and one Change event.
