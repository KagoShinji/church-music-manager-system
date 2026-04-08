import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, BookOpen, Heart, Star, ChevronDown, CalendarDays, Library, LayoutDashboard } from 'lucide-react';

/* ─── Animated counter hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ─── Intersection Observer hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Stat Counter ─── */
function StatCounter({ value, suffix = '', label, inView }) {
  const count = useCountUp(value, 1800, inView);
  return (
    <div className="hp-stat-item">
      <div className="hp-stat-value">{count}{suffix}</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  );
}

/* ─── Section label ─── */
const SectionLabel = ({ light = false, children }) => (
  <div className={`hp-section-label${light ? ' hp-section-label--light' : ''}`}>
    <span className={`hp-tag-dot${light ? ' hp-tag-dot--light' : ''}`} />
    <span>{children}</span>
    <span className={`hp-tag-dot${light ? ' hp-tag-dot--light' : ''}`} />
  </div>
);

/* ─── Gem Divider ─── */
const GemDivider = ({ light = false }) => (
  <div className={`hp-divider-ornament${light ? ' hp-divider-ornament--light' : ''}`}>
    <span /><span className="hp-divider-diamond" /><span />
  </div>
);

/* ════════════════════════════════════════════════════════════
   HOMEPAGE COMPONENT
   ════════════════════════════════════════════════════════════ */
