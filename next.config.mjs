import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone', // Disabled: causes EPERM symlink errors on Windows with pnpm. Re-enable for Docker deployments on Linux.
  serverExternalPackages: ['libsql', '@libsql/client'],
  webpack: (webpackConfig, { dev }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    // Disable webpack persistent filesystem cache in development.
    // Prevents ENOENT errors on .pack.gz files when the dev server is
    // interrupted mid-compilation or the cache becomes stale.
    if (dev) {
      webpackConfig.cache = false
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

