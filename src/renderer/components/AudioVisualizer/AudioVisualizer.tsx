/**
 * Audio Visualizer Component
 * 
 * Real-time audio visualization using Web Audio API and Canvas.
 * Displays frequency bars and waveform when microphone is active.
 * 
 * @module renderer/components/AudioVisualizer
 */

import React, { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../../store/app.store';
import { getAudioService } from '../../services/audio-service';
import './AudioVisualizer.css';

/**
 * Audio visualizer component
 * 
 * @returns {JSX.Element} The audio visualizer component
 */
export const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array>();
  
  const { isMicActive, isProcessingVoice } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const audioService = getAudioService();

  /**
   * Initialize audio context and analyser
   */
  useEffect(() => {
    if (isMicActive && !isInitialized) {
      initializeAudio();
    }

    return () => {
      cleanup();
    };
  }, [isMicActive]);

  /**
   * Initialize Web Audio API using audio service
   */
  const initializeAudio = async () => {
    try {
      // Get analyser node from audio service
      const analyser = audioService.getAnalyserNode();
      
      if (analyser) {
        analyserRef.current = analyser;
        const bufferLength = analyser.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
        setIsInitialized(true);
        startVisualization();
      } else {
        console.warn('Audio service analyser not available yet');
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  };

  /**
   * Start visualization animation
   */
  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;

      animationRef.current = requestAnimationFrame(draw);

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);

      // Clear canvas
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / dataArrayRef.current.length) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < dataArrayRef.current.length; i++) {
        barHeight = (dataArrayRef.current[i] / 255) * canvas.height * 0.8;

        // Color gradient based on frequency
        const hue = (i / dataArrayRef.current.length) * 360;
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;

        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  /**
   * Cleanup audio resources
   */
  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    analyserRef.current = null;
    setIsInitialized(false);
  };

  /**
   * Render static visualization when mic is inactive
   */
  const renderStaticVisualization = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'rgba(17, 24, 39, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw static bars
    const barCount = 50;
    const barWidth = canvas.width / barCount;

    for (let i = 0; i < barCount; i++) {
      const barHeight = Math.random() * 20 + 5;
      const x = i * barWidth;
      const y = canvas.height / 2 - barHeight / 2;

      ctx.fillStyle = 'rgba(75, 85, 99, 0.3)';
      ctx.fillRect(x, y, barWidth - 2, barHeight);
    }
  };

  useEffect(() => {
    if (!isMicActive) {
      renderStaticVisualization();
    }
  }, [isMicActive]);

  return (
    <div className="audio-visualizer">
      <div className="audio-visualizer__container">
        <canvas
          ref={canvasRef}
          className="audio-visualizer__canvas"
          width={800}
          height={100}
        />
        <div className="audio-visualizer__overlay">
          <div className="audio-visualizer__status">
            {isProcessingVoice ? (
              <>
                <span className="audio-visualizer__icon processing">🎤</span>
                <span className="audio-visualizer__text">Processing voice...</span>
              </>
            ) : isMicActive ? (
              <>
                <span className="audio-visualizer__icon active">🎙️</span>
                <span className="audio-visualizer__text">Listening...</span>
              </>
            ) : (
              <>
                <span className="audio-visualizer__icon">🔇</span>
                <span className="audio-visualizer__text">Say "Ollama" to activate</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Made with Bob
