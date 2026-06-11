'use client';

import { useState, useEffect } from 'react';

const REVIEWS = [
  // Telugu (in English chars)
  { name: 'Rahul M.', loc: 'Hyderabad, TS', product: 'Khara Mixture', text: 'Asalu taste untadi mastaru... exactly like what my ammamma used to make!', time: '10 mins ago', stars: '★★★★★' },
  { name: 'Kavya T.', loc: 'Vizag, AP', product: 'Chekodi', text: 'Chekodi asalu super untadhi andi. Maa intlo andarki chala nacchindi.', time: '1 hour ago', stars: '★★★★★' },
  { name: 'Srinivas G.', loc: 'Vijayawada, AP', product: 'Achappam', text: 'Ekkada chusina sweet shops lo ee taste raledu. Very authentic!', time: 'Just now', stars: '★★★★☆' },
  { name: 'Swathi P.', loc: 'Warangal, TS', product: 'Chekodi', text: 'Achappam chala crispy ga vachayi. Fast delivery kuda!', time: '15 mins ago', stars: '★★★★★' },
  
  // Hindi (in English chars)
  { name: 'Priya R.', loc: 'Bengaluru, KA', product: 'Chekodi', text: 'Bhai kya taste hai! Ekdum ghar wali feeling aa gayi. Best snacks!', time: '25 mins ago', stars: '★★★★★' },
  { name: 'Anil K.', loc: 'Delhi, DL', product: 'Khara Mixture', text: 'Bilkul fresh aur masala ekdum perfect. Maza aa gaya.', time: '2 hours ago', stars: '★★★★★' },
  { name: 'Neha S.', loc: 'Pune, MH', product: 'Achappam', text: 'Bachpan ki yaad aa gayi yaar. It is perfectly crunchy.', time: '40 mins ago', stars: '★★★★★' },
  { name: 'Sandeep V.', loc: 'Mumbai, MH', product: 'Khara Mixture', text: 'Packaging bahut badhiya thi aur taste bilkul authentic.', time: '3 hours ago', stars: '★★★★☆' },

  // English
  { name: 'Megha L.', loc: 'Chennai, TN', product: 'Achappam', text: 'Such a brilliant discovery! The snacks are extremely fresh and have zero oil smell.', time: '35 mins ago', stars: '★★★★★' },
  { name: 'Vikram D.', loc: 'Kochi, KL', product: 'Khara Mixture', text: 'Ordered for a family function and it was a massive hit. You can really taste the premium ingredients.', time: '5 hours ago', stars: '★★★★★' }
];

export default function LiveReviewPopup() {
  const [currentReview, setCurrentReview] = useState<typeof REVIEWS[0] | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let hideTimeout: NodeJS.Timeout;

    const displayNextReview = () => {
      // Pick a random review
      const randomReview = REVIEWS[Math.floor(Math.random() * REVIEWS.length)];
      setCurrentReview(randomReview);
      setIsVisible(true);

      // Hide after 6 seconds
      hideTimeout = setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Initial delay before showing the first popup (wait 4 seconds after page loads)
    const initialTimer = setTimeout(() => {
      displayNextReview();
      
      // Setup interval to show a new review every 20 seconds
      const reviewInterval = setInterval(() => {
        displayNextReview();
      }, 20000); 

      return () => clearInterval(reviewInterval);
    }, 4000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(hideTimeout);
    };
  }, []);

  if (!currentReview) return null;

  return (
    <div className={`live-popup ${isVisible ? 'live-popup--visible' : ''}`}>
      <div className="live-popup__inner">
        <div className="live-popup__img-wrap">
          <span className="live-popup__img-icon">📦</span>
        </div>
        <div className="live-popup__content">
          <div className="live-popup__header">
            <strong>{currentReview.name}</strong> in {currentReview.loc} 
          </div>
          <div className="live-popup__action">
            just reviewed <strong>{currentReview.product}</strong> <span style={{ color: '#D4AF37', letterSpacing: 1 }}>{currentReview.stars}</span>
          </div>
          <p className="live-popup__quote">"{currentReview.text}"</p>
          <div className="live-popup__time">✓ Verified Buyer • {currentReview.time}</div>
        </div>
        <button className="live-popup__close" onClick={() => setIsVisible(false)} aria-label="Close">×</button>
      </div>
    </div>
  );
}
