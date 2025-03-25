
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Key } from 'lucide-react';

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (apiKey: string) => void;
}

interface FormValues {
  apiKey: string;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ open, onOpenChange, onSubmit }) => {
  const form = useForm<FormValues>({
    defaultValues: {
      apiKey: ''
    }
  });

  const handleSubmit = (data: FormValues) => {
    if (data.apiKey.trim()) {
      onSubmit(data.apiKey.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5 text-blue-500" />
            Enter OpenAI API Key
          </DialogTitle>
          <DialogDescription>
            Your API key is required to generate AI-powered insights. 
            The key is only used for this request and is not stored permanently.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenAI API Key</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="sk-..." 
                      {...field} 
                      type="password"
                      className="font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Your key will be sent securely and not stored after this session.
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Proceed with Key
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;
