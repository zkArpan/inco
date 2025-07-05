import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Sparkles, RefreshCw, Image as ImageIcon, X } from 'lucide-react';

// Embedded succinct.xyz logo (hidden from user interface)
const SUCCINCT_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`
<svg width="72" height="103" viewBox="0 0 72 103" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M71.2968 10.2937V30.8773L53.4726 41.1672V20.5836L35.6484 30.8736V51.4572L17.8242 41.1672V20.5836L53.4726 0L71.2968 10.2937Z" fill="#FE11C5"/>
<path opacity="0.4" d="M35.6484 51.4579L17.8242 61.7478L0 51.4579L17.8242 41.168L35.6484 51.4579Z" fill="#FE11C5"/>
<path d="M53.4725 61.747V82.3306L17.8242 102.914L0 92.6205V72.0369L17.8242 61.747V82.3306L35.6484 72.0407V51.457L53.4725 61.747Z" fill="#FE11C5"/>
<path opacity="0.4" d="M71.2968 51.4579L53.4726 61.7478L35.6484 51.4579L53.4726 41.168L71.2968 51.4579Z" fill="#FE11C5"/>
</svg>

`)}`;

export const UploadPage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const drawTextAlongCircle = (ctx: CanvasRenderingContext2D, text: string, centerX: number, centerY: number, radius: number, startAngle: number) => {
    // Calculate arc length for 50% of circle (π radians = 180 degrees = 50% of circle)
    const arcLength = Math.PI; // 50% of circle circumference
    const angleStep = arcLength / text.length; // Distribute text evenly across 50% arc
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const angle = startAngle + (i * angleStep);
      
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      
      if (char === 'P' && text.startsWith('Prove')) {
        // Make "Prove" bold and pink
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 16px Inter';
      } else if (text.startsWith('Prove') && i < 5) {
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 16px Inter';
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = '16px Inter';
      }
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  };

  const processImage = async () => {
    if (!originalImage || !canvasRef.current) return;

    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size
      const size = 500;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Create outer glow effect
        const glowGradient = ctx.createRadialGradient(size/2, size/2, size/2 - 60, size/2, size/2, size/2);
        glowGradient.addColorStop(0, 'rgba(236, 72, 153, 0.4)');
        glowGradient.addColorStop(0.7, 'rgba(147, 51, 234, 0.3)');
        glowGradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, size, size);

        // Create clipping path for circular image
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 40, 0, 2 * Math.PI);
        ctx.clip();

        // Draw the main image
        ctx.drawImage(img, 40, 40, size - 80, size - 80);
        ctx.restore();

        // Add pink border
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 40, 0, 2 * Math.PI);
        ctx.stroke();

        // Add inner highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 45, 0, 2 * Math.PI);
        ctx.stroke();

        // Add tagline text along 50% of the border (top arc)
        const taglineRadius = size/2 - 25;
        // Start from top-left and span 50% of circle (π radians)
        drawTextAlongCircle(ctx, 'Prove the world\'s software', size/2, size/2, taglineRadius, -Math.PI * 0.75);

        // Add embedded succinct logo in bottom left
        const logoSize = 80;
        const logoX = 50;
        const logoY = size - logoSize - 50;

        // Create circular background for logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI);
        ctx.fill();

        // Add logo border
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Load and draw the embedded succinct logo
        const logoImg = new Image();
        logoImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 - 8, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logoImg, logoX + 8, logoY + 8, logoSize - 16, logoSize - 16);
          ctx.restore();

          setProcessedImage(canvas.toDataURL());
          setIsProcessing(false);
        };
        logoImg.src = SUCCINCT_LOGO_SVG;
      }
    };
    
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'succinctify-profile-enhanced.png';
      link.href = processedImage;
      link.click();
    }
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 py-8 px-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Succinctify
            </span>{' '}
            Your Profile
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your profile picture with signature succinct pink glow effect 
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upload Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-pink-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Upload className="w-6 h-6 mr-3" />
              Upload Your Image
            </h3>
            
            {!originalImage ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  isDragging 
                    ? 'border-pink-400 bg-pink-50' 
                    : 'border-gray-300 hover:border-pink-300 hover:bg-pink-25'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Drop your image here
                </p>
                <p className="text-gray-600 mb-6">
                  or click to browse your files
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-8 py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
                >
                  Choose Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                  <img 
                    src={originalImage} 
                    alt="Original" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={resetAll}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>Choose Different Image</span>
                </button>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-pink-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Sparkles className="w-6 h-6 mr-3" />
              Succinctified Preview
            </h3>
            
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mb-6">
              {processedImage ? (
                <img 
                  src={processedImage} 
                  alt="Succinctified" 
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">
                    {originalImage ? 'Ready to succinctify!' : 'Upload an image to see the magic'}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Features: Pink glow • Curved tagline • Succinct logo
                  </p>
                </div>
              )}
            </div>

            {processedImage && (
              <button
                onClick={downloadImage}
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Succinctified Image</span>
              </button>
            )}
          </div>
        </div>

        {/* Process Button */}
        {originalImage && (
          <div className="text-center">
            <button
              onClick={processImage}
              disabled={isProcessing}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-12 py-4 rounded-2xl font-semibold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3 mx-auto"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Succinctifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Succinctify My Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};