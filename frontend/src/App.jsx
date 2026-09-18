import { Routes, Route, Navigate } from "react-router-dom"

import Login from "./paginas/Login"
import SolicitarAcesso from "./paginas/SolicitarAcesso"
import MeusDados from "./paginas/MeusDados"
import Usuarios from "./paginas/Usuarios"
import EditarUsuario from "./paginas/EditarUsuario"
import Solicitacoes from "./paginas/Solicitacoes"
import Navbar from "./componentes/Navbar"
import "./App.css"

function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/solicitar-acesso" element={<SolicitarAcesso />}></Route>
        <Route path="/meus-dados" element={<MeusDados />}></Route>
        <Route path="/usuarios" element={<Usuarios />}></Route>
        <Route path="/usuarios/:id/editar" element={<EditarUsuario />}></Route>
        <Route path="/solicitacoes" element={<Solicitacoes />}></Route>
        <Route path="*" element={<Navigate to="/" />}></Route>
      </Routes>
    </div>
  )
}

export default App