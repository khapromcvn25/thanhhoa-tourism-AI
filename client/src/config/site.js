// Thông tin liên hệ và mạng xã hội. Ghi đè bằng biến môi trường VITE_* (xem client/.env.example).

const env = import.meta.env;

export const SITE = {
  email: env.VITE_CONTACT_EMAIL || 'khanguyenpromcvn@gmail.com',
  phone: env.VITE_CONTACT_PHONE || '+84 727.106.43',
};

export const SOCIALS = [
  { key: 'facebook', label: 'Facebook', href: env.VITE_SOCIAL_FACEBOOK || 'https://www.facebook.com/share/1EyEptNbFe/?mibextid=wwXIfr' },
  { key: 'youtube', label: 'YouTube', href: env.VITE_SOCIAL_YOUTUBE || 'https://www.youtube.com/@daiptththanhhoa' },
  { key: 'instagram', label: 'Instagram', href: env.VITE_SOCIAL_INSTAGRAM || 'https://www.instagram.com/_khadev_?gwpx=MW93N2dvcXl6Z2ducw%3D%3D&utm_source=qr' },
];
