export function saveToMemory(message, reply) {
  const memory = {
    timestamp: new Date().toISOString(),
    input: message,
    response: reply
  };

  console.log('Saving to AION memory:', JSON.stringify(memory, null, 2));

  // Placeholder: In real setup, you'd write to file using backend or API.
}
