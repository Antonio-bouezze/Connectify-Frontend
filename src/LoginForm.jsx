import { useMemo, useState } from "react";
import AvatarPicker from "./AvatarPicker";
import { USER_ICONS } from "./iconRegistry";

function LoginForm({ onSubmitForm, onBack, onOpenLoginFromForm }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    icon: "",
    iconColor: ""
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showAvatarConfirm, setShowAvatarConfirm] = useState(false);
  const [pendingIcon, setPendingIcon] = useState("");
  const [pendingIconColor, setPendingIconColor] = useState("");

  const selectedUserIcon = useMemo(() => {
    return USER_ICONS.find((icon) => icon.name === formData.icon)?.component || null;
  }, [formData.icon]);

  const pendingUserIcon = useMemo(() => {
    return USER_ICONS.find((icon) => icon.name === pendingIcon)?.component || null;
  }, [pendingIcon]);

  const validateUsername = (username) => {
    if (username.length < 5) {
      return "Username must be at least 5 characters long.";
    }

    if (!/^[A-Za-z0-9_/-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, "_", "-", and "/".';
    }

    if (!/[0-9]/.test(username)) {
      return "Username must contain at least 1 number.";
    }

    const letterCount = (username.match(/[A-Za-z]/g) || []).length;
    if (letterCount < 4) {
      return "Username must contain at least 4 letters.";
    }

    if (/\s/.test(username)) {
      return "Username cannot contain spaces.";
    }

    return "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required.";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else {
      const usernameError = validateUsername(formData.username);
      if (usernameError) {
        newErrors.username = usernameError;
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.icon || !formData.iconColor) {
      newErrors.icon = "Please choose and confirm your avatar.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));

    setSubmitError("");
  };

  const openAvatarPicker = () => {
    setPendingIcon(formData.icon || "");
    setPendingIconColor(formData.iconColor || "");
    setShowAvatarConfirm(false);
    setShowAvatarPicker(true);
  };

  const closeAvatarPicker = () => {
    setShowAvatarPicker(false);
    setShowAvatarConfirm(false);
  };

  const handlePendingIconSelect = (iconName) => {
    setPendingIcon(iconName);
    setPendingIconColor("");
    setShowAvatarConfirm(false);
  };

  const handlePendingColorSelect = (color) => {
    setPendingIconColor(color);
    setShowAvatarConfirm(true);
  };

  const confirmAvatarSelection = () => {
    setFormData((prev) => ({
      ...prev,
      icon: pendingIcon,
      iconColor: pendingIconColor
    }));

    setErrors((prev) => ({
      ...prev,
      icon: ""
    }));

    setShowAvatarConfirm(false);
    setShowAvatarPicker(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = onSubmitForm(formData);

    if (!result.success) {
      setSubmitError(result.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <button className="nav-style-btn" onClick={onBack}>
          Back
        </button>

        <h2 className="login-title">Create Your Connectify Account</h2>
        <p className="login-subtitle">
          Build your profile and get ready to access your messaging space.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="input-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="input-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
            </div>

            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                placeholder="Enter phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
            </div>
          </div>

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="At least 4 letters and 1 number"
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-row">
            <div className="input-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="password-input-wrap">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className="avatar-choose-row">
            <span className="avatar-choose-label">Choose icon</span>

            <button
              type="button"
              className="avatar-preview-trigger"
              onClick={openAvatarPicker}
            >
              {selectedUserIcon ? (
                (() => {
                  const SelectedIconComp = selectedUserIcon;
                  return <SelectedIconComp style={{ color: formData.iconColor }} />;
                })()
              ) : (
                <span className="avatar-preview-placeholder">+</span>
              )}
            </button>
          </div>

          {errors.icon && <span className="error-text">{errors.icon}</span>}

          <div className="username-rules">
            <p>Username rules:</p>
            <ul>
              <li>At least 4 letters</li>
              <li>At least 1 number</li>
              <li>Only letters, numbers, _, -, /</li>
              <li>No spaces allowed</li>
            </ul>
          </div>

          <div className="login-inline-message">
            <span>Already have an account? </span>
            <button
              type="button"
              className="text-link-btn"
              onClick={onOpenLoginFromForm}
            >
              Log-In
            </button>
          </div>

          {submitError && <div className="form-submit-error">{submitError}</div>}

          <button type="submit" className="submit-btn">
            Create Account
          </button>
        </form>
      </div>

      {showAvatarPicker && (
        <div className="avatar-popup-overlay" onClick={closeAvatarPicker}>
          <div className="avatar-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-popup-header">
              <h3 className="avatar-popup-title">Choose your icon</h3>
              <button
                type="button"
                className="avatar-popup-close-btn"
                onClick={closeAvatarPicker}
              >
                ✕
              </button>
            </div>

            <AvatarPicker
              type="user"
              selectedIcon={pendingIcon}
              selectedColor={pendingIconColor}
              onSelectIcon={handlePendingIconSelect}
              onSelectColor={handlePendingColorSelect}
            />
          </div>

          {showAvatarConfirm && (
            <div className="avatar-confirm-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="avatar-confirm-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="avatar-confirm-title">Confirm avatar</h3>
                <p className="avatar-confirm-text">
                  Do you want to use this avatar?
                </p>

                <div className="avatar-confirm-preview">
                  {pendingUserIcon && (() => {
                    const PendingIconComp = pendingUserIcon;
                    return <PendingIconComp style={{ color: pendingIconColor }} />;
                  })()}
                </div>

                <div className="avatar-confirm-actions">
                  <button
                    type="button"
                    className="avatar-confirm-yes-btn"
                    onClick={confirmAvatarSelection}
                  >
                    Yes
                  </button>

                  <button
                    type="button"
                    className="avatar-confirm-no-btn"
                    onClick={() => setShowAvatarConfirm(false)}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoginForm;