
import React, { useState, useEffect } from 'react';
import { ItineraryItem, ShoppingItem } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  item: ItineraryItem;
  idx: number;
  isReadOnly: boolean;
  onEdit: (item: ItineraryItem) => void;
  onRemove: (id: string) => void;
  getFinalMapLink: (item: ItineraryItem) => string;
  isGoogleMapLink: (str: string) => boolean;
  shoppingItems: ShoppingItem[];
  toggleShoppingCheck: (id: string) => void;
}

const SortableItineraryItem: React.FC<SortableItemProps> = ({
  item,
  idx,
  isReadOnly,
  onEdit,
  onRemove,
  getFinalMapLink,
  isGoogleMapLink,
  shoppingItems,
  toggleShoppingCheck,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: isReadOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const relatedShopping = shoppingItems.filter(si => si.itineraryItemId === item.id);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners}
        className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-white border-2 border-[#333] flex items-center justify-center text-[#333] z-10 font-bold text-[10px] ${!isReadOnly ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        {idx + 1}
      </div>
      
      <div className={`bg-white rounded-2xl border transition-all overflow-hidden ${isReadOnly ? 'border-gray-100' : 'border-[#f1f1f1] minimal-shadow group-hover:border-[#8a7a5d]'}`}>
        {item.attachment && (
          <div className="h-44 w-full overflow-hidden">
            <img src={item.attachment} className="w-full h-full object-cover" alt="attachment" />
          </div>
        )}
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.1em]">{item.startTime} ({item.duration})</span>
                {item.transportation && (
                  <span className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100 font-medium">
                    {item.transportation}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-[#333] text-base">{item.activity}</h4>
              
              <a 
                href={getFinalMapLink(item)} 
                target="_blank" rel="noreferrer" 
                className="text-[10px] text-[#8a7a5d] flex items-center gap-1 hover:underline font-bold"
              >
                <i className="fas fa-map-marker-alt text-[9px]"></i>
                {isGoogleMapLink(item.location) ? "在地圖中開啟連結" : (item.location || "未設定地點")}
              </a>
            </div>
            {!isReadOnly && (
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(item)} className="text-gray-300 hover:text-[#8a7a5d] p-1"><i className="fas fa-pen text-[10px]"></i></button>
                <button onClick={() => { if(confirm('刪除？')) onRemove(item.id); }} className="text-gray-100 hover:text-red-300 p-1"><i className="fas fa-trash-alt text-[10px]"></i></button>
              </div>
            )}
          </div>

          {relatedShopping.length > 0 && (
            <div className="mt-4 bg-[#fcfaf6] border border-[#e5e1db] rounded-xl p-3 space-y-2">
              <p className="text-[9px] font-bold text-[#8a7a5d] tracking-widest uppercase flex items-center gap-1.5">
                <i className="fas fa-shopping-cart text-[8px]"></i> 購物計畫
              </p>
              <div className="space-y-1.5">
                {relatedShopping.map(si => (
                  <div 
                    key={si.id} 
                    onClick={() => toggleShoppingCheck(si.id)}
                    className={`flex items-center justify-between group/si ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${si.isChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                        {si.isChecked && <i className="fas fa-check text-[7px]"></i>}
                      </div>
                      <span className={`text-[11px] ${si.isChecked ? 'line-through text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-bold text-[#8a7a5d] mr-1">[{si.forWhom || '自己'}]</span>
                        {si.name}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold serif-font ${si.isChecked ? 'text-gray-200' : 'text-gray-400'}`}>
                      {si.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.note && (
            <div className="mt-3 pt-3 border-t border-[#f9f9f9]">
              <p className="text-[11px] text-gray-500 leading-relaxed">{item.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ItineraryProps {
  destination: string;
  items: ItineraryItem[];
  setItems: React.Dispatch<React.SetStateAction<ItineraryItem[]>>;
  onEdit: (item: ItineraryItem) => void;
  onRemove: (id: string) => void;
  startDate: string;
  endDate: string;
  dailyMaps: Record<string, string>;
  onSetDailyMap: (date: string, url: string) => void;
  shoppingItems: ShoppingItem[];
  setShoppingItems: React.Dispatch<React.SetStateAction<ShoppingItem[]>>;
  isReadOnly?: boolean;
}

const Itinerary: React.FC<ItineraryProps> = ({ 
  items, setItems, onEdit, onRemove, startDate, endDate, dailyMaps, onSetDailyMap,
  shoppingItems, setShoppingItems, isReadOnly = false
}) => {
  const [activeDate, setActiveDate] = useState(startDate);
  const [showMapSetting, setShowMapSetting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    setActiveDate(startDate);
  }, [startDate]);

  const addDurationToTime = (time: string, duration: string): string => {
    if (duration === '全天') return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    let durationMinutes = 0;
    
    if (duration.endsWith('h')) {
      durationMinutes = parseFloat(duration) * 60;
    } else if (duration.endsWith('m')) {
      durationMinutes = parseInt(duration);
    }
    
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dayItems: ItineraryItem[] = items
      .filter(item => item.date === activeDate)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    const oldIndex = dayItems.findIndex(item => item.id === active.id);
    const newIndex = dayItems.findIndex(item => item.id === over.id);

    const reorderedDayItems = arrayMove(dayItems, oldIndex, newIndex);

    // Recalculate times
    const updatedDayItems = reorderedDayItems.map((item, idx) => {
      if (idx === 0) return item;
      const prevItem = reorderedDayItems[idx - 1];
      const newStartTime = addDurationToTime(prevItem.startTime, prevItem.duration);
      return { ...item, startTime: newStartTime };
    });

    // Merge back to main items list
    setItems(prevItems => {
      const otherItems = prevItems.filter(item => item.date !== activeDate);
      return [...otherItems, ...updatedDayItems];
    });
  };

  const getDateRange = (start: string, end: string) => {
    const dates = [];
    let curr = new Date(start);
    const stop = new Date(end);
    if (isNaN(curr.getTime()) || isNaN(stop.getTime())) return [];
    
    while (curr <= stop) {
      dates.push(new Date(curr).toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const tripDates = getDateRange(startDate, endDate);

  const filteredItems = items
    .filter(item => item.date === activeDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getEmbedMapUrl = (url: string) => {
    if (!url) return "";
    try {
      if (url.includes('/d/embed')) return url;
      if (url.includes('/d/u/0/edit')) return url.replace('/edit', '/embed');
      if (url.includes('/d/viewer')) return url.replace('/viewer', '/embed');
      return url;
    } catch (e) {
      return url;
    }
  };

  const isGoogleMapLink = (str: string) => {
    return str && (str.includes('google.com/maps') || str.includes('goo.gl/maps'));
  };

  const getFinalMapLink = (item: ItineraryItem) => {
    if (item.locationUrl) return item.locationUrl;
    if (isGoogleMapLink(item.location)) return item.location;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;
  };

  const toggleShoppingCheck = (id: string) => {
    if (isReadOnly) return;
    setShoppingItems(shoppingItems.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const currentDayMapUrl = dailyMaps[activeDate] || "";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold serif-font tracking-widest text-[#222]">旅程時刻</h2>
        {!isReadOnly && (
          <button 
            onClick={() => setShowMapSetting(!showMapSetting)}
            className={`text-[10px] font-bold tracking-widest px-4 py-2 rounded-full border transition-all uppercase ${
              showMapSetting ? 'bg-[#333] text-white' : 'bg-white border-[#333] text-[#333]'
            }`}
          >
            <i className="fas fa-map-marked-alt mr-2"></i>
            {currentDayMapUrl ? '更換本地圖' : '設定本地圖'}
          </button>
        )}
      </div>

      {showMapSetting && !isReadOnly && (
        <div className="bg-white p-5 rounded-2xl border border-[#f1f1f1] minimal-shadow animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#333]">設定 {activeDate.split('-').slice(1).join('/')} 的地圖</span>
            <button onClick={() => setShowMapSetting(false)} className="text-[9px] text-gray-400">關閉</button>
          </div>
          <input 
            type="url" 
            placeholder="貼上 Google 我的地圖分享連結..." 
            value={currentDayMapUrl} 
            onChange={(e) => onSetDailyMap(activeDate, e.target.value)}
            className="w-full text-[11px] bg-gray-50 border-none rounded-xl px-4 py-3 outline-none focus:ring-1 focus:ring-gray-100"
          />
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
        {tripDates.map((date, idx) => (
          <button
            key={date}
            onClick={() => setActiveDate(date)}
            className={`flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center rounded-2xl transition-all ${
              activeDate === date ? 'bg-[#333] text-white shadow-xl scale-105' : 'bg-white border border-[#f1f1f1] text-gray-400'
            }`}
          >
            <span className="text-[10px] font-light">DAY {idx + 1}</span>
            <span className="text-sm font-bold serif-font">{date.split('-').slice(1).join('/')}</span>
          </button>
        ))}
      </div>

      {currentDayMapUrl ? (
        <div className="w-full h-72 rounded-3xl overflow-hidden border border-[#f1f1f1] minimal-shadow bg-gray-50 relative group">
          <iframe 
            key={activeDate} src={getEmbedMapUrl(currentDayMapUrl)} 
            width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" 
          ></iframe>
        </div>
      ) : (
        <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
           <i className="fas fa-map-marked-alt text-gray-200 text-3xl mb-3"></i>
           <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">尚未設定此日期的地圖</p>
        </div>
      )}

      <div className="relative pl-8 border-l border-[#eee] space-y-10 py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredItems.map(i => i.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredItems.map((item, idx) => (
              <SortableItineraryItem
                key={item.id}
                item={item}
                idx={idx}
                isReadOnly={isReadOnly}
                onEdit={onEdit}
                onRemove={onRemove}
                getFinalMapLink={getFinalMapLink}
                isGoogleMapLink={isGoogleMapLink}
                shoppingItems={shoppingItems}
                toggleShoppingCheck={toggleShoppingCheck}
              />
            ))}
          </SortableContext>
        </DndContext>
        {filteredItems.length === 0 && (
          <div className="py-10 text-center text-gray-300 italic text-xs tracking-widest uppercase">
            本日尚無行程規劃
          </div>
        )}
      </div>
    </div>
  );
};

export default Itinerary;
