import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AISuggestion } from '@/types';

// Fallback suggestions used when no OpenAI key is configured
function getFallback(brewType: string): AISuggestion {
  const map: Record<string, AISuggestion> = {
    Classic: {
      roast: 'Tueste Medio (Medium)',
      grind: 'Molienda media (como sal de mar)',
      temperature: '90–93 °C (194–199 °F)',
      notes:
        'El tueste medio preserva los sabores frutales y florales sin amargor. La molienda media permite una extracción limpia y equilibrada ideal para el modo Classic de la Ninja ES601.',
    },
    Rich: {
      roast: 'Tueste Medio-Oscuro (Medium-Dark)',
      grind: 'Molienda media-fina (como azúcar glass gruesa)',
      temperature: '92–94 °C (198–201 °F)',
      notes:
        'Un tueste más oscuro potencia el cuerpo y los sabores a chocolate y nuez. La molienda ligeramente más fina extrae más compuestos en el ciclo lento del modo Rich.',
    },
    'Over Ice': {
      roast: 'Tueste Medio (Medium) o Claro-Medio',
      grind: 'Molienda media-gruesa (como arena fina)',
      temperature: '90–92 °C (194–198 °F)',
      notes:
        'Un grano más claro conserva acidez y frescura que brillan sobre el hielo. La molienda levemente más gruesa evita la sobreextracción ya que el café se concentrará al caer sobre el hielo.',
    },
    Specialty: {
      roast: 'Tueste Oscuro (Dark)',
      grind: 'Molienda fina (como azúcar glass, casi espresso)',
      temperature: '93–96 °C (200–205 °F)',
      notes:
        'El tueste oscuro desarrolla cuerpo y cremosidad esenciales para un buen concentrado. La molienda fina maximiza la extracción en el corto ciclo Specialty de la Ninja ES601.',
    },
  };
  return map[brewType] ?? map['Classic'];
}

export async function POST(req: NextRequest) {
  const { drinkName, description, brewType } = await req.json() as {
    drinkName?: string;
    description?: string;
    brewType?: string;
  };

  if (!drinkName || !brewType) {
    return NextResponse.json({ error: 'Datos insuficientes.' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // Return smart fallback if no API key is configured
  if (!apiKey || apiKey.trim() === '' || apiKey.startsWith('sk-...')) {
    return NextResponse.json(getFallback(brewType));
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `Eres un experto barista y catador de café con conocimiento profundo de la máquina Ninja DualBrew Pro ES601.

Para la siguiente bebida de café, proporciona recomendaciones específicas de preparación:

Bebida: "${drinkName}"
Descripción: "${description}"
Método de extracción en Ninja ES601: "${brewType}"

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta (sin markdown, sin texto extra):
{
  "roast": "Nivel de tueste recomendado con nombre en español e inglés",
  "grind": "Tipo de molienda recomendado con descripción táctil",
  "temperature": "Temperatura del agua en °C y °F",
  "notes": "Explicación de 2-3 oraciones de por qué estas elecciones complementan esta bebida específica y el método de extracción"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? '';
    const suggestion = JSON.parse(content) as AISuggestion;
    return NextResponse.json(suggestion);
  } catch {
    // Graceful fallback on any API error
    return NextResponse.json(getFallback(brewType));
  }
}
