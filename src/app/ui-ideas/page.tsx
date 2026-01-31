'use client'

import { useState } from 'react';

export default function UXVision() {
  const [activeTab, setActiveTab] = useState('mobile');
  const [selectedScreen, setSelectedScreen] = useState(null);

  // Definición de pantallas Mobile (registro en el gym)
  const mobileScreens = [
    {
      id: 'mobile-1',
      name: 'Quick Start',
      url: '/app/quick-start',
      description: 'Pantalla de inicio rápido. Botón grande "Nuevo Entrenamiento" + lista de últimos 3 entrenamientos.',
      wireframe: [
        { type: 'header', content: 'GymTrack' },
        { type: 'button-primary', content: '+ Nuevo Entrenamiento' },
        { type: 'section-title', content: 'Últimos entrenamientos' },
        { type: 'card', content: 'Pecho + Tríceps\nHoy - 6 ejercicios' },
        { type: 'card', content: 'Piernas\nAyer - 5 ejercicios' },
      ],
      nextScreens: ['mobile-2']
    },
    {
      id: 'mobile-2',
      name: 'Nuevo Entrenamiento',
      url: '/app/workout/new',
      description: 'Crear entrenamiento. Input de fecha (default hoy) + botón "Agregar ejercicio".',
      wireframe: [
        { type: 'header', content: '← Nuevo Entrenamiento' },
        { type: 'input', content: 'Fecha: Hoy, 30 Ene' },
        { type: 'input', content: 'Notas (opcional)' },
        { type: 'button-secondary', content: '+ Agregar Ejercicio' },
        { type: 'empty-state', content: 'Sin ejercicios aún' },
      ],
      nextScreens: ['mobile-3']
    },
    {
      id: 'mobile-3',
      name: 'Seleccionar Ejercicio',
      url: '/app/workout/new/select-exercise',
      description: 'Lista de ejercicios guardados + botón "Crear nuevo". Búsqueda rápida arriba.',
      wireframe: [
        { type: 'header', content: '← Seleccionar Ejercicio' },
        { type: 'input', content: '🔍 Buscar ejercicio...' },
        { type: 'button-secondary', content: '+ Crear Nuevo Ejercicio' },
        { type: 'card', content: 'Press de Banca\nPecho' },
        { type: 'card', content: 'Sentadilla\nPiernas' },
        { type: 'card', content: 'Peso Muerto\nEspalda' },
      ],
      nextScreens: ['mobile-4', 'mobile-5']
    },
    {
      id: 'mobile-4',
      name: 'Crear Ejercicio',
      url: '/app/exercises/new',
      description: 'Formulario simple: Nombre, Grupo muscular (select), Descripción opcional.',
      wireframe: [
        { type: 'header', content: '← Nuevo Ejercicio' },
        { type: 'input', content: 'Nombre del ejercicio' },
        { type: 'select', content: 'Grupo muscular: Pecho ▾' },
        { type: 'input', content: 'Descripción (opcional)' },
        { type: 'button-primary', content: 'Guardar Ejercicio' },
      ],
      nextScreens: ['mobile-5']
    },
    {
      id: 'mobile-5',
      name: 'Registrar Series',
      url: '/app/workout/new/exercise/[id]',
      description: 'Registrar sets del ejercicio. Lista de series + botón "Nueva serie". Input rápido: Reps + Peso.',
      wireframe: [
        { type: 'header', content: '← Press de Banca' },
        { type: 'card', content: 'Serie 1: 12 reps × 60 kg' },
        { type: 'card', content: 'Serie 2: 10 reps × 65 kg' },
        { type: 'input-group', content: 'Reps: [__]  Peso: [__] kg' },
        { type: 'button-primary', content: '+ Agregar Serie' },
        { type: 'button-secondary', content: 'Finalizar Ejercicio' },
      ],
      nextScreens: ['mobile-2']
    },
  ];

  // Definición de pantallas Desktop (análisis y visualización)
  const desktopScreens = [
    {
      id: 'desktop-1',
      name: 'Dashboard Principal',
      url: '/dashboard',
      description: 'Vista general con estadísticas, gráficos de progreso, calendario de entrenamientos.',
      wireframe: [
        { type: 'nav', content: 'Dashboard | Ejercicios | Estadísticas' },
        { type: 'stats-row', content: '📊 Esta semana: 3 entrenamientos | 45 series | 1,200 kg volumen' },
        { type: 'chart', content: '📈 Gráfico: Volumen semanal (últimas 8 semanas)' },
        { type: 'calendar', content: '📅 Calendario de entrenamientos del mes' },
      ],
      nextScreens: ['desktop-2', 'desktop-3', 'desktop-4']
    },
    {
      id: 'desktop-2',
      name: 'Historial de Entrenamientos',
      url: '/dashboard/workouts',
      description: 'Lista completa de entrenamientos con filtros por fecha y grupo muscular.',
      wireframe: [
        { type: 'nav', content: 'Dashboard | Ejercicios | Estadísticas' },
        { type: 'filters', content: 'Filtros: [Fecha] [Grupo muscular] [Buscar]' },
        { type: 'table', content: 'Tabla: Fecha | Nombre | Ejercicios | Series | Volumen | Ver' },
      ],
      nextScreens: ['desktop-5']
    },
    {
      id: 'desktop-3',
      name: 'Biblioteca de Ejercicios',
      url: '/dashboard/exercises',
      description: 'Grid de todos los ejercicios creados. Stats por ejercicio (última vez, PR, tendencia).',
      wireframe: [
        { type: 'nav', content: 'Dashboard | Ejercicios | Estadísticas' },
        { type: 'input', content: '🔍 Buscar ejercicios...' },
        { type: 'grid', content: 'Grid de cards con: Nombre | Grupo | Última vez | PR | 📈' },
      ],
      nextScreens: ['desktop-6']
    },
    {
      id: 'desktop-4',
      name: 'Estadísticas Avanzadas',
      url: '/dashboard/stats',
      description: 'Gráficos detallados: Volumen por grupo muscular, progresión de peso, frecuencia.',
      wireframe: [
        { type: 'nav', content: 'Dashboard | Ejercicios | Estadísticas' },
        { type: 'chart-large', content: '📊 Volumen total por grupo muscular (pie chart)' },
        { type: 'chart-large', content: '📈 Progresión de Press de Banca (line chart)' },
        { type: 'chart-large', content: '📅 Frecuencia de entrenamiento (heatmap)' },
      ],
      nextScreens: []
    },
    {
      id: 'desktop-5',
      name: 'Detalle de Entrenamiento',
      url: '/dashboard/workouts/[id]',
      description: 'Vista detallada de un entrenamiento específico. Todos los ejercicios y series.',
      wireframe: [
        { type: 'header', content: '← Entrenamiento: Pecho + Tríceps (30 Ene 2026)' },
        { type: 'stats-row', content: 'Duración: 65 min | Series: 18 | Volumen: 2,400 kg' },
        { type: 'exercise-block', content: 'Press de Banca\nSerie 1: 12×60kg | Serie 2: 10×65kg | Serie 3: 8×70kg' },
        { type: 'exercise-block', content: 'Press Inclinado\nSerie 1: 10×50kg | Serie 2: 8×55kg' },
      ],
      nextScreens: []
    },
    {
      id: 'desktop-6',
      name: 'Detalle de Ejercicio',
      url: '/dashboard/exercises/[id]',
      description: 'Progresión del ejercicio a lo largo del tiempo. Gráfico de peso máximo, volumen, etc.',
      wireframe: [
        { type: 'header', content: '← Press de Banca' },
        { type: 'stats-row', content: 'PR: 80kg | Última vez: Ayer | Total series: 234' },
        { type: 'chart', content: '📈 Progresión de peso máximo (últimos 6 meses)' },
        { type: 'chart', content: '📊 Volumen por entrenamiento' },
        { type: 'history', content: 'Historial de entrenamientos con este ejercicio' },
      ],
      nextScreens: []
    },
  ];

  const screens = activeTab === 'mobile' ? mobileScreens : desktopScreens;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '3rem' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '900',
          background: 'linear-gradient(to right, #FF7A00, #FF4500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          GymTrack - UX Vision v1
        </h1>
        <p style={{ color: '#888', fontSize: '1.125rem' }}>
          Flujo de pantallas para aprobación. Mobile = Registro | Desktop = Análisis
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        marginBottom: '2rem',
        display: 'flex',
        gap: '1rem',
        borderBottom: '2px solid #333'
      }}>
        <button
          onClick={() => setActiveTab('mobile')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'mobile' ? '#FF7A00' : 'transparent',
            color: activeTab === 'mobile' ? '#fff' : '#888',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          📱 Mobile Flows (5 pantallas)
        </button>
        <button
          onClick={() => setActiveTab('desktop')}
          style={{
            padding: '1rem 2rem',
            background: activeTab === 'desktop' ? '#FF7A00' : 'transparent',
            color: activeTab === 'desktop' ? '#fff' : '#888',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          💻 Desktop Flows (6 pantallas)
        </button>
      </div>

      {/* Screen Grid */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {screens.map((screen, index) => (
          <div
            key={screen.id}
            onClick={() => setSelectedScreen(screen)}
            style={{
              background: selectedScreen?.id === screen.id ? '#2a2a2a' : '#1a1a1a',
              border: selectedScreen?.id === screen.id ? '2px solid #FF7A00' : '2px solid #333',
              borderRadius: '16px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(255, 122, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Screen Number */}
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '16px',
              background: '#FF7A00',
              color: '#fff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '0.875rem'
            }}>
              {index + 1}
            </div>

            {/* Screen Name */}
            <h3 style={{ 
              fontSize: '1.25rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: '#fff'
            }}>
              {screen.name}
            </h3>

            {/* URL */}
            <div style={{
              fontSize: '0.75rem',
              color: '#FF7A00',
              fontFamily: 'monospace',
              background: '#0a0a0a',
              padding: '0.5rem',
              borderRadius: '4px',
              marginBottom: '1rem',
              overflow: 'auto'
            }}>
              {screen.url}
            </div>

            {/* Description */}
            <p style={{
              fontSize: '0.875rem',
              color: '#aaa',
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              {screen.description}
            </p>

            {/* Wireframe Preview */}
            <div style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '1rem',
              minHeight: '300px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {screen.wireframe.map((element, idx) => (
                <WireframeElement key={idx} {...element} />
              ))}
            </div>

            {/* Next Screens Indicator */}
            {screen.nextScreens.length > 0 && (
              <div style={{
                marginTop: '1rem',
                fontSize: '0.75rem',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>→ Navega a:</span>
                {screen.nextScreens.map(nextId => {
                  const nextScreen = screens.find(s => s.id === nextId);
                  return (
                    <span key={nextId} style={{
                      background: '#333',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem'
                    }}>
                      {nextScreen?.name || nextId}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div style={{
        maxWidth: '1400px',
        margin: '4rem auto 0',
        padding: '2rem',
        background: '#1a1a1a',
        border: '2px solid #333',
        borderRadius: '16px'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#FF7A00' }}>
          📋 Resumen del Flujo
        </h3>
        
        {activeTab === 'mobile' ? (
          <div style={{ color: '#aaa', lineHeight: '1.8' }}>
            <p><strong style={{ color: '#fff' }}>Contexto Mobile:</strong> Usuario está en el gym, necesita registro RÁPIDO.</p>
            <p><strong style={{ color: '#fff' }}>Flujo principal:</strong></p>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li>Quick Start → "Nuevo Entrenamiento"</li>
              <li>Selecciona/Crea ejercicio</li>
              <li>Registra series (reps + peso) de forma rápida</li>
              <li>Repite para cada ejercicio</li>
              <li>Finaliza entrenamiento</li>
            </ol>
            <p><strong style={{ color: '#fff' }}>Prioridad:</strong> Velocidad, inputs mínimos, un tap = una acción</p>
          </div>
        ) : (
          <div style={{ color: '#aaa', lineHeight: '1.8' }}>
            <p><strong style={{ color: '#fff' }}>Contexto Desktop:</strong> Usuario en casa/PC, quiere ANALIZAR su progreso.</p>
            <p><strong style={{ color: '#fff' }}>Flujo principal:</strong></p>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li>Dashboard → Ver estadísticas generales</li>
              <li>Navegar a Historial, Ejercicios o Stats</li>
              <li>Ver detalles de entrenamientos pasados</li>
              <li>Analizar progresión de ejercicios específicos</li>
              <li>Identificar patrones y tendencias</li>
            </ol>
            <p><strong style={{ color: '#fff' }}>Prioridad:</strong> Visualización, gráficos, datos históricos, insights</p>
          </div>
        )}

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#0a0a0a',
          borderRadius: '8px',
          border: '1px solid #FF7A00'
        }}>
          <p style={{ color: '#FF7A00', fontWeight: '600', marginBottom: '0.5rem' }}>
            ✅ Próximos pasos:
          </p>
          <p style={{ color: '#aaa', fontSize: '0.875rem' }}>
            1. Revisa cada pantalla y su flujo<br/>
            2. Aprueba las que te gusten<br/>
            3. Dame feedback sobre las que quieras cambiar<br/>
            4. Te entrego las páginas implementadas una por una
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para renderizar elementos del wireframe
function WireframeElement({ type, content }) {
  const styles = {
    header: {
      padding: '0.75rem',
      background: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      fontWeight: '600',
      fontSize: '0.875rem',
      color: '#333'
    },
    'button-primary': {
      padding: '1rem',
      background: '#FF7A00',
      color: '#fff',
      borderRadius: '8px',
      fontWeight: '600',
      textAlign: 'center',
      fontSize: '0.875rem'
    },
    'button-secondary': {
      padding: '0.75rem',
      background: 'transparent',
      border: '2px dashed #999',
      color: '#666',
      borderRadius: '8px',
      fontWeight: '500',
      textAlign: 'center',
      fontSize: '0.875rem'
    },
    'section-title': {
      padding: '0.5rem 0',
      fontSize: '0.75rem',
      fontWeight: '600',
      color: '#666',
      textTransform: 'uppercase'
    },
    card: {
      padding: '0.75rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      fontSize: '0.75rem',
      color: '#333',
      whiteSpace: 'pre-line'
    },
    input: {
      padding: '0.75rem',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '0.75rem',
      color: '#666'
    },
    'input-group': {
      padding: '0.75rem',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '0.75rem',
      color: '#666',
      display: 'flex',
      gap: '0.5rem'
    },
    select: {
      padding: '0.75rem',
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: '6px',
      fontSize: '0.75rem',
      color: '#666'
    },
    'empty-state': {
      padding: '2rem 1rem',
      color: '#999',
      textAlign: 'center',
      fontSize: '0.75rem',
      fontStyle: 'italic'
    },
    nav: {
      padding: '0.75rem',
      background: '#2a2a2a',
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    'stats-row': {
      padding: '0.75rem',
      background: '#f0f0f0',
      borderRadius: '6px',
      fontSize: '0.7rem',
      color: '#555',
      fontWeight: '500'
    },
    chart: {
      padding: '2rem 1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#999'
    },
    'chart-large': {
      padding: '3rem 1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#999'
    },
    calendar: {
      padding: '2rem 1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: '#999'
    },
    filters: {
      padding: '0.75rem',
      background: '#f5f5f5',
      borderRadius: '6px',
      fontSize: '0.7rem',
      color: '#666'
    },
    table: {
      padding: '1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      fontSize: '0.7rem',
      color: '#666',
      fontFamily: 'monospace'
    },
    grid: {
      padding: '1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      fontSize: '0.7rem',
      color: '#666',
      minHeight: '100px'
    },
    'exercise-block': {
      padding: '0.75rem',
      background: '#f5f5f5',
      borderLeft: '3px solid #FF7A00',
      borderRadius: '4px',
      fontSize: '0.7rem',
      color: '#333',
      whiteSpace: 'pre-line',
      fontFamily: 'monospace'
    },
    history: {
      padding: '1rem',
      background: '#fafafa',
      border: '1px solid #e5e5e5',
      borderRadius: '8px',
      fontSize: '0.7rem',
      color: '#666'
    }
  };

  return (
    <div style={styles[type] || styles.card}>
      {content}
    </div>
  );
}