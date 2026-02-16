/**
 * =============================================================================
 * API CONTRACT (exposed to frontend via google.script.run)
 * =============================================================================
 *
 * getDashboardData()
 *   Parameters: none
 *   Returns: {
 *     transactions: Array<{ dateIso, rate, twd, usd }>,
 *     summary: { totalTWD, totalUSD, averageRate, count },
 *     inflowOutflow: { inflowTWD, outflowTWD, netTWD, inflowUSD, outflowUSD, netUSD },
 *     chartSeries: {
 *       rate: Array<[dateIso, rate, averageRate]>,
 *       twd: Array<[dateIso, twd]>,
 *       assets: Array<[dateIso, cumUSD, cumTWD]>
 *     }
 *   }
 *   All dates are ISO strings. Frontend uses them for display and charts only.
 *
 * addExchangeRecord(dateStr, rate, twd)
 *   Parameters: dateStr (string yyyy-mm-dd), rate (number), twd (number)
 *   Returns: none (throws on validation error)
 *   Appends one row to the active sheet. Validation: valid date, rate > 0, twd is number.
 *
 * showSidebar() / showDashboard()
 *   Parameters: none. Used to open UI.
 * =============================================================================
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('匯率工具')
    .addItem('開啟側邊欄', 'showSidebar')
    .addItem('開啟儀表板', 'showDashboard')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('匯率資料讀取');
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Opens the Dashboard (summary + charts) in a modal dialog for better readability.
 */
function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(880)
    .setHeight(720);
  SpreadsheetApp.getUi().showModalDialog(html, '匯率儀表板');
}

/**
 * Task-oriented API: returns everything the dashboard needs in one call.
 * Backend owns all business logic and computation (summary, inflow/outflow, chart series).
 * Dates returned as ISO strings for frontend display/charts only.
 */
function getDashboardData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  let data = [];
  try {
    const range = sheet.getDataRange();
    if (range) data = range.getValues() || [];
  } catch (e) {
    // Empty sheet or no data range
  }
  if (!data.length || data.length < 2) {
    return {
      transactions: [],
      summary: { totalTWD: 0, totalUSD: 0, averageRate: 0, count: 0 },
      inflowOutflow: { inflowTWD: 0, outflowTWD: 0, netTWD: 0, inflowUSD: 0, outflowUSD: 0, netUSD: 0 },
      chartSeries: { rate: [], twd: [], assets: [] }
    };
  }

  const transactions = [];
  let totalTWD = 0, totalUSD = 0, sumRate = 0;
  let inflowTWD = 0, outflowTWD = 0, inflowUSD = 0, outflowUSD = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const dateVal = row[0];
    const rate = Number(row[1]);
    const twd = Number(row[2]);
    const usd = Number(row[3]);
    if (isNaN(rate) || isNaN(twd) || isNaN(usd)) continue;

    const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
    const dateIso = date.toISOString ? date.toISOString().slice(0, 10) : String(dateVal);

    transactions.push({ dateIso, rate, twd, usd });
    totalTWD += twd;
    totalUSD += usd;
    sumRate += rate;
    if (twd >= 0) {
      inflowTWD += twd;
      inflowUSD += usd;
    } else {
      outflowTWD += twd;
      outflowUSD += usd;
    }
  }

  const count = transactions.length;
  const averageRate = count > 0 ? sumRate / count : 0;
  const summary = { totalTWD, totalUSD, averageRate, count };
  const inflowOutflow = {
    inflowTWD,
    outflowTWD,
    netTWD: inflowTWD + outflowTWD,
    inflowUSD,
    outflowUSD,
    netUSD: inflowUSD + outflowUSD
  };

  // Build chart series (backend owns heavy computation)
  const rateSeries = [['Date', '匯率', '平均匯率']];
  const twdSeries = [['Date', '交易金額 (TWD)']];
  const assetsSeries = [['Date', '總資產 (USD)', '總資產 (TWD)']];
  let cumTWD = 0, cumUSD = 0;

  // Use ISO date strings only (no Date objects) so serialization to client is reliable.
  for (let j = 0; j < transactions.length; j++) {
    const t = transactions[j];
    rateSeries.push([t.dateIso, t.rate, averageRate]);
    twdSeries.push([t.dateIso, t.twd]);
    cumTWD += t.twd;
    cumUSD += t.usd;
    assetsSeries.push([t.dateIso, cumUSD, cumTWD]);
  }

  return {
    transactions,
    summary,
    inflowOutflow,
    chartSeries: {
      rate: rateSeries,
      twd: twdSeries,
      assets: assetsSeries
    }
  };
}

/**
 * Task-oriented API: add one exchange record. Validates and computes USD on backend.
 */
function addExchangeRecord(dateStr, rate, twd) {
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

  // Validate TWD amount (allow negative for withdrawals)
  if (typeof twd !== 'number' || isNaN(twd)) {
    throw new Error('交易金額必須為有效數字（正數=存入，負數=提領）');
  }

  // 計算 USD
  const usd = twd / rate;

  sheet.appendRow([date, rate, twd, usd]);
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
