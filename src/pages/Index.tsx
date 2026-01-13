import { useState, useRef, useCallback } from 'react';
import { Camera, Sparkles, Download, Image } from 'lucide-react';
import PosterCanvas from '@/components/PosterCanvas';
import ControlButton from '@/components/ControlButton';
import { Slider } from '@/components/ui/slider';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nonagonSize, setNonagonSize] = useState(0.27);
  const [nonagonPosition, setNonagonPosition] = useState({ x: 50, y: 35 });
  const [userName, setUserName] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setUploadedImage(img);
          setIsLoading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleBackgroundUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setBackgroundImage(img);
          setIsLoading(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, []);


  const handleDownload = useCallback(() => {
    if (canvasElement) {
      const link = document.createElement('a');
      link.download = 'campaign-poster.png';
      link.href = canvasElement.toDataURL('image/png');
      link.click();
    }
  }, [canvasElement]);

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    setCanvasElement(canvas);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Campaign <span className="text-primary">Poster</span> Generator
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Upload your photo to create a personalized campaign poster
        </p>
      </div>

      <div className="mb-8">
        <PosterCanvas
          uploadedImage={uploadedImage}
          backgroundImage={backgroundImage}
          nonagonSize={nonagonSize}
          nonagonPosition={{ x: nonagonPosition.x / 100, y: nonagonPosition.y / 100 }}
          userName={userName}
          onCanvasReady={handleCanvasReady}
        />
      </div>

      <div className="w-full max-w-[400px] mb-4 px-4">
        <label className="text-sm text-muted-foreground mb-2 block text-center">
          Your Name
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary"
          maxLength={50}
        />
      </div>

      <div className="w-full max-w-[400px] mb-4 px-4">
        <label className="text-sm text-muted-foreground mb-2 block text-center">
          Frame Size
        </label>
        <Slider
          value={[nonagonSize * 100]}
          onValueChange={(value) => setNonagonSize(value[0] / 100)}
          min={10}
          max={45}
          step={1}
          className="w-full"
        />
      </div>

      <div className="w-full max-w-[400px] mb-4 px-4">
        <label className="text-sm text-muted-foreground mb-2 block text-center">
          Frame Position (Horizontal)
        </label>
        <Slider
          value={[nonagonPosition.x]}
          onValueChange={(value) => setNonagonPosition(prev => ({ ...prev, x: value[0] }))}
          min={15}
          max={85}
          step={1}
          className="w-full"
        />
      </div>

      <div className="w-full max-w-[400px] mb-6 px-4">
        <label className="text-sm text-muted-foreground mb-2 block text-center">
          Frame Position (Vertical)
        </label>
        <Slider
          value={[nonagonPosition.y]}
          onValueChange={(value) => setNonagonPosition(prev => ({ ...prev, y: value[0] }))}
          min={15}
          max={75}
          step={1}
          className="w-full"
        />
      </div>

      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <input
          ref={bgInputRef}
          type="file"
          accept="image/*"
          onChange={handleBackgroundUpload}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <ControlButton onClick={() => bgInputRef.current?.click()}>
          <Image size={20} />
          Background
        </ControlButton>

        <ControlButton onClick={() => imageInputRef.current?.click()}>
          <Camera size={20} />
          Your Photo
        </ControlButton>

        <ControlButton
          onClick={handleDownload}
          variant="success"
          disabled={!uploadedImage}
        >
          <Download size={20} />
          Download
        </ControlButton>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
          <Sparkles size={16} className="text-primary" />
          {isLoading ? 'Loading...' : 'Drag your photo to reposition • Use slider to resize'}
        </p>
      </div>
    </div>
  );
};

export default Index;
