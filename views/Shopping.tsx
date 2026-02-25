
import React, { useState } from 'react';
import { ShoppingItem, ItineraryItem } from '../types';

interface ShoppingProps {
  shoppingItems: ShoppingItem[];
  setShoppingItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  itineraryItems: ItineraryItem[];
  isReadOnly?: boolean;
}

const Shopping: React.FC<ShoppingProps> = ({ shoppingItems, setShoppingItems, itineraryItems, isReadOnly = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [amountCurrency, setAmountCurrency] = useState('JPY');
  const [itineraryId, setItineraryId] = useState('');
  const [selectedDateForItinerary, setSelectedDateForItinerary] = useState('');
  const [forWhom, setForWhom] = useState('');
  const [activeBuyer, setActiveBuyer] = useState('全部');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const buyers = ['全部', ...Array.from(new Set(shoppingItems.map(item => item.forWhom || '自己'))).sort()];
  const itineraryDates: string[] = Array.from(
    new Set<string>(
      itineraryItems
        .filter(item => 
          item.activity && 
          item.activity.trim() !== "" && 
          item.activity !== "新行程" &&
          item.date && 
          item.date.includes('-') // Ensure it's a valid date string
        )
        .map(item => item.date)
    )
  ).sort();

  const filteredItinerariesForSelect = itineraryItems
    .filter(item => 
      item.date === selectedDateForItinerary && 
      item.activity && 
      item.activity.trim() !== "" && 
      item.activity !== "新行程"
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const handleAdd = () => {
    if (isReadOnly) return;
    if (name.trim()) {
      if (editingItemId) {
        setShoppingItems(prev => prev.map(item => 
          item.id === editingItemId ? {
            ...item,
            name,
            amount: Number(amount) || 0,
            currency: amountCurrency,
            itineraryItemId: itineraryId || undefined,
            forWhom: forWhom.trim() || '自己',
            image
          } : item
        ));
        setEditingItemId(null);
      } else {
        const newItem: ShoppingItem = {
          id: Date.now().toString(),
          name,
          amount: Number(amount) || 0,
          currency: amountCurrency,
          isChecked: false,
          itineraryItemId: itineraryId || undefined,
          forWhom: forWhom.trim() || '自己',
          image
        };
        setShoppingItems(prev => [...prev, newItem]);
      }
      setName('');
      setAmount('');
      setItineraryId('');
      setSelectedDateForItinerary('');
      setForWhom('');
      setImage(undefined);
      setIsAdding(false);
    }
  };

  const handleEdit = (item: ShoppingItem) => {
    if (isReadOnly) return;
    setName(item.name);
    setAmount(item.amount.toString());
    setAmountCurrency(item.currency);
    setForWhom(item.forWhom || '');
    setImage(item.image);
    
    if (item.itineraryItemId) {
      const linked = itineraryItems.find(i => i.id === item.itineraryItemId);
      if (linked) {
        setSelectedDateForItinerary(linked.date);
        setItineraryId(linked.id);
      }
    } else {
      setSelectedDateForItinerary('');
      setItineraryId('');
    }
    
    setEditingItemId(item.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCheck = (id: string) => {
    if (isReadOnly) return;
    setShoppingItems(prev => prev.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const removeItem = (id: string) => {
    if (isReadOnly) return;
    if(confirm('確定要刪除此購物項目嗎？')) {
      setShoppingItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredItems = (activeBuyer === '全部' 
    ? shoppingItems 
    : shoppingItems.filter(item => (item.forWhom || '自己') === activeBuyer))
    .sort((a, b) => {
      const itineraryA = itineraryItems.find(i => i.id === a.itineraryItemId);
      const itineraryB = itineraryItems.find(i => i.id === b.itineraryItemId);

      // Primary sort: Time (Date + StartTime)
      const timeA = itineraryA ? `${itineraryA.date} ${itineraryA.startTime}` : '9999-12-31 23:59';
      const timeB = itineraryB ? `${itineraryB.date} ${itineraryB.startTime}` : '9999-12-31 23:59';
      
      if (timeA !== timeB) {
        return timeA.localeCompare(timeB);
      }

      // Secondary sort: For Whom
      const whomA = a.forWhom || '自己';
      const whomB = b.forWhom || '自己';
      return whomA.localeCompare(whomB);
    });

  const summaryByCurrency = filteredItems
    .filter(item => item.isChecked)
    .reduce((acc, item) => {
      acc[item.currency] = (acc[item.currency] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>);

  const currenciesInSummary = Object.keys(summaryByCurrency);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold serif-font tracking-widest text-[#222]">購物清單</h2>
          <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">
            {activeBuyer} 的清單：{filteredItems.filter(i => i.isChecked).length} / {filteredItems.length}
          </p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => { 
              if(isAdding) {
                setIsAdding(false);
                setEditingItemId(null);
                setName('');
                setAmount('');
                setItineraryId('');
                setSelectedDateForItinerary('');
                setForWhom('');
                setImage(undefined);
              } else {
                setIsAdding(true);
              }
            }}
            className={`text-[10px] font-bold tracking-widest px-4 py-2 rounded-full transition-all uppercase border ${
              isAdding ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-[#333] text-[#333]'
            }`}
          >
            {isAdding ? '取消' : '新增清單'}
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {buyers.map(buyer => (
          <button
            key={buyer}
            onClick={() => setActiveBuyer(buyer)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border ${
              activeBuyer === buyer 
                ? 'bg-[#333] text-white border-[#333] shadow-md' 
                : 'bg-white text-gray-400 border-[#f1f1f1]'
            }`}
          >
            {buyer}
          </button>
        ))}
      </div>

      <div className="bg-[#8a7a5d] p-5 rounded-3xl shadow-lg text-white relative overflow-hidden">
        <div className="absolute top-[-20px] right-[-20px] opacity-10">
          <i className="fas fa-coins text-8xl"></i>
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-2">
            {activeBuyer === '全部' ? '已購買總金額' : `應向 ${activeBuyer} 收取`}
          </p>
          {currenciesInSummary.length > 0 ? (
            <div className="space-y-1">
              {currenciesInSummary.map(curr => (
                <div key={curr} className="flex items-baseline gap-2">
                  <span className="text-[10px] font-bold opacity-60">{curr}</span>
                  <span className="text-2xl font-bold serif-font leading-none">
                    {summaryByCurrency[curr].toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xl font-bold serif-font opacity-40 italic">尚未有購買紀錄</p>
          )}
        </div>
      </div>

      {isAdding && !isReadOnly && (
        <div className="bg-white p-6 rounded-3xl border border-[#f1f1f1] minimal-shadow space-y-4 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 gap-2">
            <input 
              type="text" placeholder="想買什麼？" 
              value={name} onChange={e => setName(e.target.value)}
              className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100" 
            />
            <input 
              type="text" placeholder="幫誰買？" 
              value={forWhom} onChange={e => setForWhom(e.target.value)}
              className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100" 
            />
          </div>
          
          <div className="flex gap-2">
            <input 
              type="number" placeholder="金額" 
              value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 min-w-0 text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100" 
            />
            <select 
              value={amountCurrency} 
              onChange={e => setAmountCurrency(e.target.value)}
              className="w-20 flex-shrink-0 bg-gray-50 border-none rounded-xl px-2 text-[10px] font-bold text-[#8a7a5d] outline-none"
            >
              <option value="JPY">JPY</option>
              <option value="TWD">TWD</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-bold text-gray-400 uppercase ml-1">物品照片網址 (選填)</p>
            <div className="flex gap-3">
              <input 
                type="url" 
                placeholder="貼上圖片 URL..." 
                value={image || ''} 
                onChange={e => setImage(e.target.value)}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" 
              />
              {image && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={image} className="w-full h-full object-cover" alt="preview" />
                  <button onClick={() => setImage(undefined)} className="absolute top-0 right-0 bg-black/50 text-white w-4 h-4 text-[8px] flex items-center justify-center"><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-50">
            <p className="text-[9px] font-bold text-gray-400 uppercase ml-1">關聯行程 (選填)</p>
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={selectedDateForItinerary} 
                onChange={e => { setSelectedDateForItinerary(e.target.value); setItineraryId(''); }}
                className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none"
              >
                <option value="">{itineraryDates.length > 0 ? '選擇日期' : '請先建立行程'}</option>
                {itineraryDates.map((date: string) => (
                  <option key={date} value={date}>{date.split('-').slice(1).join('/')}</option>
                ))}
              </select>
              <select 
                value={itineraryId} 
                onChange={e => setItineraryId(e.target.value)}
                disabled={!selectedDateForItinerary}
                className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none disabled:opacity-50"
              >
                <option value="">{selectedDateForItinerary ? '選擇行程' : '請先選日期'}</option>
                {filteredItinerariesForSelect.map(it => (
                  <option key={it.id} value={it.id}>{it.activity}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full bg-[#333] text-white py-3 rounded-xl font-bold text-sm tracking-widest shadow-md active:scale-95 transition-transform"
          >
            {editingItemId ? '儲存變更' : '新增到清單'}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-20 text-center text-gray-300 italic text-xs tracking-widest uppercase border-2 border-dashed border-gray-100 rounded-3xl">
            {activeBuyer === '全部' ? '購物清單空空的' : `${activeBuyer} 目前沒有項目`}
          </div>
        ) : (
          filteredItems.map(item => {
            const linkedItinerary = itineraryItems.find(i => i.id === item.itineraryItemId);
            return (
              <div key={item.id} className={`group bg-white p-4 rounded-2xl border transition-all flex items-center justify-between ${item.isChecked ? 'opacity-60 border-transparent' : 'border-[#f1f1f1] minimal-shadow'}`}>
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleCheck(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      item.isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent'
                    } ${isReadOnly ? 'cursor-default' : ''}`}
                  >
                    <i className="fas fa-check text-[10px]"></i>
                  </button>
                  {item.image && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt="item" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold text-[#333] truncate ${item.isChecked ? 'line-through text-gray-400' : ''}`}>
                        {item.name}
                      </h4>
                      <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${
                        item.isChecked ? 'bg-gray-100 text-gray-300 border-gray-100' : 'bg-[#fcfaf6] text-[#8a7a5d] border-[#e5e1db]'
                      }`}>
                        {item.forWhom || '自己'}
                      </span>
                    </div>
                    {linkedItinerary && (
                      <p className="text-[9px] text-gray-400 font-bold tracking-widest uppercase mt-0.5">
                        <i className="fas fa-calendar-alt mr-1"></i>
                        {linkedItinerary.date.split('-').slice(1).join('/')} {linkedItinerary.activity}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-xs font-bold serif-font ${item.isChecked ? 'text-gray-300' : 'text-[#222]'}`}>
                      {item.currency} {item.amount.toLocaleString()}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="text-gray-300 hover:text-[#8a7a5d] p-1">
                        <i className="fas fa-pen text-[10px]"></i>
                      </button>
                      <button onClick={() => removeItem(item.id)} className="text-gray-100 hover:text-red-300 p-1">
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Shopping;
