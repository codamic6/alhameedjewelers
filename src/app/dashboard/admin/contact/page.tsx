
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2, Trash2, Mail, User, Clock, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';


type ContactMessage = {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    timestamp: Timestamp;
    isRead: boolean;
};

export default function AdminContactPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  const messagesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'contact-messages'), orderBy('timestamp', 'desc')) : null),
    [firestore]
  );
  const { data: messages, isLoading } = useCollection<ContactMessage>(messagesQuery);
  
  const handleDelete = async (messageId: string) => {
     if (!firestore) return;
     try {
        await deleteDoc(doc(firestore, 'contact-messages', messageId));
        toast({ title: "Message Deleted", description: "The message has been successfully deleted."});
     } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: error.message });
     }
  };
  
   const getTimestamp = (timestamp: Timestamp | Date): Date => {
    if (timestamp instanceof Timestamp) {
      return timestamp.toDate();
    }
    return timestamp;
  };


  return (
    <>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          Contact Messages
        </h1>
        <p className="text-muted-foreground">View and manage messages from your customers.</p>

        <div className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages && messages.length > 0 ? (
            <>
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {messages.map((msg) => (
                    <Card key={msg.id} className="bg-secondary/50">
                      <CardHeader className="p-4">
                          <CardTitle className="text-base text-primary">{msg.subject}</CardTitle>
                          <CardDescription className="flex items-center gap-2 pt-1 text-xs">
                            <User className="h-3 w-3"/> {msg.name} - <span className="text-accent">{msg.email}</span>
                          </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-muted-foreground line-clamp-3">{msg.message}</p>
                      </CardContent>
                      <CardFooter className="bg-secondary/20 flex items-center justify-between p-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5 pl-2">
                            <Clock className="h-3 w-3"/> {formatDistanceToNow(getTimestamp(msg.timestamp), { addSuffix: true })}
                          </span>
                           <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedMessage(msg)}>
                              <Eye className="mr-2 h-4 w-4" /> View
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this message.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(msg.id)}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                           </div>
                      </CardFooter>
                    </Card>
                  )
                )}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">From</TableHead>
                        <TableHead className="w-[200px]">Subject</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[150px]">Received</TableHead>
                        <TableHead className="w-[50px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages?.map(msg => (
                          <TableRow key={msg.id} className="cursor-pointer" onClick={() => setSelectedMessage(msg)}>
                            <TableCell>
                              <div className="font-medium">{msg.name}</div>
                              <div className="text-xs text-muted-foreground">{msg.email}</div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {msg.subject}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-sm truncate">
                              {msg.message}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDistanceToNow(getTimestamp(msg.timestamp), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <AlertDialog onOpenChange={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem onClick={() => setSelectedMessage(msg)}>View Message</DropdownMenuItem>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive">
                                          Delete
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this message.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(msg.id)}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-10 border-2 border-dashed rounded-lg">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-2 text-lg font-semibold text-white">No Messages Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">You haven't received any messages from the contact form.</p>
            </div>
          )}
        </div>
      </div>
       <Dialog open={!!selectedMessage} onOpenChange={(isOpen) => !isOpen && setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-primary">{selectedMessage.subject}</DialogTitle>
                 <div className="flex flex-col md:flex-row md:items-center gap-x-4 gap-y-1 text-xs pt-2 text-muted-foreground">
                    <span className="flex items-center gap-1.5"><User className="h-3 w-3"/> {selectedMessage.name}</span>
                    <span className="flex items-center gap-1.5"><Mail className="h-3 w-3"/> {selectedMessage.email}</span>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                    Received on {format(getTimestamp(selectedMessage.timestamp), "PPP p")}
                </div>
              </DialogHeader>
              <Separator />
              <div className="py-4 text-base text-foreground whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Close
                  </Button>
                </DialogClose>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                     <Button type="button" variant="destructive">
                        Delete
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete this message.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        handleDelete(selectedMessage.id);
                        setSelectedMessage(null);
                      }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
