function myFunction() {
  // set the active spreadsheet
  var spreadsheet = SpreadsheetApp.getActiveSheet();
  // Pull the calendar ID from the sheet
  var calendarId = spreadsheet.getRange("I2").getValue();
  // set the active calendar with the calendar id
  var eventCal = CalendarApp.getCalendarById(calendarId);
  // set the range of cells the script should run in
  // need to look at method that will do this dynamically
  var timeOffReqs = spreadsheet.getRange("B19:H21");
  // The row and column here are relative to the range set in timeOffReqs. 
  // so cell 1 and row 1 would be whatever the first cell is defined in timeOffReqs
  // The row will advance each time through the loop
  // the other col vars are static and are used throughout the loop
  let currentRow = 1
  const eventIdCol = 7
  for (let each_item of timeOffReqs.getValues()){
    // let's define information from the sheet, each time through the loop
    const sheetRequester = each_item[0]
    const sheetStartTime = new Date(each_item[2])
    // set endtime from cell in sheet
    const sheetEndTime = new Date(each_item[3])
    // advance it by one day because google calendar is weird
    sheetEndTime.setDate(sheetEndTime.getDate() + 1)
    const sheetEventDuration = sheetEndTime - sheetStartTime

    let cell = timeOffReqs.getCell(currentRow, eventIdCol)
    // let's check to see if we've already created this event 
    // by checking the sheet for a value in cell (currentRow, eventIdCol)
    if (eventCal.getEventById(cell.getValue())){
      console.log('eventcal exists')
      // since there's something in that cell, let's grab it and store the calendarEvent object to calEvent
      const calEvent = eventCal.getEventById(cell.getValue())
      const eventEndTime = calEvent.getEndTime()
      const eventStartTime = calEvent.getStartTime()
      const calEventDuration = eventEndTime - eventStartTime

      // If either the durations or the start dates don't match, then 
      // let's blow the old event away and make a new one
      if (calEventDuration != sheetEventDuration || eventStartTime.getDate() != sheetStartTime.getDate()){
        console.log('something didnt match')
        // if the two above don't match, let's blow the calEvent away
        calEvent.deleteEvent()
        // delete the id from the sheet
        cell.setValue("")
        // recreate event and 
        // add new id to sheet
        let event = eventCal.createAllDayEvent(sheetRequester, sheetStartTime, sheetEndTime);
        cell.setValue(event.getId())
      }
    } else {
      console.log(`eventcal cell doesn't exist, make new event`)
        let event = eventCal.createAllDayEvent(sheetRequester, sheetStartTime, sheetEndTime);
        cell.setValue(event.getId())

    }
    // might consider a loop that parses row by row rather than using this method
    currentRow = currentRow + 1
  }
}
