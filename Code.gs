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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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

  // 驗證交易金額
  if (typeof twd !== 'number' || isNaN(twd) || twd < 0) {
    throw new Error('交易金額必須是大於或等於 0 的數字');
  }

  // 計算 USD
  const usd = twd / rate;

  // 新增資料列
  sheet.appendRow([date, rate, twd, usd]);

}

