import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | DesiSwad Foods – Our Story & Mission',
  description: 'Learn about DesiSwad Foods – our journey of preserving authentic Telangana homemade snack traditions with love, quality ingredients, and no preservatives.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="about-hero">
        <div className="about-hero__bg">
          <Image src="/about_banner.png" alt="Our Kitchen Story" fill style={{ objectFit: 'cover' }} />
          <div className="about-hero__overlay" />
        </div>
        <div className="container about-hero__content">
          <span className="section-label">Our Story</span>
          <h1 className="heading-xl" style={{ color: '#fff', marginBottom: 16 }}>
            Made with Love,<br />Served with Pride
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', maxWidth: 560 }}>
            A journey rooted in Telangana's rich culinary heritage
          </p>
        </div>
      </div>

      {/* Brand Story */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story__content">
              <span className="section-label">Who We Are</span>
              <h2 className="heading-lg" style={{ marginBottom: 16 }}>The DesiSwad Story</h2>
              <div className="gold-line-left" />
              <p className="about-para">
                DesiSwad Foods was founded by <strong>Shaik Feroz</strong>, an MBA graduate from Hyderabad who chose entrepreneurship over a corporate career to build something meaningful and lasting.
              </p>
              <p className="about-para">
                The inspiration behind DesiSwad Foods comes from a strong family business foundation. For more than 10 years, <strong>Telangana Food Products</strong> has been manufacturing traditional snacks and serving customers across the region. The manufacturing unit is led by Mr. Shaik Shareef, who started his journey as an auto driver and, through hard work, determination, and vision, built a successful snack manufacturing business from the ground up.
              </p>
              <p className="about-para">
                Today, Telangana Food Products operates with a dedicated team of 10 workers and continues to produce authentic traditional snacks using time-tested recipes and quality ingredients.
              </p>
              <p className="about-para">
                Growing up and watching this journey closely inspired me to think beyond local markets. I saw how customers trusted the products, appreciated the authentic taste, and kept coming back for the quality. That experience planted the seed for a bigger vision.
              </p>
              <p className="about-para">
                After completing my MBA and gaining experience in the corporate IT sector, I realized that these authentic Telangana flavors deserved a larger platform. Traditional snacks such as Chekodi and Khara Mixture had the potential to reach customers across India when combined with modern branding, professional packaging, and digital commerce.
              </p>
              <p className="about-para" style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--red)', fontStyle: 'italic', margin: '20px 0' }}>
                With this vision, I launched DesiSwad Foods.
              </p>
              <p className="about-para">
                Built on the manufacturing expertise of Telangana Food Products and driven by a passion for entrepreneurship, DesiSwad Foods was created to bring authentic Telangana snacks to modern consumers while maintaining the highest standards of quality, hygiene, and trust.
              </p>
              <p className="about-para">
                Today, DesiSwad Foods proudly offers products such as Classic Chekodi, Spicy Chekodi, and Khara Mixture. Every pack represents years of family experience, authentic recipes, and a commitment to delivering traditional taste with modern quality standards.
              </p>
              <p className="about-para">
                To strengthen customer trust and ensure compliance with industry standards, DesiSwad Foods operates with GST Registration, FSSAI Certification, and Trademark Registration. These milestones reflect our commitment to quality, food safety, brand protection, and long-term growth.
              </p>
              <p className="about-para">
                <strong>Our mission</strong> is not just to sell snacks but to preserve Telangana's rich food heritage and share it with families across India through e-commerce platforms, retail stores, supermarkets, and modern trade channels.
              </p>
              <p className="about-para">
                <strong>Our vision</strong> is to build DesiSwad Foods into one of India's most trusted premium traditional snack brands while taking the authentic taste of Telangana to customers across the country and beyond.
              </p>
              <div style={{ marginTop: 32, padding: 24, background: 'var(--cream-light)', borderRadius: 12, border: '1px solid var(--gold-light)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--red-dark)', marginBottom: 8, fontSize: '1.3rem', fontWeight: 800 }}>DESISWAD FOODS</h3>
                <p style={{ fontWeight: 700, color: 'var(--gold-dark)', fontSize: '1.1rem', marginBottom: 4 }}>Pure Taste. Pure Trust.</p>
                <p style={{ color: 'var(--gray-600)', fontStyle: 'italic', fontSize: '0.95rem' }}>From Family Tradition to a Trusted Indian Brand.</p>
              </div>
            </div>
            <div className="about-story__img">
              <Image src="/hero_banner.png" alt="Traditional Telangana Snacks" fill style={{ objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">What We Stand For</span>
            <h2 className="heading-lg">Our Values</h2>
            <div className="gold-line" />
          </div>
          <div className="values-grid">
            {[
              { icon: '🌿', title: 'No Preservatives', desc: 'Every snack is made fresh with natural ingredients. No artificial colours, flavours or preservatives — ever.' },
              { icon: '🏡', title: '100% Homemade', desc: 'Crafted in small batches in our traditional home kitchen, maintaining the authentic taste of Telangana.' },
              { icon: '✨', title: 'Premium Quality', desc: 'We source only the finest ingredients — the best rice flour, hand-picked spices, cold-pressed oils.' },
              { icon: '💚', title: 'Made with Love', desc: 'Every batch is personally overseen with the same care and attention your grandmother would give.' },
              { icon: '🚀', title: 'Fresh & Fast', desc: 'Snacks are made to order and dispatched quickly to ensure maximum freshness on delivery.' },
              { icon: '🤝', title: 'Customer Trust', desc: 'We build relationships, not just orders. Your satisfaction and trust is our biggest reward.' },
            ].map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-card__icon">{v.icon}</div>
                <h3 className="value-card__title">{v.title}</h3>
                <p className="value-card__desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="about-stats">
        <div className="container">
          <div className="stats-grid">
            {[
              { num: '500+', label: 'Happy Customers' },
              { num: '6+', label: 'Authentic Recipes' },
              { num: '3', label: 'Generations of Tradition' },
              { num: '100%', label: 'Customer Satisfaction' },
            ].map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">Our Process</span>
            <h2 className="heading-lg">From Kitchen to Doorstep</h2>
            <div className="gold-line" />
          </div>
          <div className="process-steps">
            {[
              { icon: '🌾', step: '01', title: 'Finest Ingredients', desc: 'We carefully source premium rice flour, dal, spices and oil from trusted local suppliers' },
              { icon: '👐', step: '02', title: 'Handcrafted Fresh', desc: 'Each snack is made by hand using traditional methods, in small batches for maximum quality' },
              { icon: '🔥', step: '03', title: 'Perfectly Cooked', desc: 'Cooked at the right temperature, at the right time — just as our grandmothers taught us' },
              { icon: '📦', step: '04', title: 'Packed & Shipped', desc: 'Hygienically packed in airtight pouches and shipped directly to your door within days' },
            ].map((s) => (
              <div key={s.step} className="process-step">
                <div className="process-step__num">{s.step}</div>
                <div className="process-step__icon">{s.icon}</div>
                <h4 className="process-step__title">{s.title}</h4>
                <p className="process-step__desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section" style={{ background: '#fdfaf4' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 48 }}>
            <span className="section-label">Wall of Love</span>
            <h2 className="heading-lg">What Our Customers Say</h2>
            <div className="gold-line" />
          </div>
          <div className="reviews-grid">
            {[
              {
                text: "The Chekodi tastes exactly like what my grandmother used to make. So fresh, crunchy, and absolutely zero oily smell. Highly recommended!",
                name: "Priya R.",
                loc: "Bengaluru, India",
                initial: "P"
              },
              {
                text: "Ordered the Khara Mixture for a family get-together and it was a massive hit. The spice level is perfect and you can tell they use premium ingredients.",
                name: "Rahul M.",
                loc: "Hyderabad, India",
                initial: "R"
              },
              {
                text: "I have tried many brands but DesiSwad is truly authentic. The packaging is great, delivery was fast, and the Achappam was perfectly sweet and crispy.",
                name: "Kavya T.",
                loc: "Mumbai, India",
                initial: "K"
              }
            ].map((review, i) => (
              <div key={i} className="review-card">
                <div className="review-card__stars">★★★★★</div>
                <p className="review-card__text">"{review.text}"</p>
                <div className="review-card__author">
                  <div className="review-card__avatar">{review.initial}</div>
                  <div>
                    <h4 className="review-card__name">{review.name}</h4>
                    <p className="review-card__loc">{review.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="container text-center">
          <h2 className="heading-lg" style={{ color: '#fff', marginBottom: 16 }}>
            Ready to Taste the Difference?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1.05rem' }}>
            Order your favourite Telangana snacks today and experience the real taste of home.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-gold btn-lg">🛒 Shop Now</Link>
            <Link href="/contact" className="btn btn-lg" style={{ border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}>Get in Touch</Link>
          </div>
        </div>
      </section>

      
    </>
  );
}
