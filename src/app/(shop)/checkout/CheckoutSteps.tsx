'use client';

import { cn } from '@/lib/utils';
import { Check, User, CreditCard, ClipboardList } from 'lucide-react';

const steps = [
  { id: 1, name: 'Shipping', icon: User },
  { id: 2, name: 'Payment', icon: CreditCard },
  { id: 3, name: 'Summary', icon: ClipboardList },
];

export default function CheckoutSteps({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-start justify-center">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn('relative', stepIdx !== steps.length - 1 ? 'flex-1' : '')}
          >
            {step.id < currentStep ? (
              // Completed step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-primary" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-accent mx-auto">
                    <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                </div>
                 <p className="mt-2 text-xs text-center font-medium text-primary">{step.name}</p>
              </>
            ) : step.id === currentStep ? (
              // Current step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                 <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-secondary mx-auto" aria-current="step">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                </div>
                 <p className="mt-2 text-xs text-center font-medium text-primary">{step.name}</p>
              </>
            ) : (
              // Upcoming step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-border" />
                </div>
                <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-secondary hover:border-muted-foreground mx-auto">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                </div>
                 <p className="mt-2 text-xs text-center font-medium text-muted-foreground">{step.name}</p>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}