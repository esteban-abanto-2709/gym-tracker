# Gym Tracker - Product Roadmap 🚀

Este documento define la visión a largo plazo y los hitos arquitectónicos del proyecto. El objetivo es evolucionar de un "bloc de notas de gimnasio" personal a una plataforma social, analítica y basada en rutinas estructuradas, sin perder la ligereza y rapidez actual.

---

## 🎯 v1.0: "The Foundation" (Fase Actual)

_El objetivo es dejar la base de código blindada, estructurada y en las mejores prácticas antes de añadir complejidad._

- [x] **Infraestructura Core**: Despliegue en Render + Vercel + Supabase.
- [x] **Arquitectura y Rendimiento**: Lazy Loading, Caché local en memoria y mejoras de UX.
- [x] **Seguridad Base**: CORS Mode y entorno Docker productivo.
- [x] **Normalización de Datos**: Migración de la base de datos para usar una tabla `Exercise` estandarizada, eliminando el texto libre para permitir métricas futuras.
- [x] **Limpieza de UI**: Buscador/Selector inteligente de Ejercicios en el Frontend.
- [x] **Refactorización de Arquitectura Frontend**: Modularización completa — Custom Hooks (`useExercises`, `useWorkoutForm`, `useWorkoutHistory`), Componentes UI (`ExerciseCombobox`, `CreateExerciseModal`, `WorkoutCard`), Layout compartido (`PageShell`, `AppHeader`). Pages reducidas de +500 a ~170 líneas.

---

## 🏗️ v1.5: "The Blueprint" (Sistema de Rutinas)

_El usuario no solo "hace" ejercicios, sino que sigue un "Plan"._

- [ ] **Modelado de Rutinas**: Crear entidades `Routine` y `RoutineExercise`.
- [ ] **Asignación de Días**: Capacidad de etiquetar rutinas (ej. Lunes = "Push", Martes = "Pull").
- [ ] **Tracking Inteligente en Vivo**: UI durante el entrenamiento que liste la rutina seleccionada y marque _cuántas series/sets te faltan_ para terminar.
- [ ] **Gestión de Sesiones**: Agrupar los sets diarios bajo una entidad `Session` para saber exactamente cuándo empezó y terminó un entrenamiento.

---

## 🤝 v2.0: "The Inner Circle" (Autenticación y Social)

_La app deja de ser personal y se abre al círculo de amigos._

- [ ] **Sistema de Auth**: Implementación de Supabase Auth (Google/Email).
- [ ] **Perfiles de Usuario**: Tablas de usuario vinculadas al sistema de Auth.
- [ ] **Aislamiento de Datos**: Refactorizar Backend (API Key) hacia JWT interceptors (Solo ver tus datos).
- [ ] **Marketplace Primitivo**: Capacidad de hacer "Share" a un `Routine` propio para que un amigo pueda clonarlo a su cuenta (Ej. "Piernas CBum").

---

## 📊 v2.5: "The Arena" (Dashboards y Analíticas)

_Análisis profundo de los datos acumulados._

- [ ] **Panel Personal**: Gráficas de Volumen total levantado por semana/mes.
- [ ] **PR Tracking**: Seguimiento visual de 1RM (Fuerza Máxima) histórico por ejercicio.
- [ ] **Social Dashboards**: Sistema de "Amigos" o "Follows".
- [ ] **Comparativa**: Vistas pareadas (Tú vs Amigo A) en ejercicios específicos o métricas de constancia (días entrenados al mes).

---

## 🤖 v3.0: "The Coach" (Futuro Lejano)

- Sugerencias IA.
- Mapeo de fatiga muscular específica.
- Recomendación de pesos sobrecarga progresiva.
