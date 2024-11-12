import { deriveAddress, deriveKeypair, sign } from 'ripple-keypairs';

// Função para converter uma string para hexadecimal
function stringToHex(str: string): string {
  return Buffer.from(str, 'utf8').toString('hex');
}

async function signMessage(message: string): Promise<{ signature: string; classicAddress: string }> {
  const secretSeed = process.env.SECRET_SEED;
  if (!secretSeed) {
    throw new Error('SECRET_SEED não está configurada');
  }

  const keypair = deriveKeypair(secretSeed);

  const classicAddress = deriveAddress(keypair.publicKey);

  const messageHex = stringToHex(message);

  const signature = sign(messageHex, keypair.privateKey);

  return {
    signature,
    classicAddress,
  };
}

// API Route para processar a solicitação e retornar a assinatura e classicAddress
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const { signature, classicAddress } = await signMessage(message);

    return NextResponse.json({
      classicAddress,
      signature,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
