import { NextResponse } from 'next/server';

interface nftTake{
    NFTokenID: string;
    URI: string;
}

export async function GET(request: Request, { params }: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await params; // Captura o parâmetro address da URL

    if (!address) {
      return NextResponse.json({ message: 'Endereço não fornecido.' }, { status: 400 });
    }

    // Realiza a requisição GET para a API externa
    const apiUrl = `https://web3projectapi.vercel.app/api/getAccountNFTs/${address}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json({ message: 'Erro ao buscar NFTs na API externa.' }, { status: response.status });
    }

    const nftsData = await response.json(); // Converte a resposta em JSON
    const nfts = nftsData.nfts; // Obtemos a lista de NFTs

    // Função para buscar dados da URI do NFT
    const fetchNftData = async (uriHex: string) => {
      const convertHexToString = (hex: string) => Buffer.from(hex, 'hex').toString('utf-8'); // Converte a URI de hexadecimal para string
      const uriString = convertHexToString(uriHex); // Converte a URI
      const url = `https://moccasin-quickest-mongoose-160.mypinata.cloud/ipfs/${uriString}`; // URL para buscar dados da URI no IPFS

      try {
        const nftResponse = await fetch(url);
        if (nftResponse.ok) {
          const nftData = await nftResponse.json(); // Converte a resposta em JSON
          return nftData; // Aqui você terá name, description e base64image
        } else {
          return { name: 'Unknown', description: 'No description', base64image: '' };
        }
      } catch (error) {
        console.error('Erro ao buscar a URI do NFT:', error);
        return { name: 'Unknown', description: 'No description', base64image: '' };
      }
    };

    // Processa cada NFT para obter seus dados de URI
    const nftDetailsPromises = nfts.map(async (nft: nftTake) => {
      const uriData = await fetchNftData(nft.URI);
      return {
        NFTokenID: nft.NFTokenID,
        name: uriData.name || 'Unknown Name',
        description: uriData.description || 'No description available',
        base64image: uriData.base64image || '',
      };
    });

    // Aguardar a resolução de todas as promessas
    const resolvedNftDetails = await Promise.all(nftDetailsPromises);

    // Retorna os detalhes dos NFTs
    return NextResponse.json({ nfts: resolvedNftDetails }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar NFTs:', error);
    return NextResponse.json({ message: 'Erro ao buscar NFTs.' }, { status: 500 });
  }
}