const HomePage = () => {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView();
  const [heroVisible, setHeroVisible] = useState(false);
  const [foundersRef, foundersInView] = useInView(0.1);
  const [storyRef, storyInView] = useInView(0.1);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="hp-root">

      {/* ══════════ HERO ══════════ */}
      <section className={`hp-hero ${heroVisible ? 'hp-hero--visible' : ''}`}>
        <div className="hp-hero-bg" />
        <div className="hp-hero-overlay" />
        <div className="hp-hero-overlay-gradient" />
        <div className="hp-hero-blobs" aria-hidden="true">
          <span className="hp-blob hp-blob--1" />
          <span className="hp-blob hp-blob--2" />
          <span className="hp-blob hp-blob--3" />
        </div>
        <div className="hp-dot-grid" aria-hidden="true" />
        <div className="hp-hero-rule" />

        <div className="hp-logo-wrap">
          <div className="hp-logo-ring hp-logo-ring--outer" />
          <div className="hp-logo-ring hp-logo-ring--inner" />
          <img src="/lowersampaguitalogo.jpg" alt="Sampaguita Choir Logo" className="hp-logo" />
        </div>

        <div className="hp-church-tag">
          <span className="hp-tag-dot" />
          <span>Gethsemane Parish · Mandaue City</span>
          <span className="hp-tag-dot" />
        </div>

        <h1 className="hp-hero-title">Sampaguita Choir</h1>
        <p className="hp-hero-subtitle">Choir Music Manager System</p>
        <p className="hp-hero-tagline">
          "Sing to the Lord a new song; sing to the Lord, all the earth."
          <em className="hp-tagline-ref"> — Psalm 96:1</em>
        </p>

        <div className="hp-hero-divider">
          <span /><span className="hp-divider-gem" /><span />
        </div>

        <div className="hp-hero-cta">
          <button className="btn btn-lg hp-btn-gold" onClick={() => navigate('/planner')}>
            <Music size={18} />
            Mass Planner
          </button>
          <button className="btn btn-lg hp-btn-ghost-light" onClick={() => navigate('/library')}>
            <BookOpen size={18} />
            Song Library
          </button>
        </div>

        <div className="hp-scroll-cue">
          <span>Discover our story</span>
          <ChevronDown size={18} className="hp-bounce" />
        </div>
      </section>

      {/* ══════════ FOUNDERS ══════════ */}
      <section className="hp-section hp-section--cream" ref={foundersRef}>
        <div className="hp-container">
          <SectionLabel>Our Founders</SectionLabel>
          <h2 className="hp-section-title">Pillars of Faith &amp; Song</h2>
          <GemDivider />
          <p className="hp-founders-intro">
            The Sampaguita Choir stands on the shoulders of two remarkable servants of God
            whose love for the Church and sacred music gave birth to this ministry.
          </p>

          <div className={`hp-founders-grid${foundersInView ? ' hp-founders-grid--visible' : ''}`}>

            {/* Founder 1 */}
            <div className="hp-founder-card hp-founder-card--delay-0">
              <div className="hp-founder-photo-wrap">
                <img src="/mama.jpg" alt="Josie B. Roca" className="hp-founder-photo" />
                <div className="hp-founder-photo-ring" />
              </div>
              <div className="hp-founder-body">
                <h3 className="hp-founder-name">Josie B. Roca</h3>
                <span className="hp-founder-role">Co-Founder · Choir Directress</span>
                <div className="hp-founder-divider" />
                <p className="hp-founder-bio">
                  A woman of unwavering faith and exceptional musical gift,{' '}
                  <strong>Josie B. Roca</strong> co-founded the Sampaguita Choir with a heart
                  deeply rooted in the love of God and the Church. Her passion for liturgical
                  music and ability to inspire voices shaped the choir's identity from its
                  earliest days.
                </p>
                <p className="hp-founder-bio">
                  As the anchor of the choir's spirit and discipline, Ate Josie led practices
                  with unwavering patience, teaching not just the notes but the prayer behind
                  every song. Her legacy lives on in every hymn at Gethsemane Parish.
                </p>
                <blockquote className="hp-founder-quote">
                  "Music is our prayer made audible to God."
                </blockquote>
              </div>
            </div>

            {/* Founder 2 */}
            <div className="hp-founder-card hp-founder-card--delay-1 hp-founder-card--reverse">
              <div className="hp-founder-photo-wrap">
                <img src="/papa.jpg" alt="Ernesto C. Roca Jr." className="hp-founder-photo" />
                <div className="hp-founder-photo-ring" />
              </div>
              <div className="hp-founder-body">
                <h3 className="hp-founder-name">Ernesto C. Roca Jr.</h3>
                <span className="hp-founder-role">Co-Founder · Musical Director</span>
                <div className="hp-founder-divider" />
                <p className="hp-founder-bio">
                  A man of faith and musical vision,{' '}
                  <strong>Ernesto C. Roca Jr.</strong> brought musical structure and leadership
                  to the Sampaguita Choir. His knowledge of liturgical tradition and dedication
                  to excellence established the choir's high standards of ministry.
                </p>
                <p className="hp-founder-bio">
                  Kuya Edfir's leadership was marked by deep reverence for the Mass and a
                  relentless pursuit of musical beauty in service of the Lord. He laid the
                  spiritual and musical foundation upon which the choir continues to thrive.
                </p>
                <blockquote className="hp-founder-quote">
                  "Every note we sing is an offering at the altar of God."
                </blockquote>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════ STORY SECTION ══════════ */}
      <section className="hp-section hp-section--light" ref={storyRef}>
        <div className="hp-container">
          <SectionLabel>Our Heritage</SectionLabel>
          <h2 className="hp-section-title">The Story of Sampaguita Choir</h2>
          <GemDivider />

          <div className={`hp-story-grid${storyInView ? ' hp-story-grid--visible' : ''}`}>
            <div className="hp-story-text">
              <p className="hp-story-lead">
                Born from faith, nurtured by devotion, and sustained by the love of sacred
                music — the <strong>Sampaguita Choir</strong> has been the voice of worship
                at Gethsemane Parish in Mandaue City for decades.
              </p>
              <p>
                Named after the Philippines' national flower — the pure white{' '}
                <em>sampaguita</em>, symbolizing purity, humility, and reverence — our choir
                embodies that same gentle strength in every hymn lifted in praise during the
                Holy Mass.
              </p>
              <p>
                From its earliest Sundays, the choir has faithfully served the liturgy through
                Gregorian chants, traditional Filipino church music, and contemporary Christian
                praise. Every voice is a living instrument, offered humbly to God and the
                parish community.
              </p>
              <div className="hp-story-verse">
                <span className="hp-story-verse-bar" />
                <blockquote>
                  "Let the message of Christ dwell among you richly as you teach and admonish
                  one another with all wisdom through psalms, hymns, and songs from the Spirit."
                  <cite> — Colossians 3:16</cite>
                </blockquote>
              </div>
            </div>

            <div className="hp-story-aside">
              <div className="hp-aside-card">
                <div className="hp-aside-card-icon"><Heart size={20} /></div>
                <h3>Our Mission</h3>
                <p>
                  To glorify God through sacred music and deepen the prayerful participation
                  of the faithful in the Holy Eucharist and all liturgical celebrations.
                </p>
              </div>

              <div className="hp-aside-card">
                <div className="hp-aside-card-icon"><Star size={20} /></div>
                <h3>Our Spirit</h3>
                <ul className="hp-value-list">
                  <li><span className="hp-value-dot" />Devotion to the Holy Mass</li>
                  <li><span className="hp-value-dot" />Humility in service</li>
                  <li><span className="hp-value-dot" />Excellence in musicianship</li>
                  <li><span className="hp-value-dot" />Unity as a faith community</li>
                </ul>
              </div>

              <div className="hp-exclusive-badge">
                <img src="/lowersampaguitalogo.jpg" alt="Choir logo" className="hp-badge-logo" />
                <span>Exclusive system built for<br /><strong>Sampaguita Choir</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section className="hp-section hp-section--dark" ref={statsRef}>
        <div className="hp-container">
          <SectionLabel light>In Numbers</SectionLabel>
          <h2 className="hp-section-title hp-section-title--light">Years of Faithful Service</h2>
          <GemDivider light />
          <div className="hp-stats-grid">
            <StatCounter value={30} suffix="+" label="Years of Service" inView={statsInView} />
            <StatCounter value={500} suffix="+" label="Masses Animated" inView={statsInView} />
            <StatCounter value={120} suffix="+" label="Sacred Songs" inView={statsInView} />
            <StatCounter value={50} suffix="+" label="Choir Members (Alumni)" inView={statsInView} />
          </div>
        </div>
      </section>

      {/* ══════════ SYSTEM CTA ══════════ */}
      <section className="hp-section hp-section--cta">
        <div className="hp-cta-bg-blobs" aria-hidden="true">
          <span className="hp-cta-blob hp-cta-blob--1" />
          <span className="hp-cta-blob hp-cta-blob--2" />
        </div>
        <div className="hp-container hp-cta-inner">
          <SectionLabel light>Music Manager System</SectionLabel>
          <h2 className="hp-section-title hp-section-title--light">Begin Your Liturgical Planning</h2>
          <p className="hp-cta-desc">
            Organize songs, plan Masses, manage templates, and keep all your choir's music
            resources in one sacred space — built exclusively for Sampaguita Choir.
          </p>
          <div className="hp-cta-cards">
            <button className="hp-cta-card" onClick={() => navigate('/planner')}>
              <div className="hp-cta-card-icon"><CalendarDays size={26} /></div>
              <span className="hp-cta-card-label">Mass Planner</span>
              <span className="hp-cta-card-sub">Plan liturgical song lineups</span>
            </button>
            <button className="hp-cta-card" onClick={() => navigate('/library')}>
              <div className="hp-cta-card-icon"><Library size={26} /></div>
              <span className="hp-cta-card-label">Song Library</span>
              <span className="hp-cta-card-sub">Browse &amp; manage sacred songs</span>
            </button>
            <button className="hp-cta-card" onClick={() => navigate('/dashboard')}>
              <div className="hp-cta-card-icon"><LayoutDashboard size={26} /></div>
              <span className="hp-cta-card-label">Dashboard</span>
              <span className="hp-cta-card-sub">Overview &amp; quick access</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="hp-footer">
        <div className="hp-footer-ornament">
          <span /><span className="hp-divider-gem hp-divider-gem--sm" /><span />
        </div>
        <img src="/lowersampaguitalogo.jpg" alt="Sampaguita Choir Logo" className="hp-footer-logo" />
        <p className="hp-footer-name">
          <strong>Sampaguita Choir</strong><br />
          Gethsemane Parish · Mandaue City, Cebu, Philippines
        </p>
        <p className="hp-footer-credit">
          Church Music Manager System &nbsp;·&nbsp;
          Developed by <strong>Johnjosfir B. Roca</strong>
        </p>
        <p className="hp-footer-verse">
          "Praise him with the sounding of the trumpet, praise him with the harp and lyre." — Psalm 150:3
        </p>
        <div className="hp-footer-bottom">
          <span>© {new Date().getFullYear()} Sampaguita Choir · All rights reserved</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
