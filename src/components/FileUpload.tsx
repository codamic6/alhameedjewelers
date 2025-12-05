'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Trash2, FileVideo, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

interface FileUploadProps {
  bucket: string;
  value: string[];
  onChange: (urls: string[]) => void;
}

export default function FileUpload({ bucket, value, onChange }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    await uploadFiles(files);
  };
  
  const uploadFiles = async (files: File[]) => {
      setIsUploading(true);
      setUploadProgress(0);

      const uploadedUrls = [...value];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (error) {
          toast({ variant: 'destructive', title: 'Upload failed', description: error.message });
          console.error('Supabase upload error:', error);
          continue; // Move to the next file
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        if (data.publicUrl) {
          uploadedUrls.push(data.publicUrl);
        }
      }
      
      onChange(uploadedUrls);
      setIsUploading(false);
      setUploadProgress(100);
      
      toast({ title: "Upload complete", description: `${files.length} file(s) uploaded.` });
       // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
  }

  const handleDelete = async (url: string) => {
    const fileName = url.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage.from(bucket).remove([fileName]);

    if (error) {
      toast({ variant: 'destructive', title: 'Delete failed', description: error.message });
      console.error('Supabase delete error:', error);
    } else {
      onChange(value.filter((currentUrl) => currentUrl !== url));
      toast({ title: 'File deleted' });
    }
  };

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
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div className="space-y-1">
          <p className="text-sm">Uploading...</p>
          <Progress value={uploadProgress} />
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
