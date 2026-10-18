// Configurações: perfil, cidade da previsão do tempo, conta e gerenciamento dos dados.
import { useRef } from 'react'
import { Download, Upload, RotateCcw, Trash2, LogOut } from 'lucide-react'
import { useDados } from '../context/DadosContext'
import { useAuth } from '../context/AuthContext'
import { Card, PageHeader } from '../components/ui'
import { CIDADES } from '../lib/weather'
import { downloadFile, todayISO } from '../lib/utils'

export default function Configuracoes() {
  const { state, setConfig, restaurarExemplo, apagarTudo, substituir, ocupado } = useDados()
  const { usuario, sair } = useAuth()
  const c = state.config
  const arquivoRef = useRef(null)

  const trocarCidade = (nome) => {
    const cidade = CIDADES.find((x) => x.nome === nome)
    if (cidade) setConfig({ cidade: cidade.nome, lat: cidade.lat, lon: cidade.lon })
  }

  const exportar = () =>
    downloadFile(`agroconecta-backup-${todayISO()}.json`, JSON.stringify(state, null, 2), 'application/json')

  const importar = (e) => {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    const leitor = new FileReader()
    leitor.onload = () => {
      try {
        const dados = JSON.parse(String(leitor.result))
        if (!dados || typeof dados !== 'object' || !Array.isArray(dados.produtores)) throw new Error('Formato inválido')
        if (window.confirm('Substituir todos os dados atuais pelos dados deste arquivo?')) substituir(dados)
      } catch (err) {
        window.alert('Não foi possível ler o arquivo. Use um backup exportado pelo AgroConecta.')
      }
    }
    leitor.readAsText(arquivo)
    e.target.value = '' // permite escolher o mesmo arquivo de novo
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Ajuste seu perfil, a cidade do clima e gerencie os dados do sistema." />

      <div className="grid grid-2">
        <Card title="Perfil e região">
          <div className="form-grid">
            <label className="field">
              <span>Seu nome</span>
              <input defaultValue={c.usuario} onBlur={(e) => e.target.value !== c.usuario && setConfig({ usuario: e.target.value })} />
              <small>O nome é salvo quando você sai do campo.</small>
            </label>
            <label className="field">
              <span>Perfil</span>
              <select value={c.perfil} onChange={(e) => setConfig({ perfil: e.target.value })}>
                {['Produtora', 'Produtor', 'Técnico(a)', 'Gestor(a)', 'Comprador(a)'].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Cidade da previsão do tempo</span>
              <select value={c.cidade} onChange={(e) => trocarCidade(e.target.value)}>
                {CIDADES.map((x) => (
                  <option key={x.nome}>{x.nome}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Alerta de chuva forte (mm por dia)</span>
              <input
                type="number"
                min="5"
                defaultValue={c.limiarChuva}
                onBlur={(e) => setConfig({ limiarChuva: Number(e.target.value) || 30 })}
              />
              <small>Quando a previsão passar desse valor, o painel mostra um alerta.</small>
            </label>
          </div>
        </Card>

        <Card title="Sua conta">
          <p className="muted" style={{ marginBottom: 14 }}>
            Você está conectado como <b>{usuario.email}</b>. Seus dados ficam salvos na nuvem (Firebase) e só você consegue vê-los.
          </p>
          <button className="btn btn-ghost" onClick={sair}>
            <LogOut size={16} /> Sair da conta
          </button>
        </Card>
      </div>

      <Card title="Dados do sistema">
        <p className="muted" style={{ marginBottom: 14 }}>
          Tudo é salvo automaticamente no Firebase. Se quiser uma cópia de segurança, exporte um backup em arquivo.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost" onClick={exportar}>
            <Download size={16} /> Exportar backup
          </button>
          <button className="btn btn-ghost" onClick={() => arquivoRef.current?.click()} disabled={ocupado}>
            <Upload size={16} /> Importar backup
          </button>
          <input ref={arquivoRef} type="file" accept="application/json,.json" hidden onChange={importar} />
          <button
            className="btn btn-ghost"
            disabled={ocupado}
            onClick={() => window.confirm('Carregar os dados de exemplo? Seus registros atuais serão substituídos.') && restaurarExemplo()}
          >
            <RotateCcw size={16} /> {ocupado ? 'Aguarde…' : 'Carregar dados de exemplo'}
          </button>
          <button
            className="btn btn-danger"
            disabled={ocupado}
            onClick={() => window.confirm('Apagar todos os registros e começar do zero? Essa ação não pode ser desfeita.') && apagarTudo()}
          >
            <Trash2 size={16} /> Apagar todos os dados
          </button>
        </div>
      </Card>
    </>
  )
}
