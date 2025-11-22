import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, RefreshCw, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { analyzeWasteImage } from '../services/geminiService';
import { WasteAnalysisResult, WasteCategory } from '../types';

const WasteScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<WasteAnalysisResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      setCameraError("Could not access camera. Please allow permissions or use file upload.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        stopCamera();
        handleAnalyze(dataUrl);
      }
    }
  }, [stream]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImage(dataUrl);
        handleAnalyze(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (base64Data: string) => {
    setAnalyzing(true);
    setResult(null);
    // Strip prefix for API
    const base64Content = base64Data.split(',')[1];
    const analysis = await analyzeWasteImage(base64Content);
    setResult(analysis);
    setAnalyzing(false);
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setAnalyzing(false);
    startCamera();
  };

  const getCategoryColor = (cat: WasteCategory) => {
    if (cat.includes('Organic')) return 'bg-green-100 text-green-800 border-green-500';
    if (cat.includes('Recyclable')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (cat.includes('Hazardous') || cat.includes('E-Waste')) return 'bg-red-100 text-red-800 border-red-500';
    return 'bg-gray-100 text-gray-800 border-gray-500';
  };

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full p-4 overflow-y-auto scrollbar-hide">
      
      <div className="w-full mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">AI Waste Scanner</h2>
        <p className="text-sm text-slate-500">Point your camera at an item to sort it instantly.</p>
      </div>

      {/* Camera/Image Area */}
      <div className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden shadow-lg mb-6 border border-slate-200 group">
        {!image && (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
              onLoadedMetadata={() => {
                // Ensure video plays smoothly
                 videoRef.current?.play().catch(e => console.log("Autoplay prevented", e));
              }}
            />
            {!stream && !cameraError && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
                 <button 
                  onClick={startCamera}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all flex items-center gap-2"
                 >
                   <Camera size={20} />
                   Start Camera
                 </button>
                 <div className="my-3 text-slate-400 text-xs font-medium uppercase tracking-wider">OR</div>
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="text-emerald-600 font-medium hover:text-emerald-800 transition-colors flex items-center gap-2"
                 >
                   <Upload size={18} />
                   Upload Image
                 </button>
               </div>
            )}
            {cameraError && !stream && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 p-6 text-center">
                  <AlertTriangle className="text-amber-500 mb-3" size={40} />
                  <p className="text-slate-600 mb-4 text-sm">{cameraError}</p>
                  <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="bg-emerald-600 text-white px-4 py-2 rounded-lg shadow hover:bg-emerald-700"
                 >
                   Upload Instead
                 </button>
               </div>
            )}
          </>
        )}

        {image && (
          <img src={image} alt="Captured" className="w-full h-full object-cover" />
        )}

        {/* Capture Button Overlay */}
        {stream && !analyzing && !image && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button 
              onClick={captureImage}
              className="w-16 h-16 rounded-full bg-white border-4 border-emerald-500 shadow-xl hover:scale-105 transition-transform"
              aria-label="Capture"
            />
          </div>
        )}

        {/* Analyzing Overlay */}
        {analyzing && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
            <RefreshCw className="animate-spin mb-3" size={40} />
            <p className="font-medium tracking-wide animate-pulse">Analyzing Waste...</p>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileUpload} 
        />
      </div>

      {/* Results Area */}
      {result && !analyzing && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`p-5 rounded-xl border-l-4 shadow-sm mb-4 ${getCategoryColor(result.category)}`}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  {result.category}
                  {result.confidence > 80 && <CheckCircle size={16} />}
                </h3>
                <p className="text-xs opacity-80 font-medium">{result.description}</p>
              </div>
              <span className="text-xs font-mono bg-white/50 px-2 py-1 rounded">
                {Math.round(result.confidence)}% Conf.
              </span>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">Disposal Advice</p>
                <p className="text-sm font-medium leading-relaxed">{result.disposalAdvice}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">Recyclable?</p>
                  <p className="text-sm font-bold">{result.recyclingPotential}</p>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <p className="text-xs font-semibold opacity-70 uppercase tracking-wider mb-1">Decomposition</p>
                  <p className="text-sm font-bold">{result.estimatedDecompositionTime}</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={reset}
            className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium shadow hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Scan Another Item
          </button>
        </div>
      )}
      
      {/* Initial State Instructions if camera not active */}
      {!stream && !image && !cameraError && (
         <div className="w-full p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm flex gap-3">
            <Info className="shrink-0 mt-0.5" size={18} />
            <p>Using AI, this scanner identifies waste types and tells you exactly which bin to use according to Dhaka City Corporation guidelines.</p>
         </div>
      )}

    </div>
  );
};

export default WasteScanner;