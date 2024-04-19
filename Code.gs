// send edit notifs from google sheets to discord
// do not remove these comments
// base code created by rvbautista and continued by Pingu510 on github
// https://github.com/rvbautista/google-sheets-alert-to-discord/
// https://github.com/Pingu510/google-sheets-alert-to-discord

// variables to keep an eye on: 
//  * discordWebhookUrl
//  * time: sets delay, default 5min *optional
//  * sheetUrl: *optional
//  * gidsToIgnore: If there is sheets that should not be included in the notifications *optional 

const gid = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSheetId();
const gidsToIgnore = ["1111111111"];
const discordWebhookUrl = "DISCORD_WEBHOOK_URL";  
const sheetUrl = "GOOGLE_SPREADSHEET_URL"; // needs to look like this https://docs.google.com/spreadsheets/d/xxxxxxxx/edit#gid= to properly link to correct tab


function onHandleEditEvents(editEvent) {
  const range = editEvent.range;
  var eventId = Utilities.getUuid();
  setAtomicScriptProperties("eventTriggerWinner", eventId);

  // OPTIONAL: Are there exclusion cases?
  if(gidsToIgnore.includes(gid.toString())) {
    return;
  } 

  // OPTIONAL: You might want to save values from each edit here, to be dealt with by the "winner"
  updateRowRemainder(range);  
  
  // delay
  let time = 12 * 5; // 12 = 60s * 5 => 5 min
  Logger.log(`Waiting for changes in sheetId: ${gid}`);
  
  // Wait 5s to see if another Change/Edit event is triggered
  while(time > 0 ){
    Utilities.sleep(5000);   
    time--;
    if (getAtomicScriptProperties("eventTriggerWinner") != eventId) {
      Logger.log(`New event for sheetId: ${gid}, canceling current instance.`);
      return;
    }
  }

  Logger.log(`No further changes detected within timeframe, constructing message.`);
  callWebhook(constructMessage());
  cleanup();
}

function setAtomicScriptProperties(property, value) {
  // Wrapping setProperty in a Lock probably isn't necessary since a set should be atomic
  // but just in case...
  var lock = LockService.getScriptLock();
  if (lock.tryLock(5000)) {
    PropertiesService.getScriptProperties().setProperty(gid + property, value);
    lock.releaseLock();
  }
}

function getAtomicScriptProperties(property) {
  return PropertiesService.getScriptProperties().getProperty(gid + property);
}

function cleanup(){
  PropertiesService.getScriptProperties().deleteProperty(`${gid}editedRows`);
}

function updateRowRemainder(range){
  let rows = [];

  // get 'old' edited rows from canceled events
  try {
    let reminder = JSON.parse(getAtomicScriptProperties(`editedRows`));    
    reminder.forEach((item) => { rows.push(item); });      
  } catch(err) {}
  
  // add current row
  try {
    rows.push(range.getRow());
  } catch(err) {}

  setAtomicScriptProperties(`editedRows`, JSON.stringify(rows));
}

function formatRowRemainder(){
  let rows = "";
  let reminder = JSON.parse(getAtomicScriptProperties(`editedRows`));

  // distinct values, numerical sort and format array
  reminder = [...new Set(reminder)];
  reminder = reminder.sort((a,b) => a-b);
  rows = reminder.join(", "); // TODO: grouping like '2-6, 7, 9'

  return rows;
}

function constructMessage() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetname = sheet.getName();
  
  return `[${sheetname}](<${sheetUrl}${gid}>) - Row(s) edited: ${formatRowRemainder()}`;
}

function callWebhook(message) {
  var payload = JSON.stringify({content: message});
  
  var params = {
      method: "POST",
      payload: payload,
      muteHttpExceptions: true,
      contentType: "application/json"
    };

    Logger.log(`Sending: ${payload}`);
    var response = UrlFetchApp.fetch(discordWebhookUrl, params);
}
