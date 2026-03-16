import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://mansorf.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // لو عندك صفحة للمنتجات ممكن نضيفها هنا مستقبلاً
  ];
}