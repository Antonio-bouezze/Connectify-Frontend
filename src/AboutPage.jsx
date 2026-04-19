function AboutPage({ onBack }) {
  return (
    <div className="about-page">
      <div className="about-card">
        <button className="nav-style-btn about-back-btn" onClick={onBack}>
          Back
        </button>

        <h1 className="about-title">About Connectify</h1>

        <p className="about-intro">
          Connectify is a modern communication platform designed to make
          conversations simple, engaging, and accessible. Built around the idea
          of seamless interaction, it offers a space where users can connect,
          communicate, and build meaningful exchanges in a smooth and intuitive
          environment.
        </p>

        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to create a communication experience that feels
            natural, reliable, and enjoyable. Connectify is built to bring
            people closer through a clean interface, fast interaction, and a
            user-centered design philosophy.
          </p>
        </div>

        <div className="about-section">
          <h2>What Connectify Offers</h2>
          <ul className="about-features">
            <li>Real-time and intuitive messaging experience</li>
            <li>Clean and modern user interface</li>
            <li>Structured user identity and profile setup</li>
            <li>Scalable design prepared for future room-based communication</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Project Vision</h2>
          <p>
            Connectify aims to evolve beyond a simple chat application into a
            complete communication platform, with support for richer
            interactions, stronger user identity, and more dynamic ways to
            connect in the future.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;