import { DataTablePage } from './components/DataTablePage';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <div className="h-full overflow-y-auto bg-white text-gray-900">            
      <DataTablePage/>
      <Toaster 
        position="top-right" 
        toastOptions={{duration: 3000}}
        containerStyle={{
          zIndex: 9998,
        }}
      />
    </div>
  );
}

export default App;