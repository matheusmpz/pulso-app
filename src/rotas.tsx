import { createBrowserRouter } from 'react-router'

import { LayoutApp } from '@/components/layout/LayoutApp'
import { Raiz } from '@/components/layout/Raiz'
import { RotaProtegida, RotaPublica } from '@/components/layout/RotaProtegida'
import DashboardLazy from '@/pages/DashboardLazy'
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
        children: [
          {
            element: <LayoutApp />,
            children: [
              { path: '/', element: <Home /> },
              { path: '/dashboards/:chave', element: <DashboardLazy /> },
            ],
          },
        ],
      },
      { path: '*', element: <NaoEncontrado /> },
    ],
  },
])
