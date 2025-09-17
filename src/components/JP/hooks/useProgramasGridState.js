import { useCallback, useEffect, useState } from 'react';

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
};

const pickFirstNumber = (...values) => {
  for (const value of values) {
    const normalized = normalizeNumber(value);
    if (normalized !== null) {
      return normalized;
    }
  }
  return null;
};

const calculateMontoReal = (oportunidades = []) =>
  oportunidades.reduce((acc, oportunidad) => acc + (pickFirstNumber(
    oportunidad.monto_propuesto_daf,
    oportunidad.monto_propuesto,
    oportunidad.monto
  ) || 0), 0);

const cloneProgramas = (programas = []) =>
  programas.map((programa) => {
    const oportunidades = (programa.oportunidades || []).map((oportunidad) => ({ ...oportunidad }));
    return {
      ...programa,
      oportunidades,
      monto_real: calculateMontoReal(oportunidades),
    };
  });

const updateProgramasList = (programas, programaId, transform) =>
  programas.map((programa) => {
    if (String(programa.id) !== String(programaId)) {
      return programa;
    }
    const oportunidades = transform(programa.oportunidades || []);
    return {
      ...programa,
      oportunidades,
      monto_real: calculateMontoReal(oportunidades),
    };
  });

const addAggregateEntries = (current, additions = []) => {
  if (!additions.length) {
    return current;
  }
  const next = { ...current };
  additions.forEach(({ programaId, dni, data }) => {
    const programaKey = String(programaId);
    const dniKey = String(dni);
    const actualPrograma = next[programaKey] ? { ...next[programaKey] } : {};
    actualPrograma[dniKey] = data;
    next[programaKey] = actualPrograma;
  });
  return next;
};

const removeAggregateEntries = (current, removals = []) => {
  if (!removals.length) {
    return current;
  }
  let mutated = false;
  const next = { ...current };
  removals.forEach(({ programaId, dni }) => {
    const programaKey = String(programaId);
    const dniKey = String(dni);
    if (!next[programaKey] || !(dniKey in next[programaKey])) {
      return;
    }
    mutated = true;
    const actualizado = { ...next[programaKey] };
    delete actualizado[dniKey];
    if (Object.keys(actualizado).length === 0) {
      delete next[programaKey];
    } else {
      next[programaKey] = actualizado;
    }
  });
  return mutated ? next : current;
};

const cleanAggregados = (programas, agregados) => {
  const result = {};
  programas.forEach((programa) => {
    const programaKey = String(programa.id);
    const registros = agregados[programaKey];
    if (!registros) {
      return;
    }
    const existentes = new Set((programa.oportunidades || []).map((opp) => String(opp.dni)));
    const filtrados = Object.entries(registros).filter(([dni]) => existentes.has(String(dni)));
    if (filtrados.length > 0) {
      result[programaKey] = filtrados.reduce((acc, [dni, data]) => {
        acc[String(dni)] = data;
        return acc;
      }, {});
    }
  });
  return result;
};

const pickOriginalData = (oportunidad) => ({
  etapa_venta_propuesto: oportunidad.etapa_venta_propuesto,
  tipo: oportunidad.tipo,
  agregadoEnSesion: oportunidad.agregadoEnSesion,
  monto_propuesto: oportunidad.monto_propuesto,
  monto_propuesto_daf: oportunidad.monto_propuesto_daf,
  monto_editado_en_sesion: oportunidad.monto_editado_en_sesion,
  monto_editado_por_jp: oportunidad.monto_editado_por_jp,
});

const restoreFromOriginal = (oportunidad, original = {}) => {
  const restaurada = { ...oportunidad };
  Object.entries(original).forEach(([key, value]) => {
    if (value === undefined) {
      delete restaurada[key];
    } else {
      restaurada[key] = value;
    }
  });
  if (!('monto_editado_en_sesion' in original)) {
    restaurada.monto_editado_en_sesion = false;
  }
  if (!('monto_editado_por_jp' in original)) {
    restaurada.monto_editado_por_jp = false;
  }
  return restaurada;
};

const buildNewOpportunity = (alumno) => {
  const baseMonto = pickFirstNumber(
    alumno.monto_propuesto_daf,
    alumno.monto_propuesto,
    alumno.monto
  );
  const nuevaOportunidad = {
    ...alumno,
    tipo: 'agregar_alumno',
    agregadoEnSesion: true,
    etapa_venta_propuesto: '3.5 - Tentativa Matricula',
    monto_editado_en_sesion: false,
    monto_editado_por_jp: false,
  };
  if (baseMonto !== null) {
    nuevaOportunidad.monto_propuesto = baseMonto;
    nuevaOportunidad.monto_propuesto_daf = baseMonto;
  } else {
    delete nuevaOportunidad.monto_propuesto;
    delete nuevaOportunidad.monto_propuesto_daf;
  }
  return nuevaOportunidad;
};

