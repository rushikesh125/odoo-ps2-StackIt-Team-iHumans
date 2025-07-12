
import { Toaster } from "react-hot-toast";
import HeroProvider from "./components/HeroProvider";
import StoreProvider from "./components/StoreProvider";
import "./globals.css";
import MainNavbar from "./components/MainNavbar";


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` antialiased`}>
        <StoreProvider>
          <HeroProvider>
            <MainNavbar/>
            {children}
            </HeroProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
