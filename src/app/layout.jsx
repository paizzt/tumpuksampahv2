import '../index.css';

export const metadata = {
  title: 'Tumpuk Sampah (TS)',
  description: 'Layanan Pengelolaan Sampah Organik Makassar',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
