# Sistema de Gestión de Propuestas y Conciliaciones

Sistema web desarrollado en React para gestionar propuestas y conciliaciones con control de acceso basado en roles y estados de flujo.

## 🚀 Características

- **Gestión de Propuestas**: Creación, filtrado y gestión de propuestas con programación temporal
- **Sistema de Roles**: Control de acceso basado en 4 roles (Administrador, DAF, JP, Subdirector)
- **Estados de Flujo**: 6 estados de propuesta con transiciones automáticas
- **Filtros Avanzados**: Búsqueda por fechas y estados
- **Interfaz Responsive**: Diseño moderno y adaptable
- **Switch de Roles**: Para testing y demostración

## 📋 Requisitos

- Node.js (versión 14 o superior)
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd ProyectoConciliacion
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar el proyecto**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Funcionalidades Implementadas

### Página Principal (`/main`)
- Navegación a módulos de Propuestas y Conciliaciones
- Información del sistema

### Gestión de Propuestas (`/main/propuestas`)
- ✅ Filtros por fechas de creación
- ✅ Filtro por estados
- ✅ Botón "Nueva Propuesta" con pop-up
- ✅ Grilla con información completa
- ✅ Validación de fecha (futuro/pasado)
- ✅ Control de acceso por roles
- ✅ Botón cancelar solo para Administrador
- ✅ Pop-up de selección de rol para Administrador

### Sistema de Roles
- **Administrador**: Acceso completo, puede cancelar propuestas
- **DAF**: Acceso según matriz de permisos
- **JP**: Acceso según matriz de permisos  
- **Subdirector**: Acceso limitado según matriz de permisos

### Estados de Propuesta
1. **Programada** → Fecha futura
2. **Generada** → Fecha pasada
3. **Pre-conciliado** → En proceso
4. **Conciliado** → Conciliada
5. **Proyectado** → Proyectada
6. **Cancelado** → Cancelada

## 🎮 Switch de Roles

En la esquina superior derecha encontrarás un switch para cambiar entre roles durante las pruebas:

- **Administrador**: Acceso completo
- **DAF**: Director de Área Financiera
- **JP**: Jefe de Proyecto
- **Subdirector**: Subdirector

## 📊 Datos de Prueba

El sistema incluye datos de prueba generados automáticamente:
- 20 propuestas con diferentes estados y fechas
- 15 conciliaciones de ejemplo
- 5 carteras predefinidas

## 🔧 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── ModalNuevaPropuesta.js
│   ├── ModalSeleccionRol.js
│   └── RoleSwitch.js
├── context/            # Contexto de React
│   └── RoleContext.js
├── pages/              # Páginas principales
│   ├── PaginaPrincipal.js
│   ├── PaginaPropuestas.js
│   └── PaginaConciliaciones.js
├── utils/              # Utilidades y datos
│   └── mockData.js
├── App.js              # Componente principal
└── index.js            # Punto de entrada
```

## 🎨 Estilos

- CSS modular y responsive
- Diseño moderno con cards y sombras
- Badges de estado con colores diferenciados
- Tablas responsive para móviles

## 🔄 Flujos Implementados

### Flujo de Creación de Propuesta
1. Usuario hace clic en "Nueva Propuesta"
2. Se abre pop-up con formulario
3. Usuario ingresa fecha, hora y selecciona carteras
4. Sistema valida fecha (futuro/pasado)
5. Se crea propuesta con estado correspondiente
6. Se recarga la grilla automáticamente

### Flujo de Acceso a Propuesta
1. Usuario hace clic en "Entrar"
2. Si es Administrador → Pop-up de selección de rol
3. Si es otro rol → Navegación directa según permisos
4. Sistema valida acceso según estado y rol

## 🚧 Próximas Funcionalidades

- [ ] Gestión completa de conciliaciones
- [ ] Pantallas específicas por rol y estado
- [ ] Integración con backend
- [ ] Reportes y analytics
- [ ] Exportación de datos
- [ ] Notificaciones en tiempo real

## 🐛 Solución de Problemas

### Error de dependencias
```bash
npm install --force
```

### Puerto ocupado
```bash
npm start -- --port 3001
```

### Limpiar cache
```bash
npm run build
rm -rf build
npm start
```

## 📝 Notas de Desarrollo

- El sistema está preparado para integración con backend
- Los datos de prueba se generan automáticamente
- El switch de roles es solo para testing
- La matriz de permisos está implementada según requerimientos
- Los estados se validan automáticamente según fecha

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.
