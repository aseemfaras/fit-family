function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName('Orders');

    if (!sheet) {
      sheet = doc.insertSheet('Orders');
      // Headers
      sheet.appendRow([
        'Timestamp', 
        'OrderID', 
        'CustomerName', 
        'Phone', 
        'Email', 
        'Address', 
        'PreferredDateTime', 
        'ItemsJSON', 
        'Subtotal', 
        'Shipping', 
        'Total', 
        'PaymentMethod', 
        'PaymentStatus', 
        'UPI_Ref', 
        'Note'
      ]);
    }

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow() + 1;
    var newRow = [];

    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      var value = e.parameter[header];
      
      // Special handling for timestamp if not provided or just use server time
      if (header === 'Timestamp') {
        value = new Date();
      }
      
      newRow.push(value);
    }

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setup() {
  var doc = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = doc.getSheetByName('Orders');
  
  if (!sheet) {
    sheet = doc.insertSheet('Orders');
    sheet.appendRow([
      'Timestamp', 
      'OrderID', 
      'CustomerName', 
      'Phone', 
      'Email', 
      'Address', 
      'PreferredDateTime', 
      'ItemsJSON', 
      'Subtotal', 
      'Shipping', 
      'Total', 
      'PaymentMethod', 
      'PaymentStatus', 
      'UPI_Ref', 
      'Note'
    ]);
  }
}
