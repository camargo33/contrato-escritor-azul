interface CnetLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CnetLogo = ({ className = "", size = 'md' }: CnetLogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-16',
    md: 'h-8 w-20', 
    lg: 'h-12 w-32'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 120 40" 
        className="w-full h-full"
        aria-label="CNET Logo"
      >
        <rect 
          width="120" 
          height="40" 
          rx="6" 
          className="fill-[#FF4500]"
        />
        <text 
          x="60" 
          y="28" 
          textAnchor="middle" 
          className="fill-white font-bold text-[18px]"
          style={{ fontFamily: 'Arial, sans-serif' }}
        >
          cnet
        </text>
      </svg>
    </div>
  );
};

export default CnetLogo;