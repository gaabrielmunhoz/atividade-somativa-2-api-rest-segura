import { Routes, Route, Navigate } from "react-router-dom"

import Login from "./paginas/Login"
import SolicitarAcesso from "./paginas/SolicitarAcesso"
import MeusDados from "./paginas/MeusDados"
import Usuarios from "./paginas/Usuarios"
import EditarUsuario from "./paginas/EditarUsuario"
import Solicitacoes from "./paginas/Solicitacoes"
import NovoUsuario from "./paginas/NovoUsuario"
import PrimeiroAcesso from "./paginas/PrimeiroAcesso"
import Navbar from "./componentes/Navbar"
import RotaProtegida from "./componentes/RotaProtegida"
import "./App.css"

function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/solicitar-acesso" element={<SolicitarAcesso />}></Route>
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />}></Route>
        <Route path="/meus-dados" element={<RotaProtegida><MeusDados /></RotaProtegida>}></Route>
        <Route path="/usuarios" element={<RotaProtegida perfis={["Administrador", "Operador"]}><Usuarios /></RotaProtegida>}></Route>
        <Route path="/usuarios/novo" element={<RotaProtegida perfis={["Administrador"]}><NovoUsuario /></RotaProtegida>}></Route>
        <Route path="/usuarios/:id/editar" element={<RotaProtegida perfis={["Administrador", "Operador"]}><EditarUsuario /></RotaProtegida>}></Route>
        <Route path="/solicitacoes" element={<RotaProtegida perfis={["Administrador"]}><Solicitacoes /></RotaProtegida>}></Route>
        <Route path="*" element={<Navigate to="/" />}></Route>
      </Routes>
    </div>
  )
}

export default App