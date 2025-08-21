import Container from '../components/ui/Container';
import Header from '../components/Header';
import Footer from '../components/Footer';

/** Premium App Shell cu background/spacing consistent — header STATIC (non-sticky) */
export default function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header static, full alb */}
      <div className="w-full bg-white border-b border-default">
        <Container>
          <Header />
        </Container>
      </div>

      {/* Conținut principal */}
      <main className="flex-1">
        <Container className="py-8">{children}</Container>
      </main>

      {/* Footer full alb */}
      <footer className="border-t border-default bg-white">
        <Container>
          <Footer />
        </Container>
      </footer>
    </div>
  );
}
