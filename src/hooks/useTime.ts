"use client";

import { useState, useEffect } from "react";

export const useTime = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Función para actualizar la hora
    const update = () => setNow(new Date());

    // 1. Usamos requestAnimationFrame para evitar el error de "setState sincrono"
    // Esto asegura que la primera actualización ocurra en el siguiente frame de pintado.
    const frameId = requestAnimationFrame(() => {
      update();
    });

    // 2. Iniciamos el intervalo normal
    const interval = setInterval(update, 1000);

    // Limpieza al desmontar
    return () => {
      cancelAnimationFrame(frameId);
      clearInterval(interval);
    };
  }, []);

  return now;
};
