function ContactPage({ onBack }) {
  return (
    <div className="contact-page">
      <div className="contact-card">
        <button className="nav-style-btn contact-back-btn" onClick={onBack}>
          Back
        </button>

        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-intro">
          This page can present the project creators, their contact numbers,
          and the main communication details related to Connectify.
        </p>

        <div className="contact-grid">
          <div className="contact-item">
            <h3>Creator 1</h3>
            <p><strong>Name:</strong> DonHeaven Miled Karam</p>
            <p><strong>Phone:</strong> 71/981922</p>
            <p><strong>Role:</strong> Backend & Systems Developer — led the backend implementation and is responsible for ongoing system improvements, including the Node.js communication layer.</p>
            <p><strong>Details:</strong> A third-year Computer Science student focused on completing his Bachelor's degree and advancing to graduate studies, currently beginning an internship and managing academic commitments alongside part-time work in his hometown.</p>
          </div>

          <div className="contact-item">
            <h3>Creator 2</h3>
            <p><strong>Name:</strong> Antonio Simon Abou Ezze</p>
            <p><strong>Phone:</strong> 81/347080</p>
            <p><strong>Role:</strong> Frontend Lead Developer — handled the majority of the React frontend, core UI structure, and contributed to system design and minor backend components.</p>
            <p><strong>Details:</strong> A third-year Computer Science student working towards completing his Bachelor's degree and pursuing a Master's, balancing academic challenges with near-daily work commitments.</p>
          </div>

          <div className="contact-item">
            <h3>Creator 3</h3>
            <p><strong>Name:</strong> Johnny Chadi Ghattas</p>
            <p><strong>Phone:</strong> 71/449393</p>
            <p><strong>Role:</strong> Frontend & Data Contributor — supported frontend development, contributed to database handling, and assisted in the overall application design.</p>
            <p><strong>Details:</strong> A third-year Computer Science student focused on completing his Bachelor's degree and advancing to graduate studies, while managing the challenges of regular work alongside academic responsibilities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;