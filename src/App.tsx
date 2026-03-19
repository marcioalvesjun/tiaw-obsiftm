import React from 'react';
import { RecoilRoot } from 'recoil';
import {RouterProvider} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from 'react-oidc-context';
import userManagerSettings from './config/userManagerSettings';
import router from './config/router';


function App() {
  return (
    <AuthProvider {...userManagerSettings} >
      <React.StrictMode>
        <RecoilRoot>
          <RouterProvider router={router} />
          <ToastContainer />
        </RecoilRoot>
      </React.StrictMode>
    </AuthProvider>
  );
}

export default App;
