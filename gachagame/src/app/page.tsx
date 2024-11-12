'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getNftFromAccount } from '@/interface';

interface CartaData {
  nome: string;
  imagem: string;
  descricao: string;
}

interface SlotProps {
  carta?: CartaData;
  onClick: () => void;
}

const Slot: React.FC<SlotProps> = ({ carta, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-24 h-24 border-2 border-gray-300 rounded-lg bg-gray-100 flex justify-center items-center cursor-pointer"
    >
      {carta ? (
        <Image src={carta.imagem} alt={carta.nome} width={90} height={90} className="object-cover" />
      ) : (
        <div className="w-full h-full bg-gray-300 rounded-lg"></div>
      )}
    </div>
  );
};

const cartasDisponiveis: CartaData[] = [
  { nome: 'Carta 1', imagem: '/cartas/carta1.png', descricao: 'Descrição da Carta 1' },
  { nome: 'Carta 2', imagem: '/cartas/carta2.png', descricao: 'Descrição da Carta 2' },
  { nome: 'Carta 3', imagem: '/cartas/carta3.png', descricao: 'Descrição da Carta 3' },
  { nome: 'Carta 4', imagem: '/cartas/carta4.png', descricao: 'Descrição da Carta 4' },
];

const App: React.FC = () => {
  const [userAddress, setUserAddress] = useState<string>('rG88FVLjvYiQaGftSa1cKuE2qNx7aK5ivo'); // Estado para o endereço do usuário com valor padrão
  const [cartasGanhas, setCartasGanhas] = useState<CartaData[]>([]);
  const [cartaSelecionada, setCartaSelecionada] = useState<CartaData | null>(null);
  const [cartaSorteada, setCartaSorteada] = useState<CartaData | null>(null);
  const [telaAtiva, setTelaAtiva] = useState<'roleta' | 'inventario'>('roleta');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserNfts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/web3Api/getAccountNfts/${userAddress}`);
      if (response.ok) {
        const data = await response.json();
        const nfts = data.nfts;

        const cartasDoUsuario = nfts.map((nft: getNftFromAccount) => ({
          nome: nft.name || 'NFT Desconhecido',
          imagem: nft.base64image || '',
          descricao: nft.description || 'Sem descrição',
        }));

        setCartasGanhas(cartasDoUsuario);
      } else {
        console.error('Erro ao buscar NFTs do usuário.');
      }
    } catch (error) {
      console.error('Erro ao buscar NFTs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNfts();
  }, []);

  const girarRoleta = () => {
    const indexAleatorio = Math.floor(Math.random() * cartasDisponiveis.length);
    const novaCarta = cartasDisponiveis[indexAleatorio];
    setCartaSorteada(novaCarta);
  };

  const aceitarCarta = async () => {
    if (cartaSorteada) {
      const base64image = await convertImageToBase64(cartaSorteada.imagem);
      const message = 'any message';
      
      const res = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
  
      if (!res.ok) {
        alert('Erro ao assinar a mensagem.');
        return;
      }
      const classicAddress = "rspgmhbbCRjkDbjFu4P2MX1agUGDEShYbf";
      const publicKey = "ED52AA41BB9385469BF70EEF9397496C608A08FA44B14D1F75137CF4D6B03397E2";
      const {signature } = await res.json();


      const mintNFTData = {
        auth: {
          message,
          signature,
          publicKey,
        },
        recipientAddress: userAddress,
        base64image,
        name: cartaSorteada.nome,
        description: cartaSorteada.descricao,
        gameMetadata: {},
        classicAddress
      };


      const response = await fetch('/api/web3Api/mintNft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mintNFTData),
      });

      if (response.ok) {
        alert('Carta mintada com sucesso!');
        setCartasGanhas((prevCartas) => [...prevCartas, cartaSorteada]);
      } else {
        alert('Erro ao mintar a carta.');
      }
      setCartaSorteada(null);
    }
  };

  const convertImageToBase64 = async (imageUrl: string) => {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject('Erro ao converter a imagem');
      reader.readAsDataURL(blob);
    });
  };

  const mostrarInventario = () => setTelaAtiva('inventario');
  const voltarParaRoleta = () => setTelaAtiva('roleta');

  return (
    <div className="flex flex-col items-center justify-center h-screen p-5">
      {/* Input para o endereço do usuário */}
      <label className="mb-2 text-lg font-semibold">Endereço do Usuário:</label>
      <input
        type="text"
        value={userAddress}
        onChange={(e) => setUserAddress(e.target.value)}
        className="px-4 py-2 border rounded-lg mb-4 w-full max-w-md"
        placeholder="Insira o endereço do usuário"
      />

      {telaAtiva === 'roleta' && (
        <>
          <h1 className="text-2xl font-bold">Roleta Gacha</h1>
          <button
            onClick={girarRoleta}
            className="mt-5 px-5 py-2 text-lg bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Girar Roleta
          </button>
          <button
            onClick={mostrarInventario}
            className="mt-3 px-5 py-2 text-lg bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600"
          >
            Mostrar Inventário
          </button>

          {cartaSorteada && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white p-5 rounded-lg text-center">
                <h2 className="text-xl font-bold">{cartaSorteada.nome}</h2>
                <Image src={cartaSorteada.imagem} alt={cartaSorteada.nome} width={200} height={200} className="my-4" />
                <p>{cartaSorteada.descricao}</p>
                <button
                  onClick={aceitarCarta}
                  className="mt-4 px-5 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
                >
                  Aceitar Carta
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {telaAtiva === 'inventario' && (
        <>
          <h1 className="text-2xl font-bold mb-4">Inventário (5x5 Slots)</h1>
          <button
            onClick={voltarParaRoleta}
            className="mb-4 px-5 py-2 text-lg bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600"
          >
            Voltar para Roleta
          </button>

          <button
            onClick={fetchUserNfts}
            className="mb-4 px-5 py-2 text-lg bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600"
          >
            Atualizar NFTs
          </button>

          {loading ? (
            <div className="text-lg font-bold text-gray-700">Carregando NFTs...</div>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }, (_, index) => {
                const carta = cartasGanhas[index] || null;
                return <Slot key={index} carta={carta} onClick={() => setCartaSelecionada(carta)} />;
              })}
            </div>
          )}

          {cartaSelecionada && (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
              <div className="bg-white p-5 rounded-lg text-center">
                <h2 className="text-xl font-bold">{cartaSelecionada.nome}</h2>
                <Image src={cartaSelecionada.imagem} alt={cartaSelecionada.nome} width={200} height={200} className="my-4" />
                <p>{cartaSelecionada.descricao}</p>
                <button
                  onClick={() => setCartaSelecionada(null)}
                  className="mt-4 px-5 py-2 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600"
                >
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

export default App;
