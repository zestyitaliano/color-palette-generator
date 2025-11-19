
const spaceshipSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#161843"/>
      <stop offset="100%" stop-color="#214b8b"/>
    </linearGradient>
  </defs>
  
  <!-- Background Sky -->
  <rect width="800" height="600" fill="url(#bg-grad)"/>
  
  <!-- Stars -->
  <circle cx="100" cy="100" r="2" fill="#fff7d2"/>
  <circle cx="300" cy="50" r="3" fill="#fff7d2"/>
  <circle cx="600" cy="150" r="2" fill="#fff7d2"/>
  <circle cx="700" cy="80" r="4" fill="#fff7d2"/>
  <circle cx="50" cy="300" r="2" fill="#fff7d2"/>
  
  <!-- Planet in Background -->
  <circle cx="650" cy="450" r="100" fill="#3366b1" opacity="0.5"/>
  <circle cx="620" cy="420" r="20" fill="#3877bc" opacity="0.5"/>
  <circle cx="680" cy="480" r="30" fill="#3a98d4" opacity="0.5"/>
  
  <!-- Main Spaceship Construction -->
  <g transform="translate(200, 150)">
  
    <!-- Exhaust Flame -->
    <path d="M130 300 L150 380 L170 300 Z" fill="#f37039"/>
    <path d="M140 300 L150 350 L160 300 Z" fill="#ffd458"/>
  
    <!-- Wings (Back) -->
    <path d="M50 250 L100 200 L100 280 Z" fill="#7363ac"/>
    <path d="M250 250 L200 200 L200 280 Z" fill="#7363ac"/>
    
    <!-- Main Fuselage -->
    <ellipse cx="150" cy="200" rx="60" ry="140" fill="#eef9fe"/>
    <path d="M150 60 L150 340" stroke="#acd1ef" stroke-width="1" fill="none" opacity="0.5"/>
    
    <!-- Cockpit Window -->
    <circle cx="150" cy="150" r="35" fill="#a1d4f1"/>
    <path d="M130 140 Q150 120 170 140" stroke="#fff" stroke-width="3" fill="none" opacity="0.6"/>
    
    <!-- Body Stripes/Details -->
    <path d="M110 220 Q150 240 190 220" fill="none" stroke="#ef5d9c" stroke-width="8"/>
    <path d="M115 235 Q150 255 185 235" fill="none" stroke="#f05c81" stroke-width="6"/>
    
    <!-- Side Thrusters -->
    <rect x="70" y="240" width="20" height="40" rx="5" fill="#bd202b"/>
    <rect x="210" y="240" width="20" height="40" rx="5" fill="#bd202b"/>
    
    <!-- Fins -->
    <path d="M150 60 L150 100 L180 110 Z" fill="#df195d"/>
    
    <!-- Shadows/Highlights -->
    <path d="M190 200 Q190 300 150 340" stroke="#c5daf1" stroke-width="4" fill="none"/>
    
    <!-- Additional Decorative Elements using Palette -->
    <circle cx="100" cy="180" r="5" fill="#ecf3fb"/>
    <circle cx="200" cy="180" r="5" fill="#ecf3fb"/>
    <rect x="145" y="320" width="10" height="20" fill="#59a7dc"/>
    
    <!-- Accent Panels -->
    <path d="M120 280 L130 300 L170 300 L180 280 Z" fill="#e91b3f"/>
    <circle cx="150" cy="290" r="8" fill="#ef435c"/>

  </g>
  
  <!-- Floating Asteroids -->
  <path d="M50 50 L80 40 L90 70 L60 80 Z" fill="#6cb3e3"/>
  <path d="M700 200 L730 190 L740 220 L710 230 Z" fill="#75bbe7"/>
  <path d="M100 500 L120 490 L130 510 L110 520 Z" fill="#8abfe7"/>
  
  <!-- Geometric Tech Elements -->
  <rect x="700" y="500" width="50" height="50" fill="#3ec3d6" opacity="0.8"/>
  <rect x="710" y="510" width="30" height="30" fill="#eef9fe" opacity="0.3"/>
  
</svg>
`;

export default spaceshipSvg;
