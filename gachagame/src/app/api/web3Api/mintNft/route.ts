import { NextResponse } from 'next/server';

export interface IAuth {
  message: string;
  signature: string;
  publicKey: string;
}

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
    const response = await fetch("https://web3projectapi.vercel.app/api/mintNFT", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mintNFTData),  // Passa os dados recebidos para a API externa
    });
    
    // Verificar se a resposta da API externa tem conteúdo e status correto
    if (response.ok) {
      let data;
      const responseText = await response.text(); // Primeiro pegar como texto para garantir que temos conteúdo

      if (responseText) {
        // Se a resposta contém dados, tentar fazer o parse como JSON
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Erro ao fazer o parse do JSON:', jsonError);
          data = responseText; // Se o parsing falhar, usa o texto bruto
        }
      } else {
        // Caso a resposta não tenha conteúdo
        data = null;
      }

      return NextResponse.json({ message: 'Carta mintada com sucesso!', data }, { status: 200 });
    } else {
      let errorData;
      const errorText = await response.text(); // Pega o texto do erro

      if (errorText) {
        console.log(errorText);
      } else {
        errorData = 'Erro desconhecido da API externa.'; // Caso não haja erro, usa mensagem padrão
      }

      return NextResponse.json({ message: 'Erro ao mintar a carta.', error: errorData }, { status: 500 });
    }

  } catch (error) {
    console.error('Erro ao processar a solicitação:', error);
    return NextResponse.json({ message: 'Erro ao processar a solicitação.' }, { status: 500 });
  }
}
