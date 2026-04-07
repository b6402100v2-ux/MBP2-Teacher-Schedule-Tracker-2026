function doGet(e) {
  // เวลาคนเปิดลิงก์เว็บ จะให้แสดงหน้า Index.html
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Academy of Magic 🌸')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 🌟 กรณี: โหลดข้อมูล (Load) เมื่อเปิดเว็บ
    if (payload.action === 'load') {
      var dbSheet = ss.getSheetByName("AppDB");
      if (!dbSheet) {
        dbSheet = ss.insertSheet("AppDB");
        dbSheet.getRange("A1").setValue("{}");
      }
      var data = dbSheet.getRange("A1").getValue();
      if (!data) data = "{}";
      return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
    }

    // 🌟 กรณี: บันทึกข้อมูล (Save)
    if (payload.action === 'save') {
      // 1. บันทึกสถิติและตารางสอนต้นแบบ (AppDB)
      if (payload.appData) {
        var dbSheet = ss.getSheetByName("AppDB");
        if (!dbSheet) dbSheet = ss.insertSheet("AppDB");
        dbSheet.getRange("A1").setValue(JSON.stringify(payload.appData));
      }

      // 2. บันทึกการเช็คชื่อรายวัน (ลงชีต บันทึกการสอน)
      if (payload.newRecords && payload.newRecords.length > 0) {
        var logSheet = ss.getSheetByName("บันทึกการสอน");
        if (!logSheet) {
           logSheet = ss.insertSheet("บันทึกการสอน");
           // สร้างหัวตาราง
           logSheet.appendRow(["วันที่", "ระดับชั้น", "คาบที่", "วิชา", "ครูผู้สอน", "สถานะ", "ผู้สอนแทน", "Mana ที่ได้"]);
           logSheet.getRange("A1:H1").setFontWeight("bold").setBackground("#ffb5e8");
        }
        
        for (var i = 0; i < payload.newRecords.length; i++) {
          var rec = payload.newRecords[i];
          logSheet.appendRow([
            rec.Date, rec.Class, rec.Period, rec.Subject, 
            rec.TeacherName, rec.Status, rec.SubstituteName, rec.ManaEarned
          ]);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
