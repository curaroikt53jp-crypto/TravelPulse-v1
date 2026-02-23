
import React, { useState, useEffect } from 'react';
import { ViewType, DebtItem, ItineraryItem, Flight, Hotel, ShoppingItem, ArchivedTrip } from './types';
import Dashboard from './views/Dashboard';
import Flights from './views/Flights';
import Hotels from './views/Hotels';
import Itinerary from './views/Itinerary';
import Shopping from './views/Shopping';
import BottomNav from './components/BottomNav';
import QuickAddModal from './components/QuickAddModal';
import { saveTripData, loadTripData, getArchives, archiveTrip as saveToArchives, deleteArchive } from './services/firebaseService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [destination, setDestination] = useState<string>("東京 / 日本");
  const [startDate, setStartDate] = useState<string>("2024-10-15");
  const [endDate, setEndDate] = useState<string>("2024-10-20");
  const [coverImage, setCoverImage] = useState<string>("https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop");
  
  const [dailyMaps, setDailyMaps] = useState<Record<string, string>>({});
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingItineraryItem, setEditingItineraryItem] = useState<ItineraryItem | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // History related
  const [archives, setArchives] = useState<ArchivedTrip[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isViewingArchive, setIsViewingArchive] = useState(false);

  const applyTripData = (data: any) => {
    if (data.destination) setDestination(data.destination);
    if (data.startDate) setStartDate(data.startDate);
    if (data.endDate) setEndDate(data.endDate);
    if (data.coverImage) setCoverImage(data.coverImage);
    if (data.dailyMaps) setDailyMaps(data.dailyMaps);
    if (data.debts) setDebts(data.debts);
    if (data.flights) setFlights(data.flights);
    if (data.hotels) setHotels(data.hotels);
    if (data.itineraryItems) setItineraryItems(data.itineraryItems);
    if (data.shoppingItems) setShoppingItems(data.shoppingItems);
  };

  const loadCurrentTrip = async () => {
    setIsInitialLoad(true);
    setIsViewingArchive(false);
    const data = await loadTripData();
    if (data) {
      applyTripData(data);
    }
    setIsInitialLoad(false);
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    loadCurrentTrip();
  }, []);

  useEffect(() => {
    if (!isInitialLoad && !isViewingArchive) {
      const timer = setTimeout(() => {
        saveTripData({
          destination, startDate, endDate, coverImage, dailyMaps,
          debts, flights, hotels, itineraryItems, shoppingItems
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [destination, startDate, endDate, coverImage, dailyMaps, debts, flights, hotels, itineraryItems, shoppingItems, isInitialLoad, isViewingArchive]);

  const handleResetTrip = () => {
    setDestination("新旅程");
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setCoverImage("https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2094&auto=format&fit=crop");
    setDailyMaps({});
    setDebts([]);
    setFlights([]);
    setHotels([]);
    setItineraryItems([]);
    setShoppingItems([]);
    setIsViewingArchive(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleArchive = async () => {
    const archiveData: ArchivedTrip = {
      id: '',
      timestamp: Date.now(),
      destination,
      startDate,
      endDate,
      coverImage,
      data: { destination, startDate, endDate, coverImage, dailyMaps, debts, flights, hotels, itineraryItems, shoppingItems }
    };
    await saveToArchives(archiveData);
    alert('旅程已成功歸檔到歷史紀錄！');
  };

  const openHistory = async () => {
    setIsHistoryOpen(true);
    const data = await getArchives();
    setArchives(data.sort((a: any, b: any) => b.timestamp - a.timestamp));
  };

  const viewArchive = (archive: ArchivedTrip) => {
    setIsViewingArchive(true);
    applyTripData(archive.data);
    setIsHistoryOpen(false);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteArchive = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除這筆歷史紀錄嗎？')) {
      await deleteArchive(id);
      const data = await getArchives();
      setArchives(data.sort((a: any, b: any) => b.timestamp - a.timestamp));
    }
  };

  const handleQuickAdd = (item: Partial<ItineraryItem>) => {
    if (isViewingArchive) return;
    if (editingItineraryItem) {
      setItineraryItems(itineraryItems.map(i => i.id === editingItineraryItem.id ? { ...i, ...item } as ItineraryItem : i));
    } else {
      const newItem: ItineraryItem = {
        id: Date.now().toString(),
        date: item.date || startDate,
        startTime: item.startTime || "10:00",
        duration: item.duration || "1h",
        activity: item.activity || "新行程",
        location: item.location || "",
        locationUrl: item.locationUrl || "",
        type: item.type || 'attraction',
        transportation: item.transportation || '步行',
        note: item.note || "",
        attachment: item.attachment || ""
      };
      setItineraryItems([...itineraryItems, newItem]);
    }
    setIsQuickAddOpen(false);
    setEditingItineraryItem(null);
  };

  const renderView = () => {
    const commonProps = {
      destination, setDestination, 
      startDate, setStartDate, 
      endDate, setEndDate,
      coverImage, setCoverImage,
      debts, addDebt: (desc: string, amount: number, currency: string, payer: string, date: string, id?: string) => {
        if (isViewingArchive) return;
        if (id) {
          setDebts(debts.map(d => d.id === id ? { id, description: desc, amount, currency, payer, date } : d));
        } else {
          setDebts([...debts, { id: Date.now().toString(), description: desc, amount, currency, payer, date }]);
        }
      },
      removeDebt: (id: string) => !isViewingArchive && setDebts(debts.filter(d => d.id !== id)),
      flights, setFlights,
      hotels, setHotels,
      itineraryItems,
      shoppingItems,
      dailyMaps, setDailyMap: (date: string, url: string) => !isViewingArchive && setDailyMaps(prev => ({ ...prev, [date]: url })),
      onReset: handleResetTrip,
      onArchive: handleArchive,
      isReadOnly: isViewingArchive
    };
    
    if (isInitialLoad) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-[#333] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">載入中...</p>
      </div>
    );

    switch (currentView) {
      case 'dashboard': return <Dashboard {...commonProps} />;
      case 'flights': return <Flights flights={flights} setFlights={setFlights} isReadOnly={isViewingArchive} />;
      case 'hotels': return <Hotels hotels={hotels} setHotels={setHotels} isReadOnly={isViewingArchive} />;
      case 'itinerary': return (
        <Itinerary 
          destination={destination} 
          items={itineraryItems} 
          setItems={setItineraryItems} 
          onEdit={(item) => { setEditingItineraryItem(item); setIsQuickAddOpen(true); }}
          onRemove={(id) => setItineraryItems(itineraryItems.filter(i => i.id !== id))}
          startDate={startDate}
          endDate={endDate}
          dailyMaps={dailyMaps}
          onSetDailyMap={(date, url) => setDailyMaps(prev => ({ ...prev, [date]: url }))}
          shoppingItems={shoppingItems}
          setShoppingItems={setShoppingItems}
          isReadOnly={isViewingArchive}
        />
      );
      case 'shopping': return (
        <Shopping 
          shoppingItems={shoppingItems} 
          setShoppingItems={setShoppingItems} 
          itineraryItems={itineraryItems} 
          isReadOnly={isViewingArchive}
        />
      );
      default: return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen pb-20 max-w-md mx-auto shadow-2xl overflow-x-hidden border-x border-[#eee] transition-colors duration-500 ${isViewingArchive ? 'bg-[#f8f5f0]' : 'bg-[#fdfcfb]'}`}>
      <header className={`sticky top-0 z-50 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b transition-colors ${isViewingArchive ? 'bg-[#f8f5f0]/90 border-[#e5e1db]' : 'bg-[#fdfcfb]/90 border-[#f1f1f1]'}`}>
        <button onClick={loadCurrentTrip} className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className={`${isViewingArchive ? 'text-[#8a7a5d]' : 'text-[#333]'}`}><i className="fas fa-paper-plane text-xl rotate-12"></i></div>
          <div className="flex flex-col items-start leading-none">
            <h1 className="text-xl font-bold tracking-widest text-[#222] serif-font">TravelPulse</h1>
            {isViewingArchive && <span className="text-[8px] font-bold text-[#8a7a5d] uppercase tracking-[0.2em] mt-0.5">歷史紀錄瀏覽中</span>}
          </div>
        </button>
        <div className="flex items-center gap-2">
          {!isViewingArchive && (
            <button 
              onClick={() => { setEditingItineraryItem(null); setIsQuickAddOpen(true); }}
              className="w-10 h-10 rounded-full bg-[#333] text-white flex items-center justify-center transition-transform active:scale-90"
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
          <button 
            onClick={openHistory}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${isViewingArchive ? 'bg-[#8a7a5d] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            <i className="fas fa-history text-sm"></i>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">{renderView()}</main>
      
      <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      
      <QuickAddModal 
        isOpen={isQuickAddOpen} 
        initialData={editingItineraryItem || undefined}
        defaultDate={startDate}
        hotels={hotels}
        onClose={() => { setIsQuickAddOpen(false); setEditingItineraryItem(null); }} 
        onAdd={handleQuickAdd}
      />

      {/* History Drawer */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end" onClick={() => setIsHistoryOpen(false)}>
          <div className="w-4/5 h-full bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold serif-font">旅程足跡</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="text-gray-400 p-2"><i className="fas fa-times"></i></button>
            </div>
            
            <div className="space-y-6">
              <button 
                onClick={loadCurrentTrip}
                className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all ${!isViewingArchive ? 'border-[#333] bg-[#fdfcfb] shadow-md' : 'border-gray-100 grayscale opacity-60'}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#333] text-white flex items-center justify-center flex-shrink-0"><i className="fas fa-map-marker-alt"></i></div>
                <div>
                  <p className="text-xs font-bold text-[#333]">當前旅程</p>
                  <p className="text-[10px] text-gray-400">正在規劃中...</p>
                </div>
              </button>

              <div className="pt-4 border-t border-gray-50">
                <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] uppercase mb-4">歸檔紀錄</p>
                {archives.length === 0 ? (
                  <div className="py-10 text-center text-[10px] text-gray-300 italic tracking-widest uppercase">尚無歸檔旅程</div>
                ) : (
                  <div className="space-y-3">
                    {archives.map(arc => (
                      <div key={arc.id} className="relative group">
                        <button 
                          onClick={() => viewArchive(arc)}
                          className={`w-full text-left bg-white border p-3 rounded-2xl flex items-center gap-3 active:scale-95 transition-all hover:border-gray-200 ${isViewingArchive && arc.id === archives.find(a => a.data.destination === destination)?.id ? 'border-[#8a7a5d] bg-[#f8f5f0]' : 'border-gray-100'}`}
                        >
                          <img src={arc.coverImage} className="w-12 h-12 rounded-xl object-cover" alt="trip" />
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-xs font-bold text-[#444] truncate">{arc.destination}</p>
                            <p className="text-[9px] text-gray-400">{arc.startDate} ~ {arc.endDate}</p>
                          </div>
                        </button>
                        <button 
                          onClick={(e) => handleDeleteArchive(e, arc.id)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-50 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:bg-red-100"
                        >
                          <i className="fas fa-trash-alt text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
