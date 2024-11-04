import { NextResponse } from 'next/server';

// Interface de autenticação
export interface IAuth {
  message: string;
  signature: string;
  publicKey: string;
}

// Interface para dados de Mint
interface IMintNFT {
  auth: IAuth;
  recipientAddress: string;
  base64image: string;
  name: string;
  description: string;
  gameMetadata: Record<string, string>;
}


export async function POST(request: Request) {
  try {
    // Extrair os dados da requisição do cliente
    const mintNFTData: IMintNFT = await request.json();

    // Realizar a chamada para a API externa
    const response = await fetch("https://web3projectapi.vercel.app/mintNFT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mintNFTData),  // Passa os dados recebidos para a API externa
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({ message: 'Carta mintada com sucesso!', data }, { status: 200 });
    } else {
      const errorData = await response.json();
      return NextResponse.json({ message: 'Erro ao mintar a carta.', error: errorData }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return NextResponse.json({ message: 'Erro ao processar a solicitação.' }, { status: 500 });
  }
}
