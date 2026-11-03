import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
// En producción, asegúrate de poner tu GEMINI_API_KEY en el archivo .env
const apiKey = process.env.GEMINI_API_KEY || 'TU_API_KEY_AQUI'; 
const genAI = new GoogleGenerativeAI(apiKey);

router.post('/generate-followup', async (req, res) => {
  try {
    const { customerName, quoteNumber, total, items } = req.body;

    const prompt = `
      Actúa como un vendedor experto y carismático. 
      Redacta un mensaje de WhatsApp corto, amable y persuasivo para el cliente "${customerName}".
      Acabamos de enviarle la Cotización #${quoteNumber} por un total de $${total}.
      Los productos/servicios que cotizó son: ${items.map((i: any) => i.name).join(', ')}.
      
      El mensaje debe:
      - Saludar cordialmente.
      - Mencionar que adjuntamos el PDF de la cotización.
      - Usar emojis adecuados.
      - Terminar con un llamado a la acción suave preguntando si tiene alguna duda para proceder con el pedido.
      - No usar lenguaje excesivamente formal, que suene humano y directo.
    `;

    // Usamos el modelo más rápido y eficiente para texto
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ message: text });
  } catch (error) {
    console.error("Error al generar IA:", error);
    res.status(500).json({ error: 'Error al comunicarse con la Inteligencia Artificial' });
  }
});

export const aiRouter = router;