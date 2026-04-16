import { useState, useRef, useCallback } from 'react';

export default function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const browserSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!browserSupported) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const result = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(result);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [browserSupported]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { listening, transcript, startListening, stopListening, resetTranscript, browserSupported };
}