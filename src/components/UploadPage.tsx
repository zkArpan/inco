import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Sparkles, RefreshCw, Image as ImageIcon, X, Copy, Check } from 'lucide-react';

// Modern X Logo Component
const XLogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// Embedded INCO logo (hidden from user interface)
const INCO_LOGO_SVG = `data:image/svg+xml;base64,${btoa(`
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080">
  <defs>
    <style>
      .cls-1 {
        fill: #fff;
      }

      .cls-2 {
        fill: #3673f5;
      }
    </style>
  </defs>
  <circle class="cls-2" cx="540" cy="540" r="540"/>
  <g>
    <path class="cls-1" d="M205.2,745.75l108.86-411.5h117.93l-108.86,411.5h-117.94Z"/>
    <path class="cls-1" d="M432,745.75l108.87-411.5h117.93l-108.86,411.5h-117.94Z"/>
    <path class="cls-1" d="M658.8,745.75l108.86-411.5h117.94l-108.86,411.5h-117.94Z"/>
  </g>
</svg>



`)}`;

export const UploadPage: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
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
      
      // Set font and styling
      ctx.font = 'bold 14px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Add black border/stroke for better visibility
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.strokeText(char, 0, 0);
      
      // Add white fill text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
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

        // Create blue cloudy background effect for entire canvas
        const mainCloudGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        mainCloudGradient.addColorStop(0, 'rgba(147, 197, 253, 0.8)');
        mainCloudGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.6)');
        mainCloudGradient.addColorStop(0.6, 'rgba(219, 234, 254, 0.7)');
        mainCloudGradient.addColorStop(1, 'rgba(239, 246, 255, 0.9)');
        
        ctx.fillStyle = mainCloudGradient;
        ctx.fillRect(0, 0, size, size);
        
        // Add multiple layers of blue cloud effects across entire canvas
        for (let i = 0; i < 25; i++) {
          const cloudX = (size/2) + Math.cos(i * Math.PI / 6) * (size/3 + Math.random() * 80);
          const cloudY = (size/2) + Math.sin(i * Math.PI / 6) * (size/3 + Math.random() * 80);
          const cloudSize = 20 + Math.random() * 45;
          const opacity = 0.3 + Math.random() * 0.5; // Random opacity between 0.3-0.8
          
          const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          cloudGrad.addColorStop(0, `rgba(147, 197, 253, ${opacity * 0.9})`);
          cloudGrad.addColorStop(0.4, `rgba(59, 130, 246, ${opacity * 0.7})`);
          cloudGrad.addColorStop(0.8, `rgba(219, 234, 254, ${opacity * 0.8})`);
          cloudGrad.addColorStop(1, `rgba(239, 246, 255, ${opacity * 0.4})`);
          
          ctx.fillStyle = cloudGrad;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Add medium-sized overlapping clouds
        for (let i = 0; i < 35; i++) {
          const cloudX = Math.random() * size;
          const cloudY = Math.random() * size;
          const cloudSize = 15 + Math.random() * 25;
          const opacity = 0.2 + Math.random() * 0.6; // Random opacity between 0.2-0.8
          
          const smallCloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          smallCloudGrad.addColorStop(0, `rgba(219, 234, 254, ${opacity * 0.8})`);
          smallCloudGrad.addColorStop(0.6, `rgba(239, 246, 255, ${opacity * 0.6})`);
          smallCloudGrad.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.3})`);
          
          ctx.fillStyle = smallCloudGrad;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Add many small overlapping cloud bubbles for texture
        for (let i = 0; i < 50; i++) {
          const cloudX = Math.random() * size;
          const cloudY = Math.random() * size;
          const cloudSize = 5 + Math.random() * 12;
          const opacity = 0.1 + Math.random() * 0.4; // Random opacity between 0.1-0.5
          
          const tinyCloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          tinyCloudGrad.addColorStop(0, `rgba(147, 197, 253, ${opacity * 0.9})`);
          tinyCloudGrad.addColorStop(0.5, `rgba(219, 234, 254, ${opacity * 0.7})`);
          tinyCloudGrad.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.2})`);
          
          ctx.fillStyle = tinyCloudGrad;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Add extra large soft clouds for depth
        for (let i = 0; i < 8; i++) {
          const cloudX = Math.random() * size;
          const cloudY = Math.random() * size;
          const cloudSize = 40 + Math.random() * 60;
          const opacity = 0.1 + Math.random() * 0.3; // Very soft opacity between 0.1-0.4
          
          const largeCloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
          largeCloudGrad.addColorStop(0, `rgba(59, 130, 246, ${opacity * 0.6})`);
          largeCloudGrad.addColorStop(0.3, `rgba(147, 197, 253, ${opacity * 0.8})`);
          largeCloudGrad.addColorStop(0.7, `rgba(219, 234, 254, ${opacity * 0.5})`);
          largeCloudGrad.addColorStop(1, `rgba(239, 246, 255, ${opacity * 0.2})`);
          
          ctx.fillStyle = largeCloudGrad;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudSize, 0, 2 * Math.PI);
          ctx.fill();
        }

        // Create clipping path for circular image
        ctx.save();
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 40, 0, 2 * Math.PI);
        ctx.clip();

        // Draw the main image
        ctx.drawImage(img, 40, 40, size - 80, size - 80);
        ctx.restore();

        // Add blue border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
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
        drawTextAlongCircle(ctx, '#Incommunity', size/2, size/2, taglineRadius, -Math.PI * 0.75);

        // Add embedded Incofy logo in bottom left
        const logoSize = 80;
        const logoX = 50;
        const logoY = size - logoSize - 50;

        // Create circular background for logo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, 2 * Math.PI);
        ctx.fill();

        // Add logo border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Load and draw the embedded Incofy logo
        const logoImg = new Image();
        logoImg.onload = () => {
          // Calculate proper scaling to maintain aspect ratio
          const logoAspectRatio = logoImg.naturalWidth / logoImg.naturalHeight;
          const availableSize = logoSize - 16; // Account for padding
          
          let drawWidth, drawHeight, drawX, drawY;
          
          if (logoAspectRatio > 1) {
            // Logo is wider than tall
            drawWidth = availableSize;
            drawHeight = availableSize / logoAspectRatio;
          } else {
            // Logo is taller than wide or square
            drawHeight = availableSize;
            drawWidth = availableSize * logoAspectRatio;
          }
          
          // Center the logo within the circle
          drawX = logoX + (logoSize - drawWidth) / 2;
          drawY = logoY + (logoSize - drawHeight) / 2;
          
          ctx.save();
          ctx.beginPath();
          ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2 - 8, 0, 2 * Math.PI);
          ctx.clip();
          ctx.drawImage(logoImg, drawX, drawY, drawWidth, drawHeight);
          ctx.restore();

          setProcessedImage(canvas.toDataURL());
          setIsProcessing(false);
        };
        logoImg.src = INCO_LOGO_SVG;
      }
    };
    
    img.src = originalImage;
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.download = 'incofy-profile-enhanced.png';
      link.href = processedImage;
      link.click();
    }
  };

  const copyImageToClipboard = async () => {
    if (!processedImage || !canvasRef.current) return;

    try {
      // Convert canvas to blob
      const canvas = canvasRef.current;
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setImageCopied(true);
            setTimeout(() => setImageCopied(false), 3000);
          } catch (err) {
            console.error('Failed to copy image to clipboard:', err);
            // Fallback: just show instructions
            setShowInstructions(true);
          }
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy image:', err);
      setShowInstructions(true);
    }
  };

  const postToX = async () => {
    // First copy the image to clipboard
    await copyImageToClipboard();
    
    // Then open X with pre-filled text
    const tweetText = "Incofied my profile with https://incofy.vercel.app/ #incommunity , @inconetwork";
    const encodedText = encodeURIComponent(tweetText);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
    
    // Show instructions
    setShowInstructions(true);
    
    // Open X in new tab
    setTimeout(() => {
      window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    }, 500);
  };

  const resetAll = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setImageCopied(false);
    setShowInstructions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 py-8 px-4">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Incofy
            </span>{' '}
            Your Profile
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your profile picture with signature blue cloud effect 
          </p>
        </div>

        {/* Instructions Modal */}
        {showInstructions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <XLogo className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Almost There!</h3>
                <div className="space-y-3 text-left mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">1</span>
                    </div>
                    <p className="text-gray-700">X will open with your tweet text ready</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">2</span>
                    </div>
                    <p className="text-gray-700">
                      {imageCopied ? 
                        "Your image is copied! Paste it (Ctrl+V or Cmd+V) in the tweet" :
                        "Click the photo icon and upload your incofied image"
                      }
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-sm font-bold">3</span>
                    </div>
                    <p className="text-gray-700">Hit Tweet and show off your incofied profile!</p>
                  </div>
                </div>
                
                {imageCopied && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                      <Check className="w-5 h-5" />
                      <span className="font-semibold">Image copied to clipboard!</span>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setShowInstructions(false)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-2xl font-semibold hover:shadow-lg transition-all"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}

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
              Incofied Preview
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
                    {originalImage ? 'Ready to incofy!' : 'Upload an image to Incofy'}
                  </p>
                 
                </div>
              )}
            </div>

            {processedImage && (
              <div className="space-y-3">
                <button
                  onClick={downloadImage}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Incofied Image</span>
                </button>
                
                <button
                  onClick={copyImageToClipboard}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  {imageCopied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span>Image Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copy Image</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={postToX}
                  className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center space-x-3 transition-all"
                >
                  <XLogo className="w-5 h-5" />
                  <span>Post to X</span>
                  {imageCopied && <Check className="w-5 h-5 text-green-400" />}
                </button>
              </div>
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
                  <span>Incofying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Incofy My Profile</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};