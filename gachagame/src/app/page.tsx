'use client';

import React, { useState } from 'react';

interface CartaData {
  nome: string;
  imagem: string;
  descricao: string;
}

interface SlotProps {
  carta?: CartaData;
  onClick: () => void;
}

// Componente Slot, exibe a carta ou vazio
const Slot: React.FC<SlotProps> = ({ carta, onClick }) => {
  return (
    <div onClick={onClick} style={styles.slot}>
      {carta ? <img src={carta.imagem} alt={carta.nome} style={styles.imagemCarta} /> : <div style={styles.slotVazio}></div>}
    </div>
  );
};

// Lista de cartas disponíveis (para preencher o inventário)
const cartasDisponiveis: CartaData[] = [
  { nome: 'Carta 1', imagem: '/cartas/carta1.png', descricao: 'Descrição da Carta 1' },
  { nome: 'Carta 2', imagem: '/cartas/carta2.png', descricao: 'Descrição da Carta 2' },
  { nome: 'Carta 3', imagem: '/cartas/carta3.png', descricao: 'Descrição da Carta 3' },
  { nome: 'Carta 4', imagem: '/cartas/carta4.png', descricao: 'Descrição da Carta 4' },
  { nome: 'Carta 5', imagem: '/cartas/carta5.png', descricao: 'Descrição da Carta 5' },
];

const App: React.FC = () => {
  const [cartasGanhas, setCartasGanhas] = useState<CartaData[]>([]); // Cartas ganhas pelo jogador
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaData | null>(null); // Carta selecionada para exibir detalhes
  const [cartaSorteada, setCartaSorteada] = useState<CartaData | null>(null); // Carta sorteada na roleta
  const [telaAtiva, setTelaAtiva] = useState<'roleta' | 'inventario'>('roleta'); // Controla a tela ativa

  // Função para sortear uma carta ao girar a roleta
  const girarRoleta = () => {
    const indexAleatorio = Math.floor(Math.random() * cartasDisponiveis.length);
    const novaCarta = cartasDisponiveis[indexAleatorio];
    setCartaSorteada(novaCarta); // Exibe a carta sorteada na janela
  };

  // Função para aceitar a carta sorteada e adicionar ao inventário
  const aceitarCarta = async () => {
    if (cartaSorteada) {
      try {
        const base64image = await convertImageToBase64(cartaSorteada.imagem);
        
        const mintNFTData = {
          auth: {
            message: "any message",
            signature: "any_signature",
            publicKey: "rG88FVLjvYiQaGftSa1cKuE2qNx7aK5ivo",
          },
          recipientAddress: "rG88FVLjvYiQaGftSa1cKuE2qNx7aK5ivo",
          base64image,
          name: cartaSorteada.nome,
          description: cartaSorteada.descricao,
          gameMetadata: {},
        };

        const response = await fetch("https://web3projectapi.vercel.app/mintNFT", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mintNFTData),
        });

        if (response.ok) {
          alert("Carta mintada com sucesso!");
          setCartasGanhas((prevCartas) => [...prevCartas, cartaSorteada]);
        } else {
          alert("Erro ao mintar a carta.");
        }
      } catch (error) {
        console.error("Erro ao aceitar a carta:", error);
        alert("Erro ao processar a carta.");
      } finally {
        setCartaSorteada(null); // Fecha a janela de aceitação de carta
      }
    }
  };

  // Função para converter uma imagem em base64
  const convertImageToBase64 = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject("Erro ao converter a imagem");
      reader.readAsDataURL(blob);
    });
  };

  // Função para lidar com a seleção de uma carta no inventário
  const selecionarCarta = (carta: CartaData | null) => {
    setCartaSelecionada(carta); // Exibe os detalhes da carta no inventário
  };

  // Função para fechar a janela de detalhes da carta
  const fecharDetalhes = () => {
    setCartaSelecionada(null);
  };

  // Alternar para a tela de inventário
  const mostrarInventario = () => {
    setTelaAtiva('inventario');
  };

  // Alternar de volta para a tela da roleta
  const voltarParaRoleta = () => {
    setTelaAtiva('roleta');
  };

  return (
    <div style={styles.container}>
      {telaAtiva === 'roleta' && (
        <>
          <h1>Roleta Gacha</h1>
          <button onClick={girarRoleta} style={styles.botaoGirar}>
            Girar Roleta
          </button>
          <button onClick={mostrarInventario} style={styles.botaoInventario}>
            Mostrar Inventário
          </button>

          {/* Janela para aceitar a carta sorteada */}
          {cartaSorteada && (
            <div style={styles.janelaCarta}>
              <div style={styles.janelaConteudo}>
                <h2>{cartaSorteada.nome}</h2>
                <img src={cartaSorteada.imagem} alt={cartaSorteada.nome} style={styles.imagemDetalhe} />
                <p>{cartaSorteada.descricao}</p>
                <button onClick={aceitarCarta} style={styles.botaoAceitar}>
                  Aceitar Carta
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {telaAtiva === 'inventario' && (
        <>
          <h1>Inventário (5x5 Slots)</h1>

          {/* Botão para voltar para a roleta */}
          <button onClick={voltarParaRoleta} style={styles.botaoVoltar}>
            Voltar para Roleta
          </button>

          {/* Grid de 5x5 Slots */}
          <div style={styles.grid}>
            {Array.from({ length: 25 }, (_, index) => {
              const carta = cartasGanhas[index] || null;
              return (
                <Slot
                  key={index}
                  carta={carta}
                  onClick={() => selecionarCarta(carta)} // Seleciona a carta ao clicar no slot
                />
              );
            })}
          </div>

          {/* Janela de detalhes da carta selecionada */}
          {cartaSelecionada && (
            <div style={styles.janelaDetalhes}>
              <div style={styles.janelaConteudo}>
                <h2>{cartaSelecionada.nome}</h2>
                <img src={cartaSelecionada.imagem} alt={cartaSelecionada.nome} style={styles.imagemDetalhe} />
                <p>{cartaSelecionada.descricao}</p>
                <button onClick={fecharDetalhes} style={styles.botaoFechar}>
                  Fechar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


// Estilos
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    padding: '20px',
  },
  botaoGirar: {
    padding: '10px 20px',
    marginBottom: '20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  botaoInventario: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  botaoVoltar: {
    padding: '10px 20px',
    marginBottom: '20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 100px)',  // 5 colunas
    gridTemplateRows: 'repeat(5, 100px)',     // 5 linhas
    gap: '10px',
  },
  slot: {
    width: '100px',
    height: '100px',
    border: '2px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  slotVazio: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '8px',
  },
  imagemCarta: {
    width: '90%',
    height: '90%',
    objectFit: 'cover' as 'cover',
  },
  janelaCarta: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  janelaConteudo: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center' as 'center',
  },
  imagemDetalhe: {
    width: '200px',
    height: '200px',
    objectFit: 'cover' as 'cover',
    marginBottom: '15px',
  },
  botaoAceitar: {
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  janelaDetalhes: {
    position: 'fixed' as 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botaoFechar: {
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default App;
