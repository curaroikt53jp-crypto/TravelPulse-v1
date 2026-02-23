
import React, { useState, useEffect, useRef } from 'react';
import { DebtItem, Flight, Hotel, ItineraryItem, ShoppingItem } from '../types';

interface DashboardProps {
  destination: string;
  setDestination: (d: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  coverImage: string;
  setCoverImage: (d: string) => void;
  dailyMaps: Record<string, string>;
  setDailyMap: (date: string, url: string) => void;
  debts: DebtItem[];
  addDebt: (desc: string, amount: number, currency: string, payer: string, date: string, id?: string) => void;
  removeDebt: (id: string) => void;
  flights: Flight[];
  hotels: Hotel[];
  itineraryItems: ItineraryItem[];
  shoppingItems: ShoppingItem[];
  onReset: () => void;
  onArchive: () => void;
  isReadOnly?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  destination, setDestination, 
  startDate, setStartDate, 
  endDate, setEndDate,
  coverImage, setCoverImage,
  debts, addDebt, removeDebt,
  flights,
  hotels,
  itineraryItems,
  shoppingItems,
  onReset,
  onArchive,
  isReadOnly = false
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newDebtDesc, setNewDebtDesc] = useState('');
  const [newDebtAmount, setNewDebtAmount] = useState('');
  const [newDebtPayer, setNewDebtPayer] = useState('');
  const [newDebtDate, setNewDebtDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDebtCurrency, setNewDebtCurrency] = useState('TWD');
  
  const [displayCurrency, setDisplayCurrency] = useState<'TWD' | 'JPY' | 'USD'>('TWD');
  const [selectedPayerForSummary, setSelectedPayerForSummary] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [showCoverInput, setShowCoverInput] = useState(false);

