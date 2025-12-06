'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, Upload, Sparkles, RefreshCw, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { virtualTryOn } from '@/ai/flows/virtual-try-on-flow';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
}

const STEPS = {
  INITIAL: 'initial',
  CAPTURE: 'capture',
  GENERATING: 'generating',
  RESULT: 'result',
};

export default function VirtualTryOn({ product, onClose }: VirtualTryOnProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [step, setStep] = useState(STEPS.INITIAL);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const getCameraPermission = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
      setHasCameraPermission(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'Please enable camera permissions in your browser settings to use this app.',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (step === STEPS.CAPTURE) {
      getCameraPermission();
    }
  }, [step, getCameraPermission]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setUserImage(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };
  
  const handleTryOn = async () => {
    if (!userImage || !product.imageUrls[0]) {
      toast({ variant: 'destructive', title: 'Missing Image', description: 'Please provide both a hand and product image.' });
      return;
    }

    setStep(STEPS.GENERATING);
    try {
      const result = await virtualTryOn({
        userImage,
        productImage: product.imageUrls[0],
        productCategory: product.category,
      });
      setGeneratedImage(result.generatedImage);
      setStep(STEPS.RESULT);
    } catch (error) {
      console.error('Virtual Try-On failed:', error);
      toast({ variant: 'destructive', title: 'Generation Failed', description: 'Could not generate the try-on image. Please try again.' });
      handleReset();
    }
  };
  
  const handleReset = () => {
    stopCamera();
    setUserImage(null);
    setGeneratedImage(null);
    setStep(STEPS.INITIAL);
    setHasCameraPermission(null);
  };
  
  const handleClose = () => {
      stopCamera();
      onClose();
  }


  return (
    <DialogContent className="sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
      <DialogHeader>
        <DialogTitle className="text-primary text-2xl flex items-center gap-2">
            <Sparkles/> Virtual Try-On for {product.name}
        </DialogTitle>
        <DialogDescription>
          See how this beautiful piece looks on you. Use your camera or upload a photo.
        </DialogDescription>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        {step === STEPS.INITIAL && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
            <Button variant="outline" size="lg" className="h-24 flex-col gap-2" onClick={() => setStep(STEPS.CAPTURE)}>
              <Camera className="h-8 w-8 text-primary" />
              <span>Use Camera</span>
            </Button>
            <Button variant="outline" size="lg" className="h-24 flex-col gap-2 relative">
              <Upload className="h-8 w-8 text-primary" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} />
            </Button>
          </div>
        )}

        {step === STEPS.CAPTURE && (
          <div className="space-y-4">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
            </div>
            {hasCameraPermission === false && (
              <Alert variant="destructive">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access in your browser to use this feature.
                </AlertDescription>
              </Alert>
            )}
            <Button className="w-full" size="lg" onClick={handleCapture} disabled={!hasCameraPermission}>
              <Camera className="mr-2 h-5 w-5" /> Capture Photo
            </Button>
          </div>
        )}
        
        {userImage && (step !== STEPS.GENERATING && step !== STEPS.RESULT) && (
            <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">Your selected photo:</p>
                <Image src={userImage} alt="User's hand" width={300} height={225} className="rounded-lg mx-auto border" />
                <Button className="w-full" size="lg" onClick={handleTryOn}>
                    <Sparkles className="mr-2 h-5 w-5"/> Try it on!
                </Button>
            </div>
        )}

        {step === STEPS.GENERATING && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="text-muted-foreground">Our AI is working its magic...</p>
          </div>
        )}

        {step === STEPS.RESULT && generatedImage && (
          <div className="space-y-4 text-center">
            <p className="font-semibold text-primary">Here's how it looks!</p>
            <Image src={generatedImage} alt="Virtually tried-on product" width={600} height={450} className="rounded-lg mx-auto border" />
            <Button className="w-full" size="lg" onClick={handleReset}>
                <RefreshCw className="mr-2 h-5 w-5"/> Try Again
            </Button>
          </div>
        )}

      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={handleClose}>
          <X className="mr-2 h-4 w-4" /> Close
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
