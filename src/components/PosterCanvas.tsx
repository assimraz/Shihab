import { useRef, useEffect, useCallback, useState } from "react";

interface PosterCanvasProps {
  uploadedImage: HTMLImageElement | null;
  backgroundImage: HTMLImageElement | null;
  nonagonSize: number;
  nonagonPosition: { x: number; y: number };
  userName: string;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

const PosterCanvas = ({ 
  uploadedImage, 
  backgroundImage, 
  nonagonSize,
  nonagonPosition,
  userName,
  onCanvasReady 
}: PosterCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Reset image offset when a new image is uploaded
  useEffect(() => {
    setImageOffset({ x: 0, y: 0 });
  }, [uploadedImage]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return { x, y };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width * nonagonPosition.x;
    const centerY = canvas.height * nonagonPosition.y;
    const radius = canvas.width * nonagonSize;
    
    // Check if click is within the nonagon area
    const dx = coords.x - centerX;
    const dy = coords.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < radius) {
      setIsDragging(true);
      lastPosRef.current = coords;
    }
  }, [getCanvasCoordinates, nonagonSize, nonagonPosition, uploadedImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const coords = getCanvasCoordinates(e);
    if (coords) {
      const deltaX = coords.x - lastPosRef.current.x;
      const deltaY = coords.y - lastPosRef.current.y;
      
      setImageOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPosRef.current = coords;
    }
  }, [isDragging, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!uploadedImage) return;
    
    const coords = getCanvasCoordinates(e);
    if (!coords) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const centerX = canvas.width * nonagonPosition.x;
    const centerY = canvas.height * nonagonPosition.y;
    const radius = canvas.width * nonagonSize;
    
    const dx = coords.x - centerX;
    const dy = coords.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < radius) {
      setIsDragging(true);
      lastPosRef.current = coords;
    }
  }, [getCanvasCoordinates, nonagonSize, nonagonPosition, uploadedImage]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const coords = getCanvasCoordinates(e);
    if (coords) {
      const deltaX = coords.x - lastPosRef.current.x;
      const deltaY = coords.y - lastPosRef.current.y;
      
      setImageOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      lastPosRef.current = coords;
    }
  }, [isDragging, getCanvasCoordinates]);

  const drawNonagon = useCallback((ctx: CanvasRenderingContext2D, centerX: number, centerY: number, radius: number) => {
    const sides = 9;
    const angle = (Math.PI * 2) / sides;
    const rotation = -Math.PI / 2;

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const x = centerX + radius * Math.cos(i * angle + rotation);
      const y = centerY + radius * Math.sin(i * angle + rotation);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
  }, []);

  const drawPoster = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (backgroundImage) {
      ctx.drawImage(backgroundImage, 0, 0, width, height);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#0d3a2a");
      gradient.addColorStop(1, "#051a12");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#FFD700";
      ctx.font = "bold 28px Poppins, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Upload a background template", width / 2, 100);
    }

    const centerX = width * nonagonPosition.x;
    const centerY = height * nonagonPosition.y;
    const radius = width * nonagonSize;

    if (uploadedImage) {
      ctx.save();
      drawNonagon(ctx, centerX, centerY, radius);
      ctx.clip();

      const imgWidth = uploadedImage.width;
      const imgHeight = uploadedImage.height;
      const imgAspect = imgWidth / imgHeight;

      const targetSize = radius * 2;
      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > 1) {
        drawHeight = targetSize;
        drawWidth = drawHeight * imgAspect;
      } else {
        drawWidth = targetSize;
        drawHeight = drawWidth / imgAspect;
      }

      // Apply image offset for panning
      drawX = centerX - drawWidth / 2 + imageOffset.x;
      drawY = centerY - drawHeight / 2 + imageOffset.y;

      ctx.drawImage(uploadedImage, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.save();
      drawNonagon(ctx, centerX, centerY, radius);
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 4;
      ctx.setLineDash([15, 10]);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(255, 215, 0, 0.5)";
      ctx.font = "24px Poppins, Arial";
      ctx.textAlign = "center";
      ctx.fillText("Your photo here", centerX, centerY);
    }

    // Draw user name below the photo with black color
    if (userName) {
      const nameY = centerY + radius + 60;
      ctx.fillStyle = "#000000";
      ctx.font = "bold 48px Poppins, Arial";
      ctx.textAlign = "center";
      ctx.fillText(userName.toUpperCase(), centerX, nameY);
    }

    onCanvasReady(canvas);
  }, [backgroundImage, uploadedImage, nonagonSize, nonagonPosition, userName, imageOffset, drawNonagon, onCanvasReady]);

  useEffect(() => {
    drawPoster();
  }, [drawPoster]);

  return (
    <div className="relative inline-block rounded-xl overflow-hidden shadow-2xl shadow-glow">
      <canvas 
        ref={canvasRef} 
        width={1000} 
        height={1200} 
        className={`max-w-[500px] w-full h-auto block ${uploadedImage ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
};

export default PosterCanvas;