  useEffect(() => {
    let timer: number;
    if (confirmReset) {
      timer = window.setTimeout(() => setConfirmReset(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [confirmReset]);

  const rates: Record<'TWD' | 'JPY' | 'USD', number> = { TWD: 1, JPY: 0.21, USD: 32.5 };
  const currentRate = rates[displayCurrency] || 1;

  const calculateTotal = (items: DebtItem[]) => {
    const totalTWD = items.reduce((sum, d) => {
      const itemCurrency = d.currency || 'TWD';
      const itemRate = rates[itemCurrency as keyof typeof rates] || 1;
      return sum + (Number(d.amount) * itemRate);
    }, 0);
    return totalTWD / currentRate;
  };

  const totalDebtDisplay = calculateTotal(debts);
  const uniquePayers = Array.from(new Set(debts.map(d => d.payer))).filter(Boolean).sort();
  const selectedPayerTotalDisplay = calculateTotal(debts.filter(d => d.payer === selectedPayerForSummary));

  const getWeekday = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { weekday: 'short' });
  };

  const handleExport = () => {
    const sortedItinerary = [...itineraryItems].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    const itineraryHtml = Array.from(new Set(sortedItinerary.map(i => i.date))).map(date => {
      const dayItems = sortedItinerary.filter(i => i.date === date);
      return `
        <div class="day-section">
          <div class="day-header">${date.split('-').slice(1).join('/')} (${getWeekday(date)})</div>
          ${dayItems.map(item => `
            <div class="itinerary-item">
              <div class="time">${item.startTime} (${item.duration})</div>
              <div class="activity">${item.activity}</div>
              <div class="location">${item.location}</div>
              ${item.note ? `<div class="note">${item.note}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }).join('');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${destination} - 行程表</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&family=Noto+Serif+TC:wght@700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Noto Sans TC', sans-serif; background: #fdfcfb; color: #4a4a4a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; min-height: 100vh; padding-bottom: 50px; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
    .hero { position: relative; height: 300px; width: 100%; overflow: hidden; }
    .hero img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7), transparent); display: flex; flex-direction: column; justify-content: flex-end; padding: 25px; color: white; }
    .hero h1 { font-family: 'Noto Serif TC', serif; margin: 0; font-size: 28px; }
    .hero p { margin: 5px 0 0; font-size: 14px; opacity: 0.8; }
    .section { padding: 25px; border-bottom: 1px solid #f0f0f0; }
    .section-title { font-family: 'Noto Serif TC', serif; font-size: 18px; color: #333; margin-bottom: 20px; border-left: 4px solid #8a7a5d; padding-left: 12px; }
    .flight-card { background: #fcfaf6; border: 1px solid #e5e1db; padding: 15px; border-radius: 15px; margin-bottom: 10px; }
    .day-section { margin-bottom: 30px; }
    .day-header { font-weight: bold; font-size: 16px; color: #8a7a5d; margin-bottom: 15px; background: #fcfaf6; padding: 8px 15px; border-radius: 10px; }
    .itinerary-item { border-left: 2px solid #eee; margin-left: 10px; padding-left: 20px; position: relative; margin-bottom: 20px; }
    .itinerary-item::before { content: ''; position: absolute; left: -7px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #8a7a5d; }
    .time { font-size: 11px; color: #999; font-weight: bold; }
    .activity { font-weight: bold; font-size: 15px; margin: 3px 0; color: #333; }
    .location { font-size: 12px; color: #8a7a5d; }
    .note { font-size: 12px; color: #666; font-style: italic; background: #f9f9f9; padding: 8px; border-radius: 5px; margin-top: 5px; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .summary-item { background: #f9f9f9; padding: 12px; border-radius: 12px; }
    .summary-item .label { font-size: 10px; color: #999; text-transform: uppercase; font-weight: bold; }
    .summary-item .value { font-size: 16px; font-weight: bold; color: #333; }
    footer { text-align: center; padding: 30px; font-size: 12px; color: #ccc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="hero">
      <img src="${coverImage}" alt="Cover">
      <div class="hero-overlay">
        <h1>${destination}</h1>
        <p>${startDate} ~ ${endDate}</p>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">航班資訊</div>
      ${flights.map(f => `
        <div class="flight-card">
          <div style="font-size: 12px; color: #8a7a5d; font-weight: bold;">${f.type === 'departure' ? '去程' : '回程'} · ${f.airline} ${f.flightNumber}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <div>
              <div style="font-size: 18px; font-weight: bold;">${f.departure}</div>
              <div style="font-size: 12px; color: #999;">${f.departureTime}</div>
            </div>
            <div style="color: #ddd;">→</div>
            <div style="text-align: right;">
              <div style="font-size: 18px; font-weight: bold;">${f.arrival}</div>
              <div style="font-size: 12px; color: #999;">${f.arrivalTime}</div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <div class="section-title">每日行程</div>
      ${itineraryHtml || '<div style="color: #ccc; font-style: italic;">尚未規劃行程</div>'}
    </div>

    <div class="section">
      <div class="section-title">費用與代購</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="summary-item">
          <div class="label">總支出 (TWD基準)</div>
          <div class="value">${calculateTotal(debts).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="label">購物清單</div>
          <div class="value">${shoppingItems.length} 項目</div>
        </div>
      </div>
    </div>

    <footer>Generated by TravelPulse AI</footer>
  </div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${destination}_行程總覽.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (newDebtDesc && newDebtAmount && newDebtPayer) {
      addDebt(newDebtDesc, parseFloat(newDebtAmount), newDebtCurrency, newDebtPayer, newDebtDate, editingId || undefined);
      setNewDebtDesc('');
      setNewDebtAmount('');
      setNewDebtPayer('');
      setEditingId(null);
    }
  };

  const startEdit = (debt: DebtItem) => {
    if (isReadOnly) return;
    setEditingId(debt.id);
    setNewDebtDesc(debt.description);
    setNewDebtAmount(debt.amount.toString());
    setNewDebtPayer(debt.payer);
    setNewDebtDate(debt.date);
    setNewDebtCurrency(debt.currency || 'TWD');
  };

  const departureFlight = flights.find(f => f.type === 'departure');
  const returnFlight = flights.find(f => f.type === 'return');
  const selectedHotels = (hotels || []).filter(h => h.isSelected);

  const handleResetClick = () => {
    if (confirmReset) {
      onReset();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Hero */}
      <div className="relative h-64 rounded-3xl overflow-hidden minimal-shadow group">
        <img src={coverImage} alt="Trip Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1 flex-1">
              <input 
                type="text" value={destination} onChange={(e) => !isReadOnly && setDestination(e.target.value)}
                readOnly={isReadOnly}
                className={`bg-transparent text-white text-3xl font-bold border-none outline-none focus:ring-0 w-full serif-font ${isReadOnly ? 'cursor-default' : ''}`}
                placeholder="目的地"
              />
              <div className="flex items-center gap-2 text-white/80 text-xs font-light">
                <div className="flex items-center gap-1">
                  <input type="date" value={startDate} readOnly={isReadOnly} onChange={(e) => !isReadOnly && setStartDate(e.target.value)} className={`bg-transparent border-none p-0 w-24 focus:ring-0 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`} />
                  <span className="opacity-60">({getWeekday(startDate)})</span>
                </div>
                <span>~</span>
                <div className="flex items-center gap-1">
                  <input type="date" value={endDate} readOnly={isReadOnly} onChange={(e) => !isReadOnly && setEndDate(e.target.value)} className={`bg-transparent border-none p-0 w-24 focus:ring-0 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`} />
                  <span className="opacity-60">({getWeekday(endDate)})</span>
                </div>
              </div>
            </div>
            {!isReadOnly && (
              <div className="flex flex-col items-end gap-2">
                {showCoverInput && (
                  <input 
                    type="url" 
                    placeholder="貼上底圖網址..." 
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    onBlur={() => setShowCoverInput(false)}
                    className="w-48 text-[10px] bg-white/20 backdrop-blur-md text-white border-none rounded-lg px-2 py-1 outline-none placeholder:text-white/50"
                  />
                )}
                <button 
                  onClick={() => setShowCoverInput(!showCoverInput)}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <i className="fas fa-image"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <section>
        <h2 className="text-sm font-bold mb-5 flex items-center gap-2 text-[#888] tracking-[0.2em] serif-font uppercase">行程大綱</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#f1f1f1] minimal-shadow">
            <div className="flex items-center gap-3 mb-4 text-[#333]">
              <i className="fas fa-plane text-xs"></i>
              <span className="text-xs font-bold tracking-widest uppercase">航班資訊</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1 truncate">
                  去程 {departureFlight?.flightNumber && `· ${departureFlight.flightNumber}`}
                </p>
                <p className="text-sm font-bold text-[#444] truncate">
                  {departureFlight ? `${departureFlight.departure} → ${departureFlight.arrival}` : '--'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {departureFlight ? `${departureFlight.departureTime} / ${departureFlight.arrivalTime}` : '--:-- / --:--'}
                </p>
              </div>
              <div className="w-px h-10 bg-gray-100 flex-shrink-0"></div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mb-1 truncate">
                  {returnFlight?.flightNumber && `${returnFlight.flightNumber} · `} 回程
                </p>
                <p className="text-sm font-bold text-[#444] truncate">
                  {returnFlight ? `${returnFlight.departure} → ${returnFlight.arrival}` : '--'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                  {returnFlight ? `${returnFlight.departureTime} / ${returnFlight.arrivalTime}` : '--:-- / --:--'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#f1f1f1] minimal-shadow">
            <div className="flex items-center gap-3 mb-3 text-[#333]">
              <i className="fas fa-hotel text-xs"></i>
              <span className="text-xs font-bold tracking-widest uppercase">住宿安排</span>
            </div>
            <div className="space-y-4">
              {selectedHotels.length === 0 ? (
                <div className="py-2 text-center text-[10px] text-gray-300 italic">尚未選擇入住飯店</div>
              ) : (
                selectedHotels.map(hotel => (
                  <div key={hotel.id} className="flex gap-3">
                    {hotel.images && hotel.images.length > 0 && (
                      <img src={hotel.images[0]} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="thumb" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#444] truncate">{hotel.name}</p>
                      <p className="text-[10px] text-gray-400 truncate flex items-center gap-1">
                        <i className="fas fa-map-marker-alt text-[8px]"></i> {hotel.address}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#8a7a5d] p-6 rounded-2xl shadow-lg relative overflow-hidden text-white">
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-white/70">
                  <i className="fas fa-wallet text-xs"></i>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest uppercase">總欠債</span>
                    <select value={displayCurrency} onChange={(e) => setDisplayCurrency(e.target.value as any)} className="bg-white/10 text-white text-[9px] font-bold border-none p-0 h-4 mt-1 outline-none rounded">
                      <option value="TWD" className="text-black">TWD</option>
                      <option value="JPY" className="text-black">JPY</option>
                      <option value="USD" className="text-black">USD</option>
                    </select>
                  </div>
                </div>
                <span className="text-2xl font-bold serif-font">{displayCurrency} {totalDebtDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold tracking-widest uppercase text-white/60">付款人結算</span>
                  <select 
                    value={selectedPayerForSummary} 
                    onChange={(e) => setSelectedPayerForSummary(e.target.value)}
                    className="bg-white/10 text-white text-[10px] font-bold border-none p-0 h-5 mt-1 outline-none rounded min-w-[100px]"
                  >
                    <option value="" className="text-black">選擇付款人</option>
                    {uniquePayers.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                  </select>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold serif-font">
                    {displayCurrency} {selectedPayerTotalDisplay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Debt Ledger */}
      <section className="bg-white rounded-3xl p-6 border border-[#f1f1f1] minimal-shadow">
        <h2 className="text-sm font-bold mb-6 flex items-center gap-2 text-[#333] tracking-[0.2em] serif-font uppercase">
          {!isReadOnly && editingId ? '修改帳目' : '欠錢記帳本'}
        </h2>
        {!isReadOnly && (
          <form onSubmit={handleAddDebt} className="space-y-3 mb-6">
            <input type="text" placeholder="項目名稱..." value={newDebtDesc} onChange={(e) => setNewDebtDesc(e.target.value)} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
            <input type="text" placeholder="付款人" value={newDebtPayer} onChange={(e) => setNewDebtPayer(e.target.value)} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="金額" 
                value={newDebtAmount} 
                onChange={(e) => setNewDebtAmount(e.target.value)} 
                className="flex-1 min-w-0 text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100" 
              />
              <select 
                value={newDebtCurrency} 
                onChange={(e) => setNewDebtCurrency(e.target.value)} 
                className="w-20 flex-shrink-0 bg-gray-50 border-none rounded-xl px-2 text-[10px] font-bold text-[#8a7a5d] outline-none"
              >
                <option value="TWD">TWD</option>
                <option value="JPY">JPY</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="flex gap-2 items-center">
              <input type="date" value={newDebtDate} onChange={(e) => setNewDebtDate(e.target.value)} className="flex-1 text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
              <div className="flex gap-2">
                {editingId && <button type="button" onClick={() => { setEditingId(null); setNewDebtDesc(''); setNewDebtAmount(''); }} className="bg-gray-100 text-gray-500 px-4 rounded-xl text-xs font-bold">取消</button>}
                <button type="submit" className="bg-[#333] text-white px-5 h-11 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-transform flex-shrink-0">
                  <i className={`fas ${editingId ? 'fa-check' : 'fa-plus'} mr-2 text-xs`}></i>
                  <span className="text-xs font-bold">{editingId ? '修改' : '新增'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {debts.sort((a,b) => b.date.localeCompare(a.date)).map(debt => (
            <div key={debt.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-none group">
              <div className="flex items-center gap-4">
                <div className="text-[9px] text-gray-200 font-bold vertical-text flex flex-col items-center leading-none">
                  <span>{debt.date.split('-').slice(1).join('/')}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#4a4a4a]">{debt.description}</p>
                  <p className="text-[10px] text-gray-300 uppercase">Paid by <span className="text-[#8a7a5d] font-bold">{debt.payer}</span></p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={`text-sm font-bold text-[#8a7a5d]`}>
                    {debt.currency || 'TWD'} {Number(debt.amount).toLocaleString()}
                  </p>
                </div>
                {!isReadOnly && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(debt)} className="text-gray-300 hover:text-[#8a7a5d]"><i className="fas fa-pen text-[10px]"></i></button>
                    <button onClick={() => removeDebt(debt.id)} className="text-gray-100 hover:text-red-300"><i className="fas fa-minus-circle"></i></button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center pt-8 pb-4 space-y-4">
        {!isReadOnly && (
          <button 
            onClick={onArchive}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#8a7a5d] text-white shadow-xl active:scale-95 transition-all"
          >
            <i className="fas fa-archive text-xs"></i>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">歸檔旅程</span>
          </button>
        )}

        <button 
          onClick={handleExport}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-[#333] text-white shadow-xl active:scale-95 transition-all"
        >
          <i className="fas fa-share-alt text-xs"></i>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">匯出/分享旅程</span>
        </button>

        {!isReadOnly && (
          <button 
            onClick={handleResetClick}
            className={`w-full group flex items-center justify-center gap-2 px-6 py-4 rounded-2xl transition-all duration-300 ${
              confirmReset 
              ? 'bg-red-500 text-white shadow-lg ring-4 ring-red-100' 
              : 'bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300'
            }`}
          >
            <i className={`fas ${confirmReset ? 'fa-exclamation-triangle' : 'fa-redo-alt'} text-xs`}></i>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
              {confirmReset ? '確定要清除所有資料嗎？' : '重置旅程資料'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
