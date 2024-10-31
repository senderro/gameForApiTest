// components/Carta.tsx
import React from 'react';

interface CartaProps {
  nome: string;
  imagem: string;
  descricao: string;
}

const Carta: React.FC<CartaProps> = ({ nome, imagem, descricao }) => {
  return (
    <div style={styles.carta}>
      <h2>{nome}</h2>
      <img src={imagem} alt={nome} style={styles.imagem} />
      <p>{descricao}</p>
    </div>
  );
};

const styles = {
  carta: {
    textAlign: 'center' as 'center',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    width: '300px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
  },
  imagem: {
    width: '100%',
    height: 'auto',
  },
};

export default Carta;
