// This layout file handles static generation for the [sessionId] route
// Required for static export builds

// Note: Removed edge runtime as it conflicts with client-side session management
// The session page is fully client-side and doesn't need edge runtime

export async function generateStaticParams() {
  // For static export, we return an empty array since sessions are created dynamically
  // Cloudflare Pages will handle the dynamic routing at runtime
  return []
}

export default function SessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 