const ensureArrayResult = (value) => (Array.isArray(value) ? value : (value ? [value] : []));

const defaultProducerResult = (programas) => ({ programas, agregadosToAdd: [], agregadosToRemove: [] });

const normalizeProducerResult = (result, fallbackProgramas) => {
  if (!result || typeof result !== 'object') {
    return defaultProducerResult(fallbackProgramas);
  }
  return {
    programas: Array.isArray(result.programas) ? result.programas : fallbackProgramas,
    agregadosToAdd: ensureArrayResult(result.agregadosToAdd),
    agregadosToRemove: ensureArrayResult(result.agregadosToRemove),
  };
};

const useProgramasGridState = ({
  programas,
  gridId,
  onUpdateProgramas,
  onChangeMonto,
  onRevertMonto,
}) => {
  const [localProgramas, setLocalProgramas] = useState(() => cloneProgramas(programas));
  const [agregados, setAgregados] = useState({});

  useEffect(() => {
    const nextProgramas = cloneProgramas(programas);
    setLocalProgramas(nextProgramas);
    setAgregados((prev) => cleanAggregados(nextProgramas, prev));
  }, [programas]);

  const syncProgramas = useCallback((producer) => {
    let outcome = null;
    setLocalProgramas((prev) => {
      const result = normalizeProducerResult(producer(prev), prev);
      outcome = result;
      return result.programas;
    });
    if (outcome) {
      if (outcome.agregadosToAdd.length) {
        setAgregados((prev) => addAggregateEntries(prev, outcome.agregadosToAdd));
      }
      if (outcome.agregadosToRemove.length) {
        setAgregados((prev) => removeAggregateEntries(prev, outcome.agregadosToRemove));
      }
      if (onUpdateProgramas && outcome.programas) {
        onUpdateProgramas(gridId, outcome.programas);
      }
    }
  }, [gridId, onUpdateProgramas]);

  const handleChangeMonto = useCallback((programaId, dni, value) => {
    const monto = normalizeNumber(value);
    const programaKey = String(programaId);
    const dniKey = String(dni);
    const registroActual = agregados[programaKey]?.[dniKey];
    syncProgramas((prev) => {
      const agregadosToAdd = [];
      const agregadosToRemove = [];
      const programasActualizados = updateProgramasList(prev, programaId, (oportunidades) =>
        oportunidades.map((oportunidad) => {
          if (String(oportunidad.dni) !== dniKey) {
            return oportunidad;
          }
          if (monto === null) {
            if (registroActual && !registroActual.isNew) {
              agregadosToRemove.push({ programaId: programaKey, dni: dniKey });
            }
            const { monto_propuesto_daf: _omitMontoPropuestoDaf, ...rest } = registroActual?.original
              ? restoreFromOriginal(oportunidad, registroActual.original)
              : oportunidad;
            return {
              ...rest,
              monto_editado_en_sesion: false,
              monto_editado_por_jp: false,
            };
          }
          if (!registroActual) {
            agregadosToAdd.push({
              programaId: programaKey,
              dni: dniKey,
              data: {
                isNew: false,
                original: pickOriginalData(oportunidad),
              },
            });
          }
          return {
            ...oportunidad,
            monto_propuesto_daf: monto,
            monto_editado_en_sesion: true,
            monto_editado_por_jp: true,
          };
        })
      );
      return { programas: programasActualizados, agregadosToAdd, agregadosToRemove };
    });
    if (onChangeMonto) {
      onChangeMonto(programaId, dni, monto);
    }
  }, [agregados, onChangeMonto, syncProgramas]);

  const handleRevertMonto = useCallback((programaId, dni) => {
    const programaKey = String(programaId);
    const dniKey = String(dni);
    const registroActual = agregados[programaKey]?.[dniKey];
    syncProgramas((prev) => {
      const programasActualizados = updateProgramasList(prev, programaId, (oportunidades) =>
        oportunidades.map((oportunidad) => {
          if (String(oportunidad.dni) !== dniKey) {
            return oportunidad;
          }
          if (registroActual?.original) {
            return {
              ...restoreFromOriginal(oportunidad, registroActual.original),
              monto_editado_en_sesion: false,
              monto_editado_por_jp: false,
            };
          }
          const { monto_propuesto_daf: _omitMontoPropuestoDaf, ...rest } = oportunidad;
          return {
            ...rest,
            monto_editado_en_sesion: false,
            monto_editado_por_jp: false,
          };
        })
      );
      return {
        programas: programasActualizados,
        agregadosToRemove: registroActual && !registroActual.isNew ? [{ programaId: programaKey, dni: dniKey }] : [],
      };
    });
    if (onRevertMonto) {
      onRevertMonto(programaId, dni);
    }
  }, [agregados, onRevertMonto, syncProgramas]);

  const handleAgregarAlumno = useCallback((programaId, alumno) => {
    const programaKey = String(programaId);
    const dniKey = String(alumno.dni);
    syncProgramas((prev) => {
      let agregadoRecord = null;
      const programasActualizados = prev.map((programa) => {
        if (String(programa.id) !== programaKey) {
          return programa;
        }
        const oportunidades = programa.oportunidades || [];
        const existente = oportunidades.find((opp) => String(opp.dni) === dniKey);
        if (existente) {
          const actualizados = oportunidades.map((opp) => {
            if (String(opp.dni) !== dniKey) {
              return opp;
            }
            return {
              ...opp,
              etapa_venta_propuesto: '3.5 - Tentativa Matricula',
              tipo: 'agregar_alumno',
              agregadoEnSesion: true,
            };
          });
          if (!agregados[programaKey] || !agregados[programaKey][dniKey]) {
            agregadoRecord = {
              programaId: programaKey,
              dni: dniKey,
              data: {
                isNew: false,
                original: pickOriginalData(existente),
              },
            };
          }
          return {
            ...programa,
            oportunidades: actualizados,
            monto_real: calculateMontoReal(actualizados),
          };
        }
        const nuevaOportunidad = buildNewOpportunity(alumno);
        const actualizados = [...oportunidades, nuevaOportunidad];
        if (!agregados[programaKey] || !agregados[programaKey][dniKey]) {
          agregadoRecord = {
            programaId: programaKey,
            dni: dniKey,
            data: {
              isNew: true,
              original: null,
            },
          };
        }
        return {
          ...programa,
          oportunidades: actualizados,
          monto_real: calculateMontoReal(actualizados),
        };
      });
      return {
        programas: programasActualizados,
        agregadosToAdd: agregadoRecord ? [agregadoRecord] : [],
      };
    });
  }, [agregados, syncProgramas]);

  const handleEliminarAlumno = useCallback((programaId, dni) => {
    const programaKey = String(programaId);
    const dniKey = String(dni);
    const registroAgregado = agregados[programaKey]?.[dniKey];
    syncProgramas((prev) => {
      let removalRecord = null;
      const programasActualizados = prev.map((programa) => {
        if (String(programa.id) !== programaKey) {
          return programa;
        }
        const oportunidades = programa.oportunidades || [];
        const objetivo = oportunidades.find((opp) => String(opp.dni) === dniKey);
        if (!objetivo) {
          return programa;
        }
        if (registroAgregado?.isNew || (!registroAgregado && objetivo.tipo === 'agregar_alumno' && objetivo.agregadoEnSesion)) {
          const filtrados = oportunidades.filter((opp) => String(opp.dni) !== dniKey);
          removalRecord = { programaId: programaKey, dni: dniKey };
          return {
            ...programa,
            oportunidades: filtrados,
            monto_real: calculateMontoReal(filtrados),
          };
        }
        if (registroAgregado) {
          const revertidos = oportunidades.map((opp) => {
            if (String(opp.dni) !== dniKey) {
              return opp;
            }
            return restoreFromOriginal(opp, registroAgregado.original);
          });
          removalRecord = { programaId: programaKey, dni: dniKey };
          return {
            ...programa,
            oportunidades: revertidos,
            monto_real: calculateMontoReal(revertidos),
          };
        }
        return programa;
      });
      return {
        programas: programasActualizados,
        agregadosToRemove: removalRecord ? [removalRecord] : [],
      };
    });
  }, [agregados, syncProgramas]);

  const mutateProgramas = useCallback((updater) => {
    syncProgramas((prev) => ({ programas: updater(prev) }));
  }, [syncProgramas]);

  return {
    programas: localProgramas,
    agregados,
    handleChangeMonto,
    handleRevertMonto,
    handleAgregarAlumno,
    handleEliminarAlumno,
    mutateProgramas,
    normalizeNumber,
    calculateMontoReal,
  };
};

export default useProgramasGridState;
export { calculateMontoReal, normalizeNumber };
