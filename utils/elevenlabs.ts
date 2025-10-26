// ElevenLabs configuration
const ELEVENLABS_API_KEY = '6e79f4fd391c7926f8815dc758feee1119f8793d7ec40b3d90a09ff90d8edbba';
const ELEVENLABS_VOICE_ID = 'GNZJNyUmjtha6JKquA3M'; // Your voice ID

// Text-to-Speech using ElevenLabs
export async function textToSpeech(text: string): Promise<string | null> {
  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key not configured');
    return null;
  }

  try {
    console.log('Generating ElevenLabs TTS audio...');
    
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!response.ok) {
      // Log detailed error for debugging
      const errorText = await response.text();
      console.warn(`ElevenLabs TTS failed with status ${response.status}:`, errorText);
      return null;
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    console.log('ElevenLabs TTS audio generated successfully');
    return audioUrl;
  } catch (error) {
    console.error('Error generating ElevenLabs TTS:', error);
    return null;
  }
}
