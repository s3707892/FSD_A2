interface StarRatingProps {
  rating: number;  // From 0 star to 5 star
  max?: number;
  onChange?: (rating: number) => void; // if given, it will definitely be interactive
  size?: 'sm' | 'md' | 'lg';
}

// define starRating as a component where it takes in rating, max , and size
const StarRating = ({ 
  rating, 
  max = 5,
  onChange,
  size = 'md' 
}: StarRatingProps) => {
  // decide how big the stars will look
  const sizes = {
     sm: 'text-base',
     md: 'text-xl', 
     lg: 'text-3xl'  };

// loop through max star and render each as button
  return (
     <div 
        className="flex gap-0.5"
        role={onChange ? 'radiogroup' : undefined} 
        aria-label={`Rating: ${rating} out of ${max}`}
     >
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        // check if star should be fill in or left empty
        const filled = value <= rating;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(value)}
            disabled={!onChange}
            aria-label={`${value} star${value !== 1 ? 's' : ''}`}
            className={`
              ${sizes[size]} transition-colors 
              ${filled ? 'text-amber-400' : 'text-gray-300'} 
              ${onChange ? 'cursor-pointer hover:text-amber-300' : 'cursor-default'} 
              disabled:cursor-default
            `}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;