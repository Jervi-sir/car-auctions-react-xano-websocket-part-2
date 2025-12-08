import { AlertDialog, AlertDialogContent, AlertDialogTrigger, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AppFooter() {
  return (
    <footer className="mt-10 border-t bg-background/40 backdrop-blur py-6">
      <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">

        {/* Left side links */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://github.com/Jervi-sir"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            GitHub Repository
          </a>

          <span className="hidden sm:inline-block">•</span>

          <a
            href="https://gacem.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            Portfolio
          </a>
        </div>

        {/* Right side: Alert Dialog button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
              About this project
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>About this project</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  This demo is built using <strong>React + Vite + React Router</strong>,
                  styled with <strong>shadcn/ui</strong>.
                </p>

                <p>
                  The backend is powered by <strong>Xano</strong>, including a realtime WebSocket channel for
                  live bidding updates.
                </p>

                <p>
                  Xano was used heavily with <strong>XanoScript</strong> to handle:
                </p>

                <ul className="list-disc pl-6 space-y-1">
                  <li>auction logic</li>
                  <li>bid processing</li>
                  <li>background tasks</li>
                  <li>trigger-based websocket broadcasts</li>
                </ul>

                <p>
                  It was honestly a <strong>pain to implement</strong> at first — XanoScript +
                  AI required a lot of experimentation — but the final result works smoothly.
                </p>

                <p className="font-medium">
                  The whole system is fully functional, fast, and scalable.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </footer>
  );
}
