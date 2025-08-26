# Requerimientos - Sistema de Gestión de Propuestas y Conciliaciones

## 📋 Contexto
Sistema web para gestionar propuestas y conciliaciones con control de acceso basado en roles y estados de flujo.

## 🎯 Objetivos
- Gestionar propuestas con programación temporal
- Controlar conciliaciones por etapas
- Implementar sistema de roles con permisos específicos
- Facilitar búsqueda y filtrado de propuestas

---

## 🏗️ Arquitectura de Flujos (Nodos → Flechas)

### Flujo Principal de Navegación
```
[Página Principal] → [Propuestas] → [Gestión de Propuestas]
                ↓
            [Conciliaciones] → [Gestión de Conciliaciones]
```

### Flujo de Estados de Propuesta
```
[Programada] → [Generada] → [Pre-conciliado] → [Autorización] → [Conciliado]
     ↓              ↓              ↓              ↓              ↓
[Cancelado] ← [Cancelado] ← [Cancelado] ← [Cancelado] ← [Cancelado]
```

### Flujo de Creación de Propuesta
```
[Botón Nueva Propuesta] → [Pop-up Configuración] → [Validación Fecha]
                              ↓
                    [Fecha Futura] → [Estado: Programada]
                              ↓
                    [Fecha Pasado] → [Estado: Generada]
```

---

## 🖥️ Pantallas y Rutas

### 1. Página Principal (`/main`)
**Descripción:** Gestor principal con navegación a módulos

**Elementos:**
- Botón "Propuestas" → Ruta: `/main/propuestas`
- Botón "Conciliaciones" → Ruta: `/main/conciliaciones`

### 2. Pantalla de Propuestas (`/main/propuestas`)
**Descripción:** Gestor completo de propuestas con filtros y gestión

**Elementos Superiores:**
- **Buscador por fechas:** Rango de fechas de creación
- **Filtro de estados:** Programada, Generada, Pre-conciliado, Autorización, Conciliado, Cancelado
- **Botón "Nueva Propuesta":** Genera pop-up de configuración

**Pop-up Nueva Propuesta:**
- Campo fecha y hora (formato: YYYY-MM-DD, HH:00)
- Selector de carteras
- Validación automática (futuro/pasado)
- Recarga automática de grilla

**Grilla de Propuestas:**
| Columna | Descripción |
|---------|-------------|
| Nombre de propuesta | Identificador único |
| Fecha de propuesta | Fecha y hora programada |
| Estado de propuesta | Estado actual del flujo |
| Botón "Entrar" | Acceso según rol y estado (matriz de permisos) |
| Botón "Ver" | Visualización según rol y estado (matriz de permisos) |
| Botón "Cancelar" | Solo visible para Administrador |

---

## 👥 Sistema de Roles y Permisos

### Roles Definidos
1. **Administrador**
   - ✅ Ve botón "Cancelar propuesta"
   - ✅ Ve botón "Entrar"
   - ✅ Pop-up de selección de rol al entrar
   - ✅ Acceso a propuestas canceladas

2. **DAF (Director de Área Financiera)**
   - ❌ No ve botón "Cancelar propuesta"
   - ✅ Ve botón "Entrar"
   - 🔄 Pantallas específicas por etapa

3. **JP (Jefe de Proyecto)**
   - ❌ No ve botón "Cancelar propuesta"
   - ✅ Ve botón "Entrar"
   - 🔄 Pantallas específicas por etapa

4. **Subdirector**
   - ❌ No ve botón "Cancelar propuesta"
   - ✅ Ve botón "Entrar"
   - 🔄 Pantallas específicas por etapa

### Matriz de Permisos por Estado

| Estado | DAF-SD | DAF | JP | Subdirector | Administrador |
|--------|--------|-----|----|-------------|---------------|
| Programada | ❌ | ❌ | ❌ | ❌ | ❌ |
| Generada | ✅ | ✅ | ❌ | ❌ | ✅ |
| Pre-conciliado | ✅ | ✅ | ✅ | ✅ | ✅ |
| Autorización | ✅ | ❌ | ❌ | ✅ | ✅ |
| Conciliado | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cancelado | ❌ | ❌ | ❌ | ❌ | ✅ |

**Nota:** 
- El estado "Proyectado" no está incluido en la matriz de permisos actual.
- Esta matriz se aplica a **ambos botones**: "Entrar" y "Ver".
- Los permisos controlan la visibilidad de ambos botones según el rol y estado de la propuesta.

---

## 🔄 Estados y Transiciones

### Estados de Propuesta
1. **Programada**
   - Descripción: Propuesta creada para fecha futura
   - Acceso: Ningún rol puede acceder
   - Transición: Automática a "Generada" cuando llega la fecha

2. **Generada**
   - Descripción: Propuesta lista para procesamiento
   - Acceso: Administrador, DAF, JP
   - Transición: Manual a "Pre-conciliado"

3. **Pre-conciliado**
   - Descripción: Propuesta en proceso de conciliación
   - Acceso: Todos los roles
   - Transición: Manual a "Conciliado"

4. **Conciliado**
   - Descripción: Propuesta conciliada
   - Acceso: Todos los roles
   - Transición: Estado final

5. **Autorización**
   - Descripción: Propuesta en proceso de autorización
   - Acceso: DAF-SD, Subdirector, Administrador
   - Transición: Manual a "Conciliado"

6. **Cancelado**
   - Descripción: Propuesta cancelada
   - Acceso: Solo Administrador
   - Transición: Estado final

---

## 📊 Datos y Formatos

### Entrada de Nueva Propuesta
```json
{
  "fecha": "2025-10-13",
  "hora": 13,
  "carteras": ["cartera1", "cartera2"],
  "nombre": "Propuesta_2025-10-13_13"
}
```

### Estructura de Propuesta
```json
{
  "id": "uuid",
  "nombre": "string",
  "fecha_propuesta": "datetime",
  "estado": "enum",
  "carteras": ["array"],
  "fecha_creacion": "datetime",
  "fecha_actualizacion": "datetime"
}
```

---

## 🎯 Criterios de Aceptación

### Funcionalidades Principales
- [ ] Navegación entre módulos funcional
- [ ] Creación de propuestas con validación temporal
- [ ] Filtrado por fechas y estados
- [ ] Control de acceso por roles
- [ ] Grilla con información completa
- [ ] Recarga automática post-creación

### Validaciones
- [ ] Fecha futura → Estado "Programada"
- [ ] Fecha pasada → Estado "Generada"
- [ ] Botón cancelar solo para Administrador
- [ ] Acceso por estado según matriz de permisos
- [ ] Pop-up de selección de rol para Administrador

### UX/UI
- [ ] Interfaz intuitiva y responsive
- [ ] Feedback visual de estados
- [ ] Confirmaciones para acciones críticas
- [ ] Navegación clara entre pantallas

---

## 🚀 Prioridades y Fases

### Fase 1 - Core (Alta Prioridad)
- Estructura base de navegación
- Pantalla principal
- Creación básica de propuestas
- Grilla de propuestas

### Fase 2 - Roles y Permisos (Alta Prioridad)
- Sistema de autenticación
- Control de acceso por roles
- Matriz de permisos implementada

### Fase 3 - Estados y Flujos (Media Prioridad)
- Gestión completa de estados
- Transiciones automáticas
- Validaciones temporales

### Fase 4 - Optimización (Baja Prioridad)
- Búsquedas avanzadas
- Reportes y analytics
- Integraciones externas
