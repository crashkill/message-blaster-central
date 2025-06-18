// @ts-ignore
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import React from 'react';

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: number;
}

const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  ({ children, className, hoverScale = 1.02, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn('transition-transform', className)}
      initial={{ rotateX: 0, rotateY: 0, scale: 1 }}
      whileHover={{ rotateX: -5, rotateY: 5, scale: hoverScale }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  )
);

TiltCard.displayName = 'TiltCard';

export default TiltCard; 