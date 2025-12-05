'use client';

import { useState } from 'react';
import { useStorage } from '@/firebase/provider';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Trash2, FileVideo, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function FileUpload({ value, onChange }: FileUploadProps) {
  const storage = useStorage();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    await uploadFiles(files);
  };
  
  const uploadFiles = async (files: File[]) => {
      setIsUploading(true);
      setUploadProgress({});

      const uploadPromises = files.map(file => {
        return new Promise<string | null>((resolve, reject) => {
            const fileId = uuidv4();
            const fileExt = file.name.split('.').pop();
            const fileName = `${fileId}.${fileExt}`;
            const storageRef = ref(storage, `products/${fileName}`);
            
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(prev => ({...prev, [fileName]: progress}));
                },
                (error) => {
                    console.error("Upload error:", error);
                    toast({ variant: 'destructive', title: 'Upload failed', description: `Could not upload ${file.name}.` });
                    reject(null);
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (error) {
                        console.error("Error getting download URL:", error);
                        toast({ variant: 'destructive', title: 'Upload failed', description: `Could not get URL for ${file.name}.` });
                        reject(null);
                    }
                }
            );
        });
      });
      
      try {
        const urls = await Promise.all(uploadPromises);
        const successfulUrls = urls.filter((url): url is string => url !== null);
        onChange([...value, ...successfulUrls]);
        if (successfulUrls.length > 0) {
            toast({ title: "Upload complete", description: `${successfulUrls.length} file(s) uploaded.` });
        }
      } catch (error) {
         // Errors are handled inside the promise, but a catch block is good practice
         console.error("An error occurred during one of the uploads.", error);
      } finally {
        setIsUploading(false);
        // Reset progress after a short delay
        setTimeout(() => setUploadProgress({}), 2000);
      }
  }

  const handleDelete = async (url: string) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
      onChange(value.filter((currentUrl) => currentUrl !== url));
      toast({ title: 'File deleted' });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
       console.error('Firebase storage delete error:', error);
    }
  };
  
  const totalProgress = Object.values(uploadProgress).length > 0
    ? Object.values(uploadProgress).reduce((acc, p) => acc + p, 0) / Object.values(uploadProgress).length
    : 0;

  const getFileIcon = (url: string) => {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(url)) {
        return <Image src={url} alt="Uploaded image" width={40} height={40} className="rounded-md object-cover" />;
      }
      if (/\.(mp4|mov|avi|webm)$/i.test(url)) {
          return <FileVideo className="h-10 w-10 text-muted-foreground" />;
      }
      return <FileImage className="h-10 w-10 text-muted-foreground" />;
  }

  return (
    <div className="space-y-4">
      <div className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground">
          <UploadCloud className="h-10 w-10" />
          <span className="font-semibold text-white">Click to upload or drag and drop</span>
          <span className="text-xs">Images or videos</span>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="space-y-1">
          <p className="text-sm">Uploading...</p>
          <Progress value={totalProgress} />
        </div>
      )}

      {value && value.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Uploaded Files:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url) => (
              <div key={url} className="relative group bg-secondary p-2 rounded-lg border border-border">
                <div className="aspect-square w-full rounded-md flex items-center justify-center overflow-hidden">
                    {getFileIcon(url)}
                </div>
                <div className="absolute top-1 right-1">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(url)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete file</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
