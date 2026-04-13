import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, QrCode } from 'lucide-react';

export default function QRScanner({ isOpen, onClose }) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !scanning) return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        setError('Cannot access camera. ' + err.message);
        setScanning(false);
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, scanning]);

  const scan = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);

    if (code) {
      const scannedUrl = code.data;
      // Extract the path from the full URL if needed
      const path = scannedUrl.includes('/hint/') ? scannedUrl.substring(scannedUrl.indexOf('/hint/')) : scannedUrl;
      
      stopScanning();
      onClose();
      navigate(path);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(scan, 100);
    return () => clearInterval(interval);
  }, [scanning]);

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code) {
          const scannedUrl = code.data;
          const path = scannedUrl.includes('/hint/') ? scannedUrl.substring(scannedUrl.indexOf('/hint/')) : scannedUrl;
          onClose();
          navigate(path);
        } else {
          setError('No QR code found in this image.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-background border-2 border-primary/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                Scan Hint
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {!scanning ? (
              <div className="space-y-4">
                <button
                  onClick={() => setScanning(true)}
                  className="w-full py-4 bg-primary hover:bg-secondary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <QrCode className="w-5 h-5" />
                  Start Camera Scanner
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-white/20">or</span></div>
                </div>

                <label className="w-full py-4 bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] text-white/70 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  Select from Gallery
                </label>

                <p className="text-sm text-white/40 text-center font-light">
                  Use your camera or upload a saved QR image.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden border-2 border-primary/50">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full aspect-video object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-primary rounded-lg shadow-[inset_0_0_20px_rgba(var(--primary),0.3)]" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    stopScanning();
                  }}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all"
                >
                  Stop Scanning
                </button>
                <div className="flex items-center justify-center gap-2 text-sm text-primary animate-pulse">
                  <Loader className="w-4 h-4 animate-spin" />
                  Scanning...
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
