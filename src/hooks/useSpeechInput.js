import { useState, useEffect, useCallback, useRef } from 'react';

export default function useSpeechInput() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldRestartRef = useRef(false);
  const finalTranscriptRef = useRef('');

  const browserSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Naran necesita permiso para usar el micrófono.');
        shouldRestartRef.current = false;
        setListening(false);
      }
      // 'no-speech' is non-critical, onend will handle restart
    };

    recognition.onresult = (event) => {
      let interim = '';
      let finalBatch = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalBatch += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalBatch) finalTranscriptRef.current += finalBatch;
      setTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onend = () => {
      if (shouldRestartRef.current) {
        try {
          recognition.start();
        } catch {
          setListening(false);
          shouldRestartRef.current = false;
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      try { recognition.stop(); } catch {}
    };
  }, []);

  const startListening = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
    setError(null);
    shouldRestartRef.current = true;
    try {
      recognitionRef.current?.start();
    } catch {
      recognitionRef.current?.stop();
      setTimeout(() => {
        shouldRestartRef.current = true;
        try { recognitionRef.current?.start(); } catch {}
      }, 100);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return { listening, transcript, error, startListening, stopListening, resetTranscript, browserSupported };
}