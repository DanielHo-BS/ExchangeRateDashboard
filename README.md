# Exchange Rate Dashboard (Google Apps Script)

這是一個使用 Google Apps Script 製作的匯率與交易金額管理工具。

## 功能

- 在側邊欄輸入日期、匯率與 TWD 交易金額，並寫入 Google 試算表。
- 自動計算 USD 金額（TWD / 匯率）。
- 讀取試算表資料並用 Google Charts 繪製匯率與交易金額的雙軸折線圖。
- 輸入資料具備基本防呆檢查。
- 日期欄格式固定只顯示年月日。

## 使用方式

1. 打開 Google 試算表，進入 Apps Script 編輯器。
2. 建立 `Code.gs` 與 `Sidebar.html`，貼上對應程式碼。
3. 儲存並回試算表，重新整理頁面。
4. 點選選單「匯率工具」->「開啟側邊欄」。
5. 使用側邊欄新增資料或查看圖表。

## 未來可擴充

- 日期區間過濾
- 多幣種匯率比較
- 即時 API 串接更新
- 匯率波動率與預測
