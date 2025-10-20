import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CloseIcon } from './icons/FeatureIcons';

interface WhiteboardPanelProps {
  onClose: () => void;
}

const colors = ['#FFFFFF', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7'];
const strokeWidths = [2, 5, 10, 15];

const PenIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.685 2.216a2.5 2.5 0 0 1 3.536 3.536L8.276 19.697H4.5v-3.776L18.685 2.216z" /></svg>;
const EraserIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20.311 20.311L3.689 3.689m16.622 0L3.689 20.311a2.5 2.5 0 0 1-3.536-3.536L16.775.239a2.5 2.5 0 0 1 3.536 3.536z" /></svg>;

const WhiteboardPanel: React.FC<WhiteboardPanelProps> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [isErasing, setIsErasing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    if(width === 0 || height === 0) return;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(window.devicePixelRatio, window.devicePixelRatio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;
  }, []);
  
  useEffect(() => {
    if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.lineWidth = strokeWidth;
    }
  }, [color, strokeWidth]);

  const getCoords = (event: MouseEvent | TouchEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    let clientX, clientY;
    if ('touches' in event) {
        if (event.touches.length === 0) return null; // Safeguard for empty touch list
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const context = contextRef.current;
    if (!context) return;
    const coords = getCoords(event.nativeEvent);
    if (!coords) return;
    const { x, y } = coords;

    context.beginPath();
    context.moveTo(x, y);
    setIsDrawing(true);
    event.preventDefault();
  }, []);

  const draw = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const context = contextRef.current;
    if (!context) return;
    const coords = getCoords(event.nativeEvent);
    if (!coords) return;
    const { x, y } = coords;

    context.lineTo(x, y);
    context.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.stroke();
    event.preventDefault();
  }, [isDrawing, color, strokeWidth, isErasing]);

  const stopDrawing = useCallback(() => {
    const context = contextRef.current;
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
  }, []);
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleToolClick = (tool: 'pen' | 'eraser') => setIsErasing(tool === 'eraser');

  return (
    <div className="w-full h-full bg-gray-900/80 backdrop-blur-lg border-l border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h2 className="text-xl font-bold">Whiteboard</h2>
        <button onClick={onClose} aria-label="Close whiteboard panel" className="p-1 rounded-full hover:bg-slate-700/60">
          <CloseIcon />
        </button>
      </div>

      <div className="flex-shrink-0 p-3 space-y-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => handleToolClick('pen')} className={`p-2 rounded-lg transition-colors ${!isErasing ? 'bg-blue-600 text-white' : 'bg-slate-700/60 hover:bg-slate-700'}`}><PenIcon /></button>
            <button onClick={() => handleToolClick('eraser')} className={`p-2 rounded-lg transition-colors ${isErasing ? 'bg-blue-600 text-white' : 'bg-slate-700/60 hover:bg-slate-700'}`}><EraserIcon /></button>
          </div>
          <button onClick={clearCanvas} className="px-3 py-1.5 text-sm rounded-lg bg-red-600/80 hover:bg-red-600 text-white font-semibold">Clear All</button>
        </div>
        <div className="flex items-center justify-between">
            {colors.map(c => ( <button key={c} onClick={() => {setColor(c); setIsErasing(false);}} style={{ backgroundColor: c }} className={`w-7 h-7 rounded-full transition-transform transform hover:scale-110 ${color === c && !isErasing ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white' : ''}`}></button> ))}
        </div>
        <div className="flex items-center justify-between gap-2">
            {strokeWidths.map(w => ( <button key={w} onClick={() => setStrokeWidth(w)} className={`flex-1 py-1 rounded-lg text-sm font-semibold transition-colors ${strokeWidth === w ? 'bg-blue-600 text-white' : 'bg-slate-700/60 hover:bg-slate-700'}`}>{w}px</button> ))}
        </div>
      </div>
      
      <div className="flex-1 p-2 bg-slate-800/60 relative">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
          onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
          className="w-full h-full bg-white/95 rounded-lg cursor-crosshair"
        />
      </div>
      <div className="p-4 border-t border-slate-700/50">
        <p className="text-xs text-gray-500 text-center">Whiteboard is local-only in this demo.</p>
      </div>
    </div>
  );
};

export default WhiteboardPanel;