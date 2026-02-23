
import React, { useState, useEffect } from 'react';
import { ItineraryItem, Hotel } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  initialData?: Partial<ItineraryItem>;
  defaultDate: string;
  hotels: Hotel[];
  onClose: () => void;
  onAdd: (item: Partial<ItineraryItem>) => void;
}

const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, initialData, defaultDate, hotels, onClose, onAdd }) => {
  const [formData, setFormData] = useState<Partial<ItineraryItem>>({
    date: defaultDate,
    startTime: "10:00",
    duration: "1h",
    activity: "",
    location: "",
    locationUrl: "",
    type: "attraction",
    transportation: "步行",
    note: "",
    attachment: ""
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...formData,
          ...initialData,
          locationUrl: initialData.locationUrl || "",
          transportation: initialData.transportation || "步行"
        });
      } else {
        setFormData({
          date: defaultDate,
          startTime: "10:00",
          duration: "1h",
          activity: "",
          location: "",
          locationUrl: "",
          type: "attraction",
          transportation: "步行",
          note: "",
          attachment: ""
        });
      }
    }
  }, [initialData, isOpen, defaultDate]);

  const importBookedHotel = () => {
    const bookedHotel = hotels.find(h => h.isSelected);
    if (bookedHotel) {
      setFormData({
        ...formData,
        activity: bookedHotel.name,
        location: bookedHotel.address,
        locationUrl: bookedHotel.url || "",
        type: 'rest'
      });
    } else {
      alert('尚未在住宿清單中勾選 BOOKED 的飯店');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-end justify-center">
      <div 
        className="w-full max-w-md bg-white rounded-t-[40px] p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold serif-font tracking-widest">{initialData ? '編輯行程' : '新增行程'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 scrollbar-hide">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">日期 / DATE</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={e => setFormData({...formData, date: e.target.value})} 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">抵達時間</label>
              <input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">預計待的時間</label>
              <select 
                value={formData.duration} 
                onChange={e => setFormData({...formData, duration: e.target.value})} 
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none"
              >
                <option value="30m">30 分鐘</option>
                <option value="1h">1 小時</option>
                <option value="1.5h">1.5 小時</option>
                <option value="2h">2 小時</option>
                <option value="3h">3 小時</option>
                <option value="4h">4 小時</option>
                <option value="5h">5 小時</option>
                <option value="全天">全天</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={importBookedHotel}
              className="flex-1 bg-[#8a7a5d]/10 text-[#8a7a5d] py-3 rounded-xl font-bold text-[10px] tracking-widest uppercase border border-[#8a7a5d]/20 active:scale-95 transition-all"
            >
              <i className="fas fa-hotel mr-2"></i> 帶入已訂飯店
            </button>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">行程名稱</label>
            <input type="text" placeholder="想去哪裡？" value={formData.activity} onChange={e => setFormData({...formData, activity: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">類型</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none">
                <option value="attraction">景點</option>
                <option value="food">美食</option>
                <option value="transport">交通</option>
                <option value="rest">休息</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">交通方式</label>
              <select value={formData.transportation} onChange={e => setFormData({...formData, transportation: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none">
                <option value="步行">🚶 步行</option>
                <option value="捷運/地鐵">MRT 捷運/地鐵</option>
                <option value="公車/巴士">🚌 公車/巴士</option>
                <option value="開車/計程車">🚗 開車/計程車</option>
                <option value="火車/高鐵">🚆 火車/高鐵</option>
                <option value="飛機">✈️ 飛機</option>
                <option value="船">🚢 船</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">地點名稱 / 地址</label>
            <input type="text" placeholder="店名或詳細地址" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Google 地圖連結</label>
            <input type="url" placeholder="貼上地圖連結 (選填)" value={formData.locationUrl} onChange={e => setFormData({...formData, locationUrl: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">行程圖片網址</label>
            <div className="flex gap-3">
              <input 
                type="url" 
                placeholder="貼上圖片 URL..." 
                value={formData.attachment} 
                onChange={e => setFormData({...formData, attachment: e.target.value})}
                className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none" 
              />
              {formData.attachment && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                  <img src={formData.attachment} className="w-full h-full object-cover" alt="preview" />
                  <button onClick={() => setFormData({...formData, attachment: ''})} className="absolute top-0 right-0 bg-black/50 text-white w-4 h-4 text-[8px] flex items-center justify-center"><i className="fas fa-times"></i></button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">行程筆記</label>
            <textarea placeholder="寫下一些提醒..." value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm outline-none h-20" />
          </div>

          <button onClick={() => onAdd(formData)} className="w-full bg-[#333] text-white py-4 rounded-2xl font-bold text-sm tracking-widest shadow-xl active:scale-[0.98] transition-all">
            {initialData ? '儲存變更' : '新增到行程'}
          </button>
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
