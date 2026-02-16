function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('匯率工具')
    .addItem('開啟側邊欄', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('匯率資料讀取');
  SpreadsheetApp.getUi().showSidebar(html);
}

function readExchangeData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  let output = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const timestamp = row[0];
    const rate = row[1];
    const twd = row[2];
    const usd = row[3];
    output.push(`📅 Date: ${timestamp}, 💱 Rate: ${rate}, 🇹🇼 TWD: ${twd}, 🇺🇸 USD: ${usd}`);
  }

  // 回傳結果給前端
  return output;
}

function appendData(dateStr, rate, twd) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheetTotal USD();

  // 驗證日期格式並轉換
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('日期格式錯誤，請輸入有效日期');
  }
  date.setHours(0, 0, 0, 0); // 清除時間部分

  // 驗證匯率
  if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
    throw new Error('匯率必須是大於 0 的數字');
  }

  // Validate TWD amount (allow negative for withdrawals)
  if (typeof twd !== 'number' || isNaN(twd)) {
    throw new Error('交易金額必須為有效數字（正數=存入，負數=提領）');
  }

  // 計算 USD
  const usd = twd / rate;

  // 新增資料列
  sheet.appendRow([date, rate, twd, usd]);

}

function getSummaryStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getRange(2, 5, 1, 3).getValues()[0];  // 第 2 列，第 5~7 欄

  const totalTWD = data[0];
  const totalUSD = data[1];
  const averageRate = data[2];

  return {
    totalTWD,
    totalUSD,
    averageRate
  };
}

function onFormSubmit(e) {
  // Only run when triggered by form submit (e is provided by Google). Manual run has no e.
  if (!e || !e.values) {
    Logger.log('onFormSubmit: no event data (run from Form submit, not manually).');
    return;
  }
  const formData = e.values;

  // Form Responses column order: timestamp, trade date, rate, TWD
  const formTimestamp = formData[0]; // 表單送出時間
  const tradeDateStr = formData[1];  // 交易日期
  const rate = parseFloat(formData[2]); // 匯率
  const twd = parseFloat(formData[3]);  // TWD 金額

  // Validate: rate must be positive; TWD can be negative (withdrawal)
  if (isNaN(rate) || rate <= 0 || isNaN(twd)) {
    Logger.log('❌ Invalid input skipped: rate=' + rate + ' / twd=' + twd);
    return;
  }

  const tradeDate = new Date(tradeDateStr);
  tradeDate.setHours(0, 0, 0, 0);
  // USD = TWD / rate (negative TWD => negative USD for withdrawals)
  const usd = twd / rate;

  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('exchange_rate');
  targetSheet.appendRow([tradeDate, rate, twd, usd]);

}

function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  const alreadySet = triggers.some(trigger =>
    trigger.getHandlerFunction() === 'onFormSubmit' &&
    trigger.getEventType() === ScriptApp.EventType.ON_FORM_SUBMIT
  );

  if (alreadySet) {
    Logger.log('✅ 已經有 onFormSubmit 的觸發器，略過安裝。');
    return;
  }

  const form = FormApp.getActiveForm();  // Container-bound 的話會自動對應
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('✅ 已成功掛上 onFormSubmit 觸發器！');
}

function resetFormSubmitTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'onFormSubmit') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  const form = FormApp.getActiveForm();
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('✅ 已重設 onFormSubmit 觸發器');
}
