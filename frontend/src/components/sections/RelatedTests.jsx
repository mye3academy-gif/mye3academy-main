// frontend/src/components/sections/RelatedTests.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import MockTestCard from '../MockTestCard';
import PremiumTestCard from '../PremiumTestCard';
import { ClipLoader } from 'react-spinners';

const RelatedTests = ({ categorySlug, excludeId, limit = 4 }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        setLoading(true);
        // 1. Try to get tests in the same category
        let url = `/api/public/mocktests`;
        if (categorySlug && categorySlug !== 'all') {
          url += `?category=${categorySlug}`;
        }
        
        const { data } = await api.get(url);
        if (data.success) {
          let related = data.mocktests.filter(t => String(t._id) !== String(excludeId));
          
          // 2. ONLY if current category is empty, fetch random/all from other categories
          if (related.length === 0) {
             const { data: allData } = await api.get('/api/public/mocktests');
             if (allData.success) {
                const extras = allData.mocktests.filter(t => String(t._id) !== String(excludeId));
                // Shuffle extras for variety
                const shuffled = extras.sort(() => 0.5 - Math.random());
                related = shuffled;
             }
          }
          
          setTests(related.slice(0, limit));
        }
      } catch (err) {
        console.error("Related Tests Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (excludeId) fetchRelated();
  }, [categorySlug, excludeId, limit]);

  if (loading) return (
     <div className="py-20 flex flex-col items-center justify-center">
        <ClipLoader size={30} color="#2563eb" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Discovering More Series</p>
     </div>
  );

  if (!tests.length) return null;

  return (
    <div className="mt-20 pt-16 border-t border-slate-200">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-lg shadow-blue-200"></div>
            <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Related Test Series</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Recommended for your preparation</p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tests.map((test, idx) => (
          test.isGrandTest ? (
            <PremiumTestCard key={test._id} test={test} index={idx} />
          ) : (
            <MockTestCard key={test._id} test={test} index={idx} />
          )
        ))}
      </div>
    </div>
  );
};

export default RelatedTests;
