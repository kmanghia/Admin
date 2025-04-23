/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['res.cloudinary.com','randomuser.me', 'localhost'],
      },
      experimental:{
        reactRoot: true,
        suppressHydrationWarning: true,
      }
}

export default nextConfig;
