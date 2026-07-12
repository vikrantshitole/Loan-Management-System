import { useCallback, useState } from 'react';

const useFormTouched = () => {
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const touch = useCallback((field) => {
    setTouched((current) => ({ ...current, [field]: true }));
  }, []);

  const markSubmitted = useCallback(() => {
    setSubmitted(true);
  }, []);

  const resetTouched = useCallback(() => {
    setTouched({});
    setSubmitted(false);
  }, []);

  return { touched, submitted, touch, markSubmitted, resetTouched, setSubmitted };
};

export default useFormTouched;
