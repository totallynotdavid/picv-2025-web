import { V0Logo } from './v0logo';

const Footer = () => (
  <footer>
    <div className="custom-screen pt-16">
      <div className="mt-10 py-10 border-t items-center justify-between flex">
        <p className="text-gray-600">
          Creado en el{' '}
          <a
            href="http://labtel.fisica.unmsm.edu.pe/"
            className="hover:underline transition"
          >
            Laboratorio de Teledetección
          </a>
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
