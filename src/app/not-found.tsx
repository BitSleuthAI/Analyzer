import Link from 'next/link';
import { Bot, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8">
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-6 rounded-2xl border bg-card p-12 text-center shadow-2xl shadow-primary/10">
        <Bot className="h-20 w-20 text-primary" />
        <div className="space-y-2">
          <h1 className="font-headline text-3xl font-bold tracking-tighter text-card-foreground">
            404 - Page Not Found
          </h1>
          <p className="text-muted-foreground font-normal">
            Oh sleuth!!! It seems BitSleuth bot got lost in the digital ether. The page you&apos;re looking for might have been moved or never existed.
          </p>
        </div>
        <Button asChild variant="default" className="mt-4 w-full">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
