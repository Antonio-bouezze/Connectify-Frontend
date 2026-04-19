function HomePage({ onNavigate, onOpenLogin }) {
  return (
    <div className="home-page">
      <header className="top-bar">
        <div className="top-bar-buttons">
          <div className="nav-btn-wrap">
            <button onClick={() => onNavigate("signup")}>Sign-Up</button>
          </div>

          <div className="nav-btn-wrap">
            <button onClick={() => onNavigate("about")}>About Us</button>
          </div>

          <div className="nav-btn-wrap">
            <button onClick={() => onNavigate("contact")}>Contact Us</button>
          </div>
        </div>
      </header>

      <main className="hero-section">
        <h1 className="app-title">CONNECTIFY</h1>

        <p>
          Connect instantly, share ideas effortlessly, and stay in control of
          your conversations. Designed for smooth real-time messaging with a
          clean and intuitive experience, CONNECTIFY brings communication
          closer, faster, and more engaging.
        </p>

        <div className="features">
          <span>⚡ Real-time messaging</span>
          <span>🔒 Secure communication</span>
          <span>🌐 Scalable chat rooms</span>
        </div>

        <div className="hero-actions">
          <button className="primary-btn" onClick={() => onNavigate("signup")}>
            Get Started
          </button>

          <button className="secondary-btn" onClick={() => onNavigate("about")}>
            Learn More
          </button>

          <button className="secondary-btn" onClick={onOpenLogin}>
            Log-In
          </button>
        </div>
      </main>
    </div>
  );
}

export default HomePage;