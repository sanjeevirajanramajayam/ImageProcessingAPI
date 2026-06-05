const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password) => {
  if (password.length < 6) return "Password must be at least 6 characters";
  if (!/[a-z]/.test(password)) return "Password must contain lowercase letters";
  if (!/[A-Z]/.test(password)) return "Password must contain uppercase letters";
  if (!/[0-9]/.test(password)) return "Password must contain numbers";
  return null;
};

const validateUsername = (username) => {
  if (!username || username.trim().length < 2)
    return "Username must be at least 2 characters";
  return null;
};

export { validateEmail, validatePassword, validateUsername };
