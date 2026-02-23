
import React, { useState } from 'react';
import { Hotel } from '../types';

interface HotelsProps {
  hotels: Hotel[];
  setHotels: React.Dispatch<React.SetStateAction<Hotel[]>>;
  isReadOnly?: boolean;
}

const Hotels: React.FC<HotelsProps> = ({ hotels, setHotels, isReadOnly = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Hotel>>({
    name: '',
    rating: 0,
    pricePerPerson: 0,
    currency: 'TWD',
    address: '',
    url: '',
    pros: [],
    cons: [],
    images: [],
    isSelected: false
  });
  
  const [tempPro, setTempPro] = useState('');
  const [tempCon, setTempCon] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  const resetForm = () => {
    setFormData({ name: '', rating: 0, pricePerPerson: 0, currency: 'TWD', address: '', url: '', pros: [], cons: [], images: [], isSelected: false });
    setTempPro('');
    setTempCon('');
    setImageUrlInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveHotel = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (formData.name && formData.address) {
      if (editingId) {
        setHotels(hotels.map(h => h.id === editingId ? { ...formData as Hotel, id: editingId } : h));
      } else {
        const hotelToAdd: Hotel = {
          ...formData as Hotel,
          id: Date.now().toString(),
          pros: formData.pros || [],
          cons: formData.cons || [],
          images: formData.images || [],
          isSelected: false
        };
        setHotels([...hotels, hotelToAdd]);
      }
      resetForm();
    }
  };

  const startEdit = (hotel: Hotel) => {
    if (isReadOnly) return;
    setFormData(hotel);
    setEditingId(hotel.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelect = (id: string) => {
    if (isReadOnly) return;
    setHotels(hotels.map(h => h.id === id ? { ...h, isSelected: !h.isSelected } : h));
  };

  const removeHotel = (id: string) => {
    if (isReadOnly) return;
    setHotels(hotels.filter(h => h.id !== id));
  };

  const addImage = () => {
    const trimmedUrl = imageUrlInput.trim();
    if (trimmedUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), trimmedUrl]
      }));
      setImageUrlInput('');
    }
  };

  const sortedHotels = [...hotels].sort((a, b) => (a.isSelected === b.isSelected ? 0 : a.isSelected ? -1 : 1));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold serif-font tracking-widest text-[#222]">{isReadOnly ? '住宿紀錄' : (editingId ? '編輯飯店' : '住宿比較')}</h2>
        {!isReadOnly && (
          <button 
            onClick={() => { if(isAdding) resetForm(); else setIsAdding(true); }}
            className={`text-[10px] font-bold tracking-widest px-4 py-2 rounded-full border transition-all uppercase ${
              isAdding ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-[#333] text-[#333]'
            }`}
          >
            {isAdding ? '取消' : '新增飯店'}
          </button>
        )}
      </div>

      {isAdding && !isReadOnly && (
        <section className="bg-white rounded-3xl p-6 border border-[#f1f1f1] minimal-shadow animate-in slide-in-from-top-4">
          <form onSubmit={handleSaveHotel} className="space-y-4">
            <input type="text" placeholder="飯店名稱" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
            <input type="text" placeholder="詳細地址" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
            <input type="url" placeholder="飯店官網/訂房網址" value={formData.url || ''} onChange={e => setFormData({...formData, url: e.target.value})} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">飯店照片網址</p>
                <p className="text-[8px] text-gray-400 font-medium italic">(按 Enter 鍵可繼續新增多張)</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  placeholder="貼上圖片直接連結 (需為 .jpg/.png)" 
                  value={imageUrlInput} 
                  onChange={e => setImageUrlInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                  className="flex-1 text-xs bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" 
                />
                <button 
                  type="button"
                  onClick={addImage}
                  className="px-4 rounded-xl bg-[#333] text-white text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
                >
                  新增
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
                {formData.images?.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    <img src={url} className="w-full h-full object-cover" alt="prev" />
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, images: formData.images?.filter((_, idx) => idx !== i)})} 
                      className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase ml-1 mb-1">每晚金額 / 人</p>
                <div className="flex gap-1">
                  <input type="number" placeholder="金額" value={formData.pricePerPerson || ''} onChange={e => setFormData({...formData, pricePerPerson: Number(e.target.value)})} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
                  <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="bg-gray-50 border-none rounded-xl px-2 text-xs font-bold text-[#8a7a5d] outline-none">
                    <option value="TWD">TWD</option><option value="JPY">JPY</option><option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase ml-1 mb-1">評價 (最高 10)</p>
                <input type="number" step="0.1" max="10" placeholder="0-10" value={formData.rating || ''} onChange={e => setFormData({...formData, rating: Math.min(10, Number(e.target.value))})} className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-green-600 uppercase ml-1">優點</p>
                <input type="text" placeholder="按 enter 新增..." value={tempPro} onChange={e => setTempPro(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tempPro) { setFormData({...formData, pros: [...(formData.pros || []), tempPro]}); setTempPro(''); } } }}
                  className="w-full text-[11px] bg-green-50 border-none rounded-xl px-4 py-2 outline-none" />
                <div className="flex flex-wrap gap-1">
                  {formData.pros?.map((p, i) => (
                    <span key={i} className="text-[9px] bg-white text-green-700 border border-green-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {p} <button type="button" onClick={() => setFormData({...formData, pros: formData.pros?.filter((_, idx) => idx !== i)})}><i className="fas fa-times text-[7px]"></i></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-red-600 uppercase ml-1">缺點</p>
                <input type="text" placeholder="按 enter 新增..." value={tempCon} onChange={e => setTempCon(e.target.value)} 
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (tempCon) { setFormData({...formData, cons: [...(formData.cons || []), tempCon]}); setTempCon(''); } } }}
                  className="w-full text-[11px] bg-red-50 border-none rounded-xl px-4 py-2 outline-none" />
                <div className="flex flex-wrap gap-1">
                  {formData.cons?.map((c, i) => (
                    <span key={i} className="text-[9px] bg-white text-red-700 border border-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      {c} <button type="button" onClick={() => setFormData({...formData, cons: formData.cons?.filter((_, idx) => idx !== i)})}><i className="fas fa-times text-[7px]"></i></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button type="submit" className="w-full bg-[#333] text-white py-4 rounded-2xl font-bold text-sm tracking-widest shadow-xl active:scale-[0.98] transition-all">
              {editingId ? '確認修改' : '儲存飯店資訊'}
            </button>
          </form>
        </section>
      )}

      <div className="space-y-6">
        {sortedHotels.map(hotel => (
          <div key={hotel.id} className={`bg-white rounded-3xl border transition-all overflow-hidden ${hotel.isSelected ? 'border-[#8a7a5d] ring-1 ring-[#8a7a5d] shadow-lg' : 'border-[#f1f1f1] minimal-shadow'}`}>
            {hotel.images && hotel.images.length > 0 && (
              <div className="relative h-56 bg-gray-100">
                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full">
                  {hotel.images.map((img, i) => (
                    <img key={i} src={img} className="flex-shrink-0 w-full snap-start object-cover" alt={`${hotel.name} ${i}`} />
                  ))}
                </div>
                {hotel.images.length > 1 && (
                  <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[8px] font-bold tracking-widest uppercase">
                    <i className="fas fa-images mr-1"></i> {hotel.images.length} Photos
                  </div>
                )}
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {hotel.isSelected && <span className="text-[8px] bg-[#8a7a5d] text-white px-2 py-0.5 rounded-full font-bold uppercase">Booked</span>}
                    <div className="text-[10px] text-yellow-500 flex items-center gap-1 font-bold"><i className="fas fa-star"></i>{hotel.rating} / 10</div>
                  </div>
                  {hotel.url ? (
                    <a href={hotel.url} target="_blank" rel="noreferrer" className="block group">
                      <h3 className="text-lg font-bold text-[#222] serif-font leading-tight group-hover:text-[#8a7a5d] transition-colors">
                        {hotel.name} <i className="fas fa-external-link-alt text-[10px] ml-1 opacity-30"></i>
                      </h3>
                    </a>
                  ) : (
                    <h3 className="text-lg font-bold text-[#222] serif-font leading-tight">{hotel.name}</h3>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleSelect(hotel.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center border ${hotel.isSelected ? 'bg-[#8a7a5d] border-[#8a7a5d] text-white' : 'bg-white border-gray-200 text-transparent'}`}><i className="fas fa-check text-[10px]"></i></button>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(hotel)} className="text-gray-300 hover:text-[#8a7a5d] transition-colors">
                        <i className="fas fa-pen text-[10px]"></i>
                      </button>
                      <button onClick={() => removeHotel(hotel.id)} className="text-gray-100 hover:text-red-300 transition-colors">
                        <i className="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`} target="_blank" rel="noreferrer" className="flex-1 group">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Address</p>
                    <p className="text-[11px] text-[#8a7a5d] group-hover:underline"><i className="fas fa-map-marker-alt text-[9px] mr-1"></i>{hotel.address}</p>
                  </a>
                  <div className="text-right ml-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 tracking-widest">Per Person</p>
                    <p className="text-lg font-bold text-[#222] serif-font leading-none">{hotel.currency} {hotel.pricePerPerson.toLocaleString()}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Pros</p>
                    <div className="flex flex-wrap gap-1">
                      {hotel.pros.length > 0 ? hotel.pros.map((p, i) => <span key={i} className="text-[9px] text-green-700 bg-green-50 px-2 py-1 rounded-md">{p}</span>) : <span className="text-[9px] text-gray-200 italic">None</span>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Cons</p>
                    <div className="flex flex-wrap gap-1">
                      {hotel.cons.length > 0 ? hotel.cons.map((c, i) => <span key={i} className="text-[9px] text-red-700 bg-red-50 px-2 py-1 rounded-md">{c}</span>) : <span className="text-[9px] text-gray-200 italic">None</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hotels;
