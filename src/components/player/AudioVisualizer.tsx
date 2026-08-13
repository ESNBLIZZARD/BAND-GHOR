import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface AudioVisualizerProps {
  isPlaying: boolean;
  activeColor?: string;
  barCount?: number;
}

// Simple hash function to generate deterministic pseudo-random values based on time
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function AudioVisualizer({ isPlaying, activeColor = '255, 255, 255', barCount = 40 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const progressRef = useRef(0);
  
  // Keep track of progress without triggering re-renders
  useEffect(() => {
    return usePlayerStore.subscribe((state) => {
      progressRef.current = state.progress;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const colorRGB = activeColor ? activeColor : '255, 255, 255';
    
    let time = 0;
    const targetHeights = new Float32Array(barCount);
    const currentHeights = new Float32Array(barCount);
    const peakHeights = new Float32Array(barCount);
    
    for (let i = 0; i < barCount; i++) {
      targetHeights[i] = 0.05;
      currentHeights[i] = 0.05;
      peakHeights[i] = 0;
    }

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const barWidth = (rect.width / barCount) * 0.7;
      const spacing = (rect.width / barCount) * 0.3;
      const maxHeight = rect.height;
      
      time += 0.1;
      
      const gradient = ctx.createLinearGradient(0, rect.height, 0, 0);
      gradient.addColorStop(0, `rgba(${colorRGB}, 0.2)`);
      gradient.addColorStop(0.5, `rgba(${colorRGB}, 0.6)`);
      gradient.addColorStop(1, `rgba(${colorRGB}, 1)`);

      // Use the actual song progress to seed the "frequencies"
      // This makes the visualizer deterministic and tied exactly to the song's position
      const currentSecond = Math.floor(progressRef.current * 10); // 100ms granularity for quick updates

      for (let i = 0; i < barCount; i++) {
        if (isPlaying) {
          const normalizedIndex = i / barCount;
          
          // Use seeded random based on the song's current time + bar index
          // This creates a deterministic "frequency" that perfectly syncs with playback!
          const beatSeed = currentSecond * 100 + i;
          const energy = seededRandom(beatSeed);
          
          // Organic waves mixed with the deterministic energy
          const wave1 = Math.sin(time * 0.5 - normalizedIndex * 4);
          const wave2 = Math.sin(time * 1.2 + normalizedIndex * 8);
          
          // Bass gets more energy (lower indexes)
          const bassBoost = (1 - normalizedIndex) * 0.6;
          
          let rawHeight = (energy * 0.7 + wave1 * 0.15 + wave2 * 0.15) * Math.random();
          rawHeight = rawHeight + bassBoost;
          
          targetHeights[i] = Math.min(Math.max(rawHeight, 0.05), 1.0);
          
          // Fast attack, slow decay for snappy realistic response
          if (targetHeights[i] > currentHeights[i]) {
            currentHeights[i] += (targetHeights[i] - currentHeights[i]) * 0.5; 
          } else {
            currentHeights[i] += (targetHeights[i] - currentHeights[i]) * 0.15; 
          }
          
          if (currentHeights[i] > peakHeights[i]) {
            peakHeights[i] = currentHeights[i];
          } else {
            peakHeights[i] -= 0.015;
          }
        } else {
          currentHeights[i] *= 0.85;
          peakHeights[i] *= 0.9;
          if (currentHeights[i] < 0.02) currentHeights[i] = 0.02;
          if (peakHeights[i] < 0.02) peakHeights[i] = 0;
        }
        
        const h = Math.max(currentHeights[i] * maxHeight, 2);
        const x = i * (barWidth + spacing) + spacing / 2;
        const y = rect.height - h;
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, barWidth / 2);
        ctx.fill();
        
        if (peakHeights[i] > 0) {
          const peakY = rect.height - (peakHeights[i] * maxHeight);
          ctx.fillStyle = `rgba(${colorRGB}, 0.9)`;
          ctx.beginPath();
          ctx.roundRect(x, peakY - 3, barWidth, 3, 1.5);
          ctx.fill();
        }
      }
      
      if (isPlaying || currentHeights.some(h => h > 0.05) || peakHeights.some(p => p > 0)) {
         animationRef.current = requestAnimationFrame(draw);
      }
    };
    
    if (isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(draw);
    } else {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
       animationRef.current = requestAnimationFrame(draw);
    }
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, activeColor, barCount]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      style={{ display: 'block', filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.2))' }}
    />
  );
}
