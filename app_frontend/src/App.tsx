import { Toaster } from 'react-hot-toast';
import AppRouter from './router';

export default function App() {
  return (
    <>
      <Toaster position="top-center" gutter={8} containerStyle={{ top: 20 }} />
      <AppRouter />
    </>
  );
}