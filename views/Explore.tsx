
import React, { useState, useEffect } from 'react';
import { Attraction } from '../types';
import { getTravelRecommendations } from '../services/geminiService';

interface ExploreProps {
  destination: string;
}

const Explore: React.FC<ExploreProps> = ({ destination }) => {
  const [categories, setCategories] = useState(['全部', '景點', '美食', '購物', '休閒']);
  const [activeCategory, setActiveCategory] = useState('全部');
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const result = await getTravelRecommendations(destination);
      setAttractions(result.map((r: any, i: number) => ({
        ...r,
        id: `attr-${i}`,
        image: `https://picsum.photos/seed/attr${i}/400/300`
      })));
    } catch (e) {
      console.error(e);
      // Mock data if failed
      setAttractions([
        { id: 'a1', name: '淺草寺', category: '景點', description: '東京都內最古老的寺院。', rating: 4.8, image: 'https://picsum.photos/seed/a1/400/300' },
        { id: 'a2', name: '東京鐵塔', category: '景點', description: '著名的地標，可俯瞰全景。', rating: 4.7, image: 'https://picsum.photos/seed/a2/400/300' },
        { id: 'a3', name: '築地場外市場', category: '美食', description: '品嚐最新鮮海產的地方。', rating: 4.6, image: 'https://picsum.photos/seed/a3/400/300' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [destination]);

  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  const filteredAttractions = activeCategory === '全部' 
    ? attractions 
    : attractions.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">推薦景點</h2>
        <button 
          onClick={() => setShowAddCategory(!showAddCategory)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-600"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {showAddCategory && (
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
          <p className="text-xs font-bold text-blue-800 mb-2 uppercase">新增分類</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="例如: 攝影景點..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button 
              onClick={addCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
              確認
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1,2,3].map(n => (
            <div key={n} className="bg-gray-100 rounded-2xl h-56 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredAttractions.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <i className="fas fa-search text-3xl mb-3"></i>
              <p>目前沒有符合此分類的推薦</p>
            </div>
          ) : (
            filteredAttractions.map(attr => (
              <div key={attr.id} className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                <img src={attr.image} alt={attr.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                  <div className="flex justify-between items-center mb-1">
                    <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{attr.category}</span>
                    <span className="text-white text-xs font-bold"><i className="fas fa-star text-yellow-400 mr-1"></i>{attr.rating}</span>
                  </div>
                  <h3 className="text-white text-xl font-bold">{attr.name}</h3>
                  <p className="text-white/70 text-xs mt-1 line-clamp-2">{attr.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Explore;
