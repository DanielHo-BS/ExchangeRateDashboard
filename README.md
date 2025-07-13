# Exchange Rate Dashboard (Google Apps Script)

> 📊 **A comprehensive exchange rate and transaction management tool built with Google Apps Script**  
> Track TWD/USD exchange rates, manage transaction amounts, and visualize data with interactive dual-axis charts. Perfect for personal finance tracking and currency exchange monitoring.

這是一個使用 Google Apps Script 製作的匯率與交易金額管理工具。

## 📋 功能特色

- ✅ 在側邊欄輸入日期、匯率與 TWD 交易金額，並寫入 Google 試算表
- ✅ 自動計算 USD 金額（TWD / 匯率）
- ✅ 讀取試算表資料並用 Google Charts 繪製匯率與交易金額的雙軸折線圖
- ✅ 輸入資料具備基本防呆檢查
- ✅ 日期欄格式固定只顯示年月日
- ✅ 即時圖表更新和表單重置

## 📸 系統截圖

<div align="center">
  <img src="./images/exchange.png" alt="匯率儀表板系統截圖" width="800" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
  <br>
  <em>匯率儀表板系統介面 - 支援資料輸入與雙軸圖表顯示</em>
</div>

## 🚀 使用方式

### 步驟 1: 設定 Google Apps Script
1. 開啟你的 Google 試算表
2. 點選上方選單「擴充功能」→「Apps Script」，進入 Apps Script 編輯器
3. 在 Apps Script 編輯器中：
   - 新增一個檔案，命名為 `Code.gs`，將主程式碼貼上
   - 新增一個檔案，命名為 `Sidebar.html`，將前端程式碼貼上
4. 儲存所有檔案，然後回到 Google 試算表並重新整理頁面

### 步驟 2: 使用系統
5. 你會在試算表上方看到新的選單「匯率工具」，點選「開啟側邊欄」
6. 在側邊欄即可輸入資料，或點擊按鈕查看匯率與交易金額的雙軸圖表

## 🔮 未來可擴充功能

- 📅 日期區間過濾
- 🌍 多幣種匯率比較
- 🔄 即時 API 串接更新
- 📈 匯率波動率與預測
- 📊 統計分析報表
- 🔔 匯率變動通知

## 🏗️ 系統架構

### 技術架構
- **前端**: HTML + JavaScript + Google Charts
- **後端**: Google Apps Script (Code.gs)
- **資料庫**: Google Sheets
- **圖表**: Google Charts Library

### 系統流程圖

```mermaid
graph TD
    A[Google Sheets] --> B[Apps Script]
    B --> C[Code.gs Backend]
    B --> D[Sidebar.html Frontend]
    
    C --> E[onOpen Function]
    C --> F[showSidebar Function]
    C --> G[readExchangeData Function]
    C --> H[appendData Function]
    
    D --> I[Google Charts Library]
    D --> J[Form Input]
    D --> K[Chart Display]
    
    E --> L[Create Menu '匯率工具']
    F --> M[Show Sidebar UI]
    G --> N[Read Sheet Data]
    H --> O[Write Data to Sheet]
    
    J --> P[Date Input]
    J --> Q[Rate Input]
    J --> R[TWD Amount Input]
    
    P --> S[submitData Function]
    Q --> S
    R --> S
    
    S --> T[Data Validation]
    T --> U{Validation Pass?}
    U -->|Yes| V[Call appendData]
    U -->|No| W[Show Error Message]
    
    V --> O
    O --> X[Calculate USD = TWD/Rate]
    X --> Y[Append Row to Sheet]
    Y --> Z[Success Message]
    Z --> AA[Reset Form]
    AA --> BB[Auto Refresh Chart]
    
    BB --> CC[loadData Function]
    CC --> DD[Call readExchangeData]
    DD --> N
    N --> EE[Parse Data]
    EE --> FF[drawChart Function]
    FF --> GG[Create Google Chart]
    GG --> K
    
    II[Manual Load Button] --> CC
```

### 資料流程圖

```mermaid
sequenceDiagram
    participant User
    participant Sidebar
    participant Code.gs
    participant GoogleSheets
    
    Note over User,GoogleSheets: 初始化流程
    GoogleSheets->>Code.gs: onOpen()
    Code.gs->>GoogleSheets: Create Menu
    
    Note over User,GoogleSheets: 開啟側邊欄
    User->>GoogleSheets: Click Menu
    GoogleSheets->>Code.gs: showSidebar()
    Code.gs->>Sidebar: Load HTML Interface
    
    Note over User,GoogleSheets: 資料輸入流程
    User->>Sidebar: Fill Form (Date, Rate, TWD)
    Sidebar->>Sidebar: submitData() - Validation
    Sidebar->>Code.gs: appendData(date, rate, twd)
    Code.gs->>Code.gs: Validate Input
    Code.gs->>Code.gs: Calculate USD = TWD/Rate
    Code.gs->>GoogleSheets: Append Row [Date, Rate, TWD, USD]
    Code.gs->>Sidebar: Success Response
    Sidebar->>Sidebar: Reset Form & Auto Refresh
    
    Note over User,GoogleSheets: 圖表顯示流程
    User->>Sidebar: Click "讀取並繪製雙軸圖"
    Sidebar->>Code.gs: readExchangeData()
    Code.gs->>GoogleSheets: Get All Data
    GoogleSheets->>Code.gs: Return Data Array
    Code.gs->>Sidebar: Return Formatted Data
    Sidebar->>Sidebar: Parse Data & drawChart()
    Sidebar->>Sidebar: Create Google Chart
    Sidebar->>User: Display Dual-Axis Chart
```

### 錯誤處理流程

```mermaid
flowchart TD
    A[User Input] --> B{Date Valid?}
    B -->|No| C[Show Error: 日期格式錯誤]
    B -->|Yes| D{Rate > 0?}
    D -->|No| E[Show Error: 匯率必須大於0]
    D -->|Yes| F{TWD >= 0?}
    F -->|No| G[Show Error: 交易金額必須>=0]
    F -->|Yes| H[Process Data]
    H --> I[Write to Sheet]
    I --> J[Success Message]
    
    C --> K[Stay on Form]
    E --> K
    G --> K
    J --> L[Reset Form & Refresh Chart]
```

## 📊 Google Sheet 範例格式

請在 Google 試算表中建立如下表格結構（第 1 列為標題）：

| Timestamps | Rate  | TWD   | USD   | Total TWD | Total USD | Average |
|------------|-------|-------|--------|-----------|-----------|---------|
| 2025/01/07 | 32.82 | 20000 | 609.38 | 210000    | 6565.33   | 32.05   |
| 2025/01/22 | 32.70 | 5000  | 152.91 |           |           |         |
| 2025/02/12 | 32.86 | 15000 | 456.48 |           |           |         |
| ...        | ...   | ...   | ...    |           |           |         |

### 欄位說明

- `Timestamps`：交易日期（格式建議為 `yyyy/mm/dd`，可將儲存格設為「日期格式」）
- `Rate`：當日匯率（TWD/USD）
- `TWD`：交易的新台幣金額
- `USD`：由系統自動計算（TWD ÷ Rate）
- `Total TWD`, `Total USD`, `Average`：選填欄位，可用來顯示統計資料

🔸 *由側邊欄輸入資料時，系統會自動寫入 `Timestamps`, `Rate`, `TWD`，並自動計算 `USD` 欄位。*
