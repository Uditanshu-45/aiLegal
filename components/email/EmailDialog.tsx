'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    results: any;
}

export default function EmailDialog({ results }: Props) {
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [open, setOpen] = useState(false);

    const handleSend = async () => {
        if (!email || !email.includes('@')) return;

        setSending(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/send-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    results
                })
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => {
                    setOpen(false);
                    setStatus('idle');
                    setEmail('');
                }, 2000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Share with Lawyer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Legal Analysis</DialogTitle>
                    <DialogDescription>
                        Send a detailed report of the risky clauses to your lawyer or colleague.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center space-x-2 py-4">
                    <div className="grid flex-1 gap-2">
                        <label htmlFor="email" className="sr-only">
                            Email
                        </label>
                        <input
                            id="email"
                            placeholder="lawyer@example.com"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="sm:justify-start">
                    <Button
                        type="button"
                        onClick={handleSend}
                        disabled={!email || sending || status === 'success'}
                        className={cn(
                            "w-full",
                            status === 'success' && "bg-green-600 hover:bg-green-700",
                            status === 'error' && "bg-destructive hover:bg-destructive/90"
                        )}
                    >
                        {sending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : status === 'success' ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Sent!
                            </>
                        ) : status === 'error' ? (
                            <>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Failed, try again
                            </>
                        ) : (
                            <>
                                Send Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
