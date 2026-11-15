import { createBrowserRouter } from 'react-router'

import { Raiz } from '@/components/layout/Raiz'
import { RotaProtegida, RotaPublica } from '@/components/layout/RotaProtegida'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import NaoEncontrado from '@/pages/NaoEncontrado'

export const roteador = createBrowserRouter([
  {
    element: <Raiz />,
    children: [
      {
        element: <RotaPublica />,
        children: [{ path: '/login', element: <Login /> }],
      },
      {
        element: <RotaProtegida />,
        children: [{ path: '/', element: <Home /> }],
      },
      { path: '*', element: <NaoEncontrado /> },
    ],
  },
])
