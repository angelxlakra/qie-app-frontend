import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 dark:bg-gray-900 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-3">QIE Tickets</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Blockchain-powered event ticketing on QIE Testnet. Buy, sell, and redeem tickets securely.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/my-tickets" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  My Tickets
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Create Event
                </Link>
              </li>
            </ul>
          </div>

          {/* Network Info */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Network</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Chain</dt>
                <dd className="font-mono text-xs">QIE Testnet</dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Chain ID</dt>
                <dd className="font-mono text-xs">1983</dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Explorer</dt>
                <dd>
                  <a
                    href="https://testnet.qie.digital"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    testnet.qie.digital ↗
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Contracts */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Contracts</h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">EventFactory</dt>
                <dd className="font-mono text-xs break-all">0x0efc...1e5F</dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Marketplace</dt>
                <dd className="font-mono text-xs break-all">0x5715...Dd03f</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600 dark:text-gray-400">
          <p>© 2025 QIE Event Ticketing. Built with Next.js, viem & wagmi.</p>
        </div>
      </div>
    </footer>
  )
}
