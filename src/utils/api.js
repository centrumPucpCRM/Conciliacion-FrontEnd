// src/utils/api.js

export async function fetchPropuestas() {
  const res = await fetch('http://127.0.0.1:8000/propuesta/?skip=0&limit=100');
  if (!res.ok) throw new Error('No se pudo obtener las propuestas');
  const data = await res.json();
  // Ajusta según la estructura de respuesta de tu backend
  // Si el backend devuelve un array directo:
  if (Array.isArray(data)) return data;
  // Si el backend devuelve un objeto con un array:
  if (Array.isArray(data.propuestas)) return data.propuestas;
  return [];
}
