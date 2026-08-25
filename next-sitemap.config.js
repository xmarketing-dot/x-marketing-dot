/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://besteskort.devs.surf',
  generateRobotsTxt: false,
  generateIndexSitemap: false,
  sitemapSize: 7000,
};
