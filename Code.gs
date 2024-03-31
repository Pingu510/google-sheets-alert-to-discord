// send edit notifs from google sheets to discord
// do not remove these comments
// base code created by rvbautista and continued by Pingu510 on github
// https://github.com/rvbautista/google-sheets-alert-to-discord/
// https://github.com/Pingu510/google-sheets-alert-to-discord

const gid = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getSheetId();

function onHandleEditEvents(editEvent) {
  const range = editEvent.range;
  var eventId = Utilities.getUuid();
  setAtomicScriptProperties("eventTriggerWinner", eventId);

  // OPTIONAL: You might want to save values from each edit here, to be dealt with by the "winner"
  updateRowRemainder(range);

  Logger.log(`Waited with: ${gid} + ${eventId}`);
  
  // delay
  let time = 12*5; // 12 = 60s
  while(time > 0 ){
    Utilities.sleep(5000);   // Wait to see if another Change/Edit event is triggered
    time--;
    if (getAtomicScriptProperties("eventTriggerWinner") != eventId) {
      return;
    }
  }

  Logger.log(`Trigger Winner: ${eventId}`);
  callWebhook(constructMessage());

  // cleanup
  PropertiesService.getScriptProperties().deleteProperty(`${gid}editedRows`);
}

function updateRowRemainder(range){
  let rows = [];

  try {   
    let reminder = JSON.parse(getAtomicScriptProperties(`editedRows`));    
    reminder.forEach((item) => { rows.push(item); });      
  } catch(err) {}
  
  try {
    rows.push(range.getRow());
  } catch(err) {}

  setAtomicScriptProperties(`editedRows`, JSON.stringify(rows));
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


function formatRowRemainder(){
  let rows = "";
  let reminder = JSON.parse(getAtomicScriptProperties(`editedRows`));

  // distinct values, numerical sort and format array
  reminder = [...new Set(reminder)];
  reminder = reminder.sort((a,b) => a-b);
  rows = reminder.value.join(", ");

  return rows;
}

function constructMessage() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var sheetname = sheet.getName();
  var sheetUrl = [GOOGLESPREADSHEET_URL]; // needs to look like this https://docs.google.com/spreadsheets/d/xxxxxxxx/edit#gid= to properly link to correct tab

  return `[${sheetname}](<${sheetUrl}${gid}>) - Row(s) edited: ${formatRowRemainder()}`;
}

function callWebhook(message) {
  var discordWebhookUrl = "[DISCORD_WEBHOOK_URL]";  
  var payload = JSON.stringify({content: message});
  
  var params = {
      method: "POST",
      payload: payload,
      muteHttpExceptions: true,
      contentType: "application/json"
    };

  var response = UrlFetchApp.fetch(discordWebhookUrl, params);
  Logger.log(`Sent: ${payload}`);
}