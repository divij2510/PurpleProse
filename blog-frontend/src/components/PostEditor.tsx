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
import { Upload, Image, X } from 'lucide-react';

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

export type PostFormValues = z.infer<typeof postSchema> & { 
  tags: string[];
  title: string;
  content: string;
  imageFile?: File;
};

interface PostEditorProps {
  initialValues?: Partial<PostFormValues> & { 
    tags?: string[]; 
    imageUrl?: string;
  };
  onSubmit: (data: PostFormValues) => void;
  isLoading: boolean;
}

const PostEditor = ({ initialValues, onSubmit, isLoading }: PostEditorProps) => {
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  const [content, setContent] = useState(initialValues?.content || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialValues?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialValues?.title || '',
      content: initialValues?.content || '',
    },
  });

  // Watch content change to validate
  useEffect(() => {
    form.setValue('content', content);
  }, [content, form]);

  const handleSubmit = (values: z.infer<typeof postSchema>) => {
    if (content.replace(/<(.|\n)*?>/g, '').trim().length < 20) {
      toast.error('Content must be at least 20 characters');
      return;
    }
    
    const formData: PostFormValues = {
      ...values,
      title: values.title,
      content: values.content,
      tags,
    };

    if (imageFile) {
      formData.imageFile = imageFile;
    }

    console.log('Submitting form with data:', formData);
    onSubmit(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 5MB.');
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    console.log('Image selected:', file.name, file.type, file.size);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
  ];

  return (
    <Card className="bg-black/40 border-gray-700">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the title of your post"
                      className="text-lg font-medium"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Tags</FormLabel>
              <TagsInput
                value={tags}
                onChange={setTags}
                className="react-tagsinput"
                inputProps={{
                  placeholder: 'Add a tag and press enter',
                  className: 'react-tagsinput-input',
                }}
              />
              <p className="text-xs text-gray-400">
                Add up to 5 tags to help readers discover your story
              </p>
            </div>

            <div className="space-y-2">
              <FormLabel>Cover Image</FormLabel>
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={triggerFileInput}
                  className="w-full h-32 border-dashed flex flex-col items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  <span>Upload cover image</span>
                  <span className="text-xs text-gray-400">
                    JPG, PNG or WebP, max 5MB
                  </span>
                </Button>

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
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Content</FormLabel>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                placeholder="Write your story here..."
              />
              {form.formState.errors.content && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="bg-blog-purple hover:bg-blog-purple-light"
                disabled={isLoading}
              >
                {isLoading
                  ? 'Saving...'
                  : initialValues
                  ? 'Update Post'
                  : 'Publish Post'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PostEditor;