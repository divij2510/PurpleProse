// src/components/PostEditor.tsx
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const postSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Title must be at least 5 characters' })
    .max(100, { message: 'Title must be at most 100 characters' }),
  content: z
    .string()
    .min(20, { message: 'Content must be at least 20 characters' }),
});

// This now *includes* id
export type PostFormValues = {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  imageFile?: File;
};

interface PostEditorProps {
  initialValues?: {
    id?: number;
    title?: string;
    content?: string;
    tags?: string[];
    imageUrl?: string;
  };
  onSubmit: (data: PostFormValues) => void;
  isLoading: boolean;
}

export default function PostEditor({
  initialValues = {},
  onSubmit,
  isLoading,
}: PostEditorProps) {
  const [tags, setTags] = useState<string[]>(initialValues.tags || []);
  const [content, setContent] = useState(initialValues.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialValues.imageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialValues.title || '',
      content: initialValues.content || '',
    },
  });

  useEffect(() => {
    form.setValue('content', content);
  }, [content, form]);

  function handleSubmit(values: z.infer<typeof postSchema>) {
    // Strip tags' HTML from content to validate length
    const plain = content.replace(/<(.|\n)*?>/g, '').trim();
    if (plain.length < 20) {
      toast.error('Content must be at least 20 characters');
      return;
    }

    // Build the payload
    const payload: PostFormValues = {
      id: initialValues.id,      // <<< include the post ID for updates
      title: values.title,
      content,
      tags,
    };

    if (imageFile) {
      payload.imageFile = imageFile;
    }

    onSubmit(payload);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. JPG, PNG or WebP only.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max size is 5MB.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // React Quill toolbar config...
  const modules = { /* ...same as before... */ };
  const formats = [ /* ...same as before... */];

  return (
    <Card className="bg-black/40 border-gray-700">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <div>
              <FormLabel>Tags</FormLabel>
              <TagsInput value={tags} onChange={setTags} />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <FormLabel>Cover Image</FormLabel>
              <div className="flex flex-col gap-4">
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className="hidden"
                />

                {/* Upload / Change button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  <span>{imagePreview ? 'Change cover image' : 'Upload cover image'}</span>
                  {!imagePreview && (
                    <span className="text-xs text-gray-400">
                      JPG, PNG or WebP — max 5MB
                    </span>
                  )}
                </Button>

                {/* Preview with remove */}
                {imagePreview && (
                  <div className="relative rounded-md overflow-hidden h-48">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 z-10"
                      onClick={removeImage}
                    >
                      <X size={16} />
                    </Button>
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>


            {/* Content */}
            <div>
              <FormLabel>Content</FormLabel>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
              />
              {form.formState.errors.content && (
                <p className="text-red-500">{form.formState.errors.content.message}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? 'Saving…'
                  : initialValues.id
                    ? 'Update Post'
                    : 'Publish Post'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}