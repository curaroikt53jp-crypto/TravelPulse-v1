
import React, { useState } from 'react';
import { Flight } from '../types';

interface FlightsProps {
  flights: Flight[];
  setFlights: React.Dispatch<React.SetStateAction<Flight[]>>;
  isReadOnly?: boolean;
}

const Flights: React.FC<FlightsProps> = ({ flights, setFlights, isReadOnly = false }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Flight>>({
    airline: '',
    flightNumber: '',
    departure: '',
    arrival: '',
    departureTime: '',
    arrivalTime: '',
    date: new Date().toISOString().split('T')[0],
    type: 'departure',
    ticketUrl: ''
  });

  const resetForm = () => {
    setFormData({
      airline: '',
      flightNumber: '',
      departure: '',
      arrival: '',
      departureTime: '',
      arrivalTime: '',
      date: new Date().toISOString().split('T')[0],
      type: 'departure',
      ticketUrl: ''
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const date = new Date(dateStr);
    const wk = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    return `${m}/${d} (${wk})`;
  };

  const handleSaveFlight = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    if (formData.airline && formData.flightNumber && formData.departure && formData.arrival) {
      if (editingId) {
        setFlights(flights.map(f => f.id === editingId ? { ...formData as Flight, id: editingId } : f));
      } else {
        const flightToAdd: Flight = {
          ...formData as Flight,
          id: Date.now().toString()
        };
        setFlights([...flights, flightToAdd]);
      }
      resetForm();
    }
  };

  const startEdit = (flight: Flight) => {
    if (isReadOnly) return;
    setFormData(flight);
    setEditingId(flight.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeFlight = (id: string) => {
    if (isReadOnly) return;
    setFlights(flights.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold serif-font tracking-widest text-[#222]">{isReadOnly ? '航班紀錄' : (editingId ? '編輯航班' : '航班規劃')}</h2>
        {!isReadOnly && (
          <button 
            onClick={() => { if(isAdding) resetForm(); else setIsAdding(true); }}
            className={`text-[10px] font-bold tracking-widest px-4 py-2 rounded-full transition-all uppercase border ${
              isAdding ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-[#333] text-[#333] hover:bg-[#333] hover:text-white'
            }`}
          >
            {isAdding ? '取消' : '新增航班'}
          </button>
        )}
      </div>

      {isAdding && !isReadOnly && (
        <section className="bg-white rounded-3xl p-6 border border-[#f1f1f1] minimal-shadow animate-in slide-in-from-top-4">
          <h3 className="text-[10px] font-bold text-[#888] tracking-[0.2em] uppercase mb-6">{editingId ? '修改航班資訊' : '航班資訊填寫'}</h3>
          <form onSubmit={handleSaveFlight} className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <select 
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                  className="flex-1 text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                >
                  <option value="departure">去程</option>
                  <option value="return">回程</option>
                </select>
                <input 
                  type="text" placeholder="航空公司 (如: 星宇)" value={formData.airline}
                  onChange={e => setFormData({...formData, airline: e.target.value})}
                  className="flex-[2] text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" placeholder="班次 (如: JX800)" value={formData.flightNumber}
                  onChange={e => setFormData({...formData, flightNumber: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
                <input 
                  type="date" value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" placeholder="出發地 (TPE)" value={formData.departure}
                  onChange={e => setFormData({...formData, departure: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
                <input 
                  type="text" placeholder="抵達地 (NRT)" value={formData.arrival}
                  onChange={e => setFormData({...formData, arrival: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="time" value={formData.departureTime}
                  onChange={e => setFormData({...formData, departureTime: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
                <input 
                  type="time" value={formData.arrivalTime}
                  onChange={e => setFormData({...formData, arrivalTime: e.target.value})}
                  className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase ml-1">電子機票連結 (PDF/圖片網址)</p>
              <input 
                type="url" placeholder="https://..." value={formData.ticketUrl}
                onChange={e => setFormData({...formData, ticketUrl: e.target.value})}
                className="w-full text-sm bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
              />
            </div>

            <button type="submit" className="w-full bg-[#333] text-white py-4 rounded-2xl font-bold text-sm tracking-widest shadow-xl active:scale-[0.98] transition-all">
              {editingId ? '確認修改' : '確認儲存航班'}
            </button>
          </form>
        </section>
      )}

      <div className="space-y-4">
        {flights.length === 0 ? (
          <div className="py-20 text-center text-gray-300 italic text-xs tracking-widest uppercase border-2 border-dashed border-gray-100 rounded-3xl">
            目前無航班紀錄
          </div>
        ) : (
          flights.sort((a,b) => a.date.localeCompare(b.date)).map(flight => (
            <div key={flight.id} className="bg-white p-6 rounded-3xl border border-[#f1f1f1] minimal-shadow group hover:border-[#8a7a5d] transition-all relative">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flight.type === 'departure' ? 'bg-[#8a7a5d] text-white' : 'bg-gray-100 text-[#333]'}`}>
                    <i className={`fas ${flight.type === 'departure' ? 'fa-plane-departure' : 'fa-plane-arrival'} text-xs`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">{flight.type === 'departure' ? '去程' : '回程'}</span>
                      <span className="text-[9px] font-bold text-[#8a7a5d] bg-[#fcfaf6] px-2 py-0.5 rounded border border-[#e5e1db]">
                        {formatDateDisplay(flight.date)}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#333] flex items-center gap-2">
                      {flight.airline}
                      <span className="text-[10px] font-light text-gray-300">{flight.flightNumber}</span>
                    </h3>
                  </div>
                </div>
                {!isReadOnly && (
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(flight)} className="text-gray-200 hover:text-[#8a7a5d] transition-colors">
                      <i className="fas fa-pen text-xs"></i>
                    </button>
                    <button onClick={() => removeFlight(flight.id)} className="text-gray-100 hover:text-red-300 transition-colors">
                      <i className="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center relative">
                <div className="flex-1">
                  <p className="text-2xl font-bold text-[#222] serif-font tracking-tighter">{flight.departure}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{flight.departureTime}</p>
                </div>
                <div className="flex-[1.5] flex flex-col items-center px-4">
                  <div className="w-full h-px bg-gray-100 relative">
                    <i className="fas fa-plane absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-200 text-[10px] rotate-90"></i>
                  </div>
                  <p className="text-[9px] text-gray-300 font-bold tracking-widest uppercase mt-2">
                    {flight.departureTime} - {flight.arrivalTime}
                  </p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-2xl font-bold text-[#222] serif-font tracking-tighter">{flight.arrival}</p>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{flight.arrivalTime}</p>
                </div>
              </div>

              {flight.ticketUrl && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <a href={flight.ticketUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-[#fcfaf6] border border-[#e5e1db] rounded-xl text-[#8a7a5d] text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-[#8a7a5d] hover:text-white transition-all">
                    <i className="fas fa-ticket-alt"></i> 查看電子機票
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Flights;
