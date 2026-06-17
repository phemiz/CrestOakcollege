// Input validation schemes and helpers

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9+()-\s]{10,15}$/;
  return phoneRegex.test(phone);
};

export const validateJambScore = (score: number): boolean => {
  return score >= 140 && score <= 400;
};
