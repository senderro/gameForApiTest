// components/JanelaCarta.tsx
import React from 'react';
import Carta from './Carta';

interface JanelaCartaProps {
  nome: string;
  imagem: string;
  descricao: string;
  onAccept: () => void;
}

const JanelaCarta: React.FC<JanelaCartaProps> = ({ nome, imagem, descricao, onAccept }) => {
  return (
    <div style={styles.modal}>
      <div style={styles.conteudo}>
        <Carta nome={nome} imagem={imagem} descricao={descricao} />
        <button onClick={onAccept} style={styles.botao}>
          Aceitar Carta
        </button>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  conteudo: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center' as 'center',
  },
  botao: {
    marginTop: '15px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default JanelaCarta;
