'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { UploadCloud, Trash2, FileVideo, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
}

export default function FileUpload({ value, onChange, bucket = 'Assets' }: FileUploadProps) {
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
        return new Promise<string | null>(async (resolve, reject) => {
            const fileId = uuidv4();
            const fileExt = file.name.split('.').pop();
            const filePath = `${fileId}.${fileExt}`;
            
            // NOTE: We are NOT passing any token, this relies on the bucket allowing public anonymous uploads.
            const { error: uploadError } = await supabase.storage
              .from(bucket)
              .upload(filePath, file);

            if (uploadError) {
                console.error("Upload error:", uploadError);
                toast({ variant: 'destructive', title: 'Upload failed', description: uploadError.message });
                reject(null);
                return;
            }

            const { data } = supabase.storage
              .from(bucket)
              .getPublicUrl(filePath);

            if (data?.publicUrl) {
                resolve(data.publicUrl);
            } else {
                console.error("Error getting public URL");
                toast({ variant: 'destructive', title: 'Upload failed', description: `Could not get URL for ${file.name}.` });
                reject(null);
            }
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
         console.error("An error occurred during one of the uploads.", error);
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress({}), 2000);
      }
  }

  const handleDelete = async (url: string) => {
    try {
      const filePath = new URL(url).pathname.split(`/${bucket}/`)[1];
      // NOTE: We are NOT passing any token, this relies on the bucket allowing public anonymous deletes.
      const { error } = await supabase.storage.from(bucket).remove([filePath]);

      if (error) throw error;
      
      onChange(value.filter((currentUrl) => currentUrl !== url));
      toast({ title: 'File deleted' });
    } catch (error: any) {
       toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
       console.error('Supabase storage delete error:', error);
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
