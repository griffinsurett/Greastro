// src/config/iconConfig.js
export const iconConfig = {
  include: {
    // Lucide icons (for UI elements)
    lucide: [
      'mail', 'phone', 'linkedin', 'twitter', 'github', 'instagram',
      'chevron-left', 'chevron-right', 'menu', 'x', 'star', 'globe',
      'map-pin', 'contact'
    ],
    
    // Simple Icons (for tech and social brands)
    'simple-icons': [
      'html5', 'css3', 'javascript', 'astro', 'nextdotjs', 
      'react', 'gatsby', 'svelte', 'shopify', 'wordpress', 
      'elementor', 'webflow', 'framer', 'vercel', 'github', 
      'nodedotjs', 'facebook', 'instagram', 'youtube', 
      'tiktok', 'discord', 'whatsapp', 'telegram'
    ],
    
    // Font Awesome brands (for missing tech brands)  
    'fa6-brands': [
      'aws', 'figma', 'cloudflare', 'php', 'python', 'x-twitter', 'facebook'
    ],
    
    // Font Awesome solid (if needed for UI)
    'fa6-solid': ['star', 'heart', 'check', 'envelope', 'phone']
  },
  
  // Generate SVG sprite for better performance
  svgoOptions: {
    multipass: true,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
    ],
  },
